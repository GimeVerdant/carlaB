// Nav scroll border
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Scroll reveal with stagger
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.04}s`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Active nav link on scroll (index.html only)
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a');

if (sections.length && navLinks.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => navObserver.observe(s));
}

// Edit mode (index.html only)
const editToggle = document.getElementById('editToggle');
if (editToggle) {
  const STORAGE_KEY = 'cb-page-edits';
  const EDITABLE = [
    '.hero-location', '.hero-name', '.hero-sub', '.hero-quote',
    '.section-label', '.section-title',
    '.feel-item',
    '.story-quote', '.story-body p',
    '.framework-title', '.framework-quote', '.framework-body',
    '.about-col-label', '.about-col > p',
    '.about-focus-label', '.about-focus > p',
    '.spec-group-label', '.spec-tag',
    '.pi-label', '.pi-val',
    '.footer-title', '.footer-sub', '.footer-cred',
  ];

  function allEditables() {
    return EDITABLE.flatMap(sel => [...document.querySelectorAll(sel)]);
  }

  // Restore saved text on load
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved) {
    EDITABLE.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        const key = `${sel}[${i}]`;
        if (saved[key] !== undefined) el.textContent = saved[key];
      });
    });
  }

  function enterEdit() {
    document.body.classList.add('edit-mode');
    editToggle.textContent = 'Save';
    editToggle.classList.add('is-saving');
    allEditables().forEach(el => {
      el.contentEditable = 'plaintext-only';
      // Strip HTML on paste — plain text only
      el.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }, { once: false });
    });
  }

  function saveEdits() {
    const data = {};
    EDITABLE.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        data[`${sel}[${i}]`] = el.textContent;
        el.removeAttribute('contenteditable');
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    document.body.classList.remove('edit-mode');
    editToggle.textContent = 'Edit';
    editToggle.classList.remove('is-saving');
  }

  editToggle.addEventListener('click', () => {
    document.body.classList.contains('edit-mode') ? saveEdits() : enterEdit();
  });
}
