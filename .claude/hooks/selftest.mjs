#!/usr/bin/env node
// Self-tests for the hooks in this folder. Run by `node tools/check.mjs` (full mode).
// Stand-alone: node .claude/hooks/selftest.mjs   (prints only failures; exit 1 if any)
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { decide } from './guard.mjs';
import { buildContext } from './session-start.mjs';
import { stopDecision, MAX_BLOCKS } from './stop.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const T = tmpdir().replace(/\\/g, '/');
const OK_URL = 'https://github.com/OpenMotionFX/OpenMotionFX';
const fails = [];

// [expected, tool, command] — expected is 'deny' or 'allow'. Guard runs unarmed and in dry-run mode.
const COMMANDS = [
  ['deny', 'Bash', 'rm -rf build'],
  ['deny', 'Bash', 'rm -fr ./docs'],
  ['deny', 'Bash', 'cd docs && rm -r spec'],
  ['deny', 'Bash', 'bash -c "rm -rf docs"'],
  ['deny', 'Bash', 'find . -name "*.md" -delete'],
  ['deny', 'PowerShell', 'Remove-Item -Recurse -Force docs'],
  ['deny', 'PowerShell', 'Remove-Item docs -Recurse'],
  ['deny', 'PowerShell', 'rm -r -fo apps'],
  ['deny', 'PowerShell', 'Remove-Item -Recurse $somewhere'],
  ['deny', 'PowerShell', 'cmd /c "rd /s /q docs"'],
  ['deny', 'PowerShell', `Remove-Item -Recurse "${T}/../Documents"`],
  ['allow', 'Bash', `rm -rf "${T}/omfx-scratch"`],
  ['allow', 'PowerShell', `Remove-Item -Recurse -Force "${T}/omfx-scratch" -ErrorAction SilentlyContinue`],
  ['allow', 'PowerShell', 'Remove-Item -Force notes.tmp'],
  ['allow', 'Bash', 'rm notes.tmp'],
  ['deny', 'Bash', 'git reset --hard HEAD~1'],
  ['deny', 'PowerShell', 'git status; git reset --hard'],
  ['allow', 'Bash', 'git reset HEAD README.md'],
  ['deny', 'Bash', 'git clean -fdx'],
  ['deny', 'Bash', 'git clean --force'],
  ['allow', 'Bash', 'git clean -n'],
  ['deny', 'Bash', `git push --force ${OK_URL} main`],
  ['deny', 'Bash', `git push -f ${OK_URL} main`],
  ['deny', 'Bash', `git push --force-with-lease=main:abc123 ${OK_URL} main`],
  ['deny', 'Bash', `git push ${OK_URL} +main`],
  ['deny', 'Bash', 'git push https://github.com/OpenMotionFX/OpenCamera main'],
  ['deny', 'Bash', 'git push https://github.com/someone-else/OpenMotionFX main'],
  ['deny', 'Bash', 'git push git@github.com:other/repo.git main'],
  ['deny', 'PowerShell', `cd reference/OpenCamera; git push ${OK_URL} main`],
  ['deny', 'Bash', `git -C reference/OpenCamera push ${OK_URL} main`],
  ['allow', 'Bash', `git push ${OK_URL} main`],
  ['allow', 'PowerShell', `git push ${OK_URL}.git main --tags`],
  ['deny', 'Bash', 'git commit --no-verify -m "x"'],
  ['deny', 'Bash', 'git commit -nm "x"'],
  ['deny', 'Bash', `git push --no-verify ${OK_URL} main`],
  ['deny', 'Bash', 'git -c core.hooksPath=/dev/null commit -m "x"'],
  ['deny', 'Bash', 'git config core.hooksPath elsewhere'],
  ['deny', 'Bash', 'git config --unset core.hooksPath'],
  ['allow', 'Bash', 'git config core.hooksPath .githooks'],
  ['allow', 'Bash', 'git config core.hooksPath'],
  ['allow', 'Bash', 'git commit -m "docs: note about -n and --hard in prose"'],
  ['allow', 'Bash', 'git commit -F msg.txt'],
  ['deny', 'Bash', 'git add private/notes.md'],
  ['deny', 'PowerShell', 'git add .\\private\\source-originals'],
  ['deny', 'Bash', 'git add .logs/check.log'],
  ['deny', 'Bash', 'git add -f somefile'],
  ['deny', 'Bash', 'git add --force .'],
  ['deny', 'Bash', 'git add .claude/local/deferred-terms.txt'],
  ['allow', 'Bash', 'git add -A'],
  ['allow', 'Bash', 'git add docs/ai/STATE.md'],
  ['deny', 'Bash', 'node tools/arm.mjs off'],
  ['allow', 'Bash', 'node tools/arm.mjs on'],
  ['deny', 'Bash', 'gh repo edit OpenMotionFX/OpenMotionFX --visibility public'],
  ['deny', 'Bash', 'gh repo delete OpenMotionFX/OpenMotionFX --yes'],
  ['deny', 'Bash', 'gh api -X DELETE repos/OpenMotionFX/OpenCamera/git/refs/heads/main'],
  ['allow', 'Bash', 'gh repo view OpenMotionFX/OpenCamera'],
  ['allow', 'Bash', 'gh issue list'],
  ['allow', 'Bash', 'node tools/check.mjs --fast'],
  ['allow', 'PowerShell', 'git status --short; git log --oneline -5'],
];
for (const [want, tool, command] of COMMANDS) {
  const got = decide({ tool_name: tool, tool_input: { command }, cwd: ROOT }, { dryRun: true, armed: false }) ? 'deny' : 'allow';
  if (got !== want) fails.push(`guard: expected ${want}, got ${got}: [${tool}] ${command}`);
}

