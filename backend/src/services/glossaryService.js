/**
 * LexiMed Backend - Plain-Language Glossary & Jargon Demystifier
 * Milestone: Phase 5 (Human Comprehension & Accessibility Layer)
 * Aligns directly with UN SDG 10 (Reducing Information Inequality)
 */

class GlossaryService {
  static getTerms() {
    return {
      legal: {
        'force majeure': {
          term: 'Force Majeure',
          plainMeaning: 'Unforeseeable external circumstances (like natural disasters, war, or epidemics) that excuse a party from fulfilling contract duties without penalty.',
          context: 'Contract Law / Excused Non-Performance',
          example: 'If a hurricane shuts down a warehouse, force majeure protects the supplier from late-delivery fines.'
        },
        'indemnification': {
          term: 'Indemnification',
          plainMeaning: 'A promise by one party to pay for or reimburse legal expenses, damages, or losses suffered by the other party if a problem arises.',
          context: 'Liability & Risk Transfer',
          example: 'If someone sues over software you built for a client, the client expects you to cover their court costs.'
        },
        'indemnify': {
          term: 'Indemnify',
          plainMeaning: 'To compensate for harm, loss, or legal costs incurred by another party.',
          context: 'Risk Allocation',
          example: 'The vendor agrees to indemnify the buyer against third-party patent lawsuits.'
        },
        'severability': {
          term: 'Severability',
          plainMeaning: 'A rule stating that if a court finds one clause invalid or illegal, the rest of the contract remains valid and enforced.',
          context: 'Contract Enforcement',
          example: 'Even if the non-compete clause is thrown out, the non-disclosure agreement stays fully alive.'
        },
        'remedy': {
          term: 'Remedy',
          plainMeaning: 'The legal cure, compensation, or court order provided to fix a violation or breach.',
          context: 'Enforcement & Relief',
          example: 'Financial damages or a court injunction stopping someone from copying code.'
        },
        'liquidated damages': {
          term: 'Liquidated Damages',
          plainMeaning: 'A pre-agreed financial penalty set in advance inside the contract for a specific failure or delay.',
          context: 'Remedies for Breach',
          example: 'Paying $500 for every day a construction project is delivered past deadline.'
        },
        'jurisdiction': {
          term: 'Jurisdiction',
          plainMeaning: 'The official geographic or judicial territory where a court has legal power to hear a dispute.',
          context: 'Dispute Resolution',
          example: 'Agreements often specify: "Disputes will be decided exclusively in the courts of New York."'
        },
        'arbitration': {
          term: 'Arbitration',
          plainMeaning: 'Settling a dispute out of court using a private neutral decision-maker (arbitrator) instead of a judge and jury.',
          context: 'Alternative Dispute Resolution (ADR)',
          example: 'Faster and private, but usually waives the right to appeal to a regular court.'
        },
        'covenant': {
          term: 'Covenant',
          plainMeaning: 'A formal binding promise or legal obligation to do (or not do) something specific.',
          context: 'Contractual Obligation',
          example: 'A covenant not to solicit the company\'s existing customers for 12 months.'
        },
        'non-compete': {
          term: 'Non-Compete',
          plainMeaning: 'A restrictive clause barring someone from working for or starting a competing company for a set period.',
          context: 'Employment & Trade Restraint',
          example: 'Often subject to strict reasonableness tests regarding time and geography.'
        }
      },
      medical: {
        'myocardial infarction': {
          term: 'Myocardial Infarction',
          plainMeaning: 'A heart attack. Blood flow to a portion of the heart muscle was blocked, depriving tissues of oxygen.',
          context: 'Cardiology',
          example: 'Commonly treated with clot-dissolving drugs or stent placement.'
        },
        'infarction': {
          term: 'Infarction',
          plainMeaning: 'Tissue death caused by a sudden loss of blood supply to that organ.',
          context: 'Pathology & Vascular Medicine',
          example: 'Can happen in heart, brain (ischemic stroke), or kidneys.'
        },
        'dyspnea': {
          term: 'Dyspnea',
          plainMeaning: 'Shortness of breath; feeling like you cannot get enough air into your lungs.',
          context: 'Respiratory & Cardiac Symptom',
          example: 'Shortness of breath when climbing stairs or lying flat.'
        },
        'ejection fraction': {
          term: 'Ejection Fraction (EF)',
          plainMeaning: 'A measurement of how much blood the left ventricle pumps out with each contraction (Normal is 50% to 70%).',
          context: 'Cardiac Function',
          example: 'An EF of 40% indicates mild heart pumping weakness requiring medication.'
        },
        'npo': {
          term: 'NPO (Nil Per Os)',
          plainMeaning: 'Nothing by mouth. A strict instruction not to eat or drink anything (including water or gum).',
          context: 'Pre/Post-Operative Instruction',
          example: 'Prevents choking or aspiration during general anesthesia.'
        },
        'hypertension': {
          term: 'Hypertension',
          plainMeaning: 'High blood pressure; pressure of blood against artery walls is consistently elevated.',
          context: 'Vascular Medicine',
          example: 'Measured above 130/80 mmHg; managed with diet, exercise, and blood pressure pills.'
        },
        'contraindication': {
          term: 'Contraindication',
          plainMeaning: 'A specific condition or factor that makes a particular drug or treatment inadvisable or dangerous.',
          context: 'Pharmacology & Safety',
          example: 'Severe kidney disease is a contraindication for certain imaging dyes.'
        },
        'po': {
          term: 'P.O. (Per Os)',
          plainMeaning: 'Taken by mouth (swallowed orally as a pill, capsule, or liquid).',
          context: 'Medication Administration',
          example: '"Metoprolol 25mg PO Daily" means swallow one 25mg tablet once every day.'
        },
        'bid': {
          term: 'B.I.D. (Bis In Die)',
          plainMeaning: 'Twice a day (typically taken 10 to 12 hours apart, e.g., with breakfast and dinner).',
          context: 'Dosing Frequency',
          example: '"Ciprofloxacin 500mg BID" = Take 1 pill in morning and 1 pill at evening.'
        },
        'prn': {
          term: 'P.R.N. (Pro Re Nata)',
          plainMeaning: 'As needed. Take only when a specific symptom occurs (e.g., pain or nausea).',
          context: 'Dosing Instruction',
          example: '"Ondansetron 4mg PRN nausea" = Only take if feeling nauseous, not continuously.'
        },
        'pathology': {
          term: 'Pathology',
          plainMeaning: 'The study and microscopic examination of diseased cells and tissues to confirm exact diagnoses.',
          context: 'Laboratory Diagnostics',
          example: 'Checking a biopsy under a microscope to confirm if a tumor is benign or malignant.'
        },
        'edema': {
          term: 'Edema',
          plainMeaning: 'Swelling caused by excess fluid trapped in the body\'s tissues (frequently seen in feet, ankles, or lungs).',
          context: 'Clinical Finding',
          example: 'Often indicates fluid buildup from heart, liver, or kidney problems.'
        }
      }
    };
  }

  /**
   * Annotates text by identifying jargon words and wrapping them with metadata
   */
  static annotateTextWithGlossary(text, domain = 'legal') {
    if (!text) return text;
    const dictionary = this.getTerms()[domain] || this.getTerms().legal;
    const sortedTerms = Object.keys(dictionary).sort((a, b) => b.length - a.length);

    let annotated = text;
    sortedTerms.forEach(term => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      annotated = annotated.replace(regex, (match) => {
        const entry = dictionary[term.toLowerCase()];
        if (!entry) return match;
        return `<mark class="term-anchor" data-term="${entry.term}" data-plain="${entry.plainMeaning}" data-context="${entry.context}">${match}</mark>`;
      });
    });

    return annotated;
  }
}

module.exports = GlossaryService;
