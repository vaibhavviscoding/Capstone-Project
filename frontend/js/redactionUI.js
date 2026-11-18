/**
 * LexiMed Frontend - Ethical PII/PHI Redaction Visualizer
 * Provides transparent data sanitization auditing for HIPAA and legal confidentiality
 */

class RedactionUI {
  constructor(app) {
    this.app = app;
    this.isRedacted = false;
    this.currentAuditData = null;

    this.toggleBtn = document.getElementById('btn-toggle-redaction');
    this.btnText = document.getElementById('redaction-btn-text');
    this.statusBadge = document.getElementById('meta-sanitized-status');
    this.modal = document.getElementById('redaction-modal');
    this.modalBody = document.getElementById('redaction-modal-body');
    this.btnClose = document.getElementById('btn-close-redaction-modal');
    this.btnCancel = document.getElementById('btn-redaction-cancel');
    this.btnApply = document.getElementById('btn-redaction-apply');

    this.initListeners();
  }

  initListeners() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.openAuditModal());
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.closeModal());
    }

    if (this.btnCancel) {
      this.btnCancel.addEventListener('click', () => {
        this.setRedactionState(false);
        this.closeModal();
      });
    }

    if (this.btnApply) {
      this.btnApply.addEventListener('click', () => {
        this.setRedactionState(true);
        this.closeModal();
      });
    }
  }

  async openAuditModal() {
    const text = this.app.getCurrentRawText();
    if (!text) return;

    this.modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Scanning document for HIPAA Safe Harbor 18 identifiers & legal confidentiality markers...
      </div>
    `;
    this.modal.classList.add('open');

    try {
      const response = await fetch('/api/documents/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, executeRedaction: true })
      });

      const data = await response.json();
      this.currentAuditData = data;
      this.renderAuditReport(data);
    } catch (err) {
      console.warn('Backend redaction call failed, running client-side fallback:', err);
      this.renderClientFallback(text);
    }
  }

  renderClientFallback(text) {
    const patterns = [
      { type: 'PATIENT_NAME', regex: /(?:Patient(?:\s+Name)?|Pt\.?|Client(?:\s+Name)?)(?::|\s)\s*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)\b/gi, mask: '[REDACTED_PATIENT_NAME]', risk: 'High' },
      { type: 'PHYSICIAN_NAME', regex: /(?:Dr\.|Doctor|Physician|Attending|Surgeon|Counsel|Attorney)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)\b/gi, mask: '[REDACTED_PROVIDER]', risk: 'Medium' },
      { type: 'MRN_RECORD_ID', regex: /\b(?:MRN-[A-Z0-9]{4,15}|(?:MRN|Medical Record No|Patient ID|Chart #|File No|Case No|Docket No)(?:\s*\([^)]*\))?[:#\s]+([A-Z0-9-]{4,15}))\b/gi, mask: '[REDACTED_RECORD_ID]', risk: 'Critical' },
      { type: 'SSN_NATIONAL_ID', regex: /\b\d{3}-\d{2}-\d{4}\b/g, mask: '[REDACTED_SSN]', risk: 'Critical' },
      { type: 'PHONE_NUMBER', regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, mask: '[REDACTED_PHONE]', risk: 'High' },
      { type: 'EMAIL_ADDRESS', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, mask: '[REDACTED_EMAIL]', risk: 'High' },
      { type: 'DATE_OF_BIRTH', regex: /(?:DOB|Date of Birth|Birthdate)[:\s]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b)/gi, mask: '[REDACTED_DOB]', risk: 'High' },
      { type: 'STREET_ADDRESS', regex: /\b\d{1,5}\s+[A-Za-z0-9\.,\s]{4,30}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way)\b/gi, mask: '[REDACTED_ADDRESS]', risk: 'High' }
    ];

    const detected = [];
    let redactedText = text;

    patterns.forEach(p => {
      let match;
      const re = new RegExp(p.regex.source, p.regex.flags);
      while ((match = re.exec(text)) !== null) {
        const val = match[1] || match[0];
        detected.push({
          type: p.type,
          originalSnippet: val,
          maskLabel: p.mask,
          risk: p.risk
        });
        redactedText = redactedText.replace(val, p.mask);
      }
    });

    const fallbackData = {
      scan: { detected, summary: { total: detected.length } },
      redactedText,
      redactionCount: detected.length
    };

    this.currentAuditData = fallbackData;
    this.renderAuditReport(fallbackData);
  }

  renderAuditReport(data) {
    const scan = data.scan || { detected: [], summary: { total: 0 } };
    const detected = scan.detected || [];

    let rowsHtml = '';
    if (detected.length === 0) {
      rowsHtml = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No sensitive identifiers detected in this document.</td></tr>`;
    } else {
      rowsHtml = detected.map(item => `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 0.6rem 0.75rem; font-family: var(--font-mono); font-size: 0.775rem; color: var(--border-focus);">${item.type}</td>
          <td style="padding: 0.6rem 0.75rem; font-weight: 600;">${this.escapeHtml(item.originalSnippet)}</td>
          <td style="padding: 0.6rem 0.75rem; font-family: var(--font-mono); font-size: 0.775rem; color: var(--text-muted);">${item.maskLabel}</td>
          <td style="padding: 0.6rem 0.75rem;">
            <span style="font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.45rem; border-radius: var(--radius-sm); background: ${item.risk === 'Critical' ? 'var(--danger-tint)' : 'var(--warning-tint)'}; color: ${item.risk === 'Critical' ? 'var(--danger-crimson)' : 'var(--warning-amber)'};">
              ${item.risk} Risk
            </span>
          </td>
        </tr>
      `).join('');
    }

    this.modalBody.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem;">
          <h4 style="font-weight: 700; color: var(--text-primary);">De-Identification Findings</h4>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">${detected.length} Identifiers Identified</span>
        </div>
        <p style="font-size: 0.825rem; color: var(--text-secondary); margin-bottom: 1rem;">
          In accordance with HIPAA 45 CFR § 164.514(b)(2) and legal attorney-client privilege guidelines, you can replace real names, hospital record numbers, and dates with reversible cryptographically isolated mask tokens.
        </p>

        <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.825rem; text-align: left;">
            <thead>
              <tr style="background-color: var(--bg-surface-warm); border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary); font-size: 0.725rem; text-transform: uppercase;">
                <th style="padding: 0.6rem 0.75rem;">Category</th>
                <th style="padding: 0.6rem 0.75rem;">Original String</th>
                <th style="padding: 0.6rem 0.75rem;">Mask Token</th>
                <th style="padding: 0.6rem 0.75rem;">Privacy Risk</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  setRedactionState(enabled) {
    this.isRedacted = enabled;
    if (this.btnText) {
      this.btnText.textContent = enabled ? 'PII Shield: Active' : 'PII Shield: Off';
    }
    if (this.toggleBtn) {
      this.toggleBtn.classList.toggle('active', enabled);
    }
    if (this.statusBadge) {
      if (enabled) {
        this.statusBadge.textContent = '🛡️ PHI/PII Masked with Safe Harbor Tokens';
        this.statusBadge.style.color = 'var(--status-warning)';
      } else {
        this.statusBadge.textContent = 'Original Unaltered Text';
        this.statusBadge.style.color = 'var(--status-success)';
      }
    }

    // Trigger document reload in reader with sanitized text if enabled
    this.app.onRedactionChanged(enabled, this.currentAuditData ? this.currentAuditData.redactedText : null);
  }

  closeModal() {
    this.modal.classList.remove('open');
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

window.RedactionUI = RedactionUI;
