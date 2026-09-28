import { describe, it, expect } from 'vitest';
import {
  categorize,
  energyFromMood,
  pickOne,
  shrink,
  alternative,
  type DumpItem,
  type EngineInput,
} from '../zeroDecisionEngine';

const item = (id: string, text: string, over: Partial<DumpItem> = {}): DumpItem => ({
  id,
  text,
  category: categorize(text),
  ...over,
});

const input = (over: Partial<EngineInput> = {}): EngineInput => ({
  items: [],
  energy: 'mid',
  minutes: null,
  ...over,
});

// 本引擎自己的"温柔"禁词(中文羞辱词 + 沿用仓库级英文禁词)
const SHAME_WORDS = ['应该', '早就', '落后', '懒惰', '拖延', '必须', '不能停', '坚持不住', '自律', '加油'];
const EN_FORBIDDEN = ['fail', 'broke', 'discipline'];
function isGentle(text: string): boolean {
  if (SHAME_WORDS.some((w) => text.includes(w))) return false;
  return !EN_FORBIDDEN.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(text));
}

describe('categorize — 一摊话 → 结构', () => {
  it('作业/高数 → study', () => {
    expect(categorize('下午有高数作业')).toBe('study');
    expect(categorize('明天要考试,得复习')).toBe('study');
  });
  it('论文/图/代码 → project', () => {
    expect(categorize('论文图还没改')).toBe('project');
    expect(categorize('比赛代码也得看看')).toBe('project');
  });
  it('跑步 → body,洗衣服 → life,睡觉 → rest', () => {
    expect(categorize('想去跑步')).toBe('body');
    expect(categorize('还有洗衣服没做')).toBe('life');
    expect(categorize('好想睡觉')).toBe('rest');
  });
  it('识别不出来 → project(打开类动作永远安全)', () => {
    expect(categorize('asdfqwer')).toBe('project');
  });
});

describe('energyFromMood — 心情 chips 直供电量', () => {
  it('down → empty,gloomy/low → low', () => {
    expect(energyFromMood('down')).toBe('empty');
    expect(energyFromMood('gloomy')).toBe('low');
    expect(energyFromMood('low')).toBe('low');
  });
  it('okay → mid,hopeful → high', () => {
    expect(energyFromMood('okay')).toBe('mid');
    expect(energyFromMood('hopeful')).toBe('high');
  });
  it('未知 mood → mid(不猜、不施压)', () => {
    expect(energyFromMood('???')).toBe('mid');
  });
});

describe('pickOne — 只输出一个下一步', () => {
  const pool = [
    item('a', '下午有高数作业', { urgency: 'today' }),
    item('b', '论文图还没改'),
    item('c', '想去跑步'),
    item('d', '还有洗衣服没做'),
    item('e', '好想睡觉'),
  ];

  it('空池 + 无断点 → null', () => {
    expect(pickOne(input())).toBeNull();
  });

  it('😴 低电量 → 只给 opening(最轻一级),且偏向休息/轻事', () => {
    const action = pickOne(input({ items: pool, energy: 'empty' }))!;
    expect(action.level).toBe(0);
    expect(action.minutes).toBeLessThanOrEqual(2);
    expect(['rest', 'body', 'life']).toContain(action.category);
  });

  it('⚡ 高电量 + 30 分钟 → 能给到最实的一级,且偏向项目/学习', () => {
    const action = pickOne(input({ items: pool, energy: 'high', minutes: 30 }))!;
    expect(action.level).toBeGreaterThanOrEqual(2);
    expect(['project', 'study']).toContain(action.category);
  });

  it('时间约束:5 分钟装不下 15 分钟的级,自动降级', () => {
    const action = pickOne(input({ items: pool, energy: 'high', minutes: 5 }))!;
    expect(action.minutes).toBeLessThanOrEqual(5);
    expect(action.level).toBe(1);
  });

  it('断点续接优先,即使断点项不在池子里', () => {
    const action = pickOne(input({
      items: pool,
      energy: 'mid',
      resume: { projectId: 'paper', text: 'Figure 3 已导出,还没替换正文图片' },
    }))!;
    expect(action.itemId).toBe('paper');
    expect(action.reason).toBe('接着上次的来,不用重新想');
    expect(action.level).toBeGreaterThanOrEqual(1);
  });

  it('同分时按 id 字典序(确定性 tie-break)', () => {
    const two = [item('z', '随便一个任务'), item('a', '另一个任务')];
    expect(pickOne(input({ items: two }))!.itemId).toBe('a');
  });

  it('同样输入永远同样输出(无时钟无随机)', () => {
    const a = pickOne(input({ items: pool, energy: 'low', minutes: 10 }));
    const b = pickOne(input({ items: pool, energy: 'low', minutes: 10 }));
    expect(a).toEqual(b);
  });
});

describe('shrink — 再小一点', () => {
  it('沿阶梯逐级下降,分钟数同步变小', () => {
    const start = pickOne(input({ items: [item('p', '论文图还没改')], energy: 'high', minutes: 30 }))!;
    const smaller = shrink(start);
    expect(smaller.level).toBe(start.level - 1);
    expect(smaller.minutes).toBeLessThan(start.minutes);
  });

  it('0 级是地板:不会再小,也不会消失', () => {
    const floor = pickOne(input({ items: [item('r', '好想睡觉')], energy: 'empty' }))!;
    expect(floor.level).toBe(0);
    expect(floor.canSmaller).toBe(false);
    expect(shrink(floor)).toEqual(floor);
  });

  it('非地板时 canSmaller 为 true', () => {
    const big = pickOne(input({ items: [item('p', '论文图还没改')], energy: 'high', minutes: 30 }))!;
    expect(big.canSmaller).toBe(true);
  });
});

describe('alternative — 换一个', () => {
  it('排除当前件,给出另一件', () => {
    const pool = [item('a', '下午有高数作业'), item('b', '论文图还没改')];
    const first = pickOne(input({ items: pool }))!;
    const next = alternative(input({ items: pool }), first.itemId)!;
    expect(next.itemId).not.toBe(first.itemId);
  });

  it('池子里只剩一件 → null(UI 温柔收底)', () => {
    const solo = [item('only', '写一行日记')];
    expect(alternative(input({ items: solo }), 'only')).toBeNull();
  });
});

describe('反 PUA — 引擎文案永远温柔', () => {
  it('各种输入下 reason / action 都不含羞辱词', () => {
    const pool = [
      item('a', '下午有高数作业', { urgency: 'today' }),
      item('b', '论文图还没改'),
      item('c', '想去跑步'),
      item('d', '还有洗衣服没做'),
      item('e', '好想睡觉'),
    ];
    const energies = ['empty', 'low', 'mid', 'high'] as const;
    const minutesList = [null, 2, 5, 15, 30];
    for (const energy of energies) {
      for (const minutes of minutesList) {
        const action = pickOne(input({ items: pool, energy, minutes }));
        if (!action) continue;
        expect(isGentle(action.reason)).toBe(true);
        expect(isGentle(action.action)).toBe(true);
      }
    }
    const resumed = pickOne(input({ items: pool, resume: { projectId: 'x', text: '改到一半的论文' } }))!;
    expect(isGentle(resumed.reason)).toBe(true);
    expect(isGentle(resumed.action)).toBe(true);
  });
});
