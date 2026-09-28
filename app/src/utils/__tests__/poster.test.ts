import { describe, it, expect } from 'vitest';
import { buildPosterVisual } from '../poster';

describe('buildPosterVisual — 确定性与个性化', () => {
  it('同样输入 → 完全一样的天空', () => {
    const a = buildPosterVisual('2026-09-10', '晴天花圃', 'hopeful', 14);
    const b = buildPosterVisual('2026-09-10', '晴天花圃', 'hopeful', 14);
    expect(a).toEqual(b);
  });

  it('不同日期 → 云位置不同', () => {
    const a = buildPosterVisual('2026-09-10', '晴天花圃', 'hopeful', 14);
    const b = buildPosterVisual('2026-09-11', '晴天花圃', 'hopeful', 14);
    expect(a.cloud.x).not.toBe(b.cloud.x);
  });

  it('不同天空名 → 天空不同(改名会换片天)', () => {
    const a = buildPosterVisual('2026-09-10', '晴天花圃', 'hopeful', 14);
    const b = buildPosterVisual('2026-09-10', '云上小院', 'hopeful', 14);
    expect(a.seed).not.toBe(b.seed);
  });

  it('心情影响 moodHue', () => {
    const a = buildPosterVisual('2026-09-10', '天', 'hopeful', 12);
    const b = buildPosterVisual('2026-09-10', '天', 'gloomy', 12);
    expect(a.moodHue).not.toBe(b.moodHue);
  });

  it('白天无星星,夜晚 46 颗,黄昏 18 颗', () => {
    expect(buildPosterVisual('2026-09-10', '天', 'okay', 12).stars.length).toBe(0);
    expect(buildPosterVisual('2026-09-10', '天', 'okay', 23).stars.length).toBe(46);
    expect(buildPosterVisual('2026-09-10', '天', 'okay', 18).stars.length).toBe(18);
  });

  it('白天无流星;夜晚可能命中但一定有确定性', () => {
    const day = buildPosterVisual('2026-09-10', '天', 'okay', 12);
    expect(day.meteor).toBeNull();
    const night = buildPosterVisual('2026-09-10', '天', 'okay', 23);
    const night2 = buildPosterVisual('2026-09-10', '天', 'okay', 23);
    expect(night.meteor).toEqual(night2.meteor);
  });

  it('所有坐标都在 0-1 画布范围内', () => {
    for (const h of [7, 12, 18, 23]) {
      const p = buildPosterVisual('2026-09-10', '我的天空', 'hopeful', h);
      for (const c of [p.cloud, ...p.miniClouds, p.sun]) {
        expect(c.x).toBeGreaterThanOrEqual(0);
        expect(c.x).toBeLessThanOrEqual(1);
        expect(c.y).toBeGreaterThanOrEqual(0);
        expect(c.y).toBeLessThanOrEqual(1);
      }
      for (const s of p.stars) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(1);
      }
    }
  });

  it('mood 为空也能出图(中性色)', () => {
    const p = buildPosterVisual('2026-09-10', '我的天空', null, 12);
    expect(typeof p.moodHue).toBe('string');
    expect(p.moodHue.length).toBeGreaterThan(0);
  });
});
