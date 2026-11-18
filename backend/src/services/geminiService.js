/**
 * Briefly Backend - Google Gemini API Integration Service
 * Specializes in Legal and Medical Document Analysis & Synthesis
 * Optimized for Gemini's Lowest-Tier Free Model: gemini-1.5-flash-8b / gemini-1.5-flash
 */

const TextParser = require('./textParser');

class GeminiService {
  /**
   * Default model: lowest tier / lowest latency free-access model
   * gemini-1.5-flash-8b has 15 RPM, 1M TPM, and 1,500 RPD for free in Google AI Studio.
   */
  static DEFAULT_MODEL = 'gemini-1.5-flash-8b';

  /**
   * Resolve active API Key from argument, process.env, or headers
   */
  static getApiKey(explicitKey) {
    return explicitKey || process.env.GEMINI_API_KEY || null;
  }

  /**
   * Resolve model name
   */
  static getModel(explicitModel) {
    return explicitModel || process.env.GEMINI_MODEL || this.DEFAULT_MODEL;
  }

  /**
   * Check if Gemini API is configured and ready
   */
  static isAvailable(explicitKey) {
    const key = this.getApiKey(explicitKey);
    return Boolean(key && key.trim().length > 10);
  }

  /**
   * Build the specialized prompt for legal or medical document analysis
   */
  static buildPrompt(text, domain = 'legal', summaryDepth = 'medium') {
    const depthInstruction = {
      short: 'Deliver a concise, executive-level summary focusing strictly on the single highest-impact findings and obligations.',
      medium: 'Deliver a balanced, rigorous professional summary covering primary directives, risk factors, and actionable instructions.',
      detailed: 'Deliver an in-depth comprehensive analysis with thorough breakdown of covenants/findings, sub-clauses, and full timelines.'
    }[summaryDepth] || 'Deliver a balanced, rigorous professional summary.';

    if (domain === 'medical') {
      return `You are an expert clinical medical analyst and physician documentation assistant.
Analyze the following medical record (discharge summary, clinical encounter, lab findings, operative report, or scanned chart pages).
Depth directive: ${depthInstruction}

Strict Requirements:
1. Synthesize objective clinical findings, vital signs, primary diagnoses, and patient trajectory. If document images or scanned pages are provided, perform high-accuracy OCR vision analysis on all pages.
2. Extract exact medication regimens (dosages, frequencies, routes, titration) with zero hallucination.
3. Highlight critical emergency red flags, contraindicated drugs/allergies, and post-discharge rehabilitation timelines.
4. Provide a single critical clinical takeaway in "actionNote".

You MUST reply with ONLY a valid, parseable JSON object matching this schema:
{
  "overview": "Clinical summary paragraph (2-3 sentences) detailing encounter purpose, patient status, and core trajectory.",
  "actionNote": "Crucial clinical takeaway, red-flag warning, or urgent follow-up directive.",
  "structuredCategories": [
    {
      "categoryName": "Primary Diagnoses & Clinical Findings",
      "categoryDescription": "Key conditions, diagnostic workups, and hemodynamics",
      "items": [
        { "text": "Specific finding or diagnostic detail" }
      ]
    },
    {
      "categoryName": "Medication Regimen & Dosage Instructions",
      "categoryDescription": "Prescriptions, dosages, routes, and allergy contraindications",
      "items": [
        { "text": "Specific medication, dosage, and schedule" }
      ]
    },
    {
      "categoryName": "Critical Warnings & Post-Discharge Care",
      "categoryDescription": "Emergency red flags, activity/diet restrictions, and clinic follow-up timeline",
      "items": [
        { "text": "Specific warning or follow-up instruction" }
      ]
    }
  ],
  "executiveDigest": [
    { "text": "Key clinical fact or finding" },
    { "text": "Key medication or vital parameter" },
    { "text": "Key follow-up directive" }
  ]
}

DOCUMENT CONTENT / TRANSCRIPT:
"""
${text}
"""`;
    }

    // Default: Legal Domain
    return `You are a senior legal analyst and commercial contract specialist.
Analyze the following legal document (commercial contract, employment agreement, NDA, statutory brief, scanned court record, or intellectual property assignment).
Depth directive: ${depthInstruction}

Strict Requirements:
1. Synthesize primary covenants, consideration, party obligations, and performance deliverables. If document images or scanned pages are provided, perform high-accuracy OCR vision analysis on all pages.
2. Extract exact liability caps, indemnification triggers, intellectual property assignments, and breach remedies with zero hallucination.
3. Identify governing law, dispute resolution forums (arbitration/courts), and termination notice requirements.
4. Provide a single high-priority legal takeaway in "actionNote".

You MUST reply with ONLY a valid, parseable JSON object matching this schema:
{
  "overview": "Executive legal overview paragraph (2-3 sentences) identifying parties, agreement purpose, and scope.",
  "actionNote": "Crucial practical takeaway, compliance deadline, or countersignature obligation.",
  "structuredCategories": [
    {
      "categoryName": "Core Obligations & Covenants",
      "categoryDescription": "Binding duties, performance deliverables, and operational commitments",
      "items": [
        { "text": "Specific obligation or covenant clause" }
      ]
    },
    {
      "categoryName": "Risk, Indemnity & Liabilities",
      "categoryDescription": "Financial liability caps, indemnification indemnities, and breach penalties",
      "items": [
        { "text": "Specific liability cap or indemnification clause" }
      ]
    },
    {
      "categoryName": "Jurisdiction & Termination Rules",
      "categoryDescription": "Governing statutory law, arbitration rules, and notice periods",
      "items": [
        { "text": "Specific governing jurisdiction or termination notice requirement" }
      ]
    }
  ],
  "executiveDigest": [
    { "text": "Key contractual term or covenant" },
    { "text": "Key risk or liability protection" },
    { "text": "Key dispute or termination condition" }
  ]
}

DOCUMENT CONTENT / TRANSCRIPT:
"""
${text}
"""`;
  }

