#!/usr/bin/env node
// SessionStart hook (startup, resume, clear, compact). Prints docs/ai/STATE.md and a short git status so a
// session with an empty context window knows where the project stands. Plain stdout is added to Claude's
// context (https://code.claude.com/docs/en/hooks, SessionStart). Hard cap: 80 lines in total.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MAX = 80;

export function buildContext(root = ROOT) {
  const git = (args) => (spawnSync('git', args, { cwd: root, encoding: 'utf8' }).stdout || '').trim();
  const tail = [];
  tail.push('== git ==');
  tail.push(`branch: ${git(['branch', '--show-current']) || '(none)'}`);
  const status = git(['status', '--short']).split('\n').filter(Boolean);
  tail.push(status.length ? `uncommitted files: ${status.length}` : 'working tree clean');
  tail.push(...status.slice(0, 8).map((l) => `  ${l}`));
  if (status.length > 8) tail.push(`  ... ${status.length - 8} more`);
  tail.push(...git(['log', '-3', '--format=%h %cs %s']).split('\n').filter(Boolean).map((l) => `commit: ${l}`));
  tail.push(`guardrails: ${existsSync(join(root, '.claude/local/ARMED')) ? 'ARMED (docs/source, .claude/settings.json, .claude/hooks, .claude/local are read-only)' : 'NOT ARMED (run: node tools/arm.mjs on)'}`);
  tail.push(`deferred-topic scan: ${existsSync(join(root, '.claude/local/deferred-terms.txt')) ? 'terms file present' : 'terms file MISSING on this machine'}`);

  const statePath = join(root, 'docs/ai/STATE.md');
  const head = ['== docs/ai/STATE.md =='];
  const state = existsSync(statePath) ? readFileSync(statePath, 'utf8').split(/\r?\n/) : ['(missing: recreate it from docs/ai/LOG/)'];
  while (state.length && state[state.length - 1].trim() === '') state.pop();
  const room = MAX - head.length - tail.length;
  if (state.length > room) { state.length = room - 1; state.push('... (STATE.md cut here; open the file for the rest)'); }
  return [...head, ...state, ...tail].slice(0, MAX).join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.stdout.write(buildContext() + '\n'); } catch (e) { process.stdout.write(`session-start hook failed: ${e.message}\n`); }
  process.exit(0);
}
