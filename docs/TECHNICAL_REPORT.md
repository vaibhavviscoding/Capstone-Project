# BRIEFLY: Legal and Medical Document Summarization
## Technical Report & Architecture Specification

**Prepared by:** Mimansha Bhandari, Kalpaja Sinha, Vaibhav Gupta  
**Institution:** School of Computer Science, IILM University, Greater Noida  
**Original Document:** [Briefly_Technical_Report.pdf](./Briefly_Technical_Report.pdf)

---

## 1. Executive Summary

Legal agreements and medical documents frequently contain complex terminology, lengthy paragraphs, and critical information that may be difficult for non-specialists to understand. Important details such as contractual obligations, liability conditions, medical diagnoses, medication instructions, and emergency warnings can be overlooked when users have limited time or domain-specific knowledge. This report presents **Briefly**, a human-centric document summarization and verification framework designed to improve the accessibility and understandability of legal and medical documents.

The proposed system combines document parsing, readability assessment, personally identifiable information (PII) and protected health information (PHI) detection, domain-weighted extractive summarization, provenance verification, and plain-language glossary support. The system also incorporates an optional Google Gemini integration while retaining a local extractive summarization mechanism as a fallback, supported by an automated backend test suite validating core processing modules.

---

## 2. Problem Statement & System Objectives

The increasing use of digital documentation has made legal and medical information more accessible, yet understanding specialized contracts, insurance policies, clinical discharge summaries, and medical reports remains difficult for ordinary readers. Conventional summarization tools reduce document length without accounting for domain-critical clauses, numerical dosages, or privacy risks, and provide no mechanism to verify whether generated statements remain faithful to the original text.

- **Automated Simplification:** Simplify lengthy legal and medical documents through domain-weighted extractive summarization.
- **Domain-Specific Ranking:** Identify important sentences using term frequency, sentence position, and legal or clinical lexical indicators.
- **Readability & Comprehension:** Improve accessibility through Flesch readability scoring and plain-language glossary support.
- **Privacy-Oriented Redaction:** Detect and mask selected PII and PHI identifiers while maintaining an audit mapping.
- **Source Provenance Traceability:** Connect extracted summary statements directly to their corresponding source paragraphs and quantify information retention.
- **Dual Summarization Paths:** Support both local extractive summarization and optional external Google Gemini AI summarization with automatic fallback.

---

## 3. Proposed Algorithm Architecture

Briefly processes an input document through an eight-stage modular workflow:
1. Document input and text ingestion
2. Text normalization and structural extraction
3. Readability assessment
4. PII/PHI detection and redaction
5. Domain-weighted extractive summarization
6. Provenance and information-retention verification
7. Glossary-based terminology assistance
8. Document-based search and question answering

### A. Document Ingestion, Normalization & Readability
The text parser identifies paragraph boundaries, creates paragraph-level indexes, and performs abbreviation-aware sentence splitting so expressions such as "Dr.", "Inc.", "v.", and clinical measurements like "1.5 mg" do not cause premature sentence breaks. It also computes **Flesch Reading Ease** and **Flesch–Kincaid Grade Level** indicators to estimate source text complexity.

### B. PII & PHI Detection and Redaction
Informed by the HIPAA Privacy Rule Safe Harbor method (45 CFR §164.514(b)(2)), the redaction engine performs pattern-based scanning to detect and mask personal names, patient and physician names, Social Security Numbers (SSNs), Medical Record Numbers (MRNs), and related identifying patterns while generating an audit mapping of masked entries.

### C. Domain-Weighted Extractive Summarization Equation
Rather than generating abstractive text that risks altering legal obligations or medical instructions, Briefly ranks original candidate sentences $S$ using a multi-factor scoring function incorporating term importance, positional bias, domain-specific vocabulary indicators, sentence-length penalties, and paragraph diversity:

$$\text{Score}(S) = w_{\text{tfidf}} \times \text{TFIDF}(S) + w_{\text{pos}} \times \text{PosBias}(S) + w_{\text{domain}} \times \sum_{k \in D} I(k \in S) - \text{Penalty}(|S|)$$

Where:
- $\text{TFIDF}(S)$ measures term importance.
- $\text{PosBias}(S)$ captures positional significance.
- $D$ represents the domain vocabulary (*"shall"*, *"indemnify"*, *"liability"*, *"breach"*, *"remedy"* for legal texts; *"diagnosis"*, *"prescribed"*, *"dosage"*, *"warning"*, *"emergency"* for medical texts).
- $I(k \in S)$ is the indicator function for domain term occurrence.
- $w_{\text{tfidf}}$, $w_{\text{pos}}$, and $w_{\text{domain}}$ are weighting parameters.
- $\text{Penalty}(|S|)$ penalizes extreme sentence lengths.

### D. Provenance Verification & Information Retention Equation
To verify whether generated summaries remain grounded in the original source text, the provenance module maps summary statements back to source paragraph indexes and character ranges and computes an internal retention index:

$$\text{RetentionIndex} = 0.6 \times \text{Grounding}(S) + 0.4 \times \text{EntityPreservation}(S)$$

Where $\text{Grounding}(S)$ measures lexical support from source paragraphs and $\text{EntityPreservation}(S)$ evaluates the retention of key named entities and numerical values.

---

## 4. Backend Implementation

The backend is implemented in Node.js using the Express.js framework and exposes REST API endpoints for document parsing, redaction, summarization, provenance verification, and sample document access. Processing responsibilities are separated into six modular JavaScript NLP services:

