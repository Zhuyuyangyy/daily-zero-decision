import { describe, it, expect } from 'vitest';
import {
  detectPhenomena,
  atlasStats,
  newlyDiscovered,
  monthPhenomena,
  PHENOMENA,
  type PhenomenonId,
} from '../atlas';

const ctx = (over: Partial<Parameters<typeof detectPhenomena>[0]> = {}) => ({
  hour: 12,
  loggedToday: false,
  streak: 0,
  roll: 0.5,
  roll2: 0.5,
  ...over,
});

describe('detectPhenomena — 时段场景天象', () => {
  it('清晨 → 云隙光', () => {
    expect(detectPhenomena(ctx({ hour: 7 }))).toContain('cloud-gap-light');
  });
  it('黄昏 → 晚霞', () => {
    expect(detectPhenomena(ctx({ hour: 18 }))).toContain('sunset-glow');
  });
  it('夜晚 → 星空', () => {
    expect(detectPhenomena(ctx({ hour: 22 }))).toContain('starry-sky');
  });
  it('白天无场景天象', () => {
    const ids = detectPhenomena(ctx({ hour: 12 }));
    expect(ids).not.toContain('starry-sky');
    expect(ids).not.toContain('sunset-glow');
  });
});

describe('detectPhenomena — 未打卡门槛', () => {
  it('未打卡只给时段场景,不给惊喜天象', () => {
    const ids = detectPhenomena(ctx({ hour: 23, loggedToday: false, roll: 0.01, roll2: 0.01 }));
    expect(ids).toEqual(['starry-sky']);
    expect(ids).not.toContain('meteor');
    expect(ids).not.toContain('moon-halo');
    expect(ids).not.toContain('rainbow');
  });
});

describe('detectPhenomena — 流星', () => {
  it('深夜 + 打卡 + roll 低 →流星', () => {
    expect(detectPhenomena(ctx({ hour: 23, loggedToday: true, roll: 0.1, roll2: 0.9 }))).toContain('meteor');
  });
  it('深夜 roll 与 roll2 双低 → 双流星(hidden)', () => {
    const ids = detectPhenomena(ctx({ hour: 23, loggedToday: true, roll: 0.05, roll2: 0.05 }));
    expect(ids).toContain('double-meteor');
    expect(ids).not.toContain('meteor');
  });
  it('白天永远不出流星', () => {
    expect(detectPhenomena(ctx({ hour: 12, loggedToday: true, roll: 0, roll2: 0 }))).not.toContain('meteor');
  });
});

describe('detectPhenomena — 彩虹 / 月晕 / 银河', () => {
  it('白天 + 打卡 + roll < 0.06 → 彩虹', () => {
    expect(detectPhenomena(ctx({ hour: 12, loggedToday: true, roll: 0.01 }))).toContain('rainbow');
  });
  it('深夜 + 打卡 + roll2 < 0.08 → 月晕', () => {
    expect(detectPhenomena(ctx({ hour: 23, loggedToday: true, roll: 0.99, roll2: 0.01 }))).toContain('moon-halo');
  });
  it('连续 30 天 + 深夜 → 银河(hidden)', () => {
    const ids = detectPhenomena(ctx({ hour: 2, loggedToday: true, streak: 30, roll: 0.2 }));
    expect(ids).toContain('galaxy');
  });
  it('streak 29 天不出银河', () => {
    expect(detectPhenomena(ctx({ hour: 2, loggedToday: true, streak: 29, roll: 0.2 }))).not.toContain('galaxy');
  });
});

describe('detectPhenomena — 去重与确定性', () => {
  it('同样输入 → 同样输出(确定性)', () => {
    const a = detectPhenomena(ctx({ hour: 23, loggedToday: true, roll: 0.3, roll2: 0.02 }));
    const b = detectPhenomena(ctx({ hour: 23, loggedToday: true, roll: 0.3, roll2: 0.02 }));
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(a.length);
  });
});

describe('atlasStats', () => {
  it('空图鉴 0/8', () => {
    const s = atlasStats({});
    expect(s.collected).toBe(0);
    expect(s.total).toBe(8);
  });
  it('常见 + 隐藏都统计正确', () => {
    const atlas: Record<string, PhenomenonId[]> = { '2026-09-01': ['starry-sky'], '2026-09-02': ['galaxy'] };
    const s = atlasStats(atlas);
    expect(s.collected).toBe(2);
    expect(s.byRarity.common.collected).toBe(1);
    expect(s.byRarity.hidden.collected).toBe(1);
    expect(s.byRarity.rare.collected).toBe(0);
  });
});

describe('newlyDiscovered', () => {
  it('过滤已收录', () => {
    const atlas: Record<string, PhenomenonId[]> = { '2026-09-01': ['meteor'] };
    expect(newlyDiscovered(atlas, ['meteor', 'rainbow'])).toEqual(['rainbow']);
  });
  it('空图鉴 → 全部算新', () => {
    expect(newlyDiscovered({}, ['meteor'])).toEqual(['meteor']);
  });
});

describe('monthPhenomena', () => {
  it('只统计指定月份', () => {
    const atlas: Record<string, PhenomenonId[]> = {
      '2026-08-30': ['meteor'],
      '2026-09-02': ['starry-sky', 'sunset-glow'],
      '2026-09-03': ['starry-sky'],
    };
    expect(monthPhenomena(atlas, '2026-09').sort()).toEqual(['starry-sky', 'sunset-glow']);
  });
});

describe('PHENOMENA 完整性', () => {
  it('id 唯一', () => {
    const ids = PHENOMENA.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('每个都有 hint(图鉴可展示)', () => {
    for (const p of PHENOMENA) {
      expect(p.hint.length).toBeGreaterThan(0);
      expect(p.icon.length).toBeGreaterThan(0);
    }
  });
});
