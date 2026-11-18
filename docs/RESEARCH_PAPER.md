# Briefly: An NLP-Based Framework for Legal and Medical Document Summarization, Privacy Protection, and Provenance Verification

**Authors:** Mimansha Bhandari, Kalpaja Sinha, Vaibhav Gupta  
**Affiliation:** School of Computer Science, IILM University, Greater Noida, India  
**Original Document:** [Briefly_Research_Paper.pdf](./Briefly_Research_Paper.pdf)

---

## Abstract

Legal agreements and medical documents frequently contain complex terminology, lengthy paragraphs, and critical information that may be difficult for non-specialists to understand. Important details such as contractual obligations, liability conditions, medical diagnoses, medication instructions, and emergency warnings can be overlooked when users have limited time or domain-specific knowledge. This paper presents **Briefly**, a human-centric document summarization and verification framework designed to improve the accessibility and understandability of legal and medical documents.

The proposed system combines document parsing, readability assessment, personally identifiable information (PII) and protected health information (PHI) detection, domain-weighted extractive summarization, provenance verification, and plain-language glossary support. Its summarization component uses a combination of term-frequency-based weighting, sentence-position information, and domain-specific lexical indicators to identify important sentences. The provenance module links generated summary content to corresponding source paragraphs and evaluates information retention through grounding and entity-preservation measures. The system also incorporates an optional Google Gemini integration while retaining a local extractive summarization mechanism as a fallback.

Briefly is designed with accessibility and privacy considerations, including redaction support, an accessible reading interface, and session-oriented document processing. The backend implementation provides a functional foundation for document analysis and verification. Automated tests are used to validate the core processing modules. The framework aims to make complex documents easier to navigate while maintaining traceability to their original content.

**Keywords:** *Natural Language Processing, Extractive Summarization, Legal Document Analysis, Medical Document Analysis, PII Detection, PHI Redaction, Information Retention, Provenance Verification, Document Accessibility.*

---

## I. INTRODUCTION

The increasing use of digital documentation has made legal and medical information more accessible, but understanding such information remains a significant challenge. Legal agreements, service contracts, insurance policies, clinical discharge summaries, and medical reports often contain lengthy paragraphs and specialized terminology. These documents are generally written for professional interpretation and may not be easily understood by individuals without legal or medical backgrounds.

In legal documents, important information may be distributed across multiple clauses. Conditions related to indemnification, liability, confidentiality, termination, and dispute resolution can be difficult to identify during a quick review. Similarly, medical documents may contain diagnoses, medication schedules, dosage instructions, contraindications, and follow-up recommendations that patients need to understand correctly.

Reading an entire document manually can be time-consuming. Users may overlook important details or misunderstand technical expressions. Conventional summarization tools can reduce document length, but a shorter summary is not necessarily a reliable summary. In domains such as law and healthcare, omitting a date, dosage, obligation, exception, or warning may significantly affect how the document is interpreted.

Another important concern is privacy. Legal and medical documents may contain personal identifiers, patient information, addresses, registration numbers, and other sensitive details. Processing these documents without considering privacy can expose information that should remain protected.

To address these challenges, this paper introduces Briefly, a document summarization and provenance verification system designed specifically for legal and medical content. Rather than treating summarization as a simple text-shortening task, Briefly combines content extraction with privacy-oriented processing and source traceability.

The primary objective is to generate concise and readable summaries while allowing users to refer back to the original paragraphs from which important information was extracted.

The major contributions of this work are:

1. A document ingestion and structural analysis module that normalizes text, identifies paragraphs, splits sentences, and calculates readability metrics.
2. A PII/PHI detection and redaction mechanism that identifies sensitive information and maintains an audit mapping.
3. A domain-weighted extractive summarization approach that considers sentence importance, position, and legal or medical terminology.
4. A provenance verification module that links summary content to source paragraphs and estimates information retention.
5. An accessible reading environment with glossary support and optional text-to-speech functionality.

---

## II. PROBLEM STATEMENT AND OBJECTIVES

