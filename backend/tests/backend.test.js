/**
 * LexiMed Backend Automated Unit & Integration Tests
 * Validates the completed 25-30% backend milestone
 */

const assert = require('assert');
const TextParser = require('../src/services/textParser');
const RedactionEngine = require('../src/services/redactionEngine');
const NLPSummarizer = require('../src/services/nlpSummarizer');
const ProvenanceVerifier = require('../src/services/provenanceVerifier');
const GlossaryService = require('../src/services/glossaryService');
const sampleDocuments = require('../src/data/sampleDocuments');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('\n--- Running LexiMed Backend Verification Suite ---\n');

// 1. TextParser Tests
runTest('TextParser correctly splits sentences protecting legal & medical abbreviations', () => {
  const sample = 'Dr. Robert C. Vance attended on Oct. 14, 2024. The dose was 1.5 mg PO BID. See Section 4.2 of Inc. filings.';
  const sentences = TextParser.splitIntoSentences(sample);
  assert.strictEqual(sentences.length, 3, `Expected 3 sentences, got ${sentences.length}`);
  assert.ok(sentences[0].includes('Dr. Robert C. Vance'));
  assert.ok(sentences[1].includes('1.5 mg PO BID'));
  assert.ok(sentences[2].includes('Section 4.2'));
});

runTest('TextParser indexes paragraphs and detects legal headings', () => {
  const text = `SECTION 1: ASSIGNMENT OF RIGHTS\n\nAssignor hereby transfers all right, title, and interest to Assignee.\n\nSECTION 2: INDEMNIFICATION\n\nAssignor agrees to indemnify Assignee for any breach.`;
  const paragraphs = TextParser.parseParagraphs(text);
  assert.strictEqual(paragraphs.length, 4, `Expected 4 paragraphs, got ${paragraphs.length}`);
  assert.strictEqual(paragraphs[0].isHeading, true);
  assert.strictEqual(paragraphs[1].isHeading, false);
  assert.strictEqual(paragraphs[0].id, 'para_1');
  assert.strictEqual(paragraphs[1].id, 'para_2');
});

runTest('TextParser calculates Flesch Reading Ease and Flesch-Kincaid Grade Level', () => {
  const legalText = sampleDocuments.legal.content;
  const metrics = TextParser.calculateReadabilityMetrics(legalText);
  assert.ok(metrics.totalWords > 100);
  assert.ok(metrics.fleschKincaidGrade > 8, `Grade level ${metrics.fleschKincaidGrade} should reflect complex text`);
  assert.ok(metrics.estimatedReadingTimeMinutes >= 1);
});

// 2. RedactionEngine Tests
runTest('RedactionEngine detects HIPAA PHI and legal sensitive entities', () => {
  const medText = sampleDocuments.medical.content;
  const scan = RedactionEngine.scanEntities(medText);
  assert.ok(scan.detected.length > 0, 'Should detect sensitive entities in medical record');
  const hasMRN = scan.detected.some(d => d.type === 'MRN_RECORD_ID');
  const hasPatient = scan.detected.some(d => d.type === 'PATIENT_NAME');
  assert.ok(hasMRN, 'Should detect MRN');
  assert.ok(hasPatient, 'Should detect patient name');
});

runTest('RedactionEngine applies mask tags and preserves audit mapping', () => {
  const input = 'Patient Eleanor M. Campbell with MRN-9284715 was admitted on 04/18/1958.';
  const redacted = RedactionEngine.applyRedaction(input);
  assert.ok(!redacted.sanitizedText.includes('MRN-9284715'), 'MRN must be masked');
  assert.ok(redacted.sanitizedText.includes('[REDACTED_RECORD_ID'), 'Mask token must be present');
  assert.strictEqual(redacted.redactionCount >= 2, true);
});

// 3. NLPSummarizer Tests
runTest('NLPSummarizer generates legal summary prioritizing obligations & indemnification', () => {
  const legalDoc = sampleDocuments.legal.content;
  const summary = NLPSummarizer.summarize(legalDoc, { domain: 'legal', targetSentenceCount: 4 });
  assert.strictEqual(summary.domain, 'legal');
  assert.strictEqual(summary.executiveDigest.length, 4);
  assert.ok(summary.structuredCategories.length >= 3);
  
  // Verify that summary sentences retain source paragraph IDs
  summary.executiveDigest.forEach(item => {
    assert.ok(item.paragraphId.startsWith('para_'), `Item must have paragraph anchor: ${item.paragraphId}`);
  });
});

