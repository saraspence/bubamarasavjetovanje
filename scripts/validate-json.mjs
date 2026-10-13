/**
 * validate-json.mjs — strict JSON checks that Prettier does not do.
 *
 * 1. Every .json file must parse with JSON.parse (same strictness as the
 *    browser's res.json()). Prettier's parser tolerates comments, trailing
 *    commas and single quotes, so it is not enough on its own.
 * 2. assets/i18n/hr.json and en.json must have the same keys, and each key
 *    must have the same type in both (e.g. array for data-i18n-list).
 *    Keys starting with "_" are notes for editors and are ignored.
 *
 * Always checks the whole repo; file arguments (from lint-staged) are ignored.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['node_modules', '_site']);
const I18N_DIR = 'assets/i18n';
const LANGS = ['hr', 'en'];

const errors = [];

function findJsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    // Dot-directories (.git, .vscode, .github) hold tool config, which may be JSONC.
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findJsonFiles(path);
    return entry.name.endsWith('.json') ? [path] : [];
  });
}

const parsed = new Map();
for (const file of findJsonFiles(ROOT)) {
  // Forward slashes on every OS, so the i18n lookups below match on Windows.
  const rel = relative(ROOT, file).split(sep).join('/');
  try {
    parsed.set(rel, JSON.parse(readFileSync(file, 'utf8')));
  } catch (err) {
    errors.push(`${rel}: invalid JSON — ${err.message}`);
  }
}

const typeOf = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v);

/** Map of "a.b.c" → type for every leaf, skipping "_"-prefixed keys. */
function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('_')) continue;
    const path = prefix + key;
    if (typeOf(value) === 'object') flatten(value, `${path}.`, out);
    else out.set(path, typeOf(value));
  }
  return out;
}

const dicts = LANGS.map((lang) => ({ lang, data: parsed.get(`${I18N_DIR}/${lang}.json`) }));
if (dicts.every((d) => d.data)) {
  const [a, b] = dicts.map((d) => ({ lang: d.lang, keys: flatten(d.data) }));
  for (const [x, y] of [
    [a, b],
    [b, a],
  ]) {
    for (const [key, type] of x.keys) {
      if (!y.keys.has(key)) errors.push(`${I18N_DIR}/${y.lang}.json: missing key "${key}"`);
      else if (x === a && y.keys.get(key) !== type) {
        errors.push(
          `${I18N_DIR}: "${key}" is ${type} in ${x.lang}.json but ${y.keys.get(key)} in ${y.lang}.json`
        );
      }
    }
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✖ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✔ ${parsed.size} JSON files valid, i18n keys match`);
