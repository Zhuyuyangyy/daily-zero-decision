/**
 * 天象图鉴 — 融合调研后 v0.3 的核心"惊喜系统"
 *
 * 设计原则:
 * - 纯函数:可单测,不读写状态;由 Scene/hook 层负责记录
 * - 确定性 + 概率:同日同用户同样本;概率主要由真实时刻驱动
 * - 反 PUA:错过不惩罚,没有"你错过了流星"这类文案
 * - rarity 分级:common / rare / hidden(需特定条件才解锁)
 */

import { dayPhaseFromHour } from './dayPhase';

export type PhenomenonId =
  | 'cloud-gap-light'   // 云隙光
  | 'sunset-glow'       // 晚霞
  | 'starry-sky'        // 星空
  | 'rainbow'           // 彩虹
  | 'moon-halo'         // 月晕
  | 'meteor'            // 流星
  | 'double-meteor'     // 双流星(rare)
  | 'galaxy';           // 银河(rare)

export type Rarity = 'common' | 'rare' | 'hidden';

export interface PhenomenonDef {
  id: PhenomenonId;
  name: string;
  icon: string;
  rarity: Rarity;
  /** 触发条件说明(图鉴里展示给用户看) */
  hint: string;
}

export const PHENOMENA: readonly PhenomenonDef[] = [
  { id: 'cloud-gap-light', name: '云隙光',  icon: '🌤️', rarity: 'common', hint: '清晨或上午,天空放晴时' },
  { id: 'sunset-glow',     name: '晚霞',    icon: '🌇', rarity: 'common', hint: '黄昏时分抬头看看天空' },
  { id: 'starry-sky',      name: '星空',    icon: '✨', rarity: 'common', hint: '入夜后的第一颗星' },
  { id: 'rainbow',         name: '彩虹',    icon: '🌈', rarity: 'rare',   hint: '雨过天晴,天空自己会画出来' },
  { id: 'moon-halo',       name: '月晕',    icon: '🌙', rarity: 'rare',   hint: '深夜满月当头的夜里' },
  { id: 'meteor',          name: '流星',    icon: '🌠', rarity: 'rare',   hint: '深夜与天空多待一会儿' },
  { id: 'double-meteor',   name: '双流星',  icon: '💫', rarity: 'hidden', hint: '记录 >= 7 天又恰好同夜两颗流星' },
  { id: 'galaxy',          name: '银河',    icon: '🌌', rarity: 'hidden', hint: '连续记录的第 30 天深夜' },
];

const BY_ID = new Map(PHENOMENA.map((p) => [p.id, p]));

export function getPhenomenon(id: PhenomenonId): PhenomenonDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`unknown phenomenon: ${id}`);
  return def;
}

export interface PhenomenonContext {
  /** 当天时刻 0-23 */
  hour: number;
  /** 当天是否已完成记录(打卡) */
  loggedToday: boolean;
  /** 当前连续天数 */
  streak: number;
  /** 当次随机(0-1),用于确定性复算 */
  roll: number;
  /** 当次第二次随机,仅双流星判定用 */
  roll2: number;
}

/**
 * 推导当天可能出现的天象(不写状态)。
 * 一次上下文最多返回 2 个:天象场景(时段) + 惊喜(流星/彩虹)。
 */
export function detectPhenomena(ctx: PhenomenonContext): PhenomenonId[] {
  const { hour, loggedToday, streak, roll, roll2 } = ctx;
  const out: PhenomenonId[] = [];
  const { phase } = dayPhaseFromHour(hour);

  // --- 时段场景 ---
  if (phase === 'night') out.push('starry-sky');
  else if (phase === 'dusk') out.push('sunset-glow');
  else if (phase === 'dawn') out.push('cloud-gap-light');

  // --- 门槛:只有留到此刻才可能撞见惊喜(不打卡也能在白天看天空) ---
  if (!loggedToday) return dedupe(out);

  // 彩虹:白天雨后概率(roll)
  if (phase === 'day' && roll < 0.06) out.push('rainbow');

  // 月晕:深夜满月概率(roll2)
  if (phase === 'night' && roll2 < 0.08) out.push('moon-halo');

  // 流星:深夜概率(roll)
  if (phase === 'night') {
    const deep = hour >= 22 || hour < 4;
    const chance = deep ? 0.34 : 0.2;
    let meteorCount = 0;
    if (roll < chance) meteorCount++;
    if (roll2 < chance * 0.4) meteorCount++;
    if (meteorCount >= 2) out.push('double-meteor');
    else if (meteorCount === 1) out.push('meteor');
  }

  // 银河(hidden):连续记录 >= 30 天的深夜
  if (phase === 'night' && streak >= 30 && roll < 0.5) out.push('galaxy');

  return dedupe(out);
}

function dedupe(ids: PhenomenonId[]): PhenomenonId[] {
  return [...new Set(ids)];
}

export interface AtlasStats {
  /** 已收录种数 */
  collected: number;
  /** 图鉴总种数 */
  total: number;
  /** 按稀有度统计 */
  byRarity: Record<Rarity, { collected: number; total: number }>;
}

/** 统计用户图鉴进度(输入:date → 天象 id 列表 的映射) */
export function atlasStats(atlas: Record<string, PhenomenonId[]>): AtlasStats {
  const seen = new Set<PhenomenonId>();
  for (const list of Object.values(atlas)) {
    for (const id of list) seen.add(id);
  }
  const byRarity: Record<Rarity, { collected: number; total: number }> = {
    common: { collected: 0, total: 0 },
    rare: { collected: 0, total: 0 },
    hidden: { collected: 0, total: 0 },
  };
  for (const p of PHENOMENA) {
    byRarity[p.rarity].total++;
    if (seen.has(p.id)) byRarity[p.rarity].collected++;
  }
  return { collected: seen.size, total: PHENOMENA.length, byRarity };
}

/** 新遇见的天象(从未收录过):用于"✨ 新天象"提示 */
export function newlyDiscovered(
  atlas: Record<string, PhenomenonId[]>,
  candidates: PhenomenonId[],
): PhenomenonId[] {
  const seen = new Set<PhenomenonId>();
  for (const list of Object.values(atlas)) {
    for (const id of list) seen.add(id);
  }
  return candidates.filter((id) => !seen.has(id));
}

/** 本月清单:该月出现过哪些天象(去重) */
export function monthPhenomena(
  atlas: Record<string, PhenomenonId[]>,
  yearMonth: string,
): PhenomenonId[] {
  const out = new Set<PhenomenonId>();
  for (const [date, list] of Object.entries(atlas)) {
    if (!date.startsWith(yearMonth)) continue;
    for (const id of list) out.add(id);
  }
  return [...out];
}
