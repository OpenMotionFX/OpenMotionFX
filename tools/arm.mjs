#!/usr/bin/env node
// Arms or disarms the guardrails.
//   node tools/arm.mjs on      Claude may run this (last act of setup or maintenance).
//   node tools/arm.mjs off     Owner only. The guard hook blocks Claude from running it.
//   node tools/arm.mjs status
// When armed, docs/source/, .claude/settings.json, .claude/hooks/ and .claude/local/ are read-only for Claude.
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './lib/repo.mjs';

const dir = join(REPO_ROOT, '.claude', 'local');
const flag = join(dir, 'ARMED');
const mode = process.argv[2];

if (mode === 'on') {
  mkdirSync(dir, { recursive: true });
  writeFileSync(flag, `armed ${new Date().toISOString()}\n`);
  console.log('Guardrails ARMED.');
} else if (mode === 'off') {
  if (existsSync(flag)) unlinkSync(flag);
  console.log('Guardrails DISARMED. Arm again when the change is done: node tools/arm.mjs on');
} else {
  console.log(`Guardrails are ${existsSync(flag) ? 'ARMED' : 'NOT ARMED'}. Usage: node tools/arm.mjs on|off|status`);
}