### A. Problem Statement
Legal and medical documents frequently contain specialized vocabulary and large amounts of information. Important details are often embedded within lengthy sections, making it difficult for ordinary users to locate and understand relevant information efficiently.

Existing generic summarization approaches may shorten documents without adequately considering domain-specific requirements. A summary may omit critical numerical information, legal obligations, medical instructions, or contextual details. Furthermore, users may have no convenient way to verify whether a generated statement is supported by the original document.

The problem addressed by Briefly is therefore to develop a system that can analyze legal and medical documents, identify important information, generate concise summaries, support privacy-oriented redaction, and provide traceability between the generated summary and the original source.

### B. Objectives
The main objectives of the proposed framework are:
- To simplify lengthy legal and medical documents through automated text summarization.
- To identify important sentences using domain-specific lexical information.
- To improve document readability through readability assessment and plain-language glossary support.
- To detect and mask selected sensitive personal and medical information.
- To connect extracted summary information with its corresponding source paragraphs.
- To provide a user-friendly interface with accessibility features.
- To support both local extractive summarization and optional external AI-based summarization.

*The system is intended to assist document comprehension. It does not replace professional legal interpretation, medical diagnosis, or advice from qualified professionals.*

---

## III. RELATED WORK

Automatic text summarization has been an important area of Natural Language Processing (NLP). Traditional approaches generally fall into two categories: extractive summarization and abstractive summarization.

Extractive summarization selects important sentences or phrases directly from the original document. This approach can preserve the original wording and reduce the risk of introducing entirely new statements. Luhn’s early work on automatic text summarization demonstrated the importance of statistical word significance in identifying representative sentences [1].

Term-frequency-based techniques, including TF-IDF, are commonly used to estimate the importance of terms within documents. These techniques help distinguish frequently occurring and informative terms from less significant words [2]. Sentence-ranking approaches can also incorporate positional information, structural features, and relationships between sentences.

Graph-based ranking methods provide another approach to identifying important content. PageRank introduced a link-based ranking mechanism that has influenced graph-based approaches in text processing [3]. TextRank applies graph-based ranking concepts to natural language tasks, including keyword extraction and sentence extraction for summarization [4].

In legal and medical environments, general-purpose summarization has limitations because the importance of information depends heavily on domain context. A legal document may require preservation of obligations, exceptions, dates, and liability conditions. A clinical document may require preservation of diagnoses, medication details, and warnings. This motivates the use of domain-specific lexical indicators when ranking sentences.

Readability is another important factor in document accessibility. Traditional readability measures, including Flesch Reading Ease and Flesch–Kincaid Grade Level, estimate the reading difficulty of text using sentence length and syllable-related measures [5]. Such metrics do not fully measure comprehension, but they provide useful indicators of textual complexity.

Privacy protection is particularly important when processing healthcare information. The HIPAA Privacy Rule establishes requirements concerning protected health information and specifies de-identification methods under 45 CFR §164.514 [6]. These requirements provide a relevant foundation for designing privacy-conscious document processing systems.

Briefly combines these established concepts into a single workflow. Its focus is not solely on producing shorter text, but also on supporting privacy-oriented processing, source traceability, and accessibility for non-specialist readers.

---

## IV. PROPOSED SYSTEM

### A. System Overview
Briefly is designed as a web-based legal and medical document summarization and verification suite. The system follows a modular architecture in which individual backend services perform specific document-processing tasks.

The overall workflow consists of the following stages:
1. Document input and text ingestion.
2. Text normalization and structural extraction.
3. Readability assessment.
4. PII/PHI detection and redaction.
5. Domain-weighted extractive summarization.
6. Provenance and information-retention verification.
7. Glossary-based terminology assistance.
8. Document-based search and question answering.

The frontend communicates with an Express.js backend through REST API endpoints. The backend contains independent service modules responsible for parsing, redaction, summarization, verification, glossary generation, and document querying.

### B. Document Ingestion and Text Normalization
The first stage processes the input document and prepares its text for further analysis. The text parser identifies paragraph boundaries and creates paragraph-level indexes.

