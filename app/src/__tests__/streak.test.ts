/**
 * Core business-logic unit tests: streak calculation, task parsing, and date helpers.
 *
 * These tests are deliberately decoupled from React so they exercise the
 * underlying functions the UI depends on. They live under src/__tests__/ as
 * the project's "core / cross-cutting" suite (utils tests live alongside
 * the modules they cover).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateStreak,
  getToday,
  isToday,
  isYesterday,
  parseTaskFromInput,
  generateId,
} from '../utils/storage';

describe('calculateStreak', () => {
  // Pin "today" so streak math is deterministic regardless of when CI runs.
  beforeEach(() => {
    vi.useFakeTimers();
    // 2026-06-23 (matches the project's reference date)
    vi.setSystemTime(new Date(2026, 5, 23, 10, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeros for an empty log', () => {
    const s = calculateStreak([]);
    expect(s.current).toBe(0);
    expect(s.best).toBe(0);
    expect(s.lastCompletedDate).toBeNull();
  });

  it('counts a single completion today as current=1, best=1', () => {
    const today = getToday();
    const s = calculateStreak([today]);
    expect(s.current).toBe(1);
    expect(s.best).toBe(1);
    expect(s.lastCompletedDate).toBe(today);
  });

  it('counts yesterday-only as current=1 (still in grace)', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const s = calculateStreak([yStr]);
    expect(s.current).toBe(1);
    expect(s.best).toBe(1);
  });

  it('detects a 3-day consecutive streak ending today', () => {
    const today = getToday();
    const d1 = new Date(today);
    const d2 = new Date(today);
    const d3 = new Date(today);
    d1.setDate(d1.getDate() - 1);
    d2.setDate(d2.getDate() - 2);
    d3.setDate(d3.getDate() - 3);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const s = calculateStreak([fmt(d3), fmt(d2), fmt(d1), today]);
    expect(s.current).toBe(4);
    expect(s.best).toBe(4);
  });

  it('reports best across multiple historical streaks', () => {
    const s = calculateStreak([
      '2020-01-01', '2020-01-02', '2020-01-03', // old 3-day streak
      '2020-06-01',                              // single, separated
    ]);
    expect(s.best).toBe(3);
  });

  it('deduplicates repeated dates in the log', () => {
    const today = getToday();
    const s = calculateStreak([today, today, today]);
    expect(s.current).toBe(1);
    expect(s.best).toBe(1);
  });
});

describe('parseTaskFromInput', () => {
  it('parses "读 10 页书" as reading with 10 pages', () => {
    const r = parseTaskFromInput('读 10 页书');
    expect(r.type).toBe('reading');
    expect(r.pagesPerSession).toBe(10);
  });

  it('parses "出门走走" as exercise', () => {
    const r = parseTaskFromInput('出门走走');
    expect(r.type).toBe('exercise');
  });

  it('parses "写 5 行代码" as coding', () => {
    const r = parseTaskFromInput('写 5 行代码');
    expect(r.type).toBe('coding');
  });

  it('falls back to other for unrecognised input', () => {
    const r = parseTaskFromInput('写一行日记');
    expect(r.type).toBe('other');
  });

  it('extracts book title from 《书名》 brackets', () => {
    const r = parseTaskFromInput('读书 5 页《人类简史》');
    expect(r.type).toBe('reading');
    expect(r.bookName).toBe('人类简史');
  });

  it('extracts an explicit "X 分钟" override', () => {
    const r = parseTaskFromInput('出门走走 20 分钟');
    expect(r.time).toBe('20 分钟');
  });
});

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 23, 14, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getToday returns YYYY-MM-DD in local time', () => {
    const t = getToday();
    expect(t).toBe('2026-06-23');
    expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('isToday returns true only for today', () => {
    expect(isToday('2026-06-23')).toBe(true);
    expect(isToday('2026-06-22')).toBe(false);
  });

  it('isYesterday returns true only for yesterday', () => {
    expect(isYesterday('2026-06-22')).toBe(true);
    expect(isYesterday('2026-06-23')).toBe(false);
    expect(isYesterday('2026-06-21')).toBe(false);
  });
});

describe('generateId', () => {
  it('returns non-empty unique-ish strings', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) ids.add(generateId());
    // With 50 IDs from Math.random we should see effectively no collisions,
    // but allow a small tolerance for the rare case.
    expect(ids.size).toBeGreaterThan(45);
  });

  it('returns strings of plausible length (no empty IDs)', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(4);
  });
});