// Armed state: protected paths are read-only for edits and for shell writes.
const ARMED = [
  ['deny', 'Edit', { file_path: join(ROOT, 'docs', 'source', 'solo-build-plan.md') }],
  ['deny', 'Write', { file_path: join(ROOT, '.claude', 'settings.json') }],
  ['deny', 'Write', { file_path: join(ROOT, '.claude', 'hooks', 'guard.mjs') }],
  ['deny', 'Edit', { file_path: join(ROOT, '.claude', 'local', 'ARMED') }],
  ['allow', 'Edit', { file_path: join(ROOT, 'docs', 'ai', 'STATE.md') }],
  ['allow', 'Write', { file_path: join(ROOT, '.claude', 'rules', 'docs.md') }],
  ['deny', 'PowerShell', { command: 'Set-Content .claude/settings.json "{}"' }],
  ['deny', 'PowerShell', { command: 'Remove-Item .claude\\local\\ARMED' }],
  ['deny', 'Bash', { command: 'echo x > docs/source/solo-build-plan.md' }],
  ['deny', 'Bash', { command: 'git checkout -- .claude/hooks/guard.mjs' }],
  ['allow', 'Bash', { command: 'git diff .claude/hooks/guard.mjs' }],
  ['allow', 'PowerShell', { command: 'Get-Content docs/source/MANIFEST.json' }],
];
for (const [want, tool, tool_input] of ARMED) {
  const got = decide({ tool_name: tool, tool_input, cwd: ROOT }, { dryRun: true, armed: true }) ? 'deny' : 'allow';
  if (got !== want) fails.push(`guard (armed): expected ${want}, got ${got}: [${tool}] ${JSON.stringify(tool_input)}`);
}
// Unarmed: the same edit is allowed, so setup and owner-approved maintenance stay possible.
if (decide({ tool_name: 'Write', tool_input: { file_path: join(ROOT, '.claude', 'settings.json') } }, { dryRun: true, armed: false })) fails.push('guard: unarmed edit of settings.json should be allowed');

// End to end: the script reads hook JSON on stdin and prints a deny decision in the documented shape.
const run = (stdin) => spawnSync(process.execPath, [join(HERE, 'guard.mjs')], { input: stdin, encoding: 'utf8', env: { ...process.env, OMFX_GUARD_DRYRUN: '1' } });
const e2e = run(JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git reset --hard' }, cwd: ROOT }));
try {
  const o = JSON.parse(e2e.stdout).hookSpecificOutput;
  if (o.hookEventName !== 'PreToolUse' || o.permissionDecision !== 'deny' || !o.permissionDecisionReason) fails.push('guard e2e: deny output has the wrong shape');
} catch { fails.push(`guard e2e: expected deny JSON, got "${e2e.stdout.slice(0, 80)}"`); }
if (run(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git status' }, cwd: ROOT })).stdout.trim() !== '') fails.push('guard e2e: harmless command should print nothing');
if (!/deny/.test(run('this is not json').stdout)) fails.push('guard e2e: broken input must fail closed (deny)');

// SessionStart: never more than 80 lines, always shows state and git.
const ctxText = buildContext(ROOT);
if (ctxText.split('\n').length > 80) fails.push(`session-start: ${ctxText.split('\n').length} lines, limit 80`);
if (!ctxText.includes('== docs/ai/STATE.md ==') || !ctxText.includes('== git ==')) fails.push('session-start: missing STATE or git block');

// Stop: blocks on failure, passes on success, gives up after MAX_BLOCKS so it cannot loop forever.
const s1 = stopDecision({ passed: false, output: 'FAIL x', blocksSoFar: 0 });
if (s1.json?.decision !== 'block' || !s1.json.reason || s1.blocks !== 1) fails.push('stop: first failure should block with a reason');
const s2 = stopDecision({ passed: false, output: 'FAIL x', blocksSoFar: MAX_BLOCKS });
if (s2.json?.decision === 'block' || !s2.json?.systemMessage) fails.push('stop: must stop blocking after MAX_BLOCKS attempts');
const s3 = stopDecision({ passed: true, output: '', blocksSoFar: 2 });
if (s3.json !== null || s3.blocks !== 0) fails.push('stop: a passing check must allow the stop and reset the counter');

if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log(`hook self-tests passed: ${COMMANDS.length + ARMED.length + 9} cases`);
