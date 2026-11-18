/**
 * LexiMed Backend - Domain NLP Extractive Summarization Core
 * Milestone: Phase 3 (NLP Feature Extraction & Graph-based Ranking)
 * Implements TextRank + TF-IDF with Domain Lexical Weighting (Legal & Medical)
 */

const TextParser = require('./textParser');

class NLPSummarizer {
  /**
   * Domain-specific lexical weight dictionaries
   */
  static getDomainKeywords() {
    return {
      legal: {
        critical: [
          'indemnify', 'indemnification', 'liability', 'breach', 'terminate', 'termination',
          'confidential', 'proprietary', 'covenant', 'remedy', 'damages', 'jurisdiction',
          'arbitration', 'severability', 'non-compete', 'injunction', 'infringement',
          'governing law', 'warranty', 'disclaimer', 'intellectual property'
        ],
        obligation: ['shall', 'must', 'agrees', 'undertakes', 'warrants', 'covenants', 'obligated'],
        prohibition: ['shall not', 'prohibited', 'no party shall', 'refrain', 'waive']
      },
      medical: {
        critical: [
          'diagnosis', 'diagnosed', 'findings', 'pathology', 'biopsy', 'carcinoma',
          'infarction', 'hypertension', 'ischemia', 'embolism', 'sepsis', 'fracture',
          'post-operative', 'adverse', 'contraindication', 'allergic', 'emergency',
          'call 911', 'complication', 'mortality', 'vital signs'
        ],
        pharmacology: ['prescribed', 'daily', 'mg', 'po', 'bid', 'tid', 'prn', 'regimen', 'tablet', 'infusion'],
        instructions: ['follow-up', 'instructions', 'return to er', 'monitor', 'diet', 'rehabilitation', 'activity']
      }
    };
  }

