#!/usr/bin/env node
// Reports which toolchains each phase needs and which are installed. It installs nothing.
// Run: node tools/doctor.mjs
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';

const home = homedir();
const env = process.env;
function onPath(cmd, args = ['--version']) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) return null;
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).find((l) => l.trim())?.trim().slice(0, 60) || 'found';
}
const firstExisting = (paths) => paths.find((p) => p && existsSync(p)) || null;
function glob1(dir, re) { try { const hit = readdirSync(dir).find((n) => re.test(n)); return hit ? join(dir, hit) : null; } catch { return null; } }

// [tool, needed from phase, why, finder]
const TOOLS = [
  ['node', 'now', 'tools/check, hooks', () => onPath('node')],
  ['git', 'now', 'version control', () => onPath('git')],
  ['gh', 'now', 'GitHub issues, CI status', () => onPath('gh')],
  ['ESP-IDF', 'Phase 0', 'ESP32-P4 firmware build and flash', () => env.IDF_PATH && existsSync(env.IDF_PATH) ? `IDF_PATH=${env.IDF_PATH}` : firstExisting([join(home, '.espressif'), join(home, 'esp', 'esp-idf')])],
  ['C compiler (gcc/clang)', 'Phase 0', 'host tests of portable firmware logic', () => onPath('gcc') || onPath('clang')],
  ['python (real, not the Store stub)', 'Phase 0', 'set app, solve, ESP-IDF tools', () => onPath('python') || onPath('python3') || glob1(join(home, '.espressif', 'python_env'), /^idf/)],
  ['Java (JDK 17+)', 'Phase 2', 'Android build', () => onPath('java', ['-version']) || firstExisting(['C:/Program Files/Android/Android Studio/jbr', '/Applications/Android Studio.app/Contents/jbr'])],
  ['Android SDK', 'Phase 2', 'Android build', () => firstExisting([env.ANDROID_HOME, env.ANDROID_SDK_ROOT, join(env.LOCALAPPDATA || '', 'Android', 'Sdk'), join(home, 'Android', 'Sdk')])],
  ['adb', 'Phase 2', 'install and test on the phone', () => onPath('adb', ['version'])],
  ['ffmpeg', 'Phase 2', 'frame extraction for sync and verification', () => onPath('ffmpeg', ['-version']) || glob1(join(env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages'), /^Gyan\.FFmpeg/)],
  ['Blender', 'Phase 2', 'film tests, CG placement', () => onPath('blender') || glob1('C:/Program Files/Blender Foundation', /^Blender/)],
];

console.log('tool'.padEnd(36) + 'needed'.padEnd(10) + 'status');
let missing = 0;
for (const [name, phase, why, find] of TOOLS) {
  let found = null;
  try { found = find(); } catch { found = null; }
  if (!found) missing++;
  console.log(name.padEnd(36) + phase.padEnd(10) + (found ? `ok   ${found}` : `MISSING (${why})`));
}
console.log(missing ? `${missing} tool(s) not found. Nothing was installed. See docs/ai/HUMAN_QUEUE.md before installing anything.` : 'All listed tools were found.');
