#!/usr/bin/env node
// Git hook logic, called by the small scripts in .githooks/ (enabled with: git config core.hooksPath .githooks).
//   pre-commit  blocks local-only paths, scans staged files, runs tools/check --fast
//   commit-msg  scans the message, checks the conventional-commit form
//   pre-push    allows only the project remote, scans what is pushed, runs the full tools/check
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO_ROOT } from './lib/repo.mjs';
import { loadDeferredTerms, scanText, isBinaryPath } from './lib/scan.mjs';

const git = (args) => spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const LOCAL_ONLY = /^(private|reference|\.logs|\.claude\/local|node_modules)\//;
const ALLOWED_REMOTE = /^(https:\/\/([^@/]+@)?github\.com\/|git@github\.com:)OpenMotionFX\/OpenMotionFX(\.git)?\/?$/i;
const CONVENTIONAL = /^(feat|fix|docs|test|chore|refactor|ci|build|perf|revert)(\([a-z0-9-]+\))?!?: \S.{0,90}$/;
const terms = loadDeferredTerms(REPO_ROOT);
const problems = [];
const warn = [];
if (!terms) warn.push('warning: deferred-topic scan skipped (no .claude/local/deferred-terms.txt on this machine)');

function runCheck(args) {
  const r = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'check.mjs'), ...args], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (r.status !== 0) problems.push(`tools/check ${args.join(' ') || '(full)'} failed:\n${r.stdout}${r.stderr}`);
}

const hook = process.argv[2];
if (hook === 'pre-commit') {
  const staged = (git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).stdout || '').split('\n').filter(Boolean);
  for (const f of staged) {
    if (LOCAL_ONLY.test(f)) problems.push(`staged file from a local-only folder: ${f}`);
    if (terms) terms.forEach((re, t) => { if (re.test(f)) problems.push(`deferred: staged file name matches deferred term #${t + 1}`); });
    if (!isBinaryPath(f)) problems.push(...scanText(`staged ${f}`, git(['show', `:${f}`]).stdout || '', { deferred: terms }));
  }
  if (!problems.length) runCheck(['--fast']);
} else if (hook === 'commit-msg') {
  const msg = readFileSync(process.argv[3], 'utf8').split(/\r?\n/).filter((l) => !l.startsWith('#')).join('\n');
  problems.push(...scanText('commit message', msg, { deferred: terms }));
  const subject = msg.split('\n')[0];
  if (!/^(Merge|Revert) /.test(subject) && !CONVENTIONAL.test(subject)) problems.push(`commit subject is not a conventional commit ("type(scope): summary", at most 100 characters): "${subject}"`);
} else if (hook === 'pre-push') {
  const url = process.argv[4] || '';
  if (!ALLOWED_REMOTE.test(url)) problems.push(`push target ${url} is not https://github.com/OpenMotionFX/OpenMotionFX`);
  else runCheck([]);
} else {
  problems.push(`unknown hook "${hook}"`);
}

for (const w of warn) console.error(w);
if (problems.length) {
  console.error(`${hook} blocked:\n` + problems.slice(0, 25).map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
