/**
 * LexiMed Frontend - Accessibility & Theme Controller
 * Ensures WCAG 2.1 AA/AAA compliance, dyslexia typography, and seamless theme switching
 */

(function initAccessibility() {
  const root = document.documentElement;
  const body = document.body;

  // 1. Text Size Scaling
  let currentZoom = 100;
  const btnFontDec = document.getElementById('btn-font-dec');
  const btnFontInc = document.getElementById('btn-font-inc');
  const btnFontReset = document.getElementById('btn-font-reset');

  function updateFontSize() {
    const scale = currentZoom / 100;
    root.style.setProperty('--doc-font-size', `${1.0625 * scale}rem`);
    if (btnFontReset) btnFontReset.textContent = `${currentZoom}%`;
  }

  if (btnFontDec) {
    btnFontDec.addEventListener('click', () => {
      if (currentZoom > 80) {
        currentZoom -= 10;
        updateFontSize();
      }
    });
  }

  if (btnFontInc) {
    btnFontInc.addEventListener('click', () => {
      if (currentZoom < 150) {
        currentZoom += 10;
        updateFontSize();
      }
    });
  }

  if (btnFontReset) {
    btnFontReset.addEventListener('click', () => {
      currentZoom = 100;
      updateFontSize();
    });
  }

  // 2. Dyslexia-Friendly Font Toggle
  const btnDyslexia = document.getElementById('btn-dyslexia-toggle');
  let isDyslexicFont = false;

  if (btnDyslexia) {
    btnDyslexia.addEventListener('click', () => {
      isDyslexicFont = !isDyslexicFont;
      body.classList.toggle('font-dyslexic', isDyslexicFont);
      btnDyslexia.setAttribute('aria-pressed', String(isDyslexicFont));
      btnDyslexia.classList.toggle('active', isDyslexicFont);
    });
  }

  // 3. Theme Toggle (Light / Dark)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  
  // Check system or saved preference
  let currentTheme = localStorage.getItem('leximed_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
      localStorage.setItem('leximed_theme', currentTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
  }

  // 4. Modal Dialog Accessibility (Ethics Modal)
  const ethicsModal = document.getElementById('ethics-modal');
  const btnOpenEthics = document.getElementById('btn-open-ethics-modal');
  const btnCloseEthics = document.getElementById('btn-close-ethics-modal');
  const btnDismissEthics = document.getElementById('btn-dismiss-ethics');

  function openEthicsModal() {
    if (ethicsModal) {
      ethicsModal.classList.add('open');
      if (btnCloseEthics) btnCloseEthics.focus();
    }
  }

  function closeEthicsModal() {
    if (ethicsModal) {
      ethicsModal.classList.remove('open');
      if (btnOpenEthics) btnOpenEthics.focus();
    }
  }

  if (btnOpenEthics) btnOpenEthics.addEventListener('click', openEthicsModal);
  if (btnCloseEthics) btnCloseEthics.addEventListener('click', closeEthicsModal);
  if (btnDismissEthics) btnDismissEthics.addEventListener('click', closeEthicsModal);

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEthicsModal();
      const redactionModal = document.getElementById('redaction-modal');
      if (redactionModal) redactionModal.classList.remove('open');
    }
  });
})();
