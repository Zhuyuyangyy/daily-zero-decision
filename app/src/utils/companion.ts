/**
 * 本命云成长 —— 融合调研后 v0.4 的"养成感"核心
 *
 * 设计原则(调研结论):
 * - 陪伴天数驱动成长:1 天一小团 → 7 天蓬松 → 30 天发光 → 90 天戴小冠
 * - 心情靠近:低落时云靠近一点(不说什么,只是靠近)
 * - 高兴:飘得快一点;夜里:睡着;久未打开:只是"睡了几天",不枯萎不死亡
 * - 反 PUA 铁律:零惩罚性状态,没有"你不管它它就死"
 */

import type { AppState } from '../types';
import { dayPhaseFromHour } from './dayPhase';

export type CompanionStage = 'seed' | 'small' | 'fluffy' | 'glow' | 'crowned';

export interface StageDef {
  id: CompanionStage;
  /** 用户可见的阶段名(图鉴/成长说明用) */
  label: string;
  /** 需要累计陪伴天数 */
  minDays: number;
  desc: string;
}

export const STAGES: readonly StageDef[] = [
  { id: 'seed',    label: '刚出生',  minDays: 0,  desc: '一小团，还在认识你的天空。' },
  { id: 'small',   label: '长个子',  minDays: 3,  desc: '比昨天蓬了一点。' },
  { id: 'fluffy',  label: '蓬松松',  minDays: 7,  desc: '现在可以舒服地靠着你了。' },
  { id: 'glow',    label: '会发光',  minDays: 30, desc: '深夜也会替你亮着。' },
  { id: 'crowned', label: '戴小冠',  minDays: 90, desc: '它把和你的日子都戴在了头上。' },
];

export type CompanionMood = 'calm' | 'happy' | 'sleep' | 'close' | 'proud';

export interface CompanionView {
  stage: CompanionStage;
  stageLabel: string;
  stageDesc: string;
  /** 距离下一阶段还差几天;已满级为 0 */
  daysToNext: number;
  mood: CompanionMood;
  /** 名字;未命名时 null */
  name: string | null;
  /** 陪伴天数(累计记录天数) */
  days: number;
}

/** 累计陪伴天数 = 有记录的天数(只增不减,天然符合"不惩罚") */
export function companionDays(state: AppState): number {
  return state.log.length;
}

/** 由天数推导成长阶段 */
export function stageFromDays(days: number): StageDef {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (days >= s.minDays) current = s;
  }
  return current;
}

/** 下一个阶段(满级返回 null) */
export function nextStage(days: number): StageDef | null {
  for (const s of STAGES) {
    if (days < s.minDays) return s;
  }
  return null;
}

/**
 * 推导本命云此刻的样子。
 * 全部输入都是已知事实:记录天数、今日心情、时刻、久未打开的天数。
 */
export function companionView(
  state: AppState,
  now: Date = new Date(),
): CompanionView {
  const days = companionDays(state);
  const stage = stageFromDays(days);
  const next = nextStage(days);

  // 久未打开:距上次记录超过 3 天 → 睡觉(而非死亡)
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const lastLogged = state.log.length > 0 ? state.log[state.log.length - 1] : null;
  const daysAway = lastLogged ? daysBetween(lastLogged, today) : 0;

  const { phase } = dayPhaseFromHour(now.getHours());
  const mood = state.moods[today];

  let cm: CompanionMood = 'calm';
  if (daysAway >= 3) cm = 'sleep';
  else if (phase === 'night') cm = 'sleep';
  else if (mood === 'down' || mood === 'gloomy') cm = 'close';
  else if (mood === 'hopeful') cm = 'happy';
  else if (stage.id === 'glow' || stage.id === 'crowned') cm = 'proud';

  return {
    stage: stage.id,
    stageLabel: stage.label,
    stageDesc: stage.desc,
    daysToNext: next ? Math.max(0, next.minDays - days) : 0,
    mood: cm,
    name: state.companion.name,
    days,
  };
}

function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  const ms = Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1);
  return Math.round(ms / 86400000);
}

/** 成长进度:距离下一阶段的 0-1(满级为 1) */
export function stageProgress(days: number): number {
  const next = nextStage(days);
  if (!next) return 1;
  const cur = stageFromDays(days);
  const span = next.minDays - cur.minDays;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (days - cur.minDays) / span));
}
