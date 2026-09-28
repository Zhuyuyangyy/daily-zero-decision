/**
 * zeroDecisionEngine — v0.3 核心:把"一摊事"压成"唯一下一步"
 *
 * 纯函数模块:不读写状态、不依赖 React,由 hook 层负责喂数据。
 * 设计原则与产品定位一一对应:
 * - 只输出 ONE next action:调用方拿到的永远是一个动作,不是清单
 * - 前置问题只有一个:电量直接复用已有心情系统(energyFromMood)
 * - 不许羞辱:所有 reason 文案过"温柔"审核,禁词由单测把守
 * - 缩微有地板:「再小一点」到 opening 级为止,不会归零、不会消失
 *
 * 参考实现来源(思路落地位置):
 * - CairnOS / DoubleDone  → categorize(一摊话 → 结构)
 * - ADHD Daily Planner    → 电量 × 时长约束选级
 * - task-breakdown        → 每类一张步骤阶梯(LADDERS)
 * - Context Preserver     → 断点续接优先(resume)
 */

export type DumpCategory = 'study' | 'project' | 'life' | 'body' | 'rest';

export interface DumpItem {
  id: string;
  /** 用户原文,如「下午有高数作业」 */
  text: string;
  category: DumpCategory;
  /** 截止紧迫度,解析不出来就不填 */
  urgency?: 'today' | 'soon' | 'later';
}

/** 电量四档:😴 empty / 🫠 low / 🙂 mid / ⚡ high */
export type Energy = 'empty' | 'low' | 'mid' | 'high';

export interface ResumePoint {
  /** 上次做到一半的事(项目 id) */
  projectId: string;
  /** 人话描述,如「Figure 3 已导出,还没替换正文图片」 */
  text: string;
}

export interface EngineInput {
  items: DumpItem[];
  energy: Energy;
  /** 可用分钟;null = 随便 */
  minutes: number | null;
  /** 上次断点,有就优先续接 */
  resume?: ResumePoint | null;
}

export interface NextAction {
  itemId: string;
  itemText: string;
  category: DumpCategory;
  /** 唯一下一步的动作文案 */
  action: string;
  /** 阶梯层级,0 = 最轻的 opening */
  level: number;
  /** 预计分钟 */
  minutes: number;
  /** 为什么是它(温柔,不评判) */
  reason: string;
  /** 还能不能更小 */
  canSmaller: boolean;
}

const KEYWORDS: Array<[DumpCategory, string[]]> = [
  ['rest', ['休息', '睡觉', '躺一会', '发呆', '冥想', '深呼吸', '睡一觉', '眯一会', '睡会儿']],
  ['body', ['跑步', '运动', '健身', '散步', '走路', '拉伸', '喝水', '锻炼', '游泳', '打球', '跳绳']],
  ['life', ['洗衣服', '洗碗', '快递', '打扫', '收拾', '买东西', '拿外卖', '倒垃圾', '交话费', '理发', '取件']],
  ['study', ['作业', '高数', '数学', '英语', '背单词', '考试', '复习', '题目', '课本', '看书', '阅读', '上课', '预习', '试卷']],
  ['project', ['论文', '图', '代码', '项目', '报告', '实验', '投稿', '比赛', '方案', '文档', '改稿', '查重', '答辩', 'ppt', 'PPT']],
];

/** 一摊话 → 结构。识别不出来按 project 处理(打开类动作永远安全) */
export function categorize(text: string): DumpCategory {
  for (const [category, words] of KEYWORDS) {
    if (words.some((w) => text.includes(w))) return category;
  }
  return 'project';
}

interface Rung {
  action: string;
  minutes: number;
}

