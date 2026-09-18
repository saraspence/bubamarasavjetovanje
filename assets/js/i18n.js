/**
 * i18n.js — runtime language switching.
 *
 * Croatian is the default and lives inline in the HTML (no-JS fallback, SEO).
 * Dictionaries in assets/i18n/<lang>.json are applied on top using:
 *   data-i18n="key"        → textContent
 *   data-i18n-html="key"   → innerHTML (our own JSON, may contain <a>/<strong>)
 *   data-i18n-list="key"   → array → <li> per item (ul/ol) or <p> per item
 *   data-i18n-attr="attr:key,attr2:key2" → attributes
 * <body data-page="home"> selects <page>.title / <page>.description for <head>.
 * Language buttons: any element with data-lang="hr|en".
 */
const SUPPORTED = ['hr', 'en'];
const DEFAULT_LANG = 'hr';
const STORAGE_KEY = 'lang';

let dict = null;
let currentLang = DEFAULT_LANG;

const lookup = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function getLang() {
  return currentLang;
}

/** Translate a key; returns `fallback` when not loaded / missing. */
export function t(key, fallback = '') {
  const v = lookup(dict, key);
  return v == null ? fallback : v;
}

function save(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable — ignore */
  }
}

function resolveInitialLang() {
  const param = new URLSearchParams(location.search).get('lang');
  if (SUPPORTED.includes(param)) return param;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

async function load(lang) {
  const url = new URL(`../i18n/${lang}.json`, import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`i18n: HTTP ${res.status} loading ${url}`);
  return res.json();
}

/** Apply the loaded dictionary to `root` (defaults to the whole document). */
export function apply(root = document) {
  if (!dict) return;

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = t(el.dataset.i18n, null);
    if (typeof v === 'string') el.textContent = v;
  });

  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const v = t(el.dataset.i18nHtml, null);
    if (typeof v === 'string') el.innerHTML = v;
  });

  root.querySelectorAll('[data-i18n-list]').forEach((el) => {
    const v = t(el.dataset.i18nList, null);
    if (!Array.isArray(v)) return;
    const tag = /^(ul|ol)$/i.test(el.tagName) ? 'li' : 'p';
    el.innerHTML = v.map((item) => `<${tag}>${item}</${tag}>`).join('');
  });

  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const v = t(key, null);
      if (attr && typeof v === 'string') el.setAttribute(attr, v);
    });
  });

  root.querySelectorAll('[data-lang]').forEach((btn) =>
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === currentLang))
  );

  if (root === document) {
    const page = document.body?.dataset.page;
    if (page) {
      const title = t(`${page}.title`, null);
      if (title) document.title = title;
      const desc = t(`${page}.description`, null);
      const meta = document.querySelector('meta[name="description"]');
      if (desc && meta) meta.setAttribute('content', desc);
    }
    document.documentElement.lang = currentLang;
  }
}

/** Switch language: load dictionary, persist, re-apply everywhere. */
export async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  try {
    dict = await load(lang);
    currentLang = lang;
    save(lang);
    apply();
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang } }));
  } catch (err) {
    console.error(err);
    if (lang !== DEFAULT_LANG) {
      /* fall back to the inline Croatian so the page is never left blank */
      document.documentElement.lang = DEFAULT_LANG;
    }
  } finally {
    document.documentElement.classList.add('i18n-ready');
  }
}

/** Bind [data-lang] buttons inside `root`. */
export function initLangSwitch(root = document) {
  root.querySelectorAll('[data-lang]').forEach((btn) => {
    if (btn.dataset.i18nBound) return;
    btn.dataset.i18nBound = '1';
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

/* ── boot ─────────────────────────────────────────────────────────────── */
const initial = resolveInitialLang();
document.documentElement.lang = initial;
/* Never keep content hidden for long if the dictionary is slow to arrive */
setTimeout(() => document.documentElement.classList.add('i18n-ready'), 3000);
setLang(initial);
