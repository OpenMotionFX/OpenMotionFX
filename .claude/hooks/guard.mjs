#!/usr/bin/env node
// PreToolUse guard. Scope: shell commands (Bash, PowerShell) and file edits (Edit, Write, NotebookEdit)
// made by Claude in this project. Reason: CLAUDE.md is advice; this file is enforced.
// Input and output follow https://code.claude.com/docs/en/hooks (PreToolUse, permissionDecision).
// It fails closed: an internal error denies the call, because a broken guard must not look like "allowed".
import { existsSync, unlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ALLOWED_REMOTE = /^(https:\/\/([^@/]+@)?github\.com\/|git@github\.com:)OpenMotionFX\/OpenMotionFX(\.git)?\/?$/i;
const PROTECTED = ['docs/source', '.claude/settings.json', '.claude/hooks', '.claude/local'];
const LOCAL_ONLY = ['private', '.logs', '.claude/local', 'reference'];
const ARMED_FILE = '.claude/local/ARMED';
const FORCE_ONCE_FILE = '.claude/local/allow-force-push-once';
const DISARM_HINT = 'The owner can disarm with: node tools/arm.mjs off';

const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();

/** Splits a command line into segments at ; && || | and newlines, outside quotes. */
function segments(cmd) {
  const out = []; let cur = ''; let q = null;
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (q) { if (ch === q) q = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === ';' || ch === '\n' || ch === '|' || (ch === '&' && cmd[i + 1] === '&')) {
      out.push(cur); cur = '';
      if ((ch === '|' || ch === '&') && cmd[i + 1] === ch) i++;
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function tokens(seg) {
  const out = []; let cur = ''; let q = null; let quoted = false;
  for (const ch of seg) {
    if (q) { if (ch === q) q = null; else cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; quoted = true; continue; }
    if (/\s/.test(ch)) { if (cur || quoted) out.push(cur); cur = ''; quoted = false; continue; }
    cur += ch;
  }
  if (cur || quoted) out.push(cur);
  return out;
}

function isTempPath(p) {
  const n = norm(p);
  if (!n || n.includes('..')) return false;
  const t = norm(tmpdir());
  return n.startsWith(t + '/') || n.includes('/appdata/local/temp/') || n.startsWith('/tmp/')
    || /^(\$env:te?mp|\$temp|\$tmpdir|\$\{tmpdir\}|%temp%)\//.test(n);
}

const DELETE_WORDS = new Set(['rm', 'remove-item', 'ri', 'rd', 'rmdir', 'del', 'erase']);
const VALUE_PARAMS = new Set(['-erroraction', '-ea', '-include', '-exclude', '-filter', '-warningaction']);

function recursiveDeleteReason(toks, raw, tool) {
  const why = 'Recursive deletes outside temp folders are blocked. Reason: one wrong path destroys work that cannot be recovered. Delete named files one at a time, or ask the owner.';
  if (/\brmtree\b|\brimraf\b|rmSync\s*\([^)]*recursive|\bfind\b.*\s-delete\b|Directory\]::Delete/i.test(raw)) {
    return isTempPath((raw.match(/["']([^"']+)["']/) || [])[1] || '') ? null : why;
  }
  const idx = toks.findIndex((t) => DELETE_WORDS.has(t.replace(/^[&({]+/, '').toLowerCase()));
  if (idx < 0) return null;
  const args = toks.slice(idx + 1);
  const recursive = args.some((a) => (
    /^--recursive$/.test(a) || /^\/s$/i.test(a) || /^-(rf|fr)$/i.test(a)
    || (tool === 'PowerShell' ? /^-r(e(c(u(r(se?)?)?)?)?)?(:.*)?$/i.test(a) : /^-[a-zA-Z]*[rR][a-zA-Z]*$/.test(a))));
  if (!recursive) return null;
  const paths = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (VALUE_PARAMS.has(a.toLowerCase())) { i++; continue; }
    if (a.startsWith('-') || /^\/[a-z]$/i.test(a)) continue;
    paths.push(a);
  }
  return paths.length > 0 && paths.every(isTempPath) ? null : why;
}

/** Finds git calls in a token list. Returns { sub, args, globals } for each. */
function gitCalls(toks) {
  const calls = [];
  for (let i = 0; i < toks.length; i++) {
    if (!/^git(\.exe)?$/i.test(basename(toks[i].replace(/^[&({]+/, '').replace(/\\/g, '/')))) continue;
    const globals = []; let j = i + 1;
    while (j < toks.length && toks[j].startsWith('-')) {
      globals.push(toks[j]);
      if (toks[j] === '-C' || toks[j] === '-c') { globals.push(toks[j + 1] || ''); j++; }
      j++;
    }
    if (j < toks.length) calls.push({ sub: toks[j].toLowerCase(), args: toks.slice(j + 1), globals });
  }
  return calls;
}

const shortFlag = (a, letter) => new RegExp(`^-[a-zA-Z]*${letter}[a-zA-Z]*$`).test(a);

function remoteUrls(name, cwd) {
  const run = (args) => spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (name) { const r = run(['remote', 'get-url', '--push', name]); return r.status === 0 ? [r.stdout.trim()] : null; }
  const names = (run(['remote']).stdout || '').split('\n').filter(Boolean);
  if (names.length === 0) return null;
  return names.map((n) => (run(['remote', 'get-url', '--push', n]).stdout || '').trim());
}

function gitReason(call, raw, ctx) {
  const { sub, args, globals } = call;
  const all = [...globals, ...args];
  if (all.some((a) => /core\.hookspath/i.test(a))) {
    const plain = args.filter((a) => !a.startsWith('--'));
    const readFlags = ['--get', '--local', '--show-origin'];
    const isRead = sub === 'config' && plain.length === 1 && args.filter((a) => a.startsWith('--')).every((a) => readFlags.includes(a));
    const isSetup = sub === 'config' && plain.length === 2 && plain[1] === '.githooks' && !globals.length;
    if (!isRead && !isSetup) return 'Changing core.hooksPath is blocked. Reason: it would switch off the secret and deferred-topic scans in .githooks.';
  }
  if (['commit', 'push', 'merge', 'rebase', 'am', 'cherry-pick', 'revert', 'pull'].includes(sub)) {
    const skipsNext = new Set(['-m', '-F', '-C', '-c', '--message', '--file', '--author', '--date', '-o']);
    for (let i = 0; i < args.length; i++) {
      if (skipsNext.has(args[i])) { i++; continue; }
      if (args[i] === '--no-verify' || (sub === 'commit' && shortFlag(args[i], 'n'))) return 'Skipping git hooks is blocked. Reason: the hooks run the secret scan, the deferred-topic scan and tools/check.';
    }
  }
  if (sub === 'reset' && args.includes('--hard')) return 'git reset --hard is blocked. Reason: it discards uncommitted work. Use git stash, or revert with a new commit.';
  if (sub === 'clean' && args.some((a) => a === '--force' || shortFlag(a, 'f'))) return 'git clean with force is blocked. Reason: it deletes untracked files, including gitignored private notes.';
  if (sub === 'add') {
    if (args.some((a) => a === '--force' || shortFlag(a, 'f'))) return 'git add --force is blocked. Reason: it can stage gitignored local-only files.';
    const hit = args.find((a) => LOCAL_ONLY.some((d) => norm(a) === d || norm(a).startsWith(d + '/') || norm(a).includes('/' + d + '/')));
    if (hit) return `Staging ${hit} is blocked. Reason: private/, .logs/, .claude/local/ and reference/ are local-only.`;
  }
  if (sub === 'push') {
    if (globals.includes('-C') || /\b(cd|chdir|pushd|set-location|sl)\s/i.test(raw)) return 'Pushing after changing folder is blocked. Reason: the guard must know which repository is pushed. Run git push from the project root as its own command.';
    const plain = [];
    for (let i = 0; i < args.length; i++) {
      if (['-o', '--push-option', '--repo', '--receive-pack', '--exec'].includes(args[i])) { i++; continue; }
      if (!args[i].startsWith('-')) plain.push(args[i]);
    }
    const first = plain[0];
    const isUrl = first && (/:\/\//.test(first) || /^[\w.-]+@[\w.-]+:/.test(first) || /^([a-zA-Z]:|[./\\])/.test(first));
    const urls = isUrl ? [first] : remoteUrls(first, ctx.cwd);
    if (!urls || !urls.every((u) => ALLOWED_REMOTE.test(u))) return 'Pushing is allowed only to https://github.com/OpenMotionFX/OpenMotionFX. Reason: no other repository may be changed from this project.';
    const force = args.some((a) => /^--force/.test(a) || a === '--mirror' || shortFlag(a, 'f')) || plain.slice(1).some((a) => a.startsWith('+'));
    if (force) {
      const once = join(ROOT, FORCE_ONCE_FILE);
      if (ctx.dryRun || !existsSync(once)) return 'Force pushes are blocked. Reason: they rewrite published history. A single approved overwrite needs the one-shot file .claude/local/allow-force-push-once, created only with the owner\'s approval.';
      unlinkSync(once); // one shot: the permission is used up by this call
    }
  }
  return null;
}

const WRITE_VERBS = /\b(set-content|add-content|out-file|clear-content|remove-item|move-item|copy-item|rename-item|new-item|ni|ri|mi|rm|mv|cp|del|erase|ren|rd|rmdir|tee|sed|truncate|touch|writefile\w*|appendfile\w*|rmsync|unlink\w*)\b|>|\bgit\s+(checkout|restore|rm|mv|apply|stash)\b/i;

export function checkCommand(command, ctx, depth = 0) {
  const raw = command || '';
  if (/arm\.mjs["']?\s+off\b/i.test(raw)) return 'Only the owner disarms the guardrails. Reason: an assistant must not loosen its own limits. Ask the owner to run: node tools/arm.mjs off';
  if (ctx.armed && PROTECTED.some((p) => norm(raw).includes(p)) && WRITE_VERBS.test(raw)) {
    return `Guardrails are armed: commands that change ${PROTECTED.join(', ')} are blocked. ${DISARM_HINT}`;
  }
  for (const seg of segments(raw)) {
    const toks = tokens(seg);
    const del = recursiveDeleteReason(toks, seg, ctx.tool);
    if (del) return del;
    for (const call of gitCalls(toks)) { const r = gitReason(call, raw, ctx); if (r) return r; }
    const first = (toks[0] || '').replace(/^[&({]+/, '').toLowerCase();
    if (/^gh(\.exe)?$/.test(basename(first))) {
      if (/--visibility[= ]+public|\s--public\b/i.test(seg)) return 'Making a repository public needs the owner\'s approval first.';
      if (/\brepo\s+delete\b/i.test(seg)) return 'Deleting a repository is blocked. Reason: it cannot be undone.';
      if (/opencamera/i.test(seg) && /\b(delete|edit|create|close|merge|rename|archive|transfer|sync)\b|(-X|--method)[= ]*(POST|PUT|PATCH|DELETE)|\s(-f|-F|--field|--raw-field)\s/i.test(seg)) return 'The OpenCamera repository is read-only from this project.';
    }
    // Commands wrapped in another shell: bash -c "...", cmd /c "...", powershell -Command "..."
    if (depth < 2) for (const t of toks) if (/\s/.test(t)) { const r = checkCommand(t, ctx, depth + 1); if (r) return r; }
  }
  return null;
}

export function checkPath(filePath, ctx) {
  if (!ctx.armed || !filePath) return null;
  const rel = norm(relative(ROOT, resolve(ROOT, filePath)));
  if (PROTECTED.some((p) => rel === p || rel.startsWith(p + '/'))) {
    return `Guardrails are armed: ${rel} cannot be edited. Reason: frozen sources and the guard itself must not change by accident. ${DISARM_HINT}`;
  }
  return null;
}

/** Returns a denial reason, or null to let the normal permission flow continue. */
export function decide(input, { dryRun = false, armed = null } = {}) {
  const tool = input.tool_name; const ti = input.tool_input || {};
  const ctx = {
    tool, dryRun,
    armed: armed === null ? existsSync(join(ROOT, ARMED_FILE)) : armed,
    cwd: input.cwd && existsSync(input.cwd) ? input.cwd : ROOT,
  };
  if (tool === 'Bash' || tool === 'PowerShell') return checkCommand(ti.command, ctx);
  if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') return checkPath(ti.file_path || ti.notebook_path, ctx);
  return null;
}

function main() {
  let reason;
  try {
    reason = decide(JSON.parse(readFileSync(0, 'utf8')), { dryRun: process.env.OMFX_GUARD_DRYRUN === '1' });
  } catch (e) {
    reason = `Guard hook error, call denied to be safe: ${e.message}`;
  }
  if (reason) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
  }
  process.exit(0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
