// Secret and deferred-topic scanning, shared by tools/check.mjs and the git hooks.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Patterns for credentials that must not be committed. Scope: every tracked text file and commit message.
export const SECRET_PATTERNS = [
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['GitHub fine-grained token', /github_pat_[A-Za-z0-9_]{40,}/],
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['Slack token', /xox[baprs]-[0-9A-Za-z-]{10,}/],
  ['Anthropic key', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['hard-coded credential', /(?:password|passwd|secret|api[_-]?key|token)\s*[:=]\s*["'][^"'\s]{12,}["']/i],
];

export const DEFERRED_TERMS_FILE = '.claude/local/deferred-terms.txt';

/** Returns the deferred-topic patterns, or null when the local terms file is absent (CI, fresh clones). */
export function loadDeferredTerms(root) {
  const p = join(root, DEFERRED_TERMS_FILE);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8').split(/\r?\n/).map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#')).map((l) => new RegExp(l, 'i'));
}

const BINARY = /\.(png|jpe?g|gif|pdf|ttf|otf|woff2?|zip|bin|ico)$/i;
export const isBinaryPath = (p) => BINARY.test(p);

/** Scans text line by line. Deferred hits never echo the matched text, only where it is. */
export function scanText(label, text, { deferred = null, secrets = true } = {}) {
  const problems = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (secrets) for (const [name, re] of SECRET_PATTERNS) if (re.test(line)) problems.push(`secrets: ${label}:${i + 1} looks like a ${name}`);
    if (deferred) deferred.forEach((re, t) => { if (re.test(line)) problems.push(`deferred: ${label}:${i + 1} matches deferred term #${t + 1}`); });
  });
  return problems;
}
