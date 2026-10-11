import { describe, it, expect } from 'vitest';
import { dayPhaseFromHour, shouldSpawnMeteor } from '../dayPhase';

describe('dayPhaseFromHour — 日夜时段', () => {
  it('清晨 5-9 点', () => {
    for (const h of [5, 7, 9]) {
      expect(dayPhaseFromHour(h).phase).toBe('dawn');
    }
  });

  it('白天 10-15 点', () => {
    for (const h of [10, 12, 15]) {
      expect(dayPhaseFromHour(h).phase).toBe('day');
    }
  });

  it('黄昏 16-19 点', () => {
    for (const h of [16, 18, 19]) {
      expect(dayPhaseFromHour(h).phase).toBe('dusk');
    }
  });

  it('夜晚 20-4 点', () => {
    for (const h of [20, 23, 0, 3, 4]) {
      expect(dayPhaseFromHour(h).phase).toBe('night');
    }
  });

  it('容忍越界输入(24/负数)', () => {
    expect(dayPhaseFromHour(24).phase).toBe('night'); // 24 → 0 点 → night
    expect(dayPhaseFromHour(-3).phase).toBe('night'); // -3 → 21 点 → night
  });

  it('每个时段都有中文 label', () => {
    for (const h of [6, 12, 18, 23]) {
      expect(dayPhaseFromHour(h).label.length).toBeGreaterThan(0);
    }
  });
});

describe('shouldSpawnMeteor — 夜晚流星调度', () => {
  it('白天/黄昏/清晨永不出现流星', () => {
    for (const h of [8, 12, 18]) {
      for (const roll of [0, 0.1, 0.5, 0.99]) {
        expect(shouldSpawnMeteor(h, roll)).toBe(false);
      }
    }
  });

  it('夜晚 roll=0 必出流星', () => {
    expect(shouldSpawnMeteor(23, 0)).toBe(true);
    expect(shouldSpawnMeteor(2, 0)).toBe(true);
  });

  it('深夜(22-4)概率高于普通夜晚', () => {
    // 普通夜 20 点:roll=0.25 → 0.2 概率线之上 → false
    expect(shouldSpawnMeteor(20, 0.25)).toBe(false);
    // 深夜 23 点:roll=0.25 → 0.34 概率线之下 → true
    expect(shouldSpawnMeteor(23, 0.25)).toBe(true);
  });

  it('非夜晚即使 roll=0 也不出(被 phase 先拦)', () => {
    expect(shouldSpawnMeteor(12, 0)).toBe(false);
  });
});
