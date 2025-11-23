// Read configuration from JSON script tag
const configScript = document.getElementById('microdocs-config');
const config = configScript ? JSON.parse(configScript.textContent) : { sectionIds: [], initialSection: '' };

// Microdocs initialization functions
const MicrodocsApp = {
  sectionIds: config.sectionIds,
  initialSection: config.initialSection,

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
      scrollSmooth: true,
      scrollSmoothDuration: 200,
      headingsOffset: 100,
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

  setupTocbot() {
    // Listen for section changes
    window.addEventListener('section-changed', (event) => {
      this.initTocForSection(event.detail);
    });

    // Initial load
    this.initTocForSection(this.initialSection);
  },

  setupImageRows() {
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
      // Check if p contains only whitespace text nodes
      const hasText = Array.from(p.childNodes).some(node =>
        node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
      );
      if (hasText) return;

      // Check if all children are 'a' tags
      const children = Array.from(p.children);
      if (children.length === 0) return;

      const allLinks = children.every(child => child.tagName.toLowerCase() === 'a');
      if (!allLinks) return;

      // Check if all 'a' tags contain only 'img' or 'svg'
      const validLinks = children.every(link => {
        // Check if link contains text
        const linkHasText = Array.from(link.childNodes).some(node =>
          node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
        );
        if (linkHasText) return false;

        const linkChildren = Array.from(link.children);
        if (linkChildren.length === 0) return false;

        // All children must be img or svg
        return linkChildren.every(child => {
            const tagName = child.tagName.toLowerCase();
            return tagName === 'img' || tagName === 'svg';
        });
      });

      if (validLinks) {
        p.classList.add('image-row');
      }
    });
  },

  init(alpineContext) {
    this.setupSectionWatcher(alpineContext.$watch, alpineContext.activeSection);
    this.setupThemeWatcher(alpineContext.$watch, alpineContext.theme);
    this.setupHashLinkHandler(
      () => alpineContext.activeSection,
      (section) => { alpineContext.activeSection = section; }
    );
    this.setupImageRows();
  }
};

// Expose to global scope for Alpine.js
window.MicrodocsApp = MicrodocsApp;

document.addEventListener('DOMContentLoaded', () => {
  MicrodocsApp.setupTocbot();
  MicrodocsApp.setupImageRows();
});
