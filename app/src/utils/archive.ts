/**
 * 天空档案馆 — 月度天空的自然语言总结
 *
 * 融合调研后 v0.3 的"长期价值"模块:不做折线图,用一句人话告诉用户
 * 这个月的天空是什么样。反 KPI:不统计"完成率/缺卡天数"。
 */

import type { AppState, Task } from '../types';
import { getPhenomenon, type PhenomenonId } from './atlas';
import { dayPhaseFromHour } from './dayPhase';

export interface MonthSummary {
  yearMonth: string;      // 'YYYY-MM'
  totalDays: number;      // 有记录的天数
  /** 心情分布 label → 次数 */
  moodCounts: Array<{ label: string; count: number }>;
  /** 天象分布 id → 次数 */
  phenomenonCounts: Array<{ id: PhenomenonId; icon: string; name: string; count: number }>;
  /** 本月记录的任务类型分布(用云朵种类名) */
  cloudTypeCounts: Array<{ label: string; count: number }>;
  /** 自然语言总结句 */
  sentence: string;
}

const MOOD_LABEL: Record<string, string> = {
  down: '低落', low: '一般', okay: '平静', gloomy: '低落', hopeful: '期待',
};

const CLOUD_TYPE_LABEL: Record<string, string> = {
  reading: '阅读云', exercise: '散步云', coding: '编码云', other: '日常云',
};

/** 取 'YYYY-MM' 月份前缀下所有有记录的日期 */
export function monthDates(log: string[], yearMonth: string): string[] {
  return log.filter((d) => d.startsWith(yearMonth)).sort();
}

/**
 * 构建某月总结。state 提供 log/history/moods/atlas。
 * 只统计已发生的事实,不做推断式 KPI(不输出"完成率 X%")。
 */
export function buildMonthSummary(state: AppState, yearMonth: string): MonthSummary {
  const dates = monthDates(state.log, yearMonth);

  const moodTally = new Map<string, number>();
  const cloudTally = new Map<string, number>();
  const phenTally = new Map<PhenomenonId, number>();

  for (const date of dates) {
    const mood = state.moods[date];
    if (mood) moodTally.set(mood, (moodTally.get(mood) ?? 0) + 1);

    const tasks: Task[] = state.history[date] ?? [];
    if (tasks[0]) {
      const t = tasks[0].type ?? 'other';
      cloudTally.set(t, (cloudTally.get(t) ?? 0) + 1);
    }

    for (const id of (state.atlas[date] ?? []) as PhenomenonId[]) {
      phenTally.set(id, (phenTally.get(id) ?? 0) + 1);
    }
  }

  const moodCounts = [...moodTally.entries()]
    .map(([k, count]) => ({ label: MOOD_LABEL[k] ?? k, count }))
    .sort((a, b) => b.count - a.count);

  const cloudTypeCounts = [...cloudTally.entries()]
    .map(([k, count]) => ({ label: CLOUD_TYPE_LABEL[k] ?? k, count }))
    .sort((a, b) => b.count - a.count);

  const phenomenonCounts = [...phenTally.entries()]
    .map(([id, count]) => {
      const def = getPhenomenon(id);
      return { id, icon: def.icon, name: def.name, count };
    })
    .sort((a, b) => b.count - a.count);

  return {
    yearMonth,
    totalDays: dates.length,
    moodCounts,
    phenomenonCounts,
    cloudTypeCounts,
    sentence: buildSentence(dates.length, moodCounts, phenomenonCounts),
  };
}

/** 自然语言总结 —— 优先讲"明亮感/天象",没有任何比较式压力 */
function buildSentence(
  totalDays: number,
  moodCounts: MonthSummary['moodCounts'],
  phenomenonCounts: MonthSummary['phenomenonCounts'],
): string {
  if (totalDays === 0) return '这个月的天空还空着，等你来养第一朵云。';

  const brightWords = ['期待', '平静'];
  const brightCount = moodCounts
    .filter((m) => brightWords.includes(m.label))
    .reduce((sum, m) => sum + m.count, 0);
  const brightRatio = brightCount / totalDays;

  const rare = phenomenonCounts.filter((p) => ['meteor', 'double-meteor', 'galaxy', 'rainbow', 'moon-halo'].includes(p.id));

  if (brightRatio >= 0.7) {
    return `这个月你记录了 ${totalDays} 天，大部分天空都是明亮的。`;
  }
  if (rare.length > 0) {
    return `这个月你记录了 ${totalDays} 天，还遇见了${rare.slice(0, 2).map((r) => r.name).join('、')}。`;
  }
  if (brightRatio >= 0.4) {
    return `这个月你记录了 ${totalDays} 天，天空有明有暗，都在慢慢长。`;
  }
  return `这个月你记录了 ${totalDays} 天，云来得不算多，但每一朵都留下了。`;
}

/** 当天小天空用的时节提示(与 dayPhase 同一套时刻语言) */
export function dayGreeting(now: Date = new Date()): string {
  const { phase, label } = dayPhaseFromHour(now.getHours());
  switch (phase) {
    case 'dawn': return `${label}好，云刚醒`;
    case 'day': return `${label}，天空很开`;
    case 'dusk': return `${label}了，晚霞在路上`;
    default: return `${label}，星星在值班`;
  }
}
