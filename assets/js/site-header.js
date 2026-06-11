/**
 * <site-header> — Light DOM web component
 * Renders a fixed sticky header with desktop nav and mobile slide-in drawer.
 */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'banner');

    const links = [
      { href: 'index.html', label: 'Naslovna' },
      { href: 'about.html', label: 'O meni' },
      { href: 'services.html', label: 'Usluge' },
      { href: 'faq.html', label: 'FAQ' },
      { href: 'contact.html', label: 'Kontakt' },
    ];

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    const isActive = (href) => {
      const file = href.split('/').pop();
      const match = file === currentFile || (file === 'index.html' && currentFile === '');
      return match ? ' aria-current="page"' : '';
    };

    const navItems = (cls) =>
      links
        .map(
          ({ href, label }) =>
            `<li><a href="${href}" class="${cls}"${isActive(href)}>${label}</a></li>`
        )
        .join('');

    this.innerHTML = `
      <header class="site-header">
        <div class="site-header__inner">
          <a href="index.html" class="site-header__logo" aria-label="Bubamara Savjetovanje – početna">
            <img src="assets/images/logo-t2.png" alt="Bubamara Savjetovanje"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
            <span class="site-header__logo-text" style="display:none">Bubamara Savjetovanje</span>
          </a>

          <nav class="site-nav" aria-label="Glavna navigacija">
            <ul class="site-nav__list">
              ${navItems('site-nav__link')}
            </ul>
          </nav>

          <button
            class="nav-toggle"
            aria-label="Otvori izbornik"
            aria-expanded="false"
            aria-controls="site-nav-drawer"
          >
            <span class="nav-toggle__bar"></span>
            <span class="nav-toggle__bar"></span>
            <span class="nav-toggle__bar"></span>
          </button>
        </div>
      </header>

      <div class="nav-overlay" id="site-nav-overlay" aria-hidden="true"></div>

      <div
        class="nav-drawer"
        id="site-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Izbornik"
        aria-hidden="true"
      >
        <div class="nav-drawer__header">
          <a href="index.html" class="nav-drawer__logo">Bubamara Savjetovanje</a>
          <button class="nav-drawer__close" aria-label="Zatvori izbornik">&#215;</button>
        </div>
        <nav aria-label="Navigacija">
          <ul class="nav-drawer__list">
            ${navItems('nav-drawer__link')}
          </ul>
        </nav>
      </div>
    `;

    this._initDrawer();
    this._offsetMainContent();
  }

  _initDrawer() {
    const toggle  = this.querySelector('.nav-toggle');
    const drawer  = this.querySelector('.nav-drawer');
    const overlay = this.querySelector('.nav-overlay');
    const closeBtn = this.querySelector('.nav-drawer__close');

    const open = () => {
      drawer.classList.add('is-open');
      overlay.classList.add('is-visible');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const close = () => {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      toggle.focus();
    };

    toggle.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    drawer.querySelectorAll('.nav-drawer__link').forEach((link) =>
      link.addEventListener('click', close)
    );

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
  }

  /* Push <main> and any sibling content below the fixed header */
  _offsetMainContent() {
    const applyOffset = () => {
      const h = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')
        .trim();
      const main = document.querySelector('main');
      if (main) main.style.paddingTop = '';  /* rely on CSS var in sections */
    };
    requestAnimationFrame(applyOffset);
  }
}

customElements.define('site-header', SiteHeader);