/** 每类一张阶梯:index 0 永远是最轻的 opening,后面的逐级变实 */
const LADDERS: Record<DumpCategory, Rung[]> = {
  study: [
    { action: '把书或资料翻开,找到今天要看的那一页', minutes: 2 },
    { action: '把题目读一遍,圈出看不懂的那个词', minutes: 5 },
    { action: '做一道小题,卡住就跳过', minutes: 10 },
    { action: '完成一小节,不会的标记下来', minutes: 25 },
  ],
  project: [
    { action: '打开文件夹,找到要动的那个文件', minutes: 2 },
    { action: '把要改的地方看一遍,先不动手', minutes: 5 },
    { action: '改一个小地方,改完就停', minutes: 15 },
    { action: '推进一步,能跑就行', minutes: 30 },
  ],
  life: [
    { action: '把东西拿到眼前,比如衣服放进盆里', minutes: 2 },
    { action: '只做一件,洗完这一件就停', minutes: 10 },
    { action: '把这一件事做完', minutes: 20 },
  ],
  body: [
    { action: '换上鞋,站到门口', minutes: 2 },
    { action: '出门慢走五分钟', minutes: 5 },
    { action: '动到微微出汗就回来', minutes: 20 },
  ],
  rest: [
    { action: '深呼吸三次,肩膀放下来', minutes: 1 },
    { action: '闭眼待五分钟,不用睡着', minutes: 5 },
    { action: '好好休息一会', minutes: 20 },
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

/** 电量决定最大层级:empty 只给 opening,高电量才允许大动作 */
function capFor(energy: Energy): number {
  switch (energy) {
    case 'empty': return 0;
    case 'low': return 1;
    case 'mid': return 2;
    case 'high': return 3;
  }
}

/** 在电量上限内,找装得进可用时间的最大一级 */
function rungIndexFor(category: DumpCategory, energy: Energy, minutes: number | null): number {
  const ladder = LADDERS[category] ?? LADDERS.project;
  const max = Math.min(capFor(energy), ladder.length - 1);
  let idx = max;
  while (idx > 0 && minutes != null && ladder[idx].minutes > minutes) idx--;
  return idx;
}

/** 电量 × 类别适配:低电量偏向轻的事,高电量偏向能推进的事 */
const ENERGY_FIT: Record<Energy, Partial<Record<DumpCategory, number>>> = {
  empty: { rest: 25, body: 12, life: 6, study: -10, project: -12 },
  low: { rest: 12, body: 8, life: 4, study: -4, project: -6 },
  mid: {},
  high: { project: 15, study: 10, body: 2, rest: -20 },
};

function scoreItem(item: DumpItem, energy: Energy): number {
  let score = 0;
  if (item.urgency === 'today') score += 30;
  else if (item.urgency === 'soon') score += 15;
  else if (item.urgency === 'later') score += 5;
  score += ENERGY_FIT[energy][item.category] ?? 0;
  return score;
}

function buildAction(item: DumpItem, level: number, reason: string): NextAction {
  const ladder = LADDERS[item.category] ?? LADDERS.project;
  const idx = Math.max(0, Math.min(level, ladder.length - 1));
  const rung = ladder[idx];
  return {
    itemId: item.id,
    itemText: item.text,
    category: item.category,
    action: rung.action,
    level: idx,
    minutes: rung.minutes,
    reason,
    canSmaller: idx > 0,
  };
}

/**
 * 选一:断点 > 打分最高的一件。永远只返回一个动作。
 * 纯函数:同样输入永远同样输出(无时钟、无随机)。
 */
export function pickOne(input: EngineInput): NextAction | null {
  const { items, energy, minutes, resume } = input;

  // 断点续接优先——"接着上次来"本身就是零决策
  if (resume && resume.text.trim()) {
    const existing = items.find((i) => i.id === resume.projectId);
    const base: DumpItem = existing ?? { id: resume.projectId, text: resume.text, category: 'project' };
    const level = Math.max(1, rungIndexFor(base.category, energy, minutes));
    return buildAction(base, level, RESUME_REASON);
  }

  if (items.length === 0) return null;

  let best = items[0];
  let bestScore = scoreItem(best, energy);
  for (const item of items.slice(1)) {
    const score = scoreItem(item, energy);
    // 同分按 id 字典序,保证确定性的 tie-break
    if (score > bestScore || (score === bestScore && item.id < best.id)) {
      best = item;
      bestScore = score;
    }
  }
  return buildAction(best, rungIndexFor(best.category, energy, minutes), REASONS[energy]);
}

/** 再小一点:沿阶梯下一级,0 级地板,不会再小也不会消失 */
export function shrink(action: NextAction): NextAction {
  if (action.level <= 0) return action;
  return buildAction(
    { id: action.itemId, text: action.itemText, category: action.category },
    action.level - 1,
    action.reason,
  );
}

/** 换一个:排除当前这件,重新选一。池子里只剩一件时返回 null */
export function alternative(input: EngineInput, excludeItemId: string): NextAction | null {
  const rest = input.items.filter((i) => i.id !== excludeItemId);
  return pickOne({ ...input, items: rest, resume: null });
}
