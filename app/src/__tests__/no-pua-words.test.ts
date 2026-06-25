/**
 * Anti-PUA / no-blame copy guard.
 *
 * Scans all in-repo source code for the forbidden "blame / pressure / streak-shame"
 * vocabulary the product has explicitly banned. The product promises a kind tone,
 * so we enforce that at the test layer: any reintroduction of these terms in
 * user-visible copy fails the build.
 *
 * Forbidden words: fail, broke, streak-lost, discipline, keep-going, cannot-stop
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FORBIDDEN = ['fail', 'broke', 'streak-lost', 'discipline', 'keep-going', 'cannot-stop'];

// Directories we scan. We deliberately skip node_modules, dist, build output,
// the test suite itself (so this test's own FORBIDDEN list doesn't self-fail),
// and any vendor / generated code.
const SCAN_ROOTS = ['src'];
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '__tests__',     // this test file lives under __tests__
  'coverage',
]);
const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.ico', '.pdf', '.zip', '.tar', '.gz',
  '.mp4', '.mp3', '.woff', '.woff2', '.ttf',
]);
const SCAN_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.scss', '.html', '.md', '.json', '.yml', '.yaml',
]);

interface Violation {
  file: string;
  line: number;
  word: string;
  text: string;
}

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), out);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (SKIP_EXTENSIONS.has(ext)) continue;
      if (!SCAN_EXTENSIONS.has(ext)) continue;
      out.push(path.join(dir, e.name));
    }
  }
}

function scan(): Violation[] {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    walk(path.join(process.cwd(), root), files);
  }
  const violations: Violation[] = [];
  for (const f of files) {
    let content: string;
    try {
      content = fs.readFileSync(f, 'utf-8');
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      for (const word of FORBIDDEN) {
        // Word-boundary match so "fair" doesn't trigger "fail" and
        // "broken" doesn't trigger "broke".
        const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (re.test(lower)) {
          violations.push({ file: f, line: i + 1, word, text: line.trim() });
        }
      }
    }
  }
  return violations;
}

describe('no-blame / anti-PUA copy guard', () => {
  it('source code contains none of the forbidden PUA words', () => {
    const violations = scan();
    if (violations.length > 0) {
      const summary = violations
        .slice(0, 25)
        .map((v) => `  ${v.file}:${v.line}  [${v.word}]  ${v.text}`)
        .join('\n');
      const suffix = violations.length > 25 ? `\n  ...and ${violations.length - 25} more` : '';
      // Surface a readable failure message.
      expect.fail(
        `Forbidden PUA words found in source:\n${summary}${suffix}\n\n` +
        `Banned: ${FORBIDDEN.join(', ')}`,
      );
    }
    expect(violations).toEqual([]);
  });
});