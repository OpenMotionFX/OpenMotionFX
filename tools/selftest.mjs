#!/usr/bin/env node
// Mutation proof: shows that every check can fail. It copies the repository files to a temp folder,
// confirms the clean copy passes, then breaks one thing per case and confirms the named check fails.
// Runs inside `node tools/check.mjs` (full mode). Stand-alone: node tools/selftest.mjs
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO_ROOT, listFiles } from './lib/repo.mjs';

const edit = (root, rel, fn) => writeFileSync(join(root, rel), fn(readFileSync(join(root, rel), 'utf8')));
const put = (root, rel, text) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); };
const fakeToken = () => 'gh' + 'p_' + 'a1B2'.repeat(10);

// [check id, description, mutation]
const CASES = [
  ['markdown', 'broken relative link', (r) => appendFileSync(join(r, 'README.md'), '\n[gone](does-not-exist.md)\n')],
  ['markdown', 'unclosed code fence', (r) => appendFileSync(join(r, 'README.md'), '\n```\nnever closed\n')],
  ['sizes', 'CLAUDE.md over 120 lines', (r) => appendFileSync(join(r, 'CLAUDE.md'), '\nfiller line'.repeat(130))],
  ['citations', 'digest cites a heading that does not exist', (r) => appendFileSync(join(r, 'docs/spec/take-package.md'), '\n- Invented statement (solo § No Such Heading Anywhere)\n')],
  ['citations', 'digest statement without a citation', (r) => appendFileSync(join(r, 'docs/spec/take-package.md'), '\n- A statement with no source at all\n')],
  ['source-hashes', 'frozen source edited', (r) => appendFileSync(join(r, 'docs/source/solo-build-plan.md'), 'x')],
  ['claims', 'VERIFIED without evidence', (r) => edit(r, 'docs/ai/CLAIMS.md', (t) => t.replace('| UNVERIFIED | - | - |', '| VERIFIED | T-999 | tests/results/none.csv |'))],
  ['parse', 'broken JSON', (r) => put(r, 'schemas/broken.json', '{ "a": ')],
  ['parse', 'broken YAML', (r) => put(r, '.github/workflows/broken.yml', 'a: [1, 2\nb: {')],
  ['secrets', 'token committed', (r) => put(r, 'docs/leak.txt', `token ${fakeToken()}\n`)],
  ['deferred', 'deferred term present', (r) => { put(r, '.claude/local/deferred-terms.txt', 'zzqdeferredqzz\n'); appendFileSync(join(r, 'README.md'), '\nzzqDEFERREDqzz\n'); }],
  ['ai-docs', 'STATE.md loses a required section', (r) => edit(r, 'docs/ai/STATE.md', (t) => t.replace(/^## Next three actions/m, '## Later'))],
  ['ai-docs', 'decision record without status', (r) => edit(r, 'docs/ai/DECISIONS.md', (t) => t.replace('**Status:**', 'Status'))],
  ['skeleton', 'component README loses its phase', (r) => edit(r, 'apps/phone/README.md', (t) => t.replace('**Phase:**', 'Phase'))],
  ['hooks', 'guard that allows everything', (r) => put(r, '.claude/hooks/guard.mjs', 'export function decide() { return null; }\n')],
];

export async function mutationProof(sourceRoot) {
  const { runChecks } = await import('./check.mjs');
  const failures = [];
  const base = mkdtempSync(join(tmpdir(), 'omfx-selftest-'));
  const makeCopy = (name) => {
    const dest = join(base, name);
    for (const f of listFiles(sourceRoot)) { mkdirSync(dirname(join(dest, f)), { recursive: true }); copyFileSync(join(sourceRoot, f), join(dest, f)); }
    return dest;
  };
  const failing = async (root, only) => (await runChecks(root, { fastOnly: false, only })).filter((x) => x.failures.length);
  try {
    const clean = await failing(makeCopy('clean'), null);
    for (const c of clean) failures.push(`clean copy should pass but ${c.id} failed: ${c.failures[0]}`);
    for (const [i, [id, what, mutate]] of CASES.entries()) {
      const root = makeCopy(`case-${i}`);
      mutate(root);
      const bad = (await failing(root, [id])).map((x) => x.id);
      if (!bad.includes(id)) failures.push(`"${what}" was NOT caught by check ${id}`);
    }
    // history: a secret that was committed and then deleted must still be found.
    const hist = makeCopy('history');
    const git = (args) => spawnSync('git', ['-c', 'user.name=selftest', '-c', 'user.email=selftest@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'init.defaultBranch=main', ...args], { cwd: hist, encoding: 'utf8' });
    git(['init', '-q']); git(['add', '-A']); git(['commit', '-q', '-m', 'chore: base']);
    if ((await failing(hist, ['history'])).length) failures.push('history: a clean temp repository should pass');
    put(hist, 'docs/leak.txt', `token ${fakeToken()}\n`); git(['add', '-A']); git(['commit', '-q', '-m', 'chore: add file']);
    rmSync(join(hist, 'docs/leak.txt')); git(['add', '-A']); git(['commit', '-q', '-m', 'chore: remove file']);
    if (!(await failing(hist, ['history'])).length) failures.push('"secret committed then deleted" was NOT caught by check history');
  } finally {
    rmSync(base, { recursive: true, force: true, maxRetries: 3 });
  }
  return failures;
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/selftest.mjs')) {
  const failures = await mutationProof(REPO_ROOT);
  console.log(failures.length ? failures.join('\n') : `mutation proof passed: ${CASES.length + 1} broken inputs, each caught by its check`);
  process.exit(failures.length ? 1 : 0);
}
