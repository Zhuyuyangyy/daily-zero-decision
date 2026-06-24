import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseTaskFromInput, importState, getToday, isYesterday, calculateStreak, generateId } from '../storage';

describe('parseTaskFromInput', () => {
  it('读 2 页书 → reading, 5 分钟, 2 页', () => {
    const r = parseTaskFromInput('读 2 页书');
    expect(r.type).toBe('reading');
    expect(r.pagesPerSession).toBe(2);
    expect(r.time).toBe('5 分钟');
  });

  it('出门走走 5 分钟 → exercise, 5 分钟', () => {
    const r = parseTaskFromInput('出门走走 5 分钟');
    expect(r.type).toBe('exercise');
    expect(r.time).toBe('5 分钟');
  });

  it('看 5 分钟代码 → coding, 5 分钟', () => {
    const r = parseTaskFromInput('看 5 分钟代码');
    expect(r.type).toBe('coding');
    expect(r.time).toBe('5 分钟');
  });

  it('背 5 个新词 → reading, 单词本, 5 分钟 (背单词特例)', () => {
    const r = parseTaskFromInput('背 5 个新词');
    expect(r.type).toBe('reading');
    expect(r.bookName).toBe('单词本');
    expect(r.time).toBe('5 分钟');
  });

  it('写一行日记 → other, 3 分钟', () => {
    const r = parseTaskFromInput('写一行日记');
    expect(r.type).toBe('other');
    expect(r.time).toBe('3 分钟');
  });

  it('深呼吸三次 → other, 1 分钟 (深呼吸特例)', () => {
    const r = parseTaskFromInput('深呼吸三次');
    expect(r.type).toBe('other');
    expect(r.time).toBe('1 分钟');
  });
});

describe('importState', () => {
  it('坏 JSON 返回 null', () => {
    expect(importState('not json')).toBeNull();
  });

  it('空对象返回 null（缺 log 字段）', () => {
    expect(importState('{}')).toBeNull();
  });

  it('缺字段 fallback: 仅 log + streak', () => {
    const r = importState('{"log":["2026-06-13"],"streak":{"current":1,"best":1,"lastCompletedDate":"2026-06-13"}}');
    expect(r).not.toBeNull();
    expect(r!.log).toEqual(['2026-06-13']);
    expect(r!.streak.current).toBe(1);
  });

  it('onboarded 缺失 → 走 defaultState.onboarded = false', () => {
    const r = importState('{"log":["2026-06-13"],"streak":{"current":1,"best":1,"lastCompletedDate":"2026-06-13"}}');
    expect(r!.onboarded).toBe(false);
  });

  it('H8 backfill: 历史 type=other 但 title 含"读" → 升级为 reading', () => {
    const json = JSON.stringify({
      log: ['2026-06-10'],
      streak: { current: 1, best: 1, lastCompletedDate: '2026-06-10' },
      history: {
        '2026-06-10': [{ id: '1', title: '读 2 页书', type: 'other', createdAt: '2026-06-10', completedAt: '2026-06-10' }]
      }
    });
    const r = importState(json);
    expect(r!.history['2026-06-10'][0].type).toBe('reading');
  });
});

describe('getToday / isYesterday timezone safety', () => {
  beforeEach(() => {
    // 关键时区场景：UTC+8（Asia/Shanghai）早晨 7 点
    // 此时 UTC 仍是前一天 — 旧实现会返回错误日期
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getToday 在 UTC+8 早晨返回本地日期（不是 UTC）', () => {
    // 北京时间 2026-06-23 07:00 = UTC 2026-06-22 23:00
    vi.useFakeTimers().setSystemTime(new Date('2026-06-22T23:00:00Z'));
    vi.stubGlobal('Intl', {
      ...Intl,
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'Asia/Shanghai' }),
        formatToParts: () => [
          { type: 'year', value: '2026' },
          { type: 'month', value: '06' },
          { type: 'day', value: '23' },
        ],
      }),
    });
    expect(getToday()).toBe('2026-06-23');
  });

  it('isYesterday 在 UTC+8 边界返回正确日期', () => {
    // 北京时间 2026-06-23 01:00 = UTC 2026-06-22 17:00
    vi.useFakeTimers().setSystemTime(new Date('2026-06-22T17:00:00Z'));
    vi.stubGlobal('Intl', {
      ...Intl,
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'Asia/Shanghai' }),
        formatToParts: () => [
          { type: 'year', value: '2026' },
          { type: 'month', value: '06' },
          { type: 'day', value: '23' },
        ],
      }),
    });
    expect(isYesterday('2026-06-22')).toBe(true);
    expect(isYesterday('2026-06-21')).toBe(false);
  });
});

describe('calculateStreak DST safety', () => {
  it('spring-forward DST 跨日的连续日历日应识别为连续（best 维度）', () => {
    // 三天连续（2026-03-08/09/10），不是 today/yesterday 范围 → current=0
    // 但 best 应识别为 3
    const result = calculateStreak(['2026-03-08', '2026-03-09', '2026-03-10']);
    expect(result.best).toBe(3);
    expect(result.current).toBe(0);
  });

  it('真正连续的日子（中间日）应识别为连续', () => {
    const result = calculateStreak(['2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23']);
    expect(result.current).toBe(4);
  });

  it('跨 DST 边界但仍是连续日历日', () => {
    // 2024-03-09/10/11 连续，但都不在 today 附近 → current=0, best=3
    const result = calculateStreak(['2024-03-09', '2024-03-10', '2024-03-11']);
    expect(result.best).toBe(3);
  });

  it('真正连续且包含 today → current 应等于连续长度', () => {
    // 模拟"今天 = 2026-06-23"
    const today = '2026-06-23';
    vi.useFakeTimers().setSystemTime(new Date(`${today}T12:00:00`));
    const result = calculateStreak(['2026-06-20', '2026-06-21', '2026-06-22', today]);
    expect(result.current).toBe(4);
    expect(result.best).toBe(4);
  });
});

describe('generateId', () => {
  it('快速连续生成 1000 个 ID 无重复', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) ids.add(generateId());
    expect(ids.size).toBe(1000);
  });

  it('生成的 ID 是非空字符串', () => {
    expect(generateId()).toMatch(/^[a-zA-Z0-9-]+$/);
    expect(generateId().length).toBeGreaterThan(0);
  });
});
