import { describe, it, expect } from 'vitest';
import { buildMonthSummary, monthDates, dayGreeting } from '../archive';
import type { AppState } from '../../types';
import { defaultPetState, defaultCompanionState } from '../../types';

const base = (over: Partial<AppState> = {}): AppState => ({
  schemaVersion: 4,
  tasks: [],
  log: [],
  streak: { current: 0, best: 0, lastCompletedDate: null },
  settings: { defaultPagesPerSession: 10, lastPageRead: 0, lastBookName: '', customPresets: [] },
  achievements: [],
  history: {},
  moods: {},
  pomodoroSessions: 0,
  onboarded: true,
  peace: { cards: 2, protectedDates: [], lastRewardedDate: null },
  pet: { ...defaultPetState },
  skyName: '我的天空',
  skyNamed: false,
  atlas: {},
  companion: { ...defaultCompanionState },
  projects: [],
  actionReceipts: [],
  resume: null,
  ...over,
});

describe('monthDates', () => {
  it('只取指定月份且升序', () => {
    const log = ['2026-09-03', '2026-08-30', '2026-09-01', '2026-10-01'];
    expect(monthDates(log, '2026-09')).toEqual(['2026-09-01', '2026-09-03']);
  });
  it('空 log → 空数组', () => {
    expect(monthDates([], '2026-09')).toEqual([]);
  });
});

describe('buildMonthSummary', () => {
  it('空月份 → totalDays 0 + 温柔的句子', () => {
    const s = buildMonthSummary(base(), '2026-09');
    expect(s.totalDays).toBe(0);
    expect(s.sentence).toContain('等你来养');
    expect(s.moodCounts).toEqual([]);
  });

  it('统计心情 / 云朵种类 / 天象', () => {
    const s = buildMonthSummary(
      base({
        log: ['2026-09-01', '2026-09-02', '2026-09-03'],
        moods: { '2026-09-01': 'hopeful', '2026-09-02': 'hopeful', '2026-09-03': 'down' },
        history: {
          '2026-09-01': [{ id: '1', title: '读书', type: 'reading', createdAt: '2026-09-01', completedAt: '2026-09-01' }],
          '2026-09-02': [{ id: '2', title: '跑步', type: 'exercise', createdAt: '2026-09-02', completedAt: '2026-09-02' }],
          '2026-09-03': [{ id: '3', title: '写字', type: 'reading', createdAt: '2026-09-03', completedAt: '2026-09-03' }],
        },
        atlas: { '2026-09-02': ['meteor'], '2026-09-03': ['starry-sky'] },
      }),
      '2026-09',
    );
    expect(s.totalDays).toBe(3);
    expect(s.moodCounts[0]).toEqual({ label: '期待', count: 2 });
    expect(s.cloudTypeCounts[0]).toEqual({ label: '阅读云', count: 2 });
    expect(s.phenomenonCounts.map((p) => p.id)).toContain('meteor');
    // 明亮占 2/3 且有流星 → 句子走"天象"分支(同样是正向表达)
    expect(s.sentence).toContain('流星');
    expect(s.sentence).not.toMatch(/完成率|缺卡/);
  });

  it('遇见过稀有天象时句子提天象(明亮比例 < 0.7)', () => {
    const s = buildMonthSummary(
      base({
        log: ['2026-09-01', '2026-09-02'],
        moods: { '2026-09-01': 'down', '2026-09-02': 'gloomy' },
        atlas: { '2026-09-01': ['galaxy'] },
      }),
      '2026-09',
    );
    expect(s.sentence).toContain('银河');
  });

  it('句子不含 KPI 式词汇(完成率/缺卡/落后)', () => {
    const s = buildMonthSummary(
      base({ log: ['2026-09-01'], moods: { '2026-09-01': 'okay' } }),
      '2026-09',
    );
    expect(s.sentence).not.toMatch(/完成率|缺卡|落后|没做到/);
  });
});

describe('dayGreeting', () => {
  it('各时段都有问候(不催促)', () => {
    const g1 = dayGreeting(new Date('2026-09-10T02:00:00'));
    const g2 = dayGreeting(new Date('2026-09-10T12:00:00'));
    const g3 = dayGreeting(new Date('2026-09-10T18:00:00'));
    expect(g1).toContain('夜晚');
    expect(g2).toContain('白天');
    expect(g3).toContain('黄昏');
    for (const g of [g1, g2, g3]) {
      expect(g).not.toMatch(/还没|要|必须/);
    }
  });
});