Sentence splitting is performed with consideration for legal and medical abbreviations. This is important because ordinary sentence-splitting techniques may incorrectly interpret abbreviations such as "Dr.", "Inc.", and "v." as sentence endings. Medical expressions containing numerical values, such as "1.5 mg", also require careful handling.

The parser produces structured text that can be used by the summarization and provenance modules. The module also calculates readability indicators, including:
- **Flesch Reading Ease**
- **Flesch–Kincaid Grade Level**

These indicators provide an estimate of the reading complexity of the source document and can help users understand how difficult the original content may be.

### C. PII and PHI Detection and Redaction
Legal and medical documents may contain sensitive information. Briefly includes a redaction engine designed to identify selected personally identifiable and protected health information.

The detection mechanism uses pattern-based scanning and predefined categories to identify information such as:
- Personal names
- Patient and physician names
- Social Security Numbers (SSNs)
- Medical Record Numbers (MRNs)
- Other supported identifying patterns

After detection, the system can mask identified values in the processed text. The redaction mechanism also generates an audit mapping to maintain a record of detected and masked information.

The design is informed by the de-identification concepts described in the HIPAA Privacy Rule, particularly the Safe Harbor method under 45 CFR §164.514(b)(2). However, pattern-based detection does not guarantee the identification of every sensitive entity. The implementation should therefore be treated as a privacy-supporting mechanism rather than a certified HIPAA compliance solution.

### D. Domain-Weighted Extractive Summarization
The central component of Briefly is its domain-weighted extractive summarizer. Unlike abstractive summarization, which generates new sentences, extractive summarization selects important sentences from the original document. This approach is useful in legal and medical contexts because the selected sentences retain wording from the source.

Briefly uses a multi-factor sentence-ranking approach based on:
1. Term importance.
2. Sentence position.
3. Domain-specific lexical indicators.
4. Sentence-length penalties.
5. Paragraph diversity.

The general scoring function is represented as:

$$\text{Score}(S) = w_{\text{tfidf}} \cdot \text{TFIDF}(S) + w_{\text{pos}} \cdot \text{PosBias}(S) + w_{\text{domain}} \cdot \sum_{k \in D} I(k \in S) - \text{Penalty}(|S|) \quad (1)$$

where:
- $S$ represents a candidate sentence.
- $\text{TFIDF}(S)$ represents the term-importance score of the sentence.
- $\text{PosBias}(S)$ represents the positional importance of the sentence.
- $D$ represents a domain-specific vocabulary.
- $I(k \in S)$ indicates whether a domain-specific term occurs in the sentence.
- $w_{\text{tfidf}}$, $w_{\text{pos}}$, and $w_{\text{domain}}$ represent weighting parameters.
- $\text{Penalty}(|S|)$ represents a sentence-length penalty.

For legal documents, the system considers terms associated with contractual obligations and conditions, such as *"shall"*, *"indemnify"*, *"liability"*, *"breach"*, and *"remedy"*.

For medical documents, it considers terms such as *"diagnosis"*, *"prescribed"*, *"dosage"*, *"warning"*, and *"emergency"*.

Paragraph diversity is also considered to reduce the possibility of selecting several highly similar sentences from the same section while ignoring other relevant parts of the document. The selected sentences are arranged to form a concise summary.

### E. Optional Gemini Integration
Briefly supports an optional Google Gemini integration for AI-assisted summarization. When the external service is configured and available, the system can use the selected Gemini model to generate a summary. When the API key is unavailable or the external request fails, the application can fall back to its local extractive summarization engine.

This fallback mechanism improves operational resilience by allowing the core summarization workflow to remain available without requiring a successful external API request.

The local extractive engine and external AI integration are separate processing paths. Their outputs should be evaluated independently before making claims about comparative accuracy or reliability.

### F. Provenance Verification and Information Retention
A major concern in automated summarization is whether the generated summary preserves the important information contained in the original document.

