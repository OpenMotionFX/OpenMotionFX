// The checks behind tools/check.mjs. Each check takes a ctx (see repo.mjs makeCtx) and returns a
// list of problem strings; an empty list means PASS. A string starting with "WARN " does not fail.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { spawnSync } from 'node:child_process';
import { lineCount, wordCount, splitFrontmatter, proseLines, fencesBalanced, headings, slug, parseYaml } from './repo.mjs';
import { loadDeferredTerms, scanText, isBinaryPath, DEFERRED_TERMS_FILE } from './scan.mjs';

const md = (ctx) => ctx.files.filter((f) => f.endsWith('.md'));
const SOURCES = 'docs/source/MANIFEST.json';

// --- markdown: structure and links -------------------------------------------------------------
function markdown(ctx) {
  const out = [];
  for (const f of md(ctx)) {
    const text = ctx.text(f);
    if (!fencesBalanced(text)) out.push(`${f}: a code fence is opened but not closed`);
    const body = splitFrontmatter(text).body;
    const hs = headings(body);
    const needsH1 = !f.startsWith('.github/');
    if (needsH1) {
      const first = proseLines(body).find((l) => l.trim() !== '');
      if (!first || !/^# /.test(first)) out.push(`${f}: first line must be a "# " title`);
      if (hs.filter((h) => h.level === 1).length !== 1) out.push(`${f}: must have exactly one "# " title`);
    }
    proseLines(text).forEach((line, i) => {
      const clean = line.replace(/`[^`]*`/g, '');
      for (const m of clean.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
        const target = m[1];
        if (/^(https?:|mailto:)/i.test(target)) continue;
        const [pathPart, anchor] = target.split('#');
        const rel = pathPart ? posix.normalize(posix.join(posix.dirname(f), decodeURIComponent(pathPart))) : f;
        if (!ctx.files.includes(rel) && !ctx.files.some((x) => x.startsWith(rel.replace(/\/$/, '') + '/'))) {
          out.push(`${f}:${i + 1} link target not found: ${target}`); continue;
        }
        if (anchor && rel.endsWith('.md') && ctx.files.includes(rel)) {
          const slugs = headings(ctx.text(rel)).map((h) => slug(h.text));
          if (!slugs.includes(anchor.toLowerCase())) out.push(`${f}:${i + 1} heading anchor not found: ${target}`);
        }
      }
    });
  }
  return out;
}

// --- sizes: the limits that keep sessions cheap --------------------------------------------------
const LINE_LIMITS = [
  [/^CLAUDE\.md$/, 120], [/^\.claude\/rules\/.+\.md$/, 80], [/^\.claude\/skills\/.+\/SKILL\.md$/, 100],
  [/^docs\/ai\/STATE\.md$/, 60], [/^docs\/ai\/TESTING\.md$/, 80], [/^docs\/spec\/.+\.md$/, 60],
  [/^(apps|firmware|libs|schemas|solve|pipeline|tests|tools)\/(.+\/)?README\.md$/, 20],
];
function sizes(ctx) {
  const out = [];
  for (const f of ctx.files) {
    for (const [re, max] of LINE_LIMITS) {
      if (re.test(f)) { const n = lineCount(ctx.text(f)); if (n > max) out.push(`${f}: ${n} lines, limit ${max}`); }
    }
    if (/^docs\/research\/.+\.md$/.test(f)) { const w = wordCount(ctx.text(f)); if (w > 400) out.push(`${f}: ${w} words, limit 400`); }
  }
  return out;
}

// --- citations: every digest statement names where it comes from --------------------------------
// Forms: (stack § Heading) (solo § Heading) (review § Heading) (research NN) (D-NNNN)
function citations(ctx) {
  const out = [];
  if (!ctx.has(SOURCES)) return [`${SOURCES} is missing`];
  const manifest = JSON.parse(ctx.text(SOURCES));
  const heads = Object.fromEntries(manifest.files.map((s) => [s.key, headings(ctx.text(s.path)).map((h) => h.text)]));
  const decisions = ctx.has('docs/ai/DECISIONS.md') ? ctx.text('docs/ai/DECISIONS.md') : '';
  const digests = ctx.files.filter((f) => /^docs\/spec\/.+\.md$/.test(f));
  if (digests.length === 0) out.push('docs/spec/ has no digests');
  for (const f of digests) {
    proseLines(ctx.text(f)).forEach((line, i) => {
      const isStatement = /^\s*[-*]\s+\S/.test(line) || (/^\|/.test(line) && !/^\|[\s:|-]+\|?$/.test(line));
      let cited = 0;
      for (const m of line.matchAll(/\((stack|solo|review) § ([^)]+)\)/g)) {
        cited++;
        if (!heads[m[1]]) { out.push(`${f}:${i + 1} unknown source "${m[1]}"`); continue; }
        if (!heads[m[1]].some((h) => h.startsWith(m[2].trim()))) out.push(`${f}:${i + 1} no heading starting "${m[2].trim()}" in source "${m[1]}"`);
      }
      for (const m of line.matchAll(/\(research (\d\d)\)/g)) {
        cited++;
        if (!ctx.files.some((x) => x.startsWith(`docs/research/${m[1]}-`))) out.push(`${f}:${i + 1} research file ${m[1]} not found`);
      }
      for (const m of line.matchAll(/\((D-\d{4})\)/g)) {
        cited++;
        if (!decisions.includes(`## ${m[1]} `)) out.push(`${f}:${i + 1} decision ${m[1]} not found`);
      }
      const headerRow = /^\|/.test(line) && /^\|[\s:|-]+\|?$/.test((proseLines(ctx.text(f))[i + 1] || ''));
      if (isStatement && !headerRow && cited === 0) out.push(`${f}:${i + 1} statement has no citation`);
    });
  }
  return out;
}

