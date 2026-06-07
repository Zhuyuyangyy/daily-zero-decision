import { useMemo } from 'react';
import type { SkyMood } from '../../utils/skyMood';
import type { Mood } from '../shared/MoodWidget';

/**
 * SkyProgress — 天空 + 进度合体的顶部组件
 *
 * 设计意图：
 *  - 一改之前"日期条 + 进度环 + 三个统计卡"三段式，把情绪（天空）和信息（进度）合并
 *  - 顶部信息条（日期 + 问候）半透明叠在天空上，不单独占一坨
 *  - 进度用云朵外圈的"呼吸光环"传达：0% 慢而宽，100% 快而窄并变金
 *  - streak=0 + log=0 时整个 mini stats 区域隐藏，避免三个 0 拆台
 *  - 心情选择从 MoodWidget 集成进来：5 个 emoji 横排，一行内
 *  - 总高度 ~120px，给任务列表留出空间
 */

export interface SkyProgressProps {
  mood: SkyMood;
  completedCount: number;
  totalCount: number;
  streak: number;
  bestStreak: number;
  totalDays: number;
  today: string;
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
}

// mood → 渐变 + 呼吸节奏 + 云色
const MOOD_CONFIG: Record<SkyMood, {
  from: string; via: string; to: string;
  cloudFill: string;
  cloudHighlight: string;
  breathDuration: string; // CSS 动画时长
  breathScale: string;    // 缩放幅度
}> = {
  dawn: {
    from: 'var(--sky-dawn-1)',
    via: 'var(--sky-dawn-2)',
    to: 'var(--sky-dawn-3)',
    cloudFill: 'var(--neutral-300)',
    cloudHighlight: 'var(--neutral-200)',
    breathDuration: '6s',
    breathScale: '1.0 → 1.06',
  },
  morning: {
    from: 'var(--sky-dawn-2)',
    via: 'var(--sky-dawn-3)',
    to: 'var(--sky-dawn-4)',
    cloudFill: 'var(--mint-cloud-light)',
    cloudHighlight: '#FFFFFF',
    breathDuration: '5s',
    breathScale: '1.0 → 1.05',
  },
  clear: {
    from: 'var(--sky-dawn-2)',
    via: 'var(--sky-dawn-3)',
    to: 'var(--warm-coral)',
    cloudFill: 'var(--mint-cloud)',
    cloudHighlight: 'var(--mint-cloud-light)',
    breathDuration: '4s',
    breathScale: '1.0 → 1.04',
  },
  sunny: {
    from: 'var(--sky-dawn-3)',
    via: 'var(--sky-dawn-4)',
    to: 'var(--warm-coral)',
    cloudFill: 'var(--mint-cloud)',
    cloudHighlight: 'var(--mint-cloud-light)',
    breathDuration: '3.5s',
    breathScale: '1.0 → 1.03',
  },
  golden: {
    from: 'var(--sky-dawn-4)',
    via: 'var(--warm-coral)',
    to: 'var(--warm-amber, #F2A660)',
    cloudFill: '#FFD27D',
    cloudHighlight: '#FFE9B4',
    breathDuration: '0s', // 100% 进度时光环静止
    breathScale: '1.0',
  },
};

