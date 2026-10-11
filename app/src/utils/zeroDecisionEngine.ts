/**
 * zeroDecisionEngine — v0.3 核心:把"一摊事"压成"唯一下一步"
 *
 * 纯函数模块:不读写状态、不依赖 React,由 hook 层负责喂数据。
 * P1.5 起动作必须带用户自己的上下文(论文 / Figure 3 / 高数作业),
 * 不再返回"打开文件夹"这种模板机器人文案。
 *
 * 设计原则与产品定位一一对应:
 * - 只输出 ONE next action:调用方拿到的永远是一个动作,不是清单
 * - 前置问题只有一个:电量直接复用已有心情系统(energyFromMood)
 * - 不许羞辱:所有 reason 文案过"温柔"审核,禁词由单测把守
 * - 缩微有地板:flat state list 走到头为止,不会归零、不会消失
 *
 * 参考实现来源(思路落地位置):
 * - CairnOS / DoubleDone  → splitDump + parseDump(一摊话 → 结构)
 * - ADHD Daily Planner    → 电量 × 时长约束选级
 * - task-breakdown        → 每类一张步骤阶梯(LADDERS)
 * - Context Preserver     → 断点续接优先(resume:lastAction / nextHint)
 */

import type { DumpCategory } from '../types';
export type { DumpCategory };

export interface DumpItem {
  id: string;
  /** 用户原文,如「下午有高数作业」 */
  text: string;
  category: DumpCategory;
  /** 抽取出的对象:论文 / 高数 / 代码 / 衣服 */
  object?: string;
  /** 抽取出的部位:Figure 3 / 第一题 / 摘要 */
  target?: string;
  /** 截止紧迫度,解析不出来就不填 */
  urgency?: 'today' | 'soon' | 'later';
}

/** 电量四档:😴 empty / 🫠 low / 🙂 mid / ⚡ high */
export type Energy = 'empty' | 'low' | 'mid' | 'high';

export interface ResumePoint {
  /** 上次做到一半的事(项目 id) */
  projectId: string;
  /** 人话描述,如「论文 Figure 3」 */
  text?: string;
  /** 上次实际停在哪,用于派生下一步 */
  lastAction?: string;
  /** 用户或系统记下的下一步 hint;有就直接用 */
  nextHint?: string;
  /** 上次做到第几级(用于往上走一级) */
  lastLevel?: number;
  object?: string;
  target?: string;
}

export interface EngineInput {
  items: DumpItem[];
  energy: Energy;
  /** 可用分钟;null = 随便 */
  minutes: number | null;
  /** 上次断点,有就优先续接 */
  resume?: ResumePoint | null;
}

/** 动作强度变体:full 带部位 > obj 只带对象 > bare 泛化 */
export type Variant = 'bare' | 'obj' | 'full';

export interface NextAction {
  itemId: string;
  itemText: string;
  category: DumpCategory;
  /** 唯一下一步的动作文案(带上下文) */
  action: string;
  /** 阶梯层级,0 = 最轻的 opening */
  level: number;
  /** 变体:动作里带多少上下文 */
  variant: Variant;
  /** 预计分钟 */
  minutes: number;
  /** 为什么是它(温柔,不评判) */
  reason: string;
  /** 还能不能更小 */
  canSmaller: boolean;
  /** 抽取出的对象/部位(UI 上层展示用) */
  object?: string;
  target?: string;
}

// ===== 分类:一摊话 → 五类 =====

const KEYWORDS: Array<[DumpCategory, string[]]> = [
  ['rest', ['休息', '睡觉', '躺一会', '发呆', '冥想', '深呼吸', '睡一觉', '眯一会', '睡会儿', '躺平']],
  ['body', ['跑步', '运动', '健身', '散步', '走路', '拉伸', '喝水', '锻炼', '游泳', '打球', '跳绳', '夜跑']],
  ['life', ['洗衣服', '洗碗', '快递', '打扫', '收拾', '买东西', '拿外卖', '倒垃圾', '交话费', '理发', '取件', '晒衣服']],
  ['study', ['作业', '高数', '数学', '英语', '背单词', '考试', '复习', '题目', '课本', '看书', '阅读', '上课', '预习', '试卷', '四六级', '考研']],
  ['project', ['论文', '图', '代码', '项目', '报告', '实验', '投稿', '比赛', '方案', '文档', '改稿', '查重', '答辩', '周报', '汇报', '调试']],
];