| Component / Module | Technology | Core Responsibility |
| :--- | :--- | :--- |
| **Backend Runtime & API** | Node.js, Express.js | REST API routing and modular service orchestration |
| **`textParser.js`** | Custom JavaScript NLP | Text normalization, paragraph indexing, abbreviation-aware splitting, readability |
| **`redactionEngine.js`** | Pattern-Based Scanner | PII/PHI entity detection, value masking, and audit mapping |
| **`nlpSummarizer.js`** | Local Extractive Engine | Multi-factor domain-weighted sentence scoring and paragraph diversity selection |
| **`provenanceVerifier.js`** | Grounding & Entity Engine | Source paragraph/character linkage and RetentionIndex computation |
| **`glossaryService.js`** | Domain Lexicon Service | Plain-language definitions for legal and clinical terminology |
| **`queryEngine.js`** | Token-Overlap Search | In-document search and retrieval-based question answering |
| **Optional AI Integration** | Google Gemini API | External AI summarization with automatic local extractive fallback |

---

## 5. Frontend & Accessibility Implementation

The browser-based frontend (HTML, CSS, JavaScript) communicates with the Express.js REST API and incorporates accessibility features designed to reduce cognitive load when reviewing dense documents:
- **Dyslexia-Friendly Typography & Scaling:** Supports Atkinson Hyperlegible font rendering alongside dynamic font scaling controls.
- **Adaptive Reading Themes:** Provides Parchment Light, Archive Dark, and High Contrast visual themes.
- **Split-View Provenance Interface:** Displays generated summaries alongside original source paragraphs with visual linkage highlights.
- **Assistive Audio & Glossary Popovers:** Integrates Web Speech API text-to-speech playback and inline plain-language glossary definitions.

---

## 6. Testing & Empirical Verification

### A. Automated Backend Test Suite Execution
The backend implementation was evaluated using an automated test suite covering abbreviation-aware sentence splitting, paragraph indexing, readability metrics, PII/PHI entity detection, redaction audit mapping, legal and medical summarization, provenance retention scoring, glossary lookup, document querying, and Google Gemini configuration. All 12 executed tests passed successfully:

| Test Area | Expected Functionality | Result |
| :--- | :--- | :---: |
| **Sentence splitting** | Protect supported legal and medical abbreviations | **PASSED** |
| **Paragraph indexing** | Identify paragraph structure and headings | **PASSED** |
| **Readability** | Calculate Flesch Reading Ease and Grade Level indicators | **PASSED** |
| **Sensitive entity detection** | Identify supported PII/PHI and legal patterns | **PASSED** |
| **Redaction** | Mask detected information and generate audit mapping | **PASSED** |
| **Legal summarization** | Generate an extractive legal summary | **PASSED** |
| **Medical summarization** | Generate an extractive medical summary | **PASSED** |
| **Provenance** | Calculate retention score and source linkage | **PASSED** |
| **Glossary** | Retrieve plain-language definitions | **PASSED** |
| **Query engine** | Retrieve relevant document information | **PASSED** |
| **Gemini configuration** | Validate default model and prompt construction | **PASSED** |
| **Integration Execution** | Verify cross-service communication & execution | **PASSED** |

```
================= Automated Backend Test Suite: 12 / 12 PASSED =================
```

### B. Interpretation of Verification Results
The passing execution of all 12 automated tests confirms that the decoupled backend services operate reliably and integrate properly across the document analysis pipeline. However, these results validate functional software behavior on representative test inputs and do not establish clinical accuracy, legal reliability, exhaustive PII/PHI recall, or comparative superiority over large-scale benchmarked summarization models.

---

## 7. Limitations & Future Work

- **Dependence on Lexical Features:** Local extractive ranking relies on term frequency, positional bias, and keyword matching, which may miss deeper semantic relationships; future iterations will integrate pretrained transformer models (BART, BioBERT, Legal-BERT) and sentence-transformer embeddings.
- **Pattern-Based PII/PHI Detection:** Regular-expression and pattern scanning may miss sensitive identifiers in unstructured contexts; integrating contextual named-entity recognition (NER) models will improve redaction coverage.
- **Benchmark & Human Evaluation:** Evaluating summaries against annotated legal and clinical corpora using ROUGE-1, ROUGE-2, and ROUGE-L alongside domain-expert review is required to validate summary quality and the internal RetentionIndex metric.
- **Multilingual & Constrained Abstractive Support:** Future development includes adding translation and processing support for Hindi and regional Indian languages, alongside constrained abstractive generation.
- **Advisory Boundaries & External API Dependency:** Gemini-assisted summarization depends on external API availability and data-transmission policies, and the platform serves strictly as a comprehension aid rather than a substitute for qualified legal or medical advice.

---

## 8. Conclusion

Briefly demonstrates a modular, human-centric framework for summarizing, redacting, and verifying legal and medical documents. By combining abbreviation-aware parsing, HIPAA-informed PII/PHI masking, domain-weighted extractive scoring, source-paragraph provenance tracking, optional Google Gemini integration with local fallback, and an accessible reading interface, the system enables non-specialist readers to navigate complex documents while maintaining direct traceability to original source passages.

---

## 9. References

1. H. P. Luhn, "The automatic creation of literature abstracts," *IBM Journal of Research and Development*, vol. 2, no. 2, pp. 159–165, 1958.
2. K. S. Jones, "A statistical interpretation of term specificity and its application in retrieval," *Journal of Documentation*, vol. 28, no. 1, pp. 11–21, 1972.
3. S. Brin and L. Page, "The anatomy of a large-scale hypertextual Web search engine," *Computer Networks and ISDN Systems*, vol. 30, nos. 1–7, pp. 107–117, 1998.
