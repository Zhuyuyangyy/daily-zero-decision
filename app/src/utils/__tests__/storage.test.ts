import { describe, it, expect } from 'vitest';
import { parseTaskFromInput, importState } from '../storage';

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