/** 识别不出来按 project 处理(打开类动作永远安全) */
export function categorize(text: string): DumpCategory {
  for (const [category, words] of KEYWORDS) {
    if (words.some((w) => text.includes(w))) return category;
  }
  return 'project';
}

// ===== 分割:一段脑内倾倒 → 多件事 =====

const SPLIT_RE = /[,，。;；!！?？、\n]|然后|还有|而且|顺便|另外|同时/;
const LEAD_IN_RE = /^(但是|但|不过|就是|我先|我想|我得|我要|需要|得)+/;
/** 情绪尾巴/状态碎片,不是任务 */
const STATE_RE = /好?累|好困|好烦|心烦|难受|不开心|低落|想哭|脑子很乱|不知道干嘛|不想动|脑子一团/;

/** 按标点与连接词切分;过滤情绪碎片与过短碎片 */
export function splitDump(text: string): string[] {
  return text
    .split(SPLIT_RE)
    .map((s) => s.trim().replace(LEAD_IN_RE, '').trim())
    .filter((s) => s.length >= 3)
    .filter((s) => !(categorize(s) === 'project' && !OBJECT_NOUNS.project.some((n) => s.includes(n)) && STATE_RE.test(s)));
}

// ===== 抽紧迫度 =====

const URGENCY_TODAY = /今晚|今天|今早|马上|立刻|现在|急着|截止|交稿|今天要/;
const URGENCY_SOON = /明天|明早|明晚|下次|下周|这周|本周|周[一二三四五六日末天]|星期[一二三四五六日末天]|\d+\s*号|\d+\s*日前|短期内/;
const URGENCY_TODAY_PART = /早上|上午|中午|下午|傍晚|晚上|夜里|通宵/;
const URGENCY_LATER = /以后|有空|再说|不着急|改天|哪天|到时候/;

function parseUrgency(text: string): DumpItem['urgency'] {
  if (URGENCY_TODAY.test(text)) return 'today';
  if (URGENCY_SOON.test(text)) return 'soon';
  if (URGENCY_TODAY_PART.test(text)) return 'today';
  if (URGENCY_LATER.test(text)) return 'later';
  return undefined;
}

// ===== 抽对象与部位 =====

const OBJECT_NOUNS: Record<DumpCategory, string[]> = {
  study: ['高数', '数学', '英语', '语文', '物理', '化学', '生物', '专业课', '作业', '考试', '课本', '教材', '试卷', '题目', '单词', '论文'],
  project: ['论文', '代码', '项目', '报告', '实验', '比赛', '文档', '方案', '投稿', '答辩', '周报', '汇报', '需求', '接口'],
  life: ['衣服', '碗', '快递', '垃圾', '外卖', '话费', '房间', '桌子', '鞋子', '袜子', '冰箱'],
  body: ['步', '澡', '泳'],
  rest: ['觉'],
};

const TARGET_PATTERNS: RegExp[] = [
  /[Ff]igure\s*\d+/,
  /[Tt]able\s*\d+/,
  /第\s*[0-9一二三四五六七八九十百]+\s*[题章节页张次部分篇段]/,
  /(摘要|结论|引言|正文|开头|Introduction|Abstract|Conclusion|Discussion|Caption)/,
];

function extractTarget(text: string): string | undefined {
  for (const re of TARGET_PATTERNS) {
    const m = text.match(re);
    if (m) return m[0].trim();
  }
  return undefined;
}

/** 已知名词表里找最长合并跨度(相邻名词合并,如「高数」+「作业」→「高数作业」) */
function extractObject(text: string, category: DumpCategory): string | undefined {
  const nouns = OBJECT_NOUNS[category] ?? [];
  const spans: Array<[number, number]> = [];
  for (const noun of nouns) {
    let from = 0;
    for (;;) {
      const i = text.indexOf(noun, from);
      if (i === -1) break;
      spans.push([i, i + noun.length]);
      from = i + noun.length;
    }
  }
  if (spans.length === 0) return undefined;
  spans.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span[0] <= last[1]) {
      last[1] = Math.max(last[1], span[1]);
    } else {
      merged.push([...span]);
    }
  }
  let best = merged[0];
  for (const span of merged) {
    if (span[1] - span[0] > best[1] - best[0]) best = span;
  }
  const word = text.slice(best[0], best[1]);
  return word.length >= 2 ? word : undefined;
}