runTest('NLPSummarizer generates medical summary prioritizing clinical findings & dosages', () => {
  const medDoc = sampleDocuments.medical.content;
  const summary = NLPSummarizer.summarize(medDoc, { domain: 'medical', targetSentenceCount: 5 });
  assert.strictEqual(summary.domain, 'medical');
  assert.strictEqual(summary.executiveDigest.length, 5);
  assert.ok(summary.structuredCategories.length >= 3);
  
  const hasDosageOrWarning = summary.executiveDigest.some(item => 
    /mg|po|emergency|call 911|aspirin|ticagrelor|troponin/i.test(item.text)
  );
  assert.ok(hasDosageOrWarning, 'Medical summary must capture critical dosages or warnings');
});

// 4. ProvenanceVerifier Tests
runTest('ProvenanceVerifier computes retention score and links summary to source paragraphs', () => {
  const legalDoc = sampleDocuments.legal.content;
  const summary = NLPSummarizer.summarize(legalDoc, { domain: 'legal', targetSentenceCount: 4 });
  const verification = ProvenanceVerifier.verifyRetention(legalDoc, summary.executiveDigest);
  
  assert.ok(verification.retentionScore > 50, `Retention score should be substantial, got ${verification.retentionScore}`);
  assert.ok(verification.provenanceList.length === 4);
  assert.ok(verification.provenanceList[0].groundingConfidence > 60);
});

// 5. GlossaryService Tests
runTest('GlossaryService provides plain-language demystification for jargon', () => {
  const forceMajeure = GlossaryService.getTerms().legal['force majeure'];
  assert.ok(forceMajeure);
  assert.ok(forceMajeure.plainMeaning.length > 10);

  const infarction = GlossaryService.getTerms().medical['infarction'];
  assert.ok(infarction);
  assert.ok(infarction.plainMeaning.includes('tissue death') || infarction.plainMeaning.includes('blood supply'));
});

// 6. QueryEngine Tests
const QueryEngine = require('../src/services/queryEngine');
runTest('QueryEngine locates relevant clauses for natural language inquiry', () => {
  const legalDoc = sampleDocuments.legal.content;
  const result = QueryEngine.queryDocument(legalDoc, 'What is the liability cap?', 'legal');
  assert.ok(result.matches.length > 0, 'Should find matches for liability query');
  assert.ok(result.answer.toLowerCase().includes('liability') || result.answer.includes('$1,500,000'));
  assert.ok(result.paragraphId.startsWith('para_'), 'Answer must link to source paragraph');
});

// 7. GeminiService Tests
const GeminiService = require('../src/services/geminiService');
runTest('GeminiService defaults to lowest free-tier model (gemini-1.5-flash-8b)', () => {
  assert.strictEqual(GeminiService.DEFAULT_MODEL, 'gemini-1.5-flash-8b');
  assert.strictEqual(GeminiService.getModel(), 'gemini-1.5-flash-8b');
  assert.strictEqual(GeminiService.isAvailable(null), false);
  assert.strictEqual(GeminiService.isAvailable('AIzaSyDummyTestKey1234567890'), true);
});

runTest('GeminiService constructs domain-specific prompts for legal and medical synthesis', () => {
  const legalPrompt = GeminiService.buildPrompt('This is a test agreement.', 'legal', 'short');
  assert.ok(legalPrompt.includes('senior legal analyst'));
  assert.ok(legalPrompt.includes('Core Obligations & Covenants'));
  assert.ok(legalPrompt.includes('concise, executive-level summary'));

  const medicalPrompt = GeminiService.buildPrompt('Patient blood pressure was 120/80.', 'medical', 'detailed');
  assert.ok(medicalPrompt.includes('clinical medical analyst'));
  assert.ok(medicalPrompt.includes('Medication Regimen & Dosage Instructions'));
  assert.ok(medicalPrompt.includes('in-depth comprehensive analysis'));
});

runTest('NLPSummarizer synthesizes scanned/image-based documents without throwing', () => {
  const scannedPlaceholder = '[Certified Scanned Document: images.pdf (124.5 KB)]\nPages: 3\nMode: Multimodal Vision OCR Ingestion Active';
  const summary = NLPSummarizer.summarize(scannedPlaceholder, {
    domain: 'legal',
    filename: 'images.pdf',
    isScanned: true
  });

  assert.strictEqual(summary.domain, 'legal');
  assert.ok(summary.overview.length > 20, 'Overview must be populated');
  assert.ok(summary.actionNote.length > 10, 'Action note must be present');
  assert.ok(summary.structuredCategories.length >= 3, 'Must contain standard structured categories');
  assert.ok(summary.executiveDigest.length >= 3, 'Must contain executive digest points');
  assert.ok(summary.metrics.compressionRatio, 'Must report metrics');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('🎉 Backend milestone (30%+) verified and operating cleanly!');
} else {
  process.exit(1);
}
