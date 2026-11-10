#!/usr/bin/env node
// The one verification entry point.
//   node tools/check.mjs --fast   quick checks on the working files (Stop hook, pre-commit)
//   node tools/check.mjs          everything: adds hook self-tests, git history scan, mutation proof
// Prints at most 30 lines. The full report goes to .logs/ (gitignored).
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, makeCtx } from './lib/repo.mjs';
import { CHECKS } from './lib/checks.mjs';

const fast = process.argv.includes('--fast');
const MAX_LINES = 30;

export async function runChecks(root, { fastOnly, only = null }) {
  const ctx = makeCtx(root);
  const results = [];
  for (const c of CHECKS) {
    if (fastOnly && !c.fast) continue;
    if (only && !only.includes(c.id)) continue;
    let problems;
    try { problems = await c.run(ctx); } catch (e) { problems = [`check crashed: ${e.stack || e}`]; }
    const warnings = problems.filter((p) => p.startsWith('WARN '));
    const failures = problems.filter((p) => !p.startsWith('WARN '));
    results.push({ id: c.id, what: c.what, warnings, failures });
  }
  return results;
}

async function main() {
  const started = Date.now();
  const results = await runChecks(REPO_ROOT, { fastOnly: fast });
  if (!fast) {
    const { mutationProof } = await import('./selftest.mjs');
    const failures = await mutationProof(REPO_ROOT);
    results.push({ id: 'mutation', what: 'each check fails on broken input', warnings: [], failures });
  }
  const failed = results.filter((r) => r.failures.length);
  const summary = [];
  for (const r of results) {
    const state = r.failures.length ? 'FAIL' : r.warnings.length ? 'WARN' : 'PASS';
    summary.push(`${state} ${r.id.padEnd(13)} ${r.failures.length ? `${r.failures.length} problem(s)` : r.what}`);
  }
  const detail = results.flatMap((r) => [...r.failures.map((p) => `  [${r.id}] ${p}`), ...r.warnings.map((p) => `  [${r.id}] ${p}`)]);
  const verdict = `${failed.length ? 'CHECK FAILED' : 'CHECK PASSED'} (${fast ? 'fast' : 'full'}, ${results.length} checks, ${Date.now() - started} ms)`;

  const logDir = join(REPO_ROOT, '.logs');
  mkdirSync(logDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = join(logDir, `check-${fast ? 'fast' : 'full'}-${stamp}.log`);
  writeFileSync(logFile, [verdict, ...summary, '', ...detail, ''].join('\n'));
  const old = readdirSync(logDir).filter((f) => f.startsWith('check-')).sort();
  for (const f of old.slice(0, Math.max(0, old.length - 20))) unlinkSync(join(logDir, f));

  const lines = [...summary];
  const room = MAX_LINES - summary.length - 2;
  lines.push(...detail.slice(0, room));
  if (detail.length > room) lines.push(`  ... ${detail.length - room} more line(s) in .logs/${logFile.split(/[\\/]/).pop()}`);
  lines.push(verdict);
  console.log(lines.slice(0, MAX_LINES).join('\n'));
  process.exit(failed.length ? 1 : 0);
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/check.mjs')) main();
