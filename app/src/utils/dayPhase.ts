/**
 * 日夜时段系统 — 融合自工作区"云朵祈愿墙"项目的星空/时段氛围
 *
 * 单一职责:根据真实时刻推导天空时段(不读写任何状态,纯函数可单测)。
 * 与 SkyMood(成就驱动)正交:SkyMood 管"成就感色彩",DayPhase 管"自然时刻"。
 * 反 PUA 自查:夜晚不催促"该睡觉了",只是让天空安静下来陪你。
 */

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface DayPhaseInfo {
  phase: DayPhase;
  /** 人类可读的时段名(供 aria / 未来文案用) */
  label: string;
}

/**
 * 从小时(0-23)推导时段。
 * 5-10   dawn   清晨
 * 10-16  day    白天
 * 16-20  dusk   黄昏
 * 其余    night  夜晚
 */
export function dayPhaseFromHour(hour: number): DayPhaseInfo {
  const h = ((hour % 24) + 24) % 24; // 容忍负数/超界输入
  if (h >= 5 && h < 10) return { phase: 'dawn', label: '清晨' };
  if (h >= 10 && h < 16) return { phase: 'day', label: '白天' };
  if (h >= 16 && h < 20) return { phase: 'dusk', label: '黄昏' };
  return { phase: 'night', label: '夜晚' };
}

/** 当前真实时刻的时段(测试可通过注入 Date mock) */
export function currentDayPhase(now: Date = new Date()): DayPhaseInfo {
  return dayPhaseFromHour(now.getHours());
}

/**
 * 流星调度:夜晚偶发流星。
 * 返回 true 表示此刻应生成一颗流星。
 * 概率约每 8 秒一颗(每次 tick 2s → 1/4 概率),深夜(22-4 点)更频繁。
 */
export function shouldSpawnMeteor(hour: number, roll: number): boolean {
  const { phase } = dayPhaseFromHour(hour);
  if (phase !== 'night') return false;
  const deepNight = hour >= 22 || hour < 4;
  const chance = deepNight ? 0.34 : 0.2;
  return roll < chance;
}