Briefly addresses this through a provenance verification module. The module compares summary content with source paragraphs and identifies corresponding source locations. The implementation uses lexical overlap and entity-preservation concepts to estimate whether the summary remains grounded in the original document.

The retention index is represented as:

$$\text{RetentionIndex} = 0.6 \cdot \text{Grounding}(S) + 0.4 \cdot \text{EntityPreservation}(S) \quad (2)$$

where:
- $\text{Grounding}(S)$ represents the degree to which summary content is supported by source paragraphs.
- $\text{EntityPreservation}(S)$ represents the preservation of important entities and numerical information.

The module also supports source paragraph references and character-range information. This allows the application interface to connect a summary statement with its corresponding original text.

*The retention index is an internal verification measure. It should not be interpreted as a universally validated measure of factual correctness or as proof that every important detail has been preserved.*

### G. Plain-Language Glossary and Document Querying
Legal and medical terminology can create comprehension barriers for ordinary users. Briefly includes a glossary service that provides simpler explanations of selected legal and clinical terms. Examples include terms related to contractual obligations, liability, diagnoses, and clinical instructions.

The project also includes a document query engine that supports in-document search and question answering based on token overlap. This allows users to locate relevant information within the processed document without manually reviewing every paragraph.

*The query engine is intended to support navigation and retrieval from the document. It should not be treated as an independent professional advisory system.*

### H. Accessibility and User Interface
Briefly incorporates accessibility features intended to improve the reading experience for users with different needs:
- Dyslexia-friendly font support using *Atkinson Hyperlegible*.
- Dynamic font scaling.
- Parchment Light, Archive Dark, and High Contrast reading themes.
- Text-to-speech functionality through the Web Speech API.
- A split-view reading environment.
- Visual connections between summary content and original source paragraphs.

These features aim to make the system more comfortable to use, particularly when reviewing lengthy documents.

---

## V. SYSTEM IMPLEMENTATION

### A. Technology Stack

| Component | Technology / Module |
| :--- | :--- |
| **Backend Runtime** | Node.js |
| **Backend Framework** | Express.js |
| **Frontend** | HTML, CSS, JavaScript |
| **API Communication** | REST API |
| **Text Processing** | Custom JavaScript NLP services |
| **Summarization** | Local extractive NLP engine |
| **Optional AI Integration** | Google Gemini API (`gemini-1.5-flash-8b`) |
| **Testing** | Automated backend test suite |

### B. Backend Architecture
The backend is organized into modular services to separate individual processing responsibilities:
1. `textParser.js`: Performs text normalization, paragraph indexing, sentence splitting, and readability calculations.
2. `redactionEngine.js`: Detects selected PII/PHI patterns, masks sensitive information, and generates audit mappings.
3. `nlpSummarizer.js`: Implements domain-weighted sentence ranking using term importance, positional information, and legal or medical lexical indicators.
4. `provenanceVerifier.js`: Evaluates grounding and entity preservation and links summary content to source paragraphs.
5. `glossaryService.js`: Provides plain-language explanations of selected legal and medical terms.
6. `queryEngine.js`: Supports document-based search and question answering.

The Express.js server exposes API endpoints for document parsing, redaction, summarization, verification, and sample document access.

### C. Processing Workflow
When a document is submitted, the backend first prepares the text through the parsing module. The resulting structured representation is then passed to the relevant processing services.

Sensitive information can be detected and masked before subsequent processing. The summarizer ranks sentences using the selected domain vocabulary and produces an extractive summary. The provenance verifier then compares the summary with the original document and associates summary content with source paragraphs.

Finally, the frontend displays the processed content and provides reading, glossary, and navigation features.

---

## VI. TESTING AND RESULTS

### A. Testing Approach
The backend test suite is used to verify the functionality of the implemented processing modules. Testing focuses on whether individual services produce the expected outputs for representative legal and medical document inputs.

The tests cover:
- Abbreviation-aware sentence splitting.
- Paragraph indexing and heading handling.
- Readability calculations.
- Detection of supported legal and medical sensitive entities.
- Redaction masking and audit mapping.
- Legal document summarization.
- Medical document summarization.
- Retention scoring and source paragraph linkage.
- Glossary functionality.
- Document query functionality.
- Gemini model configuration and prompt construction.