/**
 * parseDump — 一摊话 → 结构化。
 * 纯启发式:能解"论文/Figure 3/高数作业/衣服"这类结构;
 * 解不出来就留空,由阶梯的 obj/bare 变体优雅接住。
 */
export function parseDump(text: string): DumpItem {
  const category = categorize(text);
  return {
    id: '',
    text,
    category,
    object: extractObject(text, category),
    target: extractTarget(text),
    urgency: parseUrgency(text),
  };
}

/** 便捷构造:从原文造一个 DumpItem */
export function itemFromText(id: string, text: string): DumpItem {
  return { ...parseDump(text), id };
}

// ===== 意图阶梯:每类一张,动作必须带上下文 =====

interface Rung {
  /** full 变体的分钟数;obj/bare 按比例缩 */
  minutes: number;
  /** 对象+部位都有 */
  full: string;
  /** 只有对象 */
  obj: string;
  /** 都没有 */
  bare: string;
}

const LADDERS: Record<DumpCategory, Rung[]> = {
  study: [
    { minutes: 2, full: '翻开{o},找到{t}', obj: '翻开{o},找到今天要看的部分', bare: '把书或资料翻开,找到今天要看的部分' },
    { minutes: 5, full: '把{o}的{t}读一遍,圈出不懂的', obj: '把{o}读一遍,圈出不懂的', bare: '把题目读一遍,圈出看不懂的那个词' },
    { minutes: 10, full: '只做{o}的{t},卡住就跳过', obj: '只做一道,卡住就跳过', bare: '做一道小题,卡住就跳过' },
    { minutes: 25, full: '完成{o}的一小节,不会的标记下来', obj: '完成{o}的一小节', bare: '完成一小节,不会的标记下来' },
  ],
  project: [
    { minutes: 2, full: '打开{o},定位到{t}', obj: '打开{o},先看整体', bare: '打开文件夹,找到要动的那个文件' },
    { minutes: 5, full: '把{o}里{t}相关的内容看一遍,先不动手', obj: '把{o}看一遍,先不动手', bare: '把要改的地方看一遍,先不动手' },
    { minutes: 15, full: '只改{o}里{t}这一处,改完就停', obj: '只改{o}的一小处', bare: '改一个小地方,改完就停' },
    { minutes: 30, full: '把{o}推进一步,能跑就行', obj: '把{o}推进一步', bare: '推进一步,能跑就行' },
  ],
  life: [
    { minutes: 2, full: '把{o}拿到眼前,开始动手', obj: '把{o}拿到眼前', bare: '把这件事要用的东西拿到眼前' },
    { minutes: 10, full: '只处理{o}的这一件,做完就停', obj: '只处理这一件,做完就停', bare: '只做一件,做完就停' },
    { minutes: 20, full: '把{o}这件事做完,做完就休息', obj: '把这件事做完', bare: '把这一件事做完' },
  ],
  body: [
    { minutes: 2, full: '换上鞋,站到门口,随时能出发', obj: '换上鞋,站到门口', bare: '站起来,离开椅子' },
    { minutes: 5, full: '出门动五分钟,不用出汗', obj: '出门动五分钟', bare: '动五分钟,不用出汗' },
    { minutes: 20, full: '动到微微出汗就回来', obj: '动到微微出汗就回来', bare: '完成今天的运动量' },
  ],
  rest: [
    { minutes: 1, full: '深呼吸三次,肩膀放下来', obj: '深呼吸三次,肩膀放下来', bare: '深呼吸三次' },
    { minutes: 5, full: '闭眼待五分钟,不用睡着', obj: '闭眼待五分钟', bare: '闭眼待五分钟' },
    { minutes: 20, full: '好好休息一会,设个闹钟', obj: '好好休息一会', bare: '好好休息一会' },
  ],
};

const REASONS: Record<Energy, string> = {
  empty: '现在电量不高,先找最轻的那件',
  low: '先启动一下,不用多做',
  mid: '这个长度,做它刚合适',
  high: '状态不错,可以做一点实的',
};

const RESUME_REASON = '接着上次的来,不用重新想';

