// Extract section IDs from navigation data attributes
function getSectionIds() {
  const navItems = document.querySelectorAll('#main-nav [data-section-id], #mobile-nav [data-section-id]');
  return Array.from(navItems)
    .map(item => item.getAttribute('data-section-id'))
    .filter((id, index, arr) => id && arr.indexOf(id) === index); // Unique values only
}

// Microdocs initialization functions
const MicrodocsApp = {

  init(alpineContext) {
    this.setupSectionWatcher(alpineContext.$watch, alpineContext.activeSection);
    this.setupThemeWatcher(alpineContext.$watch, alpineContext.theme);
    this.setupHashLinkHandler(
      () => alpineContext.activeSection,
      (section) => { alpineContext.activeSection = section; }
    );
    this.setupTocbot();
    this.setupImageRows();
  },

  get sectionIds() {
    return getSectionIds();
  },

  get initialSection() {
    const ids = getSectionIds();
    return ids[0] || '';
  },

  getInitialTheme() {
    return localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  },

  getInitialData() {
    return {
      activeSection: this.initialSection,
      theme: this.getInitialTheme()
    };
  },

  setupSectionWatcher(watchFn, activeSection) {
    watchFn('activeSection', (section) => {
      window.scrollTo(0, 0);
      window.dispatchEvent(new CustomEvent('section-changed', { detail: section }));
    });
  },

  setupThemeWatcher(watchFn, theme) {
    watchFn('theme', (value) => {
      localStorage.setItem('theme', value);
      document.documentElement.setAttribute('data-theme', value);
    });
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', theme);
  },

  setupHashLinkHandler(getActiveSection, setActiveSection) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^=\'#\']');
      if (!link) return;

      const hash = link.getAttribute('href');
      const sectionId = hash.substring(1);

      if (this.sectionIds.includes(sectionId)) {
        e.preventDefault();
        setActiveSection(sectionId);
      }
    });
  },

  initTocForSection(sectionId) {
    tocbot.destroy();
    tocbot.init({
      tocSelector: `.toc-${sectionId}`,
      contentSelector: `#${sectionId} article`,
      headingSelector: 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]',
      hasInnerContainers: true,
      scrollSmooth: false, // Let browser handle smooth scrolling
      positionFixedSelector: '.sticky',
      linkClass: 'toc-link',
      activeLinkClass: 'is-active-link',
      listClass: 'toc-list',
      listItemClass: 'toc-list-item',
      collapseDepth: 6,
    });

    // Hide "On this page" if no TOC items were generated
    const tocContainer = document.querySelector(`.toc-${sectionId}`);
    const nav = tocContainer?.closest('nav');
    if (nav) {
      const hasTocItems = tocContainer.querySelector('.toc-list-item');
      nav.style.display = hasTocItems ? '' : 'none';
    }
  },

  // Tocbot is a singleton, it has to be rebuild on every section change.
  setupTocbot() {
    window.addEventListener('section-changed', (event) => {
      this.initTocForSection(event.detail);
    });

    this.initTocForSection(this.initialSection);
  },

  setupImageRows() {
    // Find paragraphs containing only linked images (typically badges)
    document.querySelectorAll('p').forEach(p => {
      // Skip if paragraph has text content
      if (p.textContent.trim()) return;

      // Check if all children are <a> tags containing only <img> or <svg>
      const links = Array.from(p.children);
      const isImageRow = links.length > 0 &&
        links.every(link => link.tagName === 'A' &&
          Array.from(link.children).every(child =>
            child.tagName === 'IMG' || child.tagName === 'SVG'
          )
        );

      if (isImageRow) p.classList.add('image-row');
    });
  },
};

// Expose to global scope for Alpine.js
window.MicrodocsApp = MicrodocsApp;