  /**
   * Execute Document Summarization & Analysis via Google Gemini API
   * Supports both pure text and multimodal document scans / PDFs (inlineData)
   */
  static async summarizeDocument(text, options = {}) {
    const {
      domain = 'legal',
      summaryDepth = 'medium',
      apiKey: explicitKey,
      model: explicitModel,
      fileBase64,
      mimeType = 'application/pdf',
      filename
    } = options;

    const apiKey = this.getApiKey(explicitKey);
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const model = this.getModel(explicitModel);
    const prompt = this.buildPrompt(text, domain, summaryDepth);

    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts = [];

    // Attach multimodal base64 binary document data if present (e.g. scanned PDF or image)
    if (fileBase64 && typeof fileBase64 === 'string') {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '').trim();
      if (cleanBase64.length > 50) {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'application/pdf',
            data: cleanBase64
          }
        });
      }
    }

    // Always include specialized domain prompt
    parts.push({ text: prompt });

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 2500
      }
    };

    // Calculate word counts for metrics
    let originalWords = (text || '').trim().split(/\s+/).filter(Boolean).length;
    if (originalWords < 20 && fileBase64) {
      // Estimated word count for scanned document pages
      originalWords = 650;
    }

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      throw new Error('Gemini API returned an empty or invalid candidate response.');
    }

    const rawOutput = candidate.content.parts[0].text;
    let cleanJson = rawOutput.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);

    // Calculate summary words
    const summaryDigestText = (parsed.executiveDigest || []).map(d => d.text).join(' ');
    const summaryCategoriesText = (parsed.structuredCategories || [])
      .flatMap(c => (c.items || []).map(i => i.text))
      .join(' ');
    const combinedSummaryText = `${parsed.overview || ''} ${summaryDigestText} ${summaryCategoriesText}`;
    const summaryWords = combinedSummaryText.trim().split(/\s+/).filter(Boolean).length;
    const compressionRatio = originalWords > 0
      ? `${Math.max(10, Math.round((1 - summaryWords / originalWords) * 100))}%`
      : '65%';
    const readingTimeSaved = `${Math.max(1, Math.round((originalWords - summaryWords) / 200))} mins`;

    return {
      success: true,
      provider: 'gemini',
      model: model,
      domain,
      summaryDepth,
      overview: parsed.overview || '',
      actionNote: parsed.actionNote || '',
      structuredCategories: parsed.structuredCategories || [],
      executiveDigest: parsed.executiveDigest || [],
      metrics: {
        originalWords,
        summaryWords,
        compressionRatio,
        readingTimeSaved,
        provider: `Google Gemini (${model} - Free Tier)`
      }
    };
  }
}

module.exports = GeminiService;
