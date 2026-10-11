import { describe, it, expect } from 'vitest';
import {
  categorize,
  energyFromMood,
  parseDump,
  splitDump,
  itemFromText,
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

describe('splitDump — 一段脑内倾倒 → 多件事', () => {
  it('按标点切分,情绪尾巴被丢', () => {
    const items = splitDump('下午有高数作业,论文图还没改,想去跑步,洗衣服,比赛代码也得看看,但我现在好累不知道干嘛。');
    expect(items).toContain('下午有高数作业');
    expect(items).toContain('论文图还没改');
    expect(items).toContain('想去跑步');
    expect(items).toContain('洗衣服');
    expect(items.some((s) => s.includes('好累'))).toBe(false);
  });
  it('连接词也能切开', () => {
    const items = splitDump('还有快递没取然后想买瓶水');
    expect(items).toContain('快递没取');
  });
  it('过短碎片被丢', () => {
    expect(splitDump('好,行。嗯')).toEqual([]);
  });
});

describe('parseDump — 对象/部位/紧迫度', () => {
  it('论文 Figure 3 → object=论文,target=Figure 3', () => {
    const p = parseDump('论文 Figure 3 还没换');
    expect(p.category).toBe('project');
    expect(p.object).toBe('论文');
    expect(p.target).toBe('Figure 3');
  });
  it('相邻名词合并:高数 + 作业 → 高数作业', () => {
    expect(parseDump('今晚截止的高数作业').object).toBe('高数作业');
  });
  it('今晚截止 → urgency today', () => {
    expect(parseDump('今晚截止的高数作业').urgency).toBe('today');
  });
  it('明天要交代码 → urgency soon', () => {
    expect(parseDump('明天要交代码').urgency).toBe('soon');
  });
  it('同天时段词(下午)→ urgency today,且明天优先于时段词', () => {
    expect(parseDump('下午有高数作业').urgency).toBe('today');
    expect(parseDump('明天下午交代码').urgency).toBe('soon');
  });
  it('衣服以后再说 → urgency later', () => {
    expect(parseDump('衣服以后再说').urgency).toBe('later');
  });
  it('第一题 → target', () => {
    expect(parseDump('把数学第一题写了').target).toBe('第一题');
  });
  it('识别不了 → 留空,不瞎猜', () => {
    const p = parseDump('qwq 随便');
    expect(p.object).toBeUndefined();
    expect(p.target).toBeUndefined();
    expect(p.urgency).toBeUndefined();
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
    itemFromText('a', '下午有高数作业'),
    itemFromText('b', '论文 Figure 3 还没换'),
    itemFromText('c', '想去跑步'),
    itemFromText('d', '还有洗衣服没做'),
    itemFromText('e', '好想睡觉'),
  ];

  it('空池 + 无断点 → null', () => {
    expect(pickOne(input())).toBeNull();
  });

  it('😴 低电量 → 只给 opening,且偏向休息/轻事', () => {
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

describe('pickOne — 动作必须带上下文(P1.5 核心)', () => {
  it('论文 Figure 3 + 2 分钟 → 打开论文,定位到 Figure 3', () => {
    const action = pickOne(input({ items: [itemFromText('p', '论文 Figure 3 还没换')], energy: 'mid', minutes: 2 }))!;
    expect(action.action).toBe('打开论文,定位到Figure 3');
    expect(action.object).toBe('论文');
    expect(action.target).toBe('Figure 3');
    expect(action.variant).toBe('full');
  });

  it('高电量长时段 → 带论文上下文的最实一级', () => {
    const action = pickOne(input({ items: [itemFromText('p', '论文 Figure 3 还没换')], energy: 'high' }))!;
    expect(action.action).toBe('把论文推进一步,能跑就行');
    expect(action.action).toContain('论文');
  });

  it('只有对象没部位 → 用 obj 变体,不编造部位', () => {
    const action = pickOne(input({ items: [itemFromText('h', '高数作业还没写')], energy: 'mid', minutes: 5 }))!;
    expect(action.variant).toBe('obj');
    expect(action.action).toContain('高数作业');
    expect(action.action).not.toContain('Figure');
  });

  it('什么都解不出 → bare 泛化兜底,但不丢层级逻辑', () => {
    const action = pickOne(input({ items: [itemFromText('x', 'qwq 东西还没弄')], energy: 'mid', minutes: 5 }))!;
    expect(action.variant).toBe('bare');
    expect(action.minutes).toBeLessThanOrEqual(5);
  });
});

describe('shrink — 再小一点', () => {
  const shrinkChain = (text: string, energy: 'high' = 'high') => {
    const start = pickOne(input({ items: [itemFromText('p', text)], energy }))!;
    const chain = [start];
    let current = start;
    while (current.canSmaller) {
      current = shrink(current);
      chain.push(current);
    }
    return chain;
  };

  it('沿阶梯逐级下降,分钟数只减不增', () => {
    const chain = shrinkChain('论文 Figure 3 还没换');
    expect(chain.length).toBeGreaterThan(3);
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i].minutes).toBeLessThanOrEqual(chain[i - 1].minutes);
    }
  });

  it('论文 Figure 3 的缩微链终点是 bare opening', () => {
    const chain = shrinkChain('论文 Figure 3 还没换');
    const last = chain[chain.length - 1];
    expect(last.variant).toBe('bare');
    expect(last.level).toBe(0);
    expect(last.canSmaller).toBe(false);
  });

  it('0 级是地板:不会再小,也不会消失', () => {
    const floor = pickOne(input({ items: [itemFromText('r', '好想睡觉')], energy: 'empty' }))!;
    expect(floor.canSmaller).toBe(false);
    expect(shrink(floor)).toEqual(floor);
  });

  it('缩微链中出现过只看不动手的中间级', () => {
    const chain = shrinkChain('论文 Figure 3 还没换');
    expect(chain.some((s) => s.action.includes('先不动手'))).toBe(true);
  });
});

describe('resume — 接着上次来(P1.5 核心)', () => {
  it('有 nextHint → 直接用用户自己的下一步', () => {
    const action = pickOne(input({
      items: [itemFromText('p', '论文 Figure 3 还没换')],
      resume: {
        projectId: 'p',
        object: '论文',
        target: 'Figure 3',
        lastAction: '把 Figure 3 导出成 600 dpi',
        nextHint: '把已经导出的 Figure 3 拖进正文',
        lastLevel: 2,
      },
    }))!;
    expect(action.action).toBe('把已经导出的 Figure 3 拖进正文');
    expect(action.reason).toBe('接着上次的来,不用重新想');
    expect(action.itemId).toBe('p');
  });

  it('只有 lastAction → 给上次的下一级,不重复上次', () => {
    const action = pickOne(input({
      items: [],
      resume: {
        projectId: 'paper',
        text: '论文 Figure 3',
        object: '论文',
        target: 'Figure 3',
        lastAction: '把 Figure 3 导出来了',
        lastLevel: 0,
      },
    }))!;
    expect(action.level).toBe(1);
    expect(action.action).toContain('论文');
    expect(action.action).not.toBe('把 Figure 3 导出来了');
  });

  it('断点优先于池子里更急的事', () => {
    const action = pickOne(input({
      items: [itemFromText('a', '今晚截止的高数作业')],
      resume: { projectId: 'paper', object: '论文', target: 'Figure 3', lastLevel: 1 },
    }))!;
    expect(action.itemId).toBe('paper');
  });
});

describe('alternative — 换一个', () => {
  it('排除当前件,给出另一件', () => {
    const pool = [itemFromText('a', '下午有高数作业'), itemFromText('b', '论文图还没改')];
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
      itemFromText('a', '下午有高数作业'),
      itemFromText('b', '论文 Figure 3 还没换'),
      itemFromText('c', '想去跑步'),
      itemFromText('d', '还有洗衣服没做'),
      itemFromText('e', '好想睡觉'),
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
    // 缩微链全程温柔
    let current = pickOne(input({ items: [itemFromText('p', '论文 Figure 3 还没改')], energy: 'high' }))!;
    let guard = 0;
    while (current.canSmaller && guard++ < 30) {
      current = shrink(current);
      expect(isGentle(current.action)).toBe(true);
    }
  });
});