// --- source-hashes: frozen plan documents are unchanged ----------------------------------------
function sourceHashes(ctx) {
  const out = [];
  if (!ctx.has(SOURCES)) return [`${SOURCES} is missing`];
  const manifest = JSON.parse(ctx.text(SOURCES));
  const listed = new Set(manifest.files.map((s) => s.path));
  for (const s of manifest.files) {
    if (!ctx.has(s.path)) { out.push(`${s.path}: listed in manifest but missing`); continue; }
    const sum = createHash('sha256').update(readFileSync(join(ctx.root, s.path))).digest('hex');
    if (sum !== s.sha256) out.push(`${s.path}: sha256 differs from manifest (frozen file was changed)`);
    if (headings(ctx.text(s.path))[0]?.text !== s.first_heading) out.push(`${s.path}: first heading differs from manifest`);
  }
  for (const f of ctx.files.filter((x) => /^docs\/source\/.+\.md$/.test(x) && x !== 'docs/source/README.md')) {
    if (!listed.has(f)) out.push(`${f}: not listed in manifest`);
  }
  return out;
}

// --- claims: VERIFIED needs measured evidence ---------------------------------------------------
function claims(ctx) {
  const f = 'docs/ai/CLAIMS.md';
  if (!ctx.has(f)) return [`${f} is missing`];
  const out = []; const seen = new Set(); let rows = 0;
  ctx.lines(f).forEach((line, i) => {
    const m = line.match(/^\|\s*(C-\d{3})\s*\|/);
    if (!m) return;
    rows++;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    const [id, , , status, test, evidence] = cells;
    if (cells.length !== 6) out.push(`${f}:${i + 1} ${id} needs 6 columns, has ${cells.length}`);
    if (seen.has(id)) out.push(`${f}:${i + 1} duplicate id ${id}`); seen.add(id);
    if (!['UNVERIFIED', 'VERIFIED'].includes(status)) out.push(`${f}:${i + 1} ${id} status must be UNVERIFIED or VERIFIED`);
    if (status === 'VERIFIED') {
      if (!test || test === '-') out.push(`${f}:${i + 1} ${id} is VERIFIED without a test id`);
      const ev = (evidence || '').replace(/`/g, '');
      if (!ev || ev === '-' || !ctx.files.includes(ev)) out.push(`${f}:${i + 1} ${id} is VERIFIED but evidence file "${ev}" does not exist`);
    }
  });
  if (rows === 0) out.push(`${f}: no claim rows found`);
  return out;
}

// --- parse: JSON, YAML and frontmatter are well formed ------------------------------------------
async function parse(ctx) {
  const out = [];
  for (const f of ctx.files) {
    try {
      if (f.endsWith('.json')) JSON.parse(ctx.text(f));
      else if (/\.ya?ml$/.test(f)) await parseYaml(ctx.text(f));
      else if (f.endsWith('.md')) {
        const fm = splitFrontmatter(ctx.text(f));
        const data = fm.raw === null ? null : await parseYaml(fm.raw);
        if (/^\.claude\/rules\/.+\.md$/.test(f) && !(data && data.paths)) out.push(`${f}: rule needs "paths" frontmatter (its scope)`);
        if (/^\.claude\/skills\/.+\/SKILL\.md$/.test(f) && !(data && data.description)) out.push(`${f}: skill needs "description" frontmatter`);
        if (/^\.github\/ISSUE_TEMPLATE\/.+\.md$/.test(f) && !(data && data.name && data.about)) out.push(`${f}: issue template needs "name" and "about"`);
      }
    } catch (e) { out.push(`${f}: does not parse (${String(e.message).split('\n')[0]})`); }
  }
  return out;
}

// --- secrets and deferred topic -----------------------------------------------------------------
function secrets(ctx) {
  return ctx.files.filter((f) => !isBinaryPath(f)).flatMap((f) => scanText(f, ctx.text(f), { secrets: true }));
}
function deferred(ctx) {
  const terms = loadDeferredTerms(ctx.root);
  if (!terms) return [`WARN deferred-topic scan skipped: ${DEFERRED_TERMS_FILE} is not on this machine (expected in CI)`];
  const out = [];
  for (const f of ctx.files) {
    terms.forEach((re, t) => { if (re.test(f)) out.push(`deferred: file name ${f} matches deferred term #${t + 1}`); });
    if (!isBinaryPath(f)) out.push(...scanText(f, ctx.text(f), { secrets: false, deferred: terms }));
  }
  return out;
}

// --- ai-docs: the memory layer keeps its shape --------------------------------------------------
function aiDocs(ctx) {
  const out = [];
  const need = (f, parts) => {
    if (!ctx.has(f)) { out.push(`${f} is missing`); return; }
    const hs = headings(ctx.text(f)).map((h) => h.text);
    for (const p of parts) if (!hs.some((h) => h.startsWith(p))) out.push(`${f}: missing section "${p}"`);
  };
  need('docs/ai/STATE.md', ['Phase', 'In flight', 'Next three actions', 'Blockers']);
  for (const f of ['CLAIMS', 'HUMAN_QUEUE', 'BACKLOG', 'LESSONS', 'HARDWARE', 'TESTING', 'WORKFLOW', 'DECISIONS']) need(`docs/ai/${f}.md`, []);
  if (!ctx.files.some((f) => /^docs\/ai\/LOG\/\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))) out.push('docs/ai/LOG/ needs at least one session file named YYYY-MM-DD-topic.md');
  if (ctx.has('docs/ai/DECISIONS.md')) {
    const text = ctx.text('docs/ai/DECISIONS.md');
    const recs = text.split(/^## (?=D-\d{4} )/m).slice(1);
    if (recs.length === 0) out.push('docs/ai/DECISIONS.md: no decision records');
    recs.forEach((r, i) => {
      const id = r.slice(0, 6);
      if (id !== `D-${String(i + 1).padStart(4, '0')}`) out.push(`docs/ai/DECISIONS.md: ${id} is out of order (records are append-only and numbered in sequence)`);
      for (const field of ['Status:', 'Context:', 'Decision:', 'Consequences:', 'Spec:']) if (!r.includes(`**${field}**`)) out.push(`docs/ai/DECISIONS.md: ${id} lacks **${field}**`);
      const st = r.match(/\*\*Status:\*\*\s*(\w+)/);
      if (st && !['accepted', 'proposed', 'superseded', 'rejected'].includes(st[1])) out.push(`docs/ai/DECISIONS.md: ${id} status "${st[1]}" is not accepted, proposed, superseded or rejected`);
    });
  }
  if (ctx.has('docs/ai/HUMAN_QUEUE.md')) {
    const items = ctx.text('docs/ai/HUMAN_QUEUE.md').split(/^## (?=H-\d{3} )/m).slice(1);
    items.forEach((r) => { for (const field of ['Steps:', 'Expected:']) if (!r.includes(`**${field}**`)) out.push(`docs/ai/HUMAN_QUEUE.md: ${r.slice(0, 5)} lacks **${field}**`); });
  }
  if (ctx.has('docs/INDEX.md')) {
    const index = ctx.text('docs/INDEX.md');
    for (const f of ctx.files.filter((x) => /^docs\/(spec|ai|research)\/[^/]+\.md$/.test(x))) {
      if (!index.includes(f.replace(/^docs\//, ''))) out.push(`docs/INDEX.md: does not point at ${f}`);
    }
  } else out.push('docs/INDEX.md is missing');
  return out;
}

// --- skeleton: component READMEs, hook wiring, nothing private tracked ---------------------------
const FORBIDDEN_TRACKED = /^(private|reference|\.logs|\.claude\/local|node_modules)\//;
function skeleton(ctx) {
  const out = [];
  const readmes = ctx.files.filter((f) => /^(apps|firmware|libs|schemas|solve|pipeline)\/(.+\/)?README\.md$/.test(f));
  if (readmes.length === 0) out.push('no component READMEs found');
  for (const f of readmes) for (const field of ['Purpose:', 'Spec:', 'Phase:', 'Interfaces:', 'Verification:']) {
    if (!ctx.text(f).includes(`**${field}**`)) out.push(`${f}: lacks **${field}**`);
  }
  const settings = '.claude/settings.json';
  if (ctx.has(settings)) {
    for (const m of ctx.text(settings).matchAll(/\$\{CLAUDE_PROJECT_DIR\}\/([^"\s]+)/g)) if (!ctx.has(m[1])) out.push(`${settings}: hook script ${m[1]} does not exist`);
  } else out.push(`${settings} is missing`);
  if (ctx.has('.git')) {
    const r = spawnSync('git', ['ls-files'], { cwd: ctx.root, encoding: 'utf8' });
    for (const f of (r.stdout || '').split('\n')) if (FORBIDDEN_TRACKED.test(f)) out.push(`tracked file in a local-only folder: ${f}`);
  }
  return out;
}

// --- full mode only -----------------------------------------------------------------------------
function hooks(ctx) {
  const r = spawnSync(process.execPath, [join(ctx.root, '.claude/hooks/selftest.mjs')], { cwd: ctx.root, encoding: 'utf8' });
  if (r.status === 0) return [];
  return (r.stdout + r.stderr).split(/\r?\n/).filter((l) => l.trim()).map((l) => `hooks: ${l}`);
}

function history(ctx) {
  if (!ctx.has('.git')) return ['WARN history scan skipped: not a git repository'];
  const git = (args) => spawnSync('git', args, { cwd: ctx.root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (git(['rev-parse', '--verify', 'HEAD']).status !== 0) return ['WARN history scan skipped: no commits yet'];
  const out = [];
  const terms = loadDeferredTerms(ctx.root);
  const log = git(['log', '--all', '--format=%H%x00%B%x01']).stdout || '';
  for (const entry of log.split('\x01')) {
    const [hash, msg] = entry.trim().split('\x00');
    if (hash) out.push(...scanText(`commit ${hash.slice(0, 8)} message`, msg || '', { deferred: terms }));
  }
  const names = new Set((git(['log', '--all', '--name-only', '--format=']).stdout || '').split('\n').filter(Boolean));
  for (const f of names) {
    if (FORBIDDEN_TRACKED.test(f)) out.push(`history: ${f} from a local-only folder was committed`);
    if (terms) terms.forEach((re, t) => { if (re.test(f)) out.push(`deferred: historic file name matches deferred term #${t + 1}`); });
  }
  // Every blob ever committed, so a removed line cannot hide in history.
  const objs = (git(['rev-list', '--all', '--objects']).stdout || '').split('\n').filter((l) => l.includes(' '));
  for (const line of objs) {
    const [sha, ...rest] = line.split(' '); const path = rest.join(' ');
    if (!path || isBinaryPath(path)) continue;
    if (git(['cat-file', '-t', sha]).stdout.trim() !== 'blob') continue;
    out.push(...scanText(`history ${path}@${sha.slice(0, 8)}`, git(['cat-file', '-p', sha]).stdout || '', { deferred: terms }));
  }
  return [...new Set(out)];
}

export const CHECKS = [
  { id: 'markdown', what: 'titles, code fences, links', run: markdown, fast: true },
  { id: 'sizes', what: 'line and word limits', run: sizes, fast: true },
  { id: 'citations', what: 'digests cite real headings', run: citations, fast: true },
  { id: 'source-hashes', what: 'frozen sources match manifest', run: sourceHashes, fast: true },
  { id: 'claims', what: 'VERIFIED claims have evidence', run: claims, fast: true },
  { id: 'parse', what: 'JSON, YAML, frontmatter', run: parse, fast: true },
  { id: 'secrets', what: 'no credentials in files', run: secrets, fast: true },
  { id: 'deferred', what: 'deferred-topic scan', run: deferred, fast: true },
  { id: 'ai-docs', what: 'memory layer shape', run: aiDocs, fast: true },
  { id: 'skeleton', what: 'component READMEs, hook wiring', run: skeleton, fast: true },
  { id: 'hooks', what: 'guard hook self-tests', run: hooks, fast: false },
  { id: 'history', what: 'git history scan', run: history, fast: false },
];
