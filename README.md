<div align="center">

# Briefly ⚖️ 🩺
### An NLP-Based Framework for Legal and Medical Document Summarization, Privacy Protection, and Provenance Verification

[![Node.js Version](https://img.shields.io/badge/Node.js-20.x%20%7C%2018.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Backend Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-brightgreen?logo=jest&logoColor=white)](backend/tests/backend.test.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Google Gemini API](https://img.shields.io/badge/AI%20Engine-Gemini%201.5%20Flash--8B%20(Free%20Tier)-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![HIPAA Privacy](https://img.shields.io/badge/Privacy-HIPAA%20Safe%20Harbor%20Masking-blue)](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)
[![UN SDGs](https://img.shields.io/badge/UN%20SDGs-Goal%203%20%7C%2010%20%7C%2016-E5243B)](https://sdgs.un.org/)

<p align="center">
  <strong>Final Year Undergraduate Capstone Project</strong><br>
  <strong>School of Computer Science, IILM University, Greater Noida</strong>
</p>

<p align="center">
  <strong>Authors:</strong> Mimansha Bhandari &bull; Kalpaja Sinha &bull; Vaibhav Gupta<br>
  <strong>Faculty Supervisor / Guide:</strong> Prof. Shweta
</p>

[Research Paper (PDF)](docs/Briefly_Research_Paper.pdf) &bull; [Research Paper (Markdown)](docs/RESEARCH_PAPER.md) &bull; [Technical Report (PDF)](docs/Briefly_Technical_Report.pdf) &bull; [Technical Report (Markdown)](docs/TECHNICAL_REPORT.md) &bull; [Capstone Proposal](docs/CAPSTONE_PROPOSAL.md)

</div>

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Publications & Academic Documentation](#-key-publications--academic-documentation)
- [Mathematical & Algorithmic Formulations](#-mathematical--algorithmic-formulations)
- [System Architecture & Processing Pipeline](#-system-architecture--processing-pipeline)
- [Core Feature Modules](#-core-feature-modules)
- [Automated Verification & Test Suite](#-automated-verification--test-suite)
- [Quickstart & Execution Guide](#-quickstart--execution-guide)
- [REST API Specification](#-rest-api-specification)
- [Google Gemini Integration (Free Tier)](#-google-gemini-integration-free-tier)
- [Repository File Hierarchy](#-repository-file-hierarchy)
- [Limitations & Ethical Boundaries](#-limitations--ethical-boundaries)
- [Alignment with UN Sustainable Development Goals](#-alignment-with-un-sustainable-development-goals)

---

## 🌟 Executive Overview

Legal agreements, commercial contracts, clinical discharge summaries, and medical diagnostic reports frequently contain dense paragraphs, specialized Latinate terminology, and safety-critical information. For non-specialists, comprehending binding covenants or post-discharge clinical directives is notoriously difficult, creating severe information asymmetry.

Conventional general-purpose summarization models often shorten documents at the expense of domain-critical parameters: omitting a 14-day notice deadline, indemnification liability cap, drug dosage, or emergency red-flag contraindication can cause severe legal or health repercussions. Furthermore, traditional generative models risk hallucinating ungrounded assertions without source traceability.

**Briefly** is an end-to-end, human-centric document analysis and verification framework that combines:
1. **Domain-Weighted Extractive Summarization:** Prioritizes legally binding obligations, financial liabilities, clinical diagnoses, and pharmacological dosages directly from original source sentences without hallucination.
2. **Provenance Traceability & Grounding:** Links generated summaries to corresponding source paragraph indexes and quantifies factual retention via an internal composite metric.
3. **HIPAA Safe Harbor PHI/PII Redaction:** De-identifies 18 sensitive identifier categories (patient names, SSNs, MRNs, dates, contact details) prior to processing.
4. **Interactive In-Document Clause Search & Q&A:** Grounded clause retrieval enabling users to interrogate dense documents in natural language with paragraph citations.
5. **Dual Summarization Engine:** Supports both zero-key local extractive NLP and optional Google Gemini AI (`gemini-1.5-flash-8b`) with automatic, resilient fallback.
6. **Assistive Accessibility Suite:** WCAG-aligned reading environment featuring Atkinson Hyperlegible dyslexia font, dynamic font scaling, dark/light reading themes, and Web Speech API audio playback.

---

## 📚 Key Publications & Academic Documentation

All foundational academic materials, research papers, and technical specifications are preserved in the [`docs/`](docs/) directory:

| Document | Format | Description |
| :--- | :---: | :--- |
| **Research Paper** | [PDF](docs/Briefly_Research_Paper.pdf) &bull; [Markdown](docs/RESEARCH_PAPER.md) | Full 7-page academic paper detailing methodology, scoring equations, related work, automated test results, limitations, and future scope. |
| **Technical Report** | [PDF](docs/Briefly_Technical_Report.pdf) &bull; [Markdown](docs/TECHNICAL_REPORT.md) | 5-page engineering report detailing algorithm design, service responsibilities, and empirical validation suite. |
| **Capstone Proposal & Synopsis** | [Markdown](docs/CAPSTONE_PROPOSAL.md) | Official undergraduate capstone proposal, problem statement, supervisor signatures, and UN SDG mapping. |
| **Backend Architecture Report** | [Markdown](docs/BACKEND_ARCHITECTURE_REPORT.md) | Engineering roadmap, component breakdowns, and algorithmic specifications. |

---

## 📐 Mathematical & Algorithmic Formulations

### 1. Domain-Weighted Extractive Sentence Scoring Function
Rather than employing unchecked abstractive generation that risks altering binding covenants or medical dosages, Briefly evaluates candidate sentences $S$ using a multi-factor ranking equation:

$$\text{Score}(S) = w_{\text{tfidf}} \cdot \text{TFIDF}(S) + w_{\text{pos}} \cdot \text{PosBias}(S) + w_{\text{domain}} \cdot \sum_{k \in D} I(k \in S) - \text{Penalty}(|S|)$$

Where:
- $\text{TFIDF}(S)$: Term frequency-inverse document frequency weighting of informative tokens across the corpus.
- $\text{PosBias}(S)$: Positional significance granting weight to executive opening sections and operative concluding recitals.
- $D$: Domain-specific lexical dictionary:
  - **Legal Lexicon ($D_{\text{legal}}$):** `shall`, `indemnify`, `liability`, `breach`, `remedy`, `governing law`, `arbitration`, `covenant`, `jurisdiction`.
  - **Medical Lexicon ($D_{\text{med}}$):** `diagnosis`, `prescribed`, `dosage`, `contraindication`, `vital signs`, `emergency`, `adverse`, `call 911`.
- $I(k \in S)$: Indicator function returning $1$ if domain token $k$ occurs in sentence $S$, else $0$.
- $\text{Penalty}(|S|)$: Gaussian sentence length penalty filtering out uninformative fragments ($<8$ words) or run-on clauses ($>55$ words).
- **Paragraph Diversity Constraint:** Enforces maximal cross-section coverage to prevent clustering multiple sentences from a single section.

### 2. Provenance Verification & Information Retention Index
To quantitatively verify that the generated summary preserves factual fidelity and does not introduce hallucinated claims, the provenance engine computes an internal composite Retention Index:

$$\text{RetentionIndex} = 0.6 \cdot \text{Grounding}(S) + 0.4 \cdot \text{EntityPreservation}(S)$$

Where:
- $\text{Grounding}(S)$: Jaccard token overlap between summary sentences and mapped source paragraphs.
- $\text{EntityPreservation}(S)$: Ratio of preserved critical named entities (monetary sums, dates, medication names, dosages) retained in the output.
- Every summary statement carries character-offset anchors (`paragraphId`, `startOffset`, `endOffset`) for 1-click source verification.

---

## 🏗️ System Architecture & Processing Pipeline

The system follows a clean, decoupled 8-stage pipeline:

```
[User Document: PDF / DOCX / TXT / MD]
                 │
                 ▼
  ┌─────────────────────────────┐
  │ 1. Ingestion & Normalizer   │ ──► textParser.js
  │    Paragraph Indexing &     │     Flesch Reading Ease & Kincaid Grade
  │    Abbreviation Protection  │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │ 2. Ethical Privacy Guard    │ ──► redactionEngine.js
  │    HIPAA Safe Harbor PHI    │     PII Pattern Scanner & Audit Mapping
  │    & PII De-identification  │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │ 3. Dual Summarization Core  │
  │    ├─ Primary: Gemini Flash │ ──► geminiService.js (gemini-1.5-flash-8b)
  │    └─ Fallback: Domain NLP  │ ──► nlpSummarizer.js (TF-IDF + Domain Weights)
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │ 4. Provenance & Retention   │ ──► provenanceVerifier.js
  │    Grounding Calculation &  │     Paragraph & Offset Cross-Referencing
  │    Entity Preservation Check│
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │ 5. In-Document Query Engine │ ──► queryEngine.js
  │    Natural Language Search  │     Paragraph-level Clause Retrieval
  │    & Grounded Q&A           │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │ 6. Accessible UI & Storage  │ ──► app.js & index.html
  │    Dyslexia Font, Themes,   │     savedSummaries.json (REST Sync)
  │    Speech Audio, History    │
  └─────────────────────────────┘
```

---

## 🧩 Core Feature Modules

### 1. Document Parsing & Ingestion (`textParser.js`)
- Protects legal abbreviations (`v.`, `Inc.`, `LLC.`, `No.`) and clinical titles (`Dr.`, `MRN.`, `mg.`, `mL.`) from erroneous sentence breaks.
- Generates paragraph indexes with word and character bounds.
- Computes Flesch Reading Ease score and Flesch–Kincaid Grade Level.

### 2. HIPAA Safe Harbor PHI Redaction (`redactionEngine.js`)
- Implements 18 identifier detection categories informed by 45 CFR §164.514(b)(2).
- Masks patient and physician names, SSNs, MRNs, phone numbers, email addresses, and clinical dates with standardized tokens (e.g. `[REDACTED_SSN]`).
- Generates a reversible audit mapping for clinical review.

### 3. Domain Extractive Summarizer (`nlpSummarizer.js`)
- Zero-key, 100% offline extractive summarization.
- Synthesizes dynamic executive overviews and operative action takeaways directly from source text.
- Categorizes findings into *Core Obligations*, *Risk & Indemnity*, *Jurisdiction* (Legal) or *Primary Diagnoses*, *Medication Regimens*, *Emergency Directives* (Medical).

### 4. Provenance Verifier (`provenanceVerifier.js`)
- Maps summary sentences to exact source paragraphs.
- Calculates factual grounding scores and entity retention rates.
- Flags ungrounded statements to eliminate AI hallucination risks.

### 5. In-Document Search & Q&A (`queryEngine.js`)
- Semantic token-overlap search allowing natural language queries across dense agreements and clinical files.
- Returns matched clause, paragraph citation number, and confidence percentage.

### 6. Google Gemini AI Engine (`geminiService.js`)
- Optimized for Google's lowest-latency, free-tier model: `gemini-1.5-flash-8b`.
- Strict JSON structured output schemas for legal covenants and clinical findings.
- Automatic, graceful fallback to local NLP engine when offline or if no key is provided.

### 7. Human Accessibility Suite
- **Atkinson Hyperlegible** typography for readers with dyslexia and visual fatigue.
- Browser **Web Speech API** text-to-speech player reading summaries aloud with play/pause controls.
- Dynamic font scaling controls.
- Persistent history archive syncing directly with `backend/src/data/savedSummaries.json`.

---

## 🧪 Automated Verification & Test Suite

Briefly includes an automated test suite verifying all core processing services. All **12 of 12 tests pass**:

```bash
npm test
```

```
--- Running Briefly Verification Suite ---

  ✓ PASS: TextParser correctly splits sentences protecting legal & medical abbreviations
  ✓ PASS: TextParser indexes paragraphs and detects legal headings
  ✓ PASS: TextParser calculates Flesch Reading Ease and Flesch-Kincaid Grade Level
  ✓ PASS: RedactionEngine detects HIPAA PHI and legal sensitive entities
  ✓ PASS: RedactionEngine applies mask tags and preserves audit mapping
  ✓ PASS: NLPSummarizer generates legal summary prioritizing obligations & indemnification
  ✓ PASS: NLPSummarizer generates medical summary prioritizing clinical findings & dosages
  ✓ PASS: ProvenanceVerifier computes retention score and links summary to source paragraphs
  ✓ PASS: GlossaryService provides plain-language demystification for jargon
  ✓ PASS: QueryEngine locates relevant clauses for natural language inquiry
  ✓ PASS: GeminiService defaults to lowest free-tier model (gemini-1.5-flash-8b)
  ✓ PASS: GeminiService constructs domain-specific prompts for legal and medical synthesis

================= Automated Backend Test Suite: 12 / 12 PASSED =================
```

---

## ⚡ Quickstart & Execution Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm v9.0.0 or higher

### Step 1: Clone the Repository
```bash
git clone https://github.com/vaibhavgupta/Briefly.git
cd Briefly
```

### Step 2: Install Dependencies
```bash
npm install
```
*(Dependencies are strictly minimal: standard Express.js and CORS; no heavy native binary dependencies).*

### Step 3: Run the Verification Suite
```bash
npm test
```

### Step 4: Launch the Server
```bash
npm start
```
The application will launch at:
- **Interactive Workbench:** [http://localhost:5050](http://localhost:5050)
- **API Health Check:** [http://localhost:5050/api/health](http://localhost:5050/api/health)
- **Preloaded Document Samples:** [http://localhost:5050/api/samples](http://localhost:5050/api/samples)

---

## 🌐 REST API Specification

| Endpoint | Method | Payload / Headers | Description |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | None | Returns pipeline status, AI tier, and academic capstone metadata. |
| `/api/gemini/status` | `GET` | Optional `x-gemini-api-key` | Reports Gemini configuration status and model availability. |
| `/api/samples` | `GET` | None | Retrieves preloaded legal agreements and clinical discharge summaries. |
| `/api/documents/parse` | `POST` | `{ "text": "..." }` | Normalizes text, splits sentences, and computes readability scores. |
| `/api/documents/redact` | `POST` | `{ "text": "...", "executeRedaction": true }` | Scans and de-identifies HIPAA PHI and PII identifiers with audit map. |
| `/api/documents/summarize` | `POST` | `{ "text": "...", "domain": "legal", "summaryDepth": "medium" }` | Generates structured summary via Gemini (if key set) or domain extractive NLP. |
| `/api/documents/verify` | `POST` | `{ "originalText": "...", "summaryItems": [...] }` | Computes factual grounding, source paragraph linkage, and retention index. |
| `/api/documents/query` | `POST` | `{ "text": "...", "query": "liability cap", "domain": "legal" }` | Searches document and returns matching clause with paragraph citation. |
| `/api/documents/history` | `GET` | None | Returns persistent list of saved document summaries. |
| `/api/documents/history` | `POST` | `{ "title": "...", "overview": "...", ... }` | Persists a generated summary to `backend/src/data/savedSummaries.json`. |
| `/api/documents/history/:id` | `DELETE`| None | Deletes a summary from the persistent database. |

---

## 🤖 Google Gemini Integration (Free Tier)

Briefly supports Google Gemini's free-access model **`gemini-1.5-flash-8b`**:
- **Free Quota:** 15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), 1,500 Requests Per Day (RPD) at **$0.00 cost** via [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Configuration:**
  - **In App UI:** Navigate to **Settings** &rarr; **Google Gemini AI**, paste your free API key, and click **Test Engine**.
  - **Via `.env`:** Copy `.env.example` to `.env` and set:
    ```env
    PORT=5050
    GEMINI_API_KEY=your_free_gemini_api_key
    GEMINI_MODEL=gemini-1.5-flash-8b
    ```
- **Resilient Fallback:** If no API key is supplied, Briefly automatically executes its local domain extractive NLP engine with zero interruptions.

---

## 📁 Repository File Hierarchy

```
Briefly/
├── .env.example                       # Environment configuration template
├── .gitignore                         # Standard git ignore rules (node_modules, logs, .env)
├── package.json                       # Project manifests, scripts (start, test), dependencies
├── package-lock.json                  # Deterministic dependency tree
├── README.md                          # Primary academic & technical presentation guide
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── sampleDocuments.js     # Full realistic legal contract & clinical report
│   │   │   └── savedSummaries.json    # Persistent JSON history database
│   │   ├── routes/
│   │   │   └── apiRoutes.js           # REST API endpoints & route controller
│   │   ├── services/
│   │   │   ├── geminiService.js       # Google Gemini API integration (gemini-1.5-flash-8b)
│   │   │   ├── glossaryService.js     # Plain-language legal & clinical jargon glossary
│   │   │   ├── nlpSummarizer.js       # Domain TF-IDF & TextRank extractive scoring engine
│   │   │   ├── provenanceVerifier.js  # Source paragraph grounding & retention index
│   │   │   ├── queryEngine.js         # Grounded in-document natural language clause search
│   │   │   ├── redactionEngine.js     # HIPAA Safe Harbor PHI & PII de-identification
│   │   │   └── textParser.js          # Ingestion, sentence splitter, readability metrics
│   │   └── server.js                  # Express.js HTTP application server
│   └── tests/
│       └── backend.test.js            # Automated verification suite (12/12 passing tests)
├── frontend/
│   ├── assets/
│   │   └── hero.jpg                   # Visual branding asset
│   ├── css/
│   │   └── styles.css                 # Custom editorial styling & typography
│   ├── js/
│   │   ├── accessibility.js           # Dyslexia font toggle, font scaling, themes
│   │   ├── app.js                     # SPA router, view manager, REST API coordinator
│   │   ├── audioReader.js             # Web Speech API text-to-speech audio player
│   │   ├── reader.js                  # Paragraph rendering & provenance cross-referencing
│   │   ├── redactionUI.js             # PII/PHI audit modal visualizer
│   │   └── sampleData.js              # Client-side fallback sample documents
│   └── index.html                     # Responsive workbench (Login, Summarizer, History, Settings)
└── docs/
    ├── Briefly_Research_Paper.pdf     # 7-page academic research paper
    ├── Briefly_Technical_Report.pdf   # 5-page engineering technical report
    ├── RESEARCH_PAPER.md              # Full markdown transcription of research paper
    ├── TECHNICAL_REPORT.md            # Full markdown transcription of technical report
    ├── CAPSTONE_PROPOSAL.md           # Formal undergraduate capstone proposal
    └── BACKEND_ARCHITECTURE_REPORT.md # Initial backend architecture milestone report
```

---

## ⚠️ Limitations & Ethical Boundaries

As detailed in Section VIII of the research paper:
1. **Advisory Boundary:** Briefly is an informational comprehension tool designed to reduce reading fatigue and highlight critical clauses. It is **not** a licensed attorney or medical practitioner and must **never** be treated as a substitute for professional legal counsel or clinical diagnosis.
2. **Lexical Extractive Boundaries:** The local extractive summarizer operates on term importance and lexical indicators; complex semantic metaphors or implicit conditions may require advanced contextual transformer representations.
3. **Redaction Disclaimer:** Pattern-based PII/PHI de-identification significantly reduces data exposure but does not guarantee 100% masking of unconventional identifiers in unformatted text; high-risk clinical records should undergo qualified human review.

---

## 🏛️ Alignment with UN Sustainable Development Goals

This project directly advances the **United Nations 2030 Agenda for Sustainable Development**:
- **Goal 10 (Reduced Inequalities):** Eliminates information asymmetry by translating dense, exclusionary contractual jargon into plain language for everyday consumers and patients.
- **Goal 16 (Peace, Justice and Strong Institutions):** Empowers citizens with transparent legal comprehension and verifiable source clause provenance.
- **Goal 3 (Good Health and Well-Being):** Promotes patient safety and treatment compliance by extracting actionable post-discharge care instructions, contraindications, and emergency warnings.

---

<div align="center">
  <sub>Developed as part of the Final Year Capstone Project in Computer Science at IILM University, Greater Noida.</sub><br>
  <sub>Released under the <a href="LICENSE">MIT License</a>.</sub>
</div>
