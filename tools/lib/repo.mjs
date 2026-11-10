// Shared helpers for tools/ and .claude/hooks/. Plain Node, no dependencies except `yaml` (lazy).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Folders that are never part of the repository content (mirrors .gitignore).
const SKIP_DIRS = new Set(['.git', 'node_modules', 'private', 'reference', '.logs', 'build', '.gradle', '__pycache__', '.venv']);
const SKIP_PATHS = new Set(['.claude/local', '.claude/settings.local.json']);

/** All content files under root as forward-slash relative paths. */
export function listFiles(root) {
  const out = [];
  const walk = (rel) => {
    for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
      const p = rel ? `${rel}/${e.name}` : e.name;
      if (SKIP_PATHS.has(p)) continue;
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); } else out.push(p);
    }
  };
  walk('');
  return out.sort();
}

export function makeCtx(root) {
  const cache = new Map();
  const files = listFiles(root);
  return {
    root,
    files,
    has: (rel) => existsSync(join(root, rel)),
    isDir: (rel) => existsSync(join(root, rel)) && statSync(join(root, rel)).isDirectory(),
    text: (rel) => { if (!cache.has(rel)) cache.set(rel, readFileSync(join(root, rel), 'utf8')); return cache.get(rel); },
    lines: function (rel) { return this.text(rel).split(/\r?\n/); },
  };
}

/** Line count the way an editor shows it (a trailing newline does not add a line). */
export function lineCount(text) {
  if (text === '') return 0;
  const n = text.split(/\r?\n/).length;
  return text.endsWith('\n') ? n - 1 : n;
}

export function wordCount(text) { return (text.match(/\S+/g) || []).length; }

/** Splits optional YAML frontmatter from a markdown body. Returns { raw, body, startLine }. */
export function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { raw: null, body: text };
  return { raw: m[1], body: text.slice(m[0].length) };
}

/** Markdown lines with fenced code blocks blanked out, so checks ignore code samples. */
export function proseLines(text) {
  let fence = null;
  return text.split(/\r?\n/).map((line) => {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) { if (!fence) fence = f[1][0]; else if (f[1][0] === fence) fence = null; return ''; }
    return fence ? '' : line;
  });
}

export function fencesBalanced(text) {
  let fence = null;
  for (const line of text.split(/\r?\n/)) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) { if (!fence) fence = f[1][0]; else if (f[1][0] === fence) fence = null; }
  }
  return fence === null;
}

export function headings(text) {
  return proseLines(text).map((l, i) => {
    const m = l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    return m ? { level: m[1].length, text: m[2], line: i + 1 } : null;
  }).filter(Boolean);
}

/** GitHub-style anchor for a heading. */
export function slug(heading) {
  return heading.toLowerCase().replace(/[`*_]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
}

export async function parseYaml(text) {
  const { parse } = await import('yaml');
  return parse(text);
}