const MOOD_OPTIONS: { id: Mood; icon: string; label: string }[] = [
  { id: 'down', icon: '☁️', label: '很丧' },
  { id: 'low', icon: '🌧', label: '低落' },
  { id: 'okay', icon: '🌤', label: '一般' },
  { id: 'gloomy', icon: '⛈', label: '低落' },
  { id: 'hopeful', icon: '🌈', label: '期待' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了 🌙';
  if (h < 9) return '早上好 ☀️';
  if (h < 12) return '上午好 🌤';
  if (h < 14) return '中午好 ☁️';
  if (h < 18) return '下午好 🌈';
  return '晚上好 ✨';
}

function getDateLabel(): string {
  const d = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

export default function SkyProgress({
  mood,
  completedCount,
  totalCount,
  streak,
  bestStreak,
  totalDays,
  today: _today,
  selectedMood,
  onMoodSelect,
}: SkyProgressProps) {
  const t = MOOD_CONFIG[mood] ?? MOOD_CONFIG.morning;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const hasData = streak > 0 || totalDays > 0;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  // 呼吸光环参数：进度 0% 时最大最慢，进度接近 100% 时收紧变金
  const breathStyle = useMemo(() => {
    if (isComplete) {
      return { animation: 'none', transform: 'scale(1)' };
    }
    // 进度 0-100% 映射：周期 6s → 3s，缩放 1.06 → 1.02
    const dur = 6 - progress * 3;
    const scaleMax = 1.06 - progress * 0.04;
    return {
      animation: `sky-breathe ${dur}s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate`,
      '--sky-breath-scale': String(scaleMax),
    } as React.CSSProperties;
  }, [isComplete, progress]);

  return (
    <div
      className="clay-noise"
      style={{
        position: 'relative',
        width: '100%',
        height: 120,
        overflow: 'hidden',
        borderRadius: 'var(--radius-hero, 28px)',
        background: `linear-gradient(180deg, ${t.from} 0%, ${t.via} 50%, ${t.to} 100%)`,
        boxShadow: 'inset 0 -6px 18px rgba(180,100,90,0.10), inset 0 2px 10px rgba(255, 240, 225, 0.55), var(--shadow-clay-deep)',
        transition: 'background 1.6s var(--ease-out-quart)',
      }}
    >
      {/* scoped breath animation */}
      <style>{`
        @keyframes sky-breathe {
          from { transform: scale(1); opacity: 0.55; }
          to { transform: scale(var(--sky-breath-scale, 1.05)); opacity: 0.85; }
        }
      `}</style>

      {/* 顶部信息条：日期 + 问候（半透明） */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--ink-light)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.2,
              opacity: 0.85,
            }}
          >
            {getDateLabel()}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1.2,
              marginTop: 1,
            }}
          >
            {getGreeting()}
          </div>
        </div>
        {/* 连续天数徽章（仅 streak > 0 时显示） */}
        {streak > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--warm-coral) 0%, var(--warm-amber, #F2A660) 100%)',
              color: '#fff',
              boxShadow: '0 3px 10px rgba(255, 155, 133, 0.4)',
              flexShrink: 0,
              pointerEvents: 'auto',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                lineHeight: 1,
                fontFamily: 'var(--font-display)',
              }}
            >
              {streak}
            </span>
            <span style={{ fontSize: 8, lineHeight: 1, opacity: 0.9, marginTop: 1 }}>
              天
            </span>
          </div>
        )}
      </div>

      {/* 云朵 + 呼吸光环（左侧主视觉） */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 14,
          width: 96,
          height: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 呼吸光环（外圈） */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid ${isComplete ? 'rgba(255, 210, 125, 0.7)' : 'rgba(255, 255, 255, 0.6)'}`,
            ...breathStyle,
          }}
        />
        {/* 第二层光环（叠在进度上） */}
        {!isComplete && totalCount > 0 && (
          <svg
            viewBox="0 0 96 96"
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotate(-90deg)',
            }}
          >
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="3"
            />
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="var(--mint-cloud-deep)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.6s var(--ease-out-quart)' }}
            />
          </svg>
        )}
        {/* 云朵本体 */}
        <svg
          viewBox="-30 -25 60 50"
          aria-hidden
          style={{
            width: 70,
            height: 56,
            filter: `drop-shadow(0 3px 6px rgba(180, 100, 90, 0.25))`,
          }}
        >
          {/* 底部暗面 */}
          <ellipse cx="0" cy="6" rx="26" ry="5" fill="rgba(0,0,0,0.08)" />
          {/* 云朵主体 */}
          <ellipse cx="0" cy="2" rx="26" ry="10" fill={t.cloudFill} />
          <ellipse cx="-13" cy="-3" rx="10" ry="8" fill={t.cloudFill} />
          <ellipse cx="5" cy="-6" rx="12" ry="10" fill={t.cloudFill} />
          <ellipse cx="18" cy="-2" rx="8" ry="6" fill={t.cloudFill} />
          {/* 顶部高光 */}
          <ellipse cx="0" cy="-6" rx="13" ry="3" fill={t.cloudHighlight} opacity="0.85" />
          <ellipse cx="-2" cy="-9" rx="4" ry="1.5" fill="#FFFFFF" opacity="0.7" />
          {/* 表情（根据 mood） */}
          {mood === 'golden' || isComplete ? (
            <g>
              {/* 完成：微笑 */}
              <circle cx="-5" cy="-3" r="1" fill="var(--mint-cloud-text, #2F8B57)" />
              <circle cx="5" cy="-3" r="1" fill="var(--mint-cloud-text, #2F8B57)" />
              <path d="M -4 0 Q 0 3 4 0" stroke="var(--mint-cloud-text, #2F8B57)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* 平静/期待：点眼 */}
              <circle cx="-5" cy="-3" r="0.8" fill="var(--ink, #3D3530)" />
              <circle cx="5" cy="-3" r="0.8" fill="var(--ink, #3D3530)" />
            </g>
          )}
        </svg>
      </div>

      {/* 右侧：mini stats + 心情选择 */}
      <div
        style={{
          position: 'absolute',
          right: 14,
          top: 44,
          bottom: 14,
          left: 116,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 6,
          zIndex: 3,
        }}
      >
        {/* mini stats（仅在有数据时显示） */}
        {hasData && (
          <div
            style={{
              display: 'flex',
              gap: 6,
              fontSize: 11,
              color: 'var(--ink-light)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {bestStreak > 0 && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                🏆 最佳 {bestStreak} 天
              </span>
            )}
            {totalDays > 0 && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                📋 累计 {totalDays} 天
              </span>
            )}
          </div>
        )}

        {/* 心情选择条（5 emoji 一行） */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {MOOD_OPTIONS.map((m) => {
            const isActive = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onMoodSelect(m.id)}
                aria-label={m.label}
                aria-pressed={isActive}
                style={{
                  flex: 1,
                  height: 28,
                  border: 'none',
                  borderRadius: 999,
                  background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--dur-fast) var(--ease-out-quart)',
                  boxShadow: isActive ? '0 2px 6px rgba(180, 100, 90, 0.15)' : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {m.icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
