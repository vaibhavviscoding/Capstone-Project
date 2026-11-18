# College Capstone Project Synopsis & Proposal

## Project Title
**Briefly: Legal and Medical Document Summarizer and Provenance Verification Suite**

---

### Academic Information
- **Project Team**:
  1. Mimansha Bhandari
  2. Kalpaja Sinha
  3. Vaibhav Gupta
- **Institution**: School of Computer Science, IILM University, Greater Noida
- **Project Guide / Supervisor**: Prof. Shweta
- **Curriculum**: Final Year Undergraduate Capstone Project

---

## Alignment with UN Sustainable Development Goals (SDGs)
*Directly addressing the core goals highlighted in the project synopsis:*

- **Goal 10: Reduce inequalities within and across countries**  
  Legal contracts and clinical discharge summaries are often written in dense, Latinate jargon that creates severe information asymmetry. Everyday citizens and patients without professional law or medical degrees are disadvantaged. This project democratizes comprehension through verifiable, plain-language synthesis.

- **Goal 16: Encourage peaceful and inclusive societies, ensure justice for all, and strengthen transparent and accountable institutions**  
  Promotes transparent legal access by breaking down complex non-disclosure, indemnification, liability, and dispute resolution clauses into understandable covenants with 100% verifiable source citation.

- **Goal 3: Good health and well-being**  
  Enhances patient safety and post-hospital adherence by clearly extracting discharge diagnoses, medication dosages, contraindications, and emergency red-flag symptoms.

---

## Problem Statement
> *"Legal and medical documents often contain a lot of information and technical terms which can make them difficult to understand. Reading these documents completely can be really time-consuming as well. Important details such as legal points, medical findings, or instructions may be hard to locate quickly. This project aims to develop a system that can analyse such documents & generate clear, concise summaries while preserving the important information and original meaning."*

---

## Abstract
> *"The legal and medical document summarizer is an AI-based project developed to make lengthy & complicated documents easier to understand. Legal and medical documents usually contain a lot of information, technical terms and details that can take considerable time to read & interpret. This can make it difficult to quickly find the needed information. The proposed system will use Natural Language Processing (NLP) techniques to analyse uploaded documents, identify the main points & generate a short and understandable summary. It will be designed to handle different types of documents from both legal & medical domains. The generated summaries will be compared to original documents to ensure the retention of important information. The main purpose of this project is to make reading documents time efficient & make important information more accessible & easier to understand for users."*

---

## Methodology & Architectural Highlights
1. **Document Ingestion & Text Normalization**:
   - Paragraph indexing, legal/medical abbreviation protection, and Flesch-Kincaid readability scoring.
2. **Ethical Data Handling & PII/PHI De-identification**:
   - Complies with HIPAA Safe Harbor 45 CFR § 164.514(b)(2).
   - Zero-retention ephemeral memory processing.
3. **Domain NLP Extractive Scoring Core**:
   - Hybrid graph-based sentence ranking with TF-IDF and domain-specific lexical weight boosters for Legal (indemnity, breach, jurisdiction) and Medical (diagnoses, medications, warnings).
4. **Factual Retention & Provenance Verification Engine**:
   - Evaluates composite retention score and grounds every summary assertion to its exact source paragraph with 1-click cross-referencing.
5. **Human-Centric & Accessible Reader Interface**:
   - Dyslexia-friendly font toggle (Atkinson Hyperlegible), text-to-speech audio reader, and WCAG AA+ high-contrast support. Strictly avoids generic AI tropes (no magic sparkles or capsule chips).
