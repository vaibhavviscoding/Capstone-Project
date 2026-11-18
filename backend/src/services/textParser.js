/**
 * LexiMed Backend - Ingestion & Text Normalization Service
 * Milestone: Phase 1 (Core Document Processing Engine)
 * Part of Capstone Project: Legal & Medical Document Summarizer
 */

class TextParser {
  /**
   * Cleans raw text input, handles erratic spacing and normalization
   */
  static cleanText(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    return rawText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Intelligently splits text into paragraphs while preserving structure
   */
  static parseParagraphs(text) {
    const cleaned = this.cleanText(text);
    if (!cleaned) return [];

    const rawBlocks = cleaned.split(/\n\s*\n+/);
    let cumulativeCharIndex = 0;

    return rawBlocks
      .map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const charStart = text.indexOf(trimmed, cumulativeCharIndex);
        const charEnd = charStart !== -1 ? charStart + trimmed.length : cumulativeCharIndex + trimmed.length;
        cumulativeCharIndex = charEnd;

        // Detect if this paragraph is a heading
        const isHeading = this.detectHeading(trimmed);
        const sentences = this.splitIntoSentences(trimmed);
        const words = this.tokenizeWords(trimmed);

        return {
          id: `para_${index + 1}`,
          order: index + 1,
          isHeading,
          content: trimmed,
          sentences,
          wordCount: words.length,
          sentenceCount: sentences.length,
          charStart,
          charEnd
        };
      })
      .filter(Boolean);
  }

  /**
   * Heading heuristic detector (short line, uppercase, or numbered legal/medical clause)
   */
  static detectHeading(block) {
    if (block.length > 120) return false;
    // Check for Section, Article, Clause, Goal, or numbered prefix
    if (/^(SECTION|ARTICLE|CLAUSE|GOAL|EXHIBIT|SCHEDULE|RECITALS|DIAGNOSIS|HISTORY|MEDICATIONS|PLAN|DISCHARGE|FOLLOW-UP)\b/i.test(block)) {
      return true;
    }
    // Check for numeric header: "1.0", "1.1", "IV."
    if (/^(\d+(\.\d+)*|[IVXLCDM]+\.)\s+[A-Z]/i.test(block)) {
      return true;
    }
    // Check if entire block is uppercase
    if (block === block.toUpperCase() && block.length > 3 && /[A-Z]/.test(block)) {
      return true;
    }
    return false;
  }

  /**
   * Domain-aware sentence splitter that protects legal/medical abbreviations
   */
  static splitIntoSentences(text) {
    if (!text) return [];

    const protectedTitles = [
      'Dr', 'Mr', 'Ms', 'Mrs', 'Prof', 'Sr', 'Jr', 'vs', 'e\\.g', 'i\\.e', 'etc',
      'vol', 'dept', 'approx', 'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Sept', 'Oct', 'Nov', 'Dec'
    ];

    let masked = text;

    // 1. Protect middle initials (e.g., 'Robert C. Vance')
    masked = masked.replace(/\b([A-Z])\.\s+(?=[A-Z])/g, '$1\u2024 ');

    // 2. Protect decimal numbers (e.g., '1.5 mg', 'Section 4.2')
    masked = masked.replace(/(\d+)\.(\d+)/g, '$1\u2024$2');

    // 3. Protect titles followed by a space and capitalized word or number
    protectedTitles.forEach(t => {
      const re = new RegExp(`\\b(${t})\\.\\s+`, 'gi');
      masked = masked.replace(re, '$1\u2024 ');
    });

    // 4. Protect corporate abbreviations before lowercase words
    masked = masked.replace(/\b(Inc|Ltd|Corp|Co)\.\s+(?=[a-z])/gi, '$1\u2024 ');

    // 5. Split on true sentence terminals (. ! ?) followed by whitespace and capital/quote/number
    const rawSentences = masked.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);

    // 6. Restore original dots and trim
    return rawSentences
      .map(s => s.replace(/\u2024/g, '.').trim())
      .filter(s => s.length > 0);
  }

  /**
   * Tokenizes text into lowercase normalized words
   */
  static tokenizeWords(text) {
    if (!text) return [];
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
    return words;
  }

  /**
   * Computes human readability metrics (Flesch Reading Ease, Flesch-Kincaid Grade)
   */
  static calculateReadabilityMetrics(text) {
    const words = this.tokenizeWords(text);
    const sentences = this.splitIntoSentences(text);

    const totalWords = words.length || 1;
    const totalSentences = sentences.length || 1;

    let totalSyllables = 0;
    words.forEach(w => {
      totalSyllables += this.countSyllables(w);
    });

    const wordsPerSentence = totalWords / totalSentences;
    const syllablesPerWord = totalSyllables / totalWords;

    // Flesch Reading Ease: 206.835 - (1.015 * ASL) - (84.6 * ASW)
    const readingEase = Math.max(0, Math.min(100, Math.round(206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord))));

    // Flesch-Kincaid Grade Level: (0.39 * ASL) + (11.8 * ASW) - 15.59
    const gradeLevel = Math.max(1, Math.round(((0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59) * 10) / 10);

    // Human reading speed estimation (~200 words per minute for dense technical text)
    const estimatedReadingTimeMinutes = Math.ceil(totalWords / 180);

    let complexityCategory = 'Standard';
    if (gradeLevel >= 16) complexityCategory = 'Post-Graduate / Highly Dense';
    else if (gradeLevel >= 12) complexityCategory = 'College / Professional';
    else if (gradeLevel >= 9) complexityCategory = 'High School';
    else complexityCategory = 'Accessible Plain Language';

    return {
      totalWords,
      totalSentences,
      averageSentenceLength: Math.round(wordsPerSentence * 10) / 10,
      fleschReadingEase: readingEase,
      fleschKincaidGrade: gradeLevel,
      complexityCategory,
      estimatedReadingTimeMinutes
    };
  }

  /**
   * Syllable counter heuristic for English words
   */
  static countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? Math.max(1, syllables.length) : 1;
  }
}

module.exports = TextParser;
