import { describe, it, expect, beforeEach } from 'vitest';
import { parseTaskFromInput, importState, loadState, saveState, getToday, exportState, defaultState } from '../storage';
import { CURRENT_SCHEMA_VERSION } from '../../types';

const STORAGE_KEY = 'daily-zero-decision';

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

  it('返回的是解析后的 AppState（不是 loadState）', () => {
    const json = JSON.stringify({
      log: ['2026-06-13'],
      streak: { current: 2, best: 5, lastCompletedDate: '2026-06-13' },
      tasks: [{ id: 't1', title: '读 2 页书', type: 'reading', createdAt: '2026-06-13' }],
    });
    const r = importState(json);
    expect(r).not.toBeNull();
    expect(r!.streak.current).toBe(2);
    expect(r!.streak.best).toBe(5);
    expect(r!.tasks[0].id).toBe('t1');
  });
});

describe('getToday local timezone', () => {
  it('test_getToday_local_timezone', () => {
    const today = getToday();
    const expected = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
    expect(today).toBe(expected);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('schema + export/import roundtrip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('test_export_import_roundtrip: save → import → data 一致', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      log: ['2026-06-13', '2026-06-14'],
      streak: { current: 2, best: 5, lastCompletedDate: '2026-06-14' },
      tasks: [{ id: 't1', title: '出门走走', type: 'exercise', createdAt: '2026-06-13' }],
      pomodoroSessions: 3,
      onboarded: true,
    });
    const r = importState(json);
    expect(r).not.toBeNull();
    expect(r!.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(r!.log).toEqual(['2026-06-13', '2026-06-14']);
    expect(r!.streak.best).toBe(5);
    expect(r!.pomodoroSessions).toBe(3);
    expect(r!.onboarded).toBe(true);
    expect(r!.tasks[0].title).toBe('出门走走');
  });

  it('test_importState_returns_imported_data: 不是 loadState（空存储）的结果', () => {
    localStorage.clear();
    const json = JSON.stringify({
      log: ['2026-06-13'],
      streak: { current: 99, best: 99, lastCompletedDate: '2026-06-13' },
      pomodoroSessions: 42,
    });
    const r = importState(json);
    const ls = loadState();
    // importState 必须反映导入数据，而不是从 localStorage 读到的默认空状态
    expect(r!.streak.current).toBe(99);
    expect(r!.pomodoroSessions).toBe(42);
    expect(ls.streak.current).toBe(0);
    expect(ls.pomodoroSessions).toBe(0);
  });

  it('test_corrupted_storage_recovers: 损坏 JSON + 坏 import 都不会抛异常', () => {
    localStorage.setItem(STORAGE_KEY, '<<<not-json>>>');
    let recovered: any = null;
    try {
      recovered = loadState();
    } catch {
      // must not throw
    }
    expect(recovered).not.toBeNull();
    expect(recovered.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(recovered.streak.current).toBe(0);

    const bad = importState('not json');
    expect(bad).toBeNull();
  });
});
