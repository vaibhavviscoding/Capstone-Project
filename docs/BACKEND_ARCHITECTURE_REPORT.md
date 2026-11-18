# Briefly Backend Architecture Report
**Project:** Briefly: Legal and Medical Document Summarizer and Provenance Verification Suite  
**Authors:** Mimansha Bhandari, Kalpaja Sinha, Vaibhav Gupta  
**Institution:** School of Computer Science, IILM University, Greater Noida  
**Milestone:** Functional Backend Architecture Implemented & Verified (12/12 Automated Tests Passing)

## 1. Overview & Objective
In accordance with the project milestone schedule, **25% to 30% of the backend processing pipeline** has been architected, coded, and validated with unit test suites. The implemented services establish the foundational layers required for document ingestion, ethical privacy compliance, domain-specific NLP extraction, and factual retention verification.

---

## 2. Completed Backend Services Breakdown (28% Foundation)

| Service Module | Source File | Responsibilities & Algorithms | Status |
| :--- | :--- | :--- | :--- |
| **Ingestion & Normalizer** | `backend/src/services/textParser.js` | Text normalization, structural paragraph indexing, abbreviation-safe sentence splitting (`Dr.`, `v.`, `Inc.`, `1.5 mg`, middle initials), Flesch Reading Ease & Flesch-Kincaid Grade Level calculations. | **100% (Phase 1)** |
| **Ethical PII/PHI Redactor** | `backend/src/services/redactionEngine.js` | HIPAA Safe Harbor 18 De-identification scanner, patient/physician name masking, MRN/SSN sanitization, audit mapping generation. | **100% (Phase 2)** |
| **Domain NLP Summarizer** | `backend/src/services/nlpSummarizer.js` | Hybrid TF-IDF and graph-based TextRank scoring, legal obligation boosters (`shall`, `indemnify`, `liability`), medical clinical boosters (`diagnosis`, `mg`, `emergency`), structured sectional clustering. | **80% (Phase 3 Core)** |
| **Retention & Provenance Verifier**| `backend/src/services/provenanceVerifier.js`| Factual grounding calculator, Jaccard similarity mapping between summary bullets and source paragraphs, critical numerical & entity preservation checker. | **70% (Phase 4 Core)** |
| **Plain-Language Glossary** | `backend/src/services/glossaryService.js` | Demystification dictionary for legal and clinical jargon with plain-language definitions and contextual examples. | **100% (Phase 5)** |
| **REST API Server** | `backend/src/server.js`, `apiRoutes.js` | Express.js REST API endpoints for `/api/documents/parse`, `/api/documents/redact`, `/api/documents/summarize`, `/api/documents/verify`, and `/api/samples`. | **100%** |
| **Automated Test Suite** | `backend/tests/backend.test.js` | Automated assertion suite covering all 5 core services; runs via `npm test`. | **100% Passing** |

---

## 3. Algorithmic Detail

### 3.1 Domain-Weighted Extractive Scoring
The extractive summarizer ranks sentences using a multi-factor scoring function:
$$\text{Score}(S) = w_{\text{tfidf}} \cdot \text{TF-IDF}(S) + w_{\text{pos}} \cdot \text{PosBias}(S) + w_{\text{domain}} \cdot \sum_{k \in D} \mathbb{I}(k \in S) - \text{Penalty}(|S|)$$
- $w_{\text{domain}}$ heavily rewards contractual covenants (`shall`, `indemnify`, `remedy`) in legal documents, and clinical directives (`diagnosis`, `prescribed`, `warning`, `call 911`) in medical records.
- Prevents clustering by enforcing paragraph diversity.

### 3.2 Provenance & Retention Evaluation
Directly fulfilling the abstract's core mandate:
$$\text{Retention Index} = 0.6 \cdot \text{Grounding}(S) + 0.4 \cdot \text{EntityPreservation}(S)$$
Every summary bullet retains its source paragraph anchor (`para_1`, `para_2`, etc.) and character range, preventing ungrounded hallucinations.

---

## 4. Roadmap for Remaining 72% Backend Development
1. **Sprint 3 (Phases 3.2 & 4.2 - 25% addition)**:
   - Tokenization via HuggingFace transformers (BART / BioBERT / Legal-BERT).
   - Sentence embedding generation using `sentence-transformers` for dense vector semantic matching.
2. **Sprint 4 (Phase 5 - 25% addition)**:
   - Fine-tuned abstractive headline generation with constrained beam search.
   - Multilingual neural translation (Hindi, regional Indian languages) for healthcare equity under UN SDG 10.
3. **Sprint 5 (Evaluation & Polish - 22% addition)**:
   - ROUGE-1, ROUGE-2, and ROUGE-L benchmark evaluation on CNN/DailyMail, BillSum, and MIMIC-III clinical datasets.
   - Comprehensive performance metrics for final Capstone dissertation.
