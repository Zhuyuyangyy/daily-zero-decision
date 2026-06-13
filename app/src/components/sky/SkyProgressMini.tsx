import type { SkyMood } from './SkyScene';

export interface SkyProgressMiniProps {
  streak: number;
  totalClouds: number;
  mood: SkyMood;
  hasTodayCloud: boolean;
}

const MOOD_ICON: Record<SkyMood, string> = {
  dawn: '🌅',
  morning: '🌄',
  clear: '🌤️',
  sunny: '☀️',
  golden: '☀️',
};

function pickText(streak: number, totalClouds: number, hasTodayCloud: boolean): string {
  if (hasTodayCloud) {
    return `☁️ 今天已长出 · 连续 ${streak} 天`;
  }
  if (totalClouds > 0) {
    return `☁️ 今天待长出 · 累计 ${totalClouds} 朵`;
  }
  return '☁️ 第一朵云，今天开始';
}

export function SkyProgressMini({ streak, totalClouds, mood, hasTodayCloud }: SkyProgressMiniProps) {
  const icon = MOOD_ICON[mood];
  const text = pickText(streak, totalClouds, hasTodayCloud);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(8px)',
        fontSize: 12,
        color: 'var(--ink)',
        fontWeight: 600,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}