import { describe, it, expect } from 'vitest';
import { copy } from '../copy';

describe('copy.pokeLine — 摸云萌语库', () => {
  const BANNED_PATTERNS = [
    /再坚持/,
    /连续\s*\d+\s*天/,
    /不要断/,
    /还没做/,
    /完成度/,
    /别忘了/,
    /加油/,
  ];

  it('pokeLine 是 copy 对象上的函数', () => {
    expect(typeof copy.pokeLine).toBe('function');
  });

  it('每次调用返回非空字符串', () => {
    for (let i = 0; i < 30; i++) {
      const line = copy.pokeLine();
      expect(typeof line).toBe('string');
      expect(line.length).toBeGreaterThan(0);
    }
  });

  it('多次调用覆盖到至少 3 条不同萌语(非恒定单句)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      seen.add(copy.pokeLine());
      if (seen.size >= 3) break;
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  it('全部萌语都不含催办/比较/KPI 词汇(反 PUA 铁律)', () => {
    // 直接遍历内部池不可行,改为对 celebrate/footer 之外的可见文案抽检:
    // 连续抽 60 条,断言无一命中禁止词
    for (let i = 0; i < 60; i++) {
      const line = copy.pokeLine();
      for (const pattern of BANNED_PATTERNS) {
        expect(line).not.toMatch(pattern);
      }
    }
  });
});
