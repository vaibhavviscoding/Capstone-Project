/**
 * LexiMed Backend - Document Question Answering & Query Engine
 * Milestone: Phase 3 Extension (Interactive Document Querying & Search)
 * Answers user queries about document content with verified paragraph grounding
 */

const TextParser = require('./textParser');

class QueryEngine {
  /**
   * Evaluates a natural language question against the document and returns best grounded answers
   */
  static queryDocument(text, query, domain = 'legal') {
    if (!text || !query) {
      return { answer: 'Please provide both document text and a query.', matches: [] };
    }

    const paragraphs = TextParser.parseParagraphs(text);
    const stopwords = require('./nlpSummarizer').getStopwords();
    const queryTokens = TextParser.tokenizeWords(query).filter(w => !stopwords.has(w) && w.length > 2);
    
    if (queryTokens.length === 0) {
      return { answer: 'Query consisted only of common words. Please specify key terms.', matches: [] };
    }

    // Flatten all sentences across paragraphs
    const candidateSentences = [];
    paragraphs.forEach(p => {
      p.sentences.forEach(s => {
        if (s.trim().length > 15) {
          candidateSentences.push({
            paragraphId: p.id,
            paragraphOrder: p.order,
            isHeading: p.isHeading,
            sentenceText: s.trim(),
            tokens: new Set(TextParser.tokenizeWords(s))
          });
        }
      });
    });

    // Score sentences against query tokens
    const scored = candidateSentences.map(c => {
      let matchCount = 0;
      let matchedTerms = [];

      queryTokens.forEach(qt => {
        if (c.tokens.has(qt)) {
          matchCount += 1.5;
          matchedTerms.push(qt);
        } else if (qt.length >= 4) {
          // Check substring / stem match only for longer roots
          for (const token of c.tokens) {
            if (token.length >= 4 && (token.includes(qt) || qt.includes(token))) {
              matchCount += 0.9;
              matchedTerms.push(token);
              break;
            }
          }
        }
      });

      const score = queryTokens.length > 0 ? (matchCount / queryTokens.length) * 100 : 0;
      return {
        ...c,
        score: Math.round(score),
        matchedTerms: Array.from(new Set(matchedTerms))
      };
    });

    // Sort by relevance score
    const bestMatches = scored
      .filter(s => s.score > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (bestMatches.length === 0) {
      return {
        query,
        answer: 'No directly matching clause or finding was located for this specific inquiry. Please check the full document text.',
        confidence: 0,
        matches: []
      };
    }

    const topMatch = bestMatches[0];
    let fullAnswer = topMatch.sentenceText;

    // If top match is short (e.g. a heading or clause prefix like '4.3 Limitation of Liability.'),
    // retrieve subsequent context from the same paragraph
    const matchedPara = paragraphs.find(p => p.id === topMatch.paragraphId);
    if (matchedPara && fullAnswer.length < 50 && matchedPara.sentences.length > 1) {
      const matchIdx = matchedPara.sentences.findIndex(s => s.trim() === topMatch.sentenceText);
      if (matchIdx !== -1 && matchIdx + 1 < matchedPara.sentences.length) {
        fullAnswer = `${fullAnswer} ${matchedPara.sentences[matchIdx + 1].trim()}`;
      } else {
        fullAnswer = matchedPara.content;
      }
    }

    return {
      query,
      answer: fullAnswer,
      confidence: topMatch.score,
      paragraphId: topMatch.paragraphId,
      paragraphOrder: topMatch.paragraphOrder,
      matches: bestMatches.map(m => ({
        paragraphId: m.paragraphId,
        paragraphOrder: m.paragraphOrder,
        text: m.sentenceText,
        confidence: m.score,
        matchedTerms: m.matchedTerms
      }))
    };
  }

  /**
   * Pre-packaged intelligent questions tailored to the active domain
   */
  static getSuggestedQueries(domain = 'legal') {
    if (domain === 'legal') {
      return [
        'What is the aggregate liability cap?',
        'What is the non-compete duration and scope?',
        'What are the indemnification requirements?',
        'Which court or arbitration venue has jurisdiction?',
        'What happens in case of a force majeure event?'
      ];
    } else {
      return [
        'What was the primary admission diagnosis?',
        'What medications were prescribed at discharge?',
        'What are the emergency warning symptoms to call 911 for?',
        'What activities or foods are restricted?',
        'When is the outpatient follow-up appointment?'
      ];
    }
  }
}

module.exports = QueryEngine;
