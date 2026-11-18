/**
 * LexiMed Frontend - Manuscript Reader, Section Outline & In-Document Search
 * High-efficiency document viewer with interactive provenance jumping
 */

class ManuscriptReader {
  constructor(app) {
    this.app = app;
    this.viewer = document.getElementById('manuscript-viewer');
    this.bodyContent = document.getElementById('manuscript-body-content');
    this.outlineContainer = document.getElementById('doc-outline-container');
    this.popover = document.getElementById('term-popover');
    this.popoverTerm = document.getElementById('popover-term');
    this.popoverContext = document.getElementById('popover-context');
    this.popoverMeaning = document.getElementById('popover-meaning');

    // In-Document Search
    this.searchInput = document.getElementById('doc-search-input');
    this.searchCounter = document.getElementById('doc-search-counter');
    this.searchMatches = [];
    this.currentMatchIndex = -1;

    this.activeHighlightPara = null;
    this.initSearchEvents();
    this.initPopoverEvents();
  }

  renderParagraphs(paragraphs, glossary = {}) {
    if (!this.bodyContent) return;
    this.bodyContent.innerHTML = '';
    if (this.outlineContainer) this.outlineContainer.innerHTML = '';

    paragraphs.forEach((p) => {
      const paraEl = document.createElement('div');
      paraEl.className = 'doc-para manuscript-para' + (p.isHeading ? ' is-heading' : '');
      paraEl.id = p.id;
      paraEl.setAttribute('data-para-order', p.order);

      // Paragraph numbering
      const numSpan = document.createElement('span');
      numSpan.className = 'para-marker para-num';
      numSpan.textContent = `¶ ${p.order}`;
      paraEl.appendChild(numSpan);

      // Paragraph text with glossary markings
      const textContainer = document.createElement('div');
      textContainer.className = 'para-text-body';
      textContainer.innerHTML = this.annotateWithGlossary(p.content, glossary);
      paraEl.appendChild(textContainer);

      this.bodyContent.appendChild(paraEl);

      // Add to sidebar outline if it is a heading or primary section
      if (p.isHeading && this.outlineContainer) {
        const outlineItem = document.createElement('li');
        outlineItem.className = 'section-nav-item doc-outline-item';
        outlineItem.textContent = p.content.length > 35 ? p.content.substring(0, 35) + '...' : p.content;
        outlineItem.title = p.content;
        outlineItem.addEventListener('click', () => {
          paraEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelectorAll('.section-nav-item, .doc-outline-item').forEach(el => el.classList.remove('active'));
          outlineItem.classList.add('active');
        });
        this.outlineContainer.appendChild(outlineItem);
      }
    });

    this.attachTermAnchorListeners();
  }

  annotateWithGlossary(text, glossary = {}) {
    if (!text || !glossary || Object.keys(glossary).length === 0) {
      return this.escapeHtml(text);
    }

    let result = this.escapeHtml(text);
    const sortedTerms = Object.keys(glossary).sort((a, b) => b.length - a.length);

    sortedTerms.forEach(term => {
      const entry = glossary[term];
      const re = new RegExp(`\\b(${this.escapeRegex(term)})\\b`, 'gi');
      result = result.replace(re, (match) => {
        return `<mark class="jargon-term" data-term="${this.escapeHtml(entry.term)}" data-context="${this.escapeHtml(entry.context || '')}" data-plain="${this.escapeHtml(entry.plainMeaning)}" data-example="${this.escapeHtml(entry.example || '')}">${match}</mark>`;
      });
    });

    return result;
  }

  initPopoverEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.jargon-term') && !e.target.closest('#term-popover')) {
        this.hidePopover();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hidePopover();
    });
  }

  attachTermAnchorListeners() {
    const anchors = this.bodyContent.querySelectorAll('.jargon-term');
    anchors.forEach(anchor => {
      anchor.addEventListener('mouseenter', (e) => this.showPopover(e.target));
      anchor.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showPopover(e.target);
      });
    });
  }

  showPopover(targetEl) {
    if (!this.popover) return;

    const term = targetEl.getAttribute('data-term');
    const context = targetEl.getAttribute('data-context');
    const plain = targetEl.getAttribute('data-plain');
    const example = targetEl.getAttribute('data-example');

    if (this.popoverTerm) this.popoverTerm.textContent = term || 'Terminology';
    if (this.popoverContext) this.popoverContext.textContent = context || '';
    if (this.popoverMeaning) {
      this.popoverMeaning.innerHTML = `
        <p>${plain || 'Technical domain term.'}</p>
        ${example ? `<p style="margin-top: 0.35rem; font-style: italic; color: var(--text-muted); font-size: 0.725rem;">Example: ${example}</p>` : ''}
      `;
    }

    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    this.popover.style.top = `${rect.bottom + scrollTop + 6}px`;
    this.popover.style.left = `${Math.min(window.innerWidth - 340, Math.max(16, rect.left + scrollLeft - 20))}px`;
    this.popover.classList.add('active');
  }

  hidePopover() {
    if (this.popover) {
      this.popover.classList.remove('active');
    }
  }

  /**
   * Jump and highlight target paragraph from verification cite
   */
  highlightProvenance(paragraphId) {
    if (!paragraphId) return;

    if (this.activeHighlightPara) {
      this.activeHighlightPara.classList.remove('provenance-target');
    }

    const targetPara = document.getElementById(paragraphId);
    if (targetPara) {
      this.activeHighlightPara = targetPara;
      targetPara.classList.add('provenance-target');

      targetPara.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  /**
   * In-Document Search & Text Highlight
   */
  initSearchEvents() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', (e) => {
      this.executeSearch(e.target.value.trim());
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          this.prevSearchMatch();
        } else {
          this.nextSearchMatch();
        }
      }
    });

    const btnPrev = document.getElementById('btn-search-prev');
    const btnNext = document.getElementById('btn-search-next');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevSearchMatch());
    if (btnNext) btnNext.addEventListener('click', () => this.nextSearchMatch());
  }

  prevSearchMatch() {
    if (this.searchMatches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.searchMatches.length) % this.searchMatches.length;
    this.updateSearchCounter();
    this.focusCurrentSearchMatch();
  }

  executeSearch(query) {
    // Clear previous search marks
    const previousMarks = this.bodyContent.querySelectorAll('mark.search-highlight');
    previousMarks.forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });

    this.searchMatches = [];
    this.currentMatchIndex = -1;

    if (!query || query.length < 2) {
      if (this.searchCounter) this.searchCounter.textContent = '';
      return;
    }

    // Search paragraphs
    const paragraphs = this.bodyContent.querySelectorAll('.manuscript-para');
    paragraphs.forEach(para => {
      const textContainer = para.querySelector('.para-text-body');
      if (!textContainer) return;

      const inner = textContainer.innerHTML;
      const re = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
      if (re.test(inner)) {
        textContainer.innerHTML = inner.replace(re, '<mark class="search-highlight" style="background: #fef08a; color: #000; padding: 0 2px; border-radius: 2px;">$1</mark>');
      }
    });

    this.searchMatches = Array.from(this.bodyContent.querySelectorAll('mark.search-highlight'));
    if (this.searchMatches.length > 0) {
      this.currentMatchIndex = 0;
      this.updateSearchCounter();
      this.focusCurrentSearchMatch();
    } else {
      if (this.searchCounter) this.searchCounter.textContent = '0 matches';
    }
  }

  nextSearchMatch() {
    if (this.searchMatches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.searchMatches.length;
    this.updateSearchCounter();
    this.focusCurrentSearchMatch();
  }

  focusCurrentSearchMatch() {
    const match = this.searchMatches[this.currentMatchIndex];
    if (match) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      match.style.outline = '2px solid var(--domain-legal-accent)';
      setTimeout(() => { match.style.outline = 'none'; }, 1500);
    }
  }

  updateSearchCounter() {
    if (this.searchCounter) {
      this.searchCounter.textContent = `${this.currentMatchIndex + 1} of ${this.searchMatches.length}`;
    }
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

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

window.ManuscriptReader = ManuscriptReader;
