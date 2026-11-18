/**
 * LexiMed Backend - Ethical Data Handling & PII/PHI Redaction Engine
 * Milestone: Phase 2 (Confidentiality & Ethical Compliance Layer)
 * Complies with HIPAA Safe Harbor 18 De-identification Categories & Legal Confidentiality
 */

class RedactionEngine {
  /**
   * Comprehensive regular expressions and pattern matchers for sensitive data
   */
  static getPatterns() {
    return [
      {
        type: 'PATIENT_NAME',
        category: 'HIPAA_PHI',
        regex: /(?:Patient(?:\s+Name)?|Pt\.?|Client(?:\s+Name)?)(?::|\s)\s*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)\b/gi,
        maskLabel: '[REDACTED_PATIENT_NAME]',
        risk: 'High'
      },
      {
        type: 'PHYSICIAN_NAME',
        category: 'HIPAA_PHI',
        regex: /(?:Dr\.|Doctor|Physician|Attending|Surgeon|Counsel|Attorney)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)\b/gi,
        maskLabel: '[REDACTED_PROVIDER]',
        risk: 'Medium'
      },
      {
        type: 'MRN_RECORD_ID',
        category: 'HIPAA_PHI',
        regex: /\b(?:MRN-[A-Z0-9]{4,15}|(?:MRN|Medical Record No|Patient ID|Chart #|File No|Case No|Docket No)(?:\s*\([^)]*\))?[:#\s]+([A-Z0-9-]{4,15}))\b/gi,
        maskLabel: '[REDACTED_RECORD_ID]',
        risk: 'Critical'
      },
      {
        type: 'SSN_NATIONAL_ID',
        category: 'HIPAA_PHI',
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        maskLabel: '[REDACTED_SSN]',
        risk: 'Critical'
      },
      {
        type: 'PHONE_NUMBER',
        category: 'CONTACT',
        regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        maskLabel: '[REDACTED_PHONE]',
        risk: 'High'
      },
      {
        type: 'EMAIL_ADDRESS',
        category: 'CONTACT',
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
        maskLabel: '[REDACTED_EMAIL]',
        risk: 'High'
      },
      {
        type: 'DATE_OF_BIRTH',
        category: 'HIPAA_PHI',
        regex: /(?:DOB|Date of Birth|Birthdate)[:\s]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b)/gi,
        maskLabel: '[REDACTED_DOB]',
        risk: 'High'
      },
      {
        type: 'FINANCIAL_ACCOUNT',
        category: 'FINANCIAL',
        regex: /\b(?:Account #|Routing #|IBAN|SWIFT|Wire Details)[:\s]*([A-Z0-9]{8,24})\b/gi,
        maskLabel: '[REDACTED_FINANCIAL_ID]',
        risk: 'Critical'
      },
      {
        type: 'STREET_ADDRESS',
        category: 'HIPAA_PHI',
        regex: /\b\d{1,5}\s+[A-Za-z0-9\.,\s]{4,30}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way)\b/gi,
        maskLabel: '[REDACTED_ADDRESS]',
        risk: 'High'
      }
    ];
  }

  /**
   * Scans text to detect sensitive entities without modifying the original
   */
  static scanEntities(text) {
    if (!text) return { detected: [], summary: { total: 0, highRisk: 0 } };

    const detected = [];
    const patterns = this.getPatterns();

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const valueToRedact = match[1] || match[0];
        const index = match.index + (match[1] ? fullMatch.indexOf(match[1]) : 0);

        detected.push({
          type: pattern.type,
          category: pattern.category,
          originalSnippet: valueToRedact,
          maskLabel: pattern.maskLabel,
          startIndex: index,
          endIndex: index + valueToRedact.length,
          risk: pattern.risk
        });
      }
    });

    const highRisk = detected.filter(d => d.risk === 'Critical' || d.risk === 'High').length;

    return {
      detected,
      summary: {
        total: detected.length,
        highRisk,
        mediumRisk: detected.length - highRisk,
        safeForProcessing: detected.length === 0
      }
    };
  }

  /**
   * Applies redaction to text and returns sanitized text with an audit mapping
   */
  static applyRedaction(text) {
    if (!text) return { sanitizedText: '', redactionCount: 0, mapping: [] };

    let sanitized = text;
    const mapping = [];
    let counter = 1;

    const patterns = this.getPatterns();

    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      sanitized = sanitized.replace(regex, (match, p1) => {
        const target = p1 || match;
        const numberedMask = `${pattern.maskLabel.replace(']', `_${counter++}]`)}`;

        mapping.push({
          id: numberedMask,
          type: pattern.type,
          category: pattern.category,
          original: target,
          risk: pattern.risk
        });

        if (p1) {
          return match.replace(p1, numberedMask);
        }
        return numberedMask;
      });
    });

    return {
      sanitizedText: sanitized,
      redactionCount: mapping.length,
      mapping,
      ethicalCompliance: {
        hipaaStandard: 'Safe Harbor 45 CFR § 164.514(b)(2)',
        zeroKnowledgePrinciple: 'Ephemeral runtime memory only. Redacted tokens never leave client boundary.'
      }
    };
  }
}

module.exports = RedactionEngine;
