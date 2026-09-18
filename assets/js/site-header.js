/**
 * <site-header> — Light DOM web component
 * Renders a fixed sticky header with desktop nav, HR/EN language switch and
 * a mobile slide-in drawer. Text is Croatian by default and translated at
 * runtime by i18n.js through data-i18n* attributes.
 */
import { apply, initLangSwitch } from './i18n.js';

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'banner');

    const links = [
      { href: 'index.html', key: 'nav.home', label: 'Naslovna' },
      { href: 'about.html', key: 'nav.about', label: 'O meni' },
      { href: 'services.html', key: 'nav.services', label: 'Usluge' },
      { href: 'faq.html', key: 'nav.faq', label: 'FAQ' },
      { href: 'contact.html', key: 'nav.contact', label: 'Kontakt' },
    ];

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const currentLang = document.documentElement.lang || 'hr';

    const isActive = (href) => {
      const file = href.split('/').pop();
      const match = file === currentFile || (file === 'index.html' && currentFile === '');
      return match ? ' aria-current="page"' : '';
    };

    const navItems = (cls) =>
      links
        .map(
          ({ href, key, label }) =>
            `<li><a href="${href}" class="${cls}" data-i18n="${key}"${isActive(href)}>${label}</a></li>`
        )
        .join('');

    const langButton = (lang) =>
      `<button type="button" data-lang="${lang}" lang="${lang}"
               aria-pressed="${String(lang === currentLang)}">${lang.toUpperCase()}</button>`;

    const langSwitch = (modifier = '') => `
      <div class="lang-switch${modifier}" role="group" aria-label="Jezik" data-i18n-attr="aria-label:nav.language">
        ${langButton('hr')}
        <span class="lang-switch__sep" aria-hidden="true">|</span>
        ${langButton('en')}
      </div>`;

    this.innerHTML = `
      <header class="site-header">
        <div class="site-header__inner">
          <a href="index.html" class="site-header__logo"
             aria-label="Bubamara Savjetovanje – početna" data-i18n-attr="aria-label:nav.logoAria">
            <img src="assets/images/logo-t2.png" alt="Bubamara Savjetovanje"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
            <span class="site-header__logo-text" style="display:none">Bubamara Savjetovanje</span>
          </a>

          <div class="site-header__right">
            <nav class="site-nav" aria-label="Glavna navigacija" data-i18n-attr="aria-label:nav.mainNav">
              <ul class="site-nav__list">
                ${navItems('site-nav__link')}
              </ul>
            </nav>

            ${langSwitch()}

            <button
              class="nav-toggle"
              aria-label="Otvori izbornik"
              data-i18n-attr="aria-label:nav.openMenu"
              aria-expanded="false"
              aria-controls="site-nav-drawer"
            >
              <span class="nav-toggle__bar"></span>
              <span class="nav-toggle__bar"></span>
              <span class="nav-toggle__bar"></span>
            </button>
          </div>
        </div>
      </header>

      <div class="nav-overlay" id="site-nav-overlay" aria-hidden="true"></div>

      <div
        class="nav-drawer"
        id="site-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Izbornik"
        data-i18n-attr="aria-label:nav.menu"
        aria-hidden="true"
      >
        <div class="nav-drawer__header">
          <a href="index.html" class="nav-drawer__logo">Bubamara Savjetovanje</a>
          <button class="nav-drawer__close" aria-label="Zatvori izbornik" data-i18n-attr="aria-label:nav.closeMenu">&#215;</button>
        </div>
        <nav aria-label="Izbornik" data-i18n-attr="aria-label:nav.menu">
          <ul class="nav-drawer__list">
            ${navItems('nav-drawer__link')}
          </ul>
        </nav>
        ${langSwitch(' lang-switch--drawer')}
      </div>
    `;

    this._initDrawer();
    initLangSwitch(this);
    apply(this); /* no-op until the dictionary has loaded; i18n.js re-applies then */
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
}

customElements.define('site-header', SiteHeader);