/** 已有心情 → 电量。mood chips 就是唯一的前置问题 */
export function energyFromMood(mood: string): Energy {
  switch (mood) {
    case 'down': return 'empty';
    case 'gloomy':
    case 'low': return 'low';
    case 'okay':
    case 'calm': return 'mid';
    case 'hopeful':
    case 'happy': return 'high';
    default: return 'mid';
  }
}

// ===== flat state list:缩微就是沿列表往前走一步 =====

const VARIANT_MINUTES: Record<Variant, number> = { bare: 0.5, obj: 0.75, full: 1 };
const VARIANT_RANK: Record<Variant, number> = { bare: 0, obj: 1, full: 2 };

interface State {
  level: number;
  variant: Variant;
  minutes: number;
}

const FLAT: Record<DumpCategory, State[]> = (() => {
  const out = {} as Record<DumpCategory, State[]>;
  for (const [category, ladder] of Object.entries(LADDERS) as Array<[DumpCategory, Rung[]]>) {
    const states: State[] = [];
    ladder.forEach((rung, level) => {
      (['bare', 'obj', 'full'] as Variant[]).forEach((variant) => {
        states.push({
          level,
          variant,
          minutes: Math.max(1, Math.round(rung.minutes * VARIANT_MINUTES[variant])),
        });
      });
    });
    states.sort(
      (a, b) => a.minutes - b.minutes || a.level - b.level || VARIANT_RANK[a.variant] - VARIANT_RANK[b.variant],
    );
    out[category] = states;
  }
  return out;
})();

const maxLevelOf = (category: DumpCategory): number => (LADDERS[category] ?? LADDERS.project).length - 1;

function templateFor(rung: Rung, variant: Variant): string {
  if (variant === 'full') return rung.full;
  if (variant === 'obj') return rung.obj;
  return rung.bare;
}

function fillTemplate(tpl: string, object?: string, target?: string): string {
  return tpl.replace(/\{o\}/g, object ?? '').replace(/\{t\}/g, target ?? '');
}

function render(item: Pick<DumpItem, 'category' | 'object' | 'target'>, state: State): string {
  const ladder = LADDERS[item.category] ?? LADDERS.project;
  const rung = ladder[state.level];
  return fillTemplate(templateFor(rung, state.variant), item.object, item.target);
}

/** 上下文能支撑的最强变体 */
function strongestVariant(object?: string, target?: string): Variant {
  if (object && target) return 'full';
  if (object) return 'obj';
  return 'bare';
}

/** 电量决定层级上限:empty 只给 opening,高电量才允许大动作 */
function capFor(energy: Energy): number {
  switch (energy) {
    case 'empty': return 0;
    case 'low': return 1;
    case 'mid': return 2;
    case 'high': return 3;
  }
}

interface Ctx {
  object?: string;
  target?: string;
}

/** 取不超过目标层级的最大状态(变体按上下文取最强) */
function nearestState(category: DumpCategory, level: number, ctx: Ctx): State {
  const lv = Math.max(0, Math.min(level, maxLevelOf(category)));
  const variant = strongestVariant(ctx.object, ctx.target);
  return stateAt(category, lv, variant);
}

function stateAt(category: DumpCategory, level: number, variant: Variant): State {
  const states = FLAT[category] ?? FLAT.project;
  return states.find((s) => s.level === level && s.variant === variant)
    ?? states.filter((s) => s.level === level).pop()
    ?? states[0];
}

/**
 * 起始状态:层级不超电量上限;分钟装不下就往下降级——
 * 注意先保"变体强度"(带上下文的动作优先),再降层级。
 */
function initialState(category: DumpCategory, ctx: Ctx, energy: Energy, minutes: number | null): State {
  let level = Math.min(capFor(energy), maxLevelOf(category));
  while (level >= 0) {
    const variant = strongestVariant(ctx.object, ctx.target);
    const picked = stateAt(category, level, variant);
    if (minutes == null || picked.minutes <= minutes) return picked;
    level--;
  }
  return stateAt(category, 0, 'bare');
}

function stateIndex(category: DumpCategory, level: number, variant: Variant): number {
  const states = FLAT[category] ?? FLAT.project;
  const idx = states.findIndex((s) => s.level === level && s.variant === variant);
  return idx === -1 ? 0 : idx;
}

