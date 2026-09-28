import { describe, it, expect } from 'vitest';
import { companionView, companionDays, stageFromDays, nextStage, stageProgress, STAGES } from '../companion';
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
  ...over,
});

describe('阶段成长', () => {
  it('0 天 seed;3 天 small;7 天 fluffy;30 天 glow;90 天 crowned', () => {
    expect(stageFromDays(0).id).toBe('seed');
    expect(stageFromDays(2).id).toBe('seed');
    expect(stageFromDays(3).id).toBe('small');
    expect(stageFromDays(6).id).toBe('small');
    expect(stageFromDays(7).id).toBe('fluffy');
    expect(stageFromDays(29).id).toBe('fluffy');
    expect(stageFromDays(30).id).toBe('glow');
    expect(stageFromDays(89).id).toBe('glow');
    expect(stageFromDays(90).id).toBe('crowned');
  });

  it('nextStage 满级返回 null', () => {
    expect(nextStage(90)).toBeNull();
    expect(nextStage(0)?.id).toBe('small');
  });

  it('stageProgress 满级 = 1;进度在 0-1', () => {
    expect(stageProgress(90)).toBe(1);
    const p = stageProgress(1);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
    expect(stageProgress(3)).toBe(0); // 刚到 small 起点
  });

  it('STAGES 门槛递增且 id 唯一', () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].minDays).toBeGreaterThan(STAGES[i - 1].minDays);
    }
    expect(new Set(STAGES.map((s) => s.id)).size).toBe(STAGES.length);
  });
});

describe('companionView — 情感表现(反 PUA)', () => {
  it('夜晚 → 睡着', () => {
    const v = companionView(base({ log: ['2026-09-09'] }), new Date('2026-09-10T23:00:00'));
    expect(v.mood).toBe('sleep');
  });

  it('低落 → 靠近(close)', () => {
    const v = companionView(
      base({ log: ['2026-09-10'], moods: { '2026-09-10': 'gloomy' } }),
      new Date('2026-09-10T14:00:00'),
    );
    expect(v.mood).toBe('close');
  });

  it('期待 → 飘得快(happy)', () => {
    const v = companionView(
      base({ log: ['2026-09-10'], moods: { '2026-09-10': 'hopeful' } }),
      new Date('2026-09-10T14:00:00'),
    );
    expect(v.mood).toBe('happy');
  });

  it('久未打开 → 睡着(绝不枯萎/死亡)', () => {
    // 4 天前有记录 → 4 天没开 → 睡;累计 4 天 → small 阶段不回退
    const v = companionView(
      base({ log: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-06'] }),
      new Date('2026-09-10T14:00:00'),
    );
    expect(v.mood).toBe('sleep');
    expect(v.stage).toBe('small');
  });

  it('陪伴天数 = log 长度(只增不减)', () => {
    expect(companionDays(base({ log: ['2026-09-01', '2026-09-02'] }))).toBe(2);
  });

  it('daysToNext 满级为 0', () => {
    const v = companionView(base({ log: Array.from({ length: 91 }, (_, i) => `2026-01-${String(i % 28 + 1).padStart(2, '0')}`) }));
    expect(v.daysToNext).toBe(0);
  });

  it('名字透传(未命名为 null)', () => {
    const v = companionView(base({ companion: { name: '团团', metAt: '2026-09-10', nicknamed: true } }));
    expect(v.name).toBe('团团');
    const v2 = companionView(base());
    expect(v2.name).toBeNull();
  });
});