### B. Functional Test Results
The automated test suite was executed against the supplied project implementation. The recorded test outcome was **12 successful tests out of 12 executed tests**, detailed in Table II.

| Test Area | Expected Functionality | Result |
| :--- | :--- | :---: |
| **Sentence splitting** | Protect supported abbreviations | **PASSED** |
| **Paragraph indexing** | Identify paragraph structure and headings | **PASSED** |
| **Readability** | Calculate readability indicators | **PASSED** |
| **Sensitive entity detection** | Identify supported PII/PHI and legal patterns | **PASSED** |
| **Redaction** | Mask detected information and generate audit mapping | **PASSED** |
| **Legal summarization** | Generate an extractive legal summary | **PASSED** |
| **Medical summarization** | Generate an extractive medical summary | **PASSED** |
| **Provenance** | Calculate retention score and source linkage | **PASSED** |
| **Glossary** | Retrieve plain-language definitions | **PASSED** |
| **Query engine** | Retrieve relevant document information | **PASSED** |
| **Gemini configuration** | Validate default model and prompt construction | **PASSED** |
| **Overall Suite Execution** | Validate modular integration across all services | **PASSED** |

The results demonstrate that the tested backend functions operate as expected for the test cases included in the project.

### C. Interpretation of Results
The successful execution of all 12 tests provides evidence that the implemented backend services are functionally connected and that their basic processing operations work for the tested inputs.

The results are particularly relevant to the system’s modular architecture. Document parsing, redaction, summarization, provenance verification, glossary retrieval, and document querying can be tested as separate components.

However, these results should be interpreted within the scope of functional testing. They do not establish clinical accuracy, legal reliability, complete PII/PHI detection, or superiority over existing summarization systems. Further evaluation using larger and independently annotated datasets is required to measure the quality of generated summaries and the reliability of the verification mechanism.

---

## VII. DISCUSSION

Briefly approaches document summarization as a combination of information extraction, privacy support, and source traceability rather than a standalone text-generation task.

One of the main design considerations is the importance of preserving domain-specific information. In legal documents, a summary should retain relevant obligations and conditions. In medical documents, important instructions and numerical details should remain identifiable. The use of domain-specific lexical indicators provides a foundation for ranking sentences according to their relevance to the document type.

Another important consideration is traceability. A summary is more useful when users can return to the original paragraph and inspect the context in which the information appeared. The provenance module supports this requirement by associating summary content with source locations.

Privacy is also a significant aspect of the system. Redaction support can reduce the exposure of selected identifiers during document processing. However, pattern-based detection has limitations, particularly when sensitive information appears in unexpected formats or within contextual expressions. Human review and stronger entity-recognition methods may be required for high-risk applications.

The optional external AI integration provides an additional summarization path, while the local fallback engine reduces dependence on external service availability. Nevertheless, external processing introduces separate considerations concerning data transmission, API configuration, and privacy policies. Users should understand these considerations before submitting sensitive documents to an external service.

The accessibility features further distinguish the proposed framework by considering how users interact with complex information. Font adjustment, reading themes, text-to-speech, and source highlighting support a more approachable document-review experience.

Overall, the current implementation establishes a functional foundation. Its practical reliability must be evaluated through additional experiments involving diverse documents, independent reviewers, and domain-specific assessment criteria.

---

## VIII. LIMITATIONS AND FUTURE SCOPE

Although the current implementation provides the main processing modules, several areas require further development and evaluation.

