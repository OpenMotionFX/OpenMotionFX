#!/usr/bin/env node
// Stop hook. Runs `node tools/check.mjs --fast` when Claude finishes a turn. On failure it hands the
// failure back so the work continues (https://code.claude.com/docs/en/hooks, Stop decision control).
// Loop protection: after MAX_BLOCKS failed attempts in a row in one session it lets the turn end and
// tells the owner, on top of Claude Code's own cap of 8 continuations.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const MAX_BLOCKS = 3;

/** Pure decision: given the check result and how many times this session was already blocked. */
export function stopDecision({ passed, output, blocksSoFar }) {
  if (passed) return { blocks: 0, json: null };
  if (blocksSoFar >= MAX_BLOCKS) {
    return { blocks: blocksSoFar, json: { systemMessage: `tools/check --fast still fails after ${MAX_BLOCKS} attempts. Stopping anyway. Full output is in .logs/.` } };
  }
  const reason = [
    'node tools/check.mjs --fast failed. Fix the problems below before ending the turn.',
    'If a problem cannot be fixed in this session, write it under Blockers in docs/ai/STATE.md and say so.',
    '', output.split(/\r?\n/).slice(0, 30).join('\n'),
  ].join('\n');
  return { blocks: blocksSoFar + 1, json: { decision: 'block', reason } };
}

function main() {
  let input = {};
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { /* no input: treat as a plain run */ }
  const stateFile = join(ROOT, '.logs', 'stop-hook.json');
  let state = { session: null, blocks: 0 };
  try { if (existsSync(stateFile)) state = JSON.parse(readFileSync(stateFile, 'utf8')); } catch { /* corrupt state: start again */ }
  if (state.session !== input.session_id) state = { session: input.session_id || null, blocks: 0 };

  const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'check.mjs'), '--fast'], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  const d = stopDecision({ passed: r.status === 0, output: `${r.stdout || ''}${r.stderr || ''}`, blocksSoFar: state.blocks });
  try { mkdirSync(dirname(stateFile), { recursive: true }); writeFileSync(stateFile, JSON.stringify({ session: state.session, blocks: d.blocks })); } catch { /* state is best effort */ }
  if (d.json) process.stdout.write(JSON.stringify(d.json));
  process.exit(0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