function buildAction(
  item: Pick<DumpItem, 'id' | 'text' | 'category' | 'object' | 'target'>,
  state: State,
  reason: string,
): NextAction {
  const idx = stateIndex(item.category, state.level, state.variant);
  return {
    itemId: item.id,
    itemText: item.text,
    category: item.category,
    action: render(item, state),
    level: state.level,
    variant: state.variant,
    minutes: state.minutes,
    reason,
    canSmaller: idx > 0,
    object: item.object,
    target: item.target,
  };
}

/** 补齐缺失解析字段(老调用方只给 text 也能工作) */
function ensureParsed(item: DumpItem): DumpItem {
  const parsed = parseDump(item.text);
  return {
    ...item,
    object: item.object ?? parsed.object,
    target: item.target ?? parsed.target,
    urgency: item.urgency ?? parsed.urgency,
  };
}

function scoreItem(item: DumpItem, energy: Energy): number {
  let score = 0;
  if (item.urgency === 'today') score += 30;
  else if (item.urgency === 'soon') score += 15;
  else if (item.urgency === 'later') score += 5;
  const fit: Partial<Record<Energy, Partial<Record<DumpCategory, number>>>> = {
    empty: { rest: 25, body: 12, life: 6, study: -10, project: -12 },
    low: { rest: 12, body: 8, life: 4, study: -4, project: -6 },
    mid: {},
    high: { project: 15, study: 10, body: 2, rest: -20 },
  };
  score += fit[energy]?.[item.category] ?? 0;
  return score;
}

/**
 * 选一:断点 > 打分最高的一件。永远只返回一个动作。
 * 纯函数:同样输入永远同样输出(无时钟、无随机)。
 */
export function pickOne(input: EngineInput): NextAction | null {
  const { items, energy, minutes, resume } = input;

  // 断点续接优先——"接着上次来"本身就是零决策
  if (resume && resume.projectId) {
    const existing = items.find((i) => i.id === resume.projectId);
    const ctx: Ctx = {
      object: existing?.object ?? resume.object,
      target: existing?.target ?? resume.target,
    };
    const category = existing?.category ?? (resume.text ? parseDump(resume.text).category : 'project');

    // 有 nextHint:直接用用户自己记下的下一步
    if (resume.nextHint && resume.nextHint.trim()) {
      const state = nearestState(category, Math.max(1, resume.lastLevel ?? 1), ctx);
      return {
        ...buildAction({ id: resume.projectId, text: resume.text ?? resume.lastAction ?? '', category, ...ctx }, state, RESUME_REASON),
        action: resume.nextHint,
      };
    }

    // 只有 lastAction:在上次的下一级继续
    if (resume.lastAction) {
      const state = nearestState(category, (resume.lastLevel ?? 1) + 1, ctx);
      return buildAction(
        { id: resume.projectId, text: resume.text ?? resume.lastAction, category, ...ctx },
        state,
        RESUME_REASON,
      );
    }

    // 兜底:至少给一个能启动的动作
    const state = initialState(category, ctx, energy, minutes);
    const raised = nearestState(category, Math.max(1, state.level), ctx);
    return buildAction(
      { id: resume.projectId, text: resume.text ?? '', category, ...ctx },
      raised,
      RESUME_REASON,
    );
  }

  if (items.length === 0) return null;

  let best = ensureParsed(items[0]);
  let bestScore = scoreItem(best, energy);
  for (const raw of items.slice(1)) {
    const item = ensureParsed(raw);
    const score = scoreItem(item, energy);
    // 同分按 id 字典序,保证确定性的 tie-break
    if (score > bestScore || (score === bestScore && item.id < best.id)) {
      best = item;
      bestScore = score;
    }
  }
  return buildAction(best, initialState(best.category, best, energy, minutes), REASONS[energy]);
}

/** 再小一点:沿 flat list 退一格。0 号位是地板,不会再小也不会消失 */
export function shrink(action: NextAction): NextAction {
  const idx = stateIndex(action.category, action.level, action.variant);
  if (idx <= 0) return action;
  const states = FLAT[action.category] ?? FLAT.project;
  return buildAction(
    {
      id: action.itemId,
      text: action.itemText,
      category: action.category,
      object: action.object,
      target: action.target,
    },
    states[idx - 1],
    action.reason,
  );
}

/** 换一个:排除当前这件,重新选一。池子里只剩一件时返回 null */
export function alternative(input: EngineInput, excludeItemId: string): NextAction | null {
  const rest = input.items.filter((i) => i.id !== excludeItemId);
  return pickOne({ ...input, items: rest, resume: null });
}