### A. Limitations
1. **Dependence on Lexical Features:** The local summarization mechanism relies on term importance, positional information, and domain-specific vocabulary. Such methods may not fully capture complex semantic relationships or context-dependent meaning.
2. **Sensitive Information Detection:** Pattern-based PII/PHI detection may fail to identify certain identifiers, especially when they appear in unusual formats or ambiguous contexts.
3. **Limited Evaluation Dataset:** The current functional tests establish basic module behavior but do not provide a large-scale benchmark of legal and medical summarization quality.
4. **Retention Score Interpretation:** The provenance retention index is an implementation-specific measure. Its relationship with human judgments of factual completeness requires further validation.
5. **External AI Dependency:** Gemini-based summarization depends on API availability, configuration, and external service behavior.
6. **Domain-Specific Validation:** The system has not been established as a substitute for legal or clinical professional review.

### B. Future Scope
1. **Transformer-Based NLP:** Integration of pre-trained transformer models such as BART, BioBERT, and Legal-BERT could improve semantic understanding and domain-specific processing.
2. **Sentence Embeddings:** Sentence-transformer models could support semantic similarity calculations and improve the matching of summary statements with source paragraphs.
3. **Advanced Abstractive Summarization:** Constrained generation techniques could be explored to produce more readable summaries while retaining important source information.
4. **Multilingual Support:** Translation and multilingual processing for Hindi and other regional Indian languages could improve accessibility.
5. **Benchmark Evaluation:** ROUGE-1, ROUGE-2, and ROUGE-L could be used to compare generated summaries with reference summaries. Additional human evaluation would be needed to assess factual consistency and domain-specific usefulness.
6. **Improved Entity Recognition:** More advanced named-entity recognition models could strengthen the identification of personal and medical information.
7. **Expanded User Evaluation:** Testing with a wider range of legal and medical documents and feedback from relevant domain professionals could help identify practical limitations and improvements.

---

## IX. CONCLUSION

This paper presented Briefly, a human-centric framework for summarizing and verifying legal and medical documents. The system addresses the challenges associated with lengthy documents, specialized terminology, privacy-sensitive information, and the difficulty of verifying generated summaries against their original sources.

The proposed architecture combines document parsing, readability assessment, PII/PHI detection and redaction, domain-weighted extractive summarization, provenance verification, glossary support, and document-based querying. Optional Gemini integration provides an additional summarization path, while the local extractive engine supports fallback operation.

The backend implementation was tested through an automated test suite, with all 12 executed tests passing. These results demonstrate the functional operation of the tested modules and establish a foundation for further development.

The central contribution of Briefly is its combined focus on summarization, traceability, privacy-oriented processing, and accessibility. By connecting concise summaries to their original source paragraphs, the system aims to help users review complex information more efficiently without treating automated summaries as replacements for professional judgment.

Future work will focus on stronger semantic models, expanded evaluation datasets, improved sensitive-information detection, multilingual support, and domain-specific validation. With these improvements, Briefly can be developed further as an accessible document-comprehension tool for legal and medical information.

---

## REFERENCES

1. H. P. Luhn, "The automatic creation of literature abstracts," *IBM Journal of Research and Development*, vol. 2, no. 2, pp. 159–165, 1958.
2. K. S. Jones, "A statistical interpretation of term specificity and its application in retrieval," *Journal of Documentation*, vol. 28, no. 1, pp. 11–21, 1972.
3. S. Brin and L. Page, "The anatomy of a large-scale hypertextual Web search engine," *Computer Networks and ISDN Systems*, vol. 30, nos. 1–7, pp. 107–117, 1998.
4. R. Mihalcea and P. Tarau, "TextRank: Bringing order into text," in *Proceedings of the 2004 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, Barcelona, Spain, 2004, pp. 404–411.
5. R. F. Flesch, "A new readability yardstick," *Journal of Applied Psychology*, vol. 32, no. 3, pp. 221–233, 1948.
6. U.S. Department of Health and Human Services, "Standards for Privacy of Individually Identifiable Health Information," 45 CFR §164.514, Security and Privacy, HIPAA Privacy Rule.
7. Google, "Gemini API Documentation," Google AI for Developers. [Online]. Available: https://ai.google.dev/gemini-api/docs

---
*Note: This paper describes the current project implementation and its documented capabilities. The reported test results refer to the supplied backend test suite and should not be interpreted as clinical validation, legal validation, or certification of regulatory compliance.*
