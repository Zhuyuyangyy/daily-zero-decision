/**
 * 今日天空卡 — 海报视觉参数生成(纯函数,可单测)
 *
 * 核心要求(调研结论):
 * - 确定性:同一天 + 同一用户 + 同一心情 → 完全一样的天空
 * - 个性化:不同 seed → 云位置/大小/星星分布/太阳位置/流星轨迹不同
 * - 传播性:右下角小 logo,底部轻文案
 *
 * seed 约定: `${date}|${skyName}|${mood}` —— 用户改名后同一天也会长出新天空,
 * 这是"你的天空"的又一层归属感。
 */

import type { TaskType } from '../types';
import { dayPhaseFromHour } from './dayPhase';

export interface PosterVisual {
  seed: string;
  hour: number;
  phase: 'dawn' | 'day' | 'dusk' | 'night';
  /** 主云 */
  cloud: {
    x: number;   // 0-1
    y: number;   // 0-1
    scale: number;
    type: TaskType;
  };
  /** 陪衬小云(0-3 朵) */
  miniClouds: Array<{ x: number; y: number; scale: number; opacity: number }>;
  /** 星星(仅夜/黄昏) */
  stars: Array<{ x: number; y: number; r: number; twinkle: number }>;
  /** 太阳/月亮位置 */
  sun: { x: number; y: number; glow: number };
  /** 今天的流星(概率性;命中则在卡片上留一道) */
  meteor: { x: number; y: number; angle: number; length: number } | null;
  /** 心情色调 */
  moodHue: string;
}

/** FNV-1a:与 cloudSeed 同族哈希,保证星空在工程内风格一致 */
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seeded(seed: number, salt: number): number {
  const x = Math.sin(seed + salt * 9301) * 233280;
  return x - Math.floor(x);
}

function range(seed: number, salt: number, min: number, max: number): number {
  return min + seeded(seed, salt) * (max - min);
}

const MOOD_HUE: Record<string, string> = {
  down:    '#D8DEEA',
  low:     '#CFC9EE',
  okay:    '#FFE7AE',
  gloomy:  '#BFDCC9',
  hopeful: '#FFD3E4',
};

/** 生成海报视觉参数。dateStr='YYYY-MM-DD';mood 为空时用中性色 */
export function buildPosterVisual(
  dateStr: string,
  skyName: string,
  mood: string | null | undefined,
  hour: number,
): PosterVisual {
  const seedStr = `${dateStr}|${skyName}|${mood ?? 'neutral'}`;
  const seed = hashString(seedStr);
  const { phase } = dayPhaseFromHour(hour);

  const cloud = {
    x: range(seed, 1, 0.18, 0.82),
    y: range(seed, 2, 0.3, 0.58),
    scale: range(seed, 3, 0.85, 1.25),
    type: (mood === 'gloomy' || mood === 'down' ? 'other' : 'other') as TaskType,
  };

  const miniCount = phase === 'night' ? 3 : 2;
  const miniClouds = Array.from({ length: miniCount }, (_, i) => ({
    x: range(seed, 10 + i * 3, 0.08, 0.9),
    y: range(seed, 11 + i * 3, 0.12, 0.5),
    scale: range(seed, 12 + i * 3, 0.35, 0.6),
    opacity: range(seed, 13 + i * 3, 0.35, 0.6),
  }));

  const starCount = phase === 'night' ? 46 : phase === 'dusk' ? 18 : 0;
  const stars = Array.from({ length: starCount }, (_, i) => ({
    x: range(seed, 40 + i, 0.03, 0.97),
    y: range(seed, 60 + i, 0.04, 0.72),
    r: range(seed, 80 + i, 0.5, 1.9),
    twinkle: range(seed, 100 + i, 1.6, 4.2),
  }));

  const sun = {
    x: range(seed, 120, 0.16, 0.84),
    y: phase === 'night' ? range(seed, 121, 0.14, 0.3) : range(seed, 121, 0.12, 0.34),
    glow: range(seed, 122, 0.5, 0.9),
  };

  // 流星:夜/黄昏 30% 概率,命中则画一道斜线(确定性:同 seed 同结果)
  const meteorRoll = seeded(seed, 200);
  const wantsMeteor = (phase === 'night' || phase === 'dusk') && meteorRoll < 0.3;
  const meteor = wantsMeteor
    ? {
        x: range(seed, 201, 0.45, 0.9),
        y: range(seed, 202, 0.06, 0.24),
        angle: range(seed, 203, 22, 40),
        length: range(seed, 204, 90, 170),
      }
    : null;

  return {
    seed: seedStr,
    hour,
    phase,
    cloud,
    miniClouds,
    stars,
    sun,
    meteor,
    moodHue: MOOD_HUE[mood ?? ''] ?? '#FFE7AE',
  };
}