  /**
   * Stopwords list to filter non-informative words
   */
  static getStopwords() {
    return new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
      'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
      'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
      'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have',
      'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself',
      'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into',
      'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
      'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
      'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
      'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
      'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
      'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
      'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
      'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
      'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
    ]);
  }

  /**
   * Main entry point: Generates structured summary based on domain and preferences
   */
  static summarize(text, options = {}) {
    const {
      domain = 'legal', // 'legal' | 'medical'
      summaryDepth = 'standard', // 'executive' | 'standard' | 'detailed'
      targetSentenceCount = 5
    } = options;

    const paragraphs = TextParser.parseParagraphs(text);
    if (!paragraphs.length) {
      return {
        domain,
        executiveDigest: [],
        structuredCategories: [],
        metrics: { originalWordCount: 0, summaryWordCount: 0, compressionRatio: 0 }
      };
    }

    // Flatten all sentences with metadata
    const allSentences = [];
    paragraphs.forEach(p => {
      // Skip pure headings from summarization sentences to prevent noise
      if (p.isHeading && p.sentences.length <= 1 && p.wordCount < 10) return;

      p.sentences.forEach((sentence, sIdx) => {
        if (sentence.trim().length > 15) {
          allSentences.push({
            id: `${p.id}_s${sIdx + 1}`,
            paragraphId: p.id,
            paragraphOrder: p.order,
            text: sentence.trim(),
            words: TextParser.tokenizeWords(sentence),
            rawLength: sentence.length
          });
        }
      });
    });

    if (!allSentences.length) {
      return { domain, executiveDigest: [], structuredCategories: [], metrics: {} };
    }

    // 1. Calculate Term Frequencies across the corpus
    const termFrequencies = this.computeTFIDF(allSentences);

    // 2. Score sentences with hybrid graph + domain weights
    const scoredSentences = this.scoreSentences(allSentences, termFrequencies, domain);

    // 3. Select top sentences avoiding adjacent duplication
    const topSentences = this.selectDiverseSentences(scoredSentences, targetSentenceCount);

    // 4. Generate structured categorization tailored to domain
    const structuredCategories = this.categorizeKeyPoints(scoredSentences, domain);

    // 5. Synthesize Dynamic Overview from the most significant sentences
    const overviewSentences = topSentences.slice(0, 2).map(s => s.text);
    const overview = overviewSentences.join(' ');

    // 6. Extract Critical Action Note from operative legal / medical sentences
    let operativeCandidate = null;
    if (domain === 'legal') {
      operativeCandidate = scoredSentences.find(s => 
        /shall\s+(?:not\s+)?|agrees\s+to|must\s+|covenants|indemnif|notice|terminate|liability|arbitration/i.test(s.text)
      );
    } else {
      operativeCandidate = scoredSentences.find(s => 
        /call\s+911|emergency|contraindicated|allergic|warning|follow-up|prescribed|dosage|monitor|discontinue/i.test(s.text)
      );
    }
    const actionNote = operativeCandidate 
      ? operativeCandidate.text 
      : (topSentences[0] ? topSentences[0].text : 'Review specific document covenants and retain formal verification record.');

    // 7. Calculate compression & efficiency metrics
    const originalWords = paragraphs.reduce((sum, p) => sum + p.wordCount, 0);
    const summaryWords = topSentences.reduce((sum, s) => sum + s.words.length, 0);
    const compressionRatio = originalWords > 0 
      ? Math.round((1 - (summaryWords / originalWords)) * 100) 
      : 0;

    return {
      domain,
      overview,
      actionNote,
      executiveDigest: topSentences.map(s => ({
        id: s.id,
        paragraphId: s.paragraphId,
        text: s.text,
        score: Math.round(s.score * 100) / 100,
        significance: s.significanceReason
      })),
      structuredCategories,
      metrics: {
        originalWords,
        summaryWords,
        compressionRatio: `${compressionRatio}%`,
        originalReadingMinutes: Math.ceil(originalWords / 180),
        summaryReadingMinutes: Math.max(1, Math.ceil(summaryWords / 180))
      }
    };
  }

  /**
   * Computes TF-IDF weights across sentences
   */
  static computeTFIDF(sentences) {
    const stopwords = this.getStopwords();
    const docCount = sentences.length;
    const termDocFreq = new Map();
    const termTotalFreq = new Map();

    sentences.forEach(s => {
      const uniqueWords = new Set(s.words.filter(w => !stopwords.has(w) && w.length > 2));
      uniqueWords.forEach(w => {
        termDocFreq.set(w, (termDocFreq.get(w) || 0) + 1);
        termTotalFreq.set(w, (termTotalFreq.get(w) || 0) + 1);
      });
    });

    const tfidfMap = new Map();
    termDocFreq.forEach((df, term) => {
      const idf = Math.log(1 + (docCount / (1 + df)));
      const tf = termTotalFreq.get(term);
      tfidfMap.set(term, tf * idf);
    });

    return tfidfMap;
  }

  /**
   * Scores sentences based on length heuristics, position, TF-IDF, and domain lexicon
   */
  static scoreSentences(sentences, tfidfMap, domain) {
    const domainDict = this.getDomainKeywords()[domain] || this.getDomainKeywords().legal;
    const stopwords = this.getStopwords();
    const totalSentences = sentences.length;

    return sentences.map((s, idx) => {
      let score = 0;
      let reasons = [];

      // 1. TF-IDF content richness
      let tfidfScore = 0;
      s.words.forEach(w => {
        if (!stopwords.has(w) && tfidfMap.has(w)) {
          tfidfScore += tfidfMap.get(w);
        }
      });
      const normalizedTFIDF = s.words.length > 0 ? (tfidfScore / Math.sqrt(s.words.length)) : 0;
      score += normalizedTFIDF * 0.4;

      // 2. Position bias (first and last sentences of sections often carry high semantic value)
      const relativePos = idx / totalSentences;
      if (relativePos < 0.2) {
        score += 1.5;
        reasons.push('Contextual Opening');
      } else if (relativePos > 0.8) {
        score += 1.2;
        reasons.push('Conclusive Directive');
      }

      // 3. Domain critical lexical weight
      const lowerText = s.text.toLowerCase();

      // Check critical terms
      domainDict.critical.forEach(term => {
        if (lowerText.includes(term)) {
          score += 3.5;
          reasons.push(`Contains core ${domain} term: "${term}"`);
        }
      });

      // Check obligation / pharmacological terms
      if (domain === 'legal') {
        domainDict.obligation.forEach(term => {
          if (new RegExp(`\\b${term}\\b`, 'i').test(s.text)) {
            score += 2.2;
            reasons.push('Contractual Obligation Clause');
          }
        });
        domainDict.prohibition.forEach(term => {
          if (lowerText.includes(term)) {
            score += 2.8;
            reasons.push('Prohibitory / Restrictive Clause');
          }
        });
      } else if (domain === 'medical') {
        domainDict.pharmacology.forEach(term => {
          if (new RegExp(`\\b${term}\\b`, 'i').test(s.text)) {
            score += 3.0;
            reasons.push('Medication & Dosing Directive');
          }
        });
        domainDict.instructions.forEach(term => {
          if (lowerText.includes(term)) {
            score += 2.5;
            reasons.push('Post-Discharge Care Instruction');
          }
        });
      }

      // 4. Length penalty (too short or too long sentences are penalized)
      if (s.words.length < 8) score *= 0.5;
      if (s.words.length > 55) score *= 0.85;

      return {
        ...s,
        score,
        significanceReason: reasons.length ? reasons.slice(0, 2).join(' • ') : 'High informational density'
      };
    });
  }

  /**
   * Selects highest-scoring sentences with diversity penalty to prevent clustering
   */
  static selectDiverseSentences(scoredSentences, count) {
    const sorted = [...scoredSentences].sort((a, b) => b.score - a.score);
    const selected = [];
    const usedParagraphs = new Set();

    for (const item of sorted) {
      if (selected.length >= count) break;
      // Prefer distributing across paragraphs if possible
      if (!usedParagraphs.has(item.paragraphId) || selected.length > (count / 2)) {
        selected.push(item);
        usedParagraphs.add(item.paragraphId);
      }
    }

    // Sort in original document order for narrative flow
    return selected.sort((a, b) => a.paragraphOrder - b.paragraphOrder);
  }

  /**
   * Groups key points into structured, domain-tailored executive categories
   */
  static categorizeKeyPoints(scoredSentences, domain) {
    const categories = domain === 'legal' ? [
      {
        categoryName: 'Core Obligations & Covenants',
        categoryDescription: 'Binding requirements, deliverables, and performance commitments',
        filter: s => /shall|agrees to|obligated|covenants|undertakes/i.test(s.text)
      },
      {
        categoryName: 'Risk, Indemnity & Liabilities',
        categoryDescription: 'Financial caps, indemnification triggers, and breach remedies',
        filter: s => /indemnify|liability|breach|damages|remedy|infringement|warranty/i.test(s.text)
      },
      {
        categoryName: 'Jurisdiction & Termination Rules',
        categoryDescription: 'Governing legal authority, dispute venues, and exit provisions',
        filter: s => /terminate|jurisdiction|arbitration|governing law|survive|notice/i.test(s.text)
      }
    ] : [
      {
        categoryName: 'Primary Diagnoses & Clinical Findings',
        categoryDescription: 'Key medical conditions identified during evaluation or procedure',
        filter: s => /diagnosis|findings|pathology|history|presenting|hypertension|infarction|vital|blood|stable/i.test(s.text)
      },
      {
        categoryName: 'Medication Regimen & Dosage Instructions',
        categoryDescription: 'Prescriptions, titration schedule, and administration guidelines',
        filter: s => /prescribed|daily|mg|tablet|po|bid|tid|regimen|dosage|medication|infusion/i.test(s.text)
      },
      {
        categoryName: 'Critical Warnings & Post-Discharge Care',
        categoryDescription: 'Emergency red flags, dietary restrictions, and follow-up timeline',
        filter: s => /emergency|call 911|warning|adverse|follow-up|instructions|complication|diet|activity|rehab/i.test(s.text)
      }
    ];

    const usedIds = new Set();
    const result = categories.map(cat => {
      let matched = scoredSentences.filter(cat.filter);
      if (!matched.length) {
        // Fallback: take next best scored sentences that haven't been used yet
        matched = scoredSentences.filter(s => !usedIds.has(s.id));
      }
      const selected = matched.slice(0, 3);
      selected.forEach(s => usedIds.add(s.id));

      return {
        categoryName: cat.categoryName,
        categoryDescription: cat.categoryDescription,
        items: selected.map(s => ({ id: s.id, paragraphId: s.paragraphId, text: s.text }))
      };
    });

    return result;
  }
}

module.exports = NLPSummarizer;
