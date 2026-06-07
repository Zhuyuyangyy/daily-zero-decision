import type { Task } from '../../types';

interface TodayDecisionCardProps {
  task: Task;
  onComplete: () => void;
  onEasier: () => void;
}

/**
 * 今日零决策卡 — Round 1 的主视觉
 * 用户进来看到的唯一主角：今天只需要养这一朵云
 */
export default function TodayDecisionCard({ task, onComplete, onEasier }: TodayDecisionCardProps) {
  return (
    <div
      style={{
        margin: '16px 16px 0',
        padding: '28px 24px 24px',
        borderRadius: '28px',
        background: 'linear-gradient(180deg, #FFF8F4 0%, #FFF1E8 100%)',
        border: '1px solid var(--hairline-subtle)',
        boxShadow:
          '0 12px 32px rgba(180, 100, 80, 0.10), 0 2px 6px rgba(180, 100, 80, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
      }}
    >
      {/* 小标签 — "今天养这朵云" */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          fontSize: 11,
          color: 'var(--ink-light)',
          fontFamily: 'var(--font-body)',
          marginBottom: 14,
        }}
      >
        <span>☁️</span>
        <span>今天养这朵云</span>
      </div>

      {/* 任务标题 — 主角 */}
      <h2
        style={{
          margin: '0 0 10px',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.25,
          letterSpacing: 'var(--tracking-heading)',
        }}
      >
        {task.title}
      </h2>

      {/* 温柔解释 */}
      <p
        style={{
          margin: '0 0 16px',
          fontSize: 14,
          color: 'var(--ink-light)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          maxWidth: '32ch',
        }}
      >
        不用完成很多，
        让今天轻轻往前一点就好。
      </p>

      {/* Meta — 时间 / 地点 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 12,
          color: 'var(--ink-light)',
          fontFamily: 'var(--font-body)',
          marginBottom: 22,
        }}
      >
        {task.time && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            ⏱ 预计 {task.time}
          </span>
        )}
        {task.place && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            📍 {task.place}
          </span>
        )}
      </div>

      {/* 主按钮 + 温柔出口 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onComplete}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(180deg, #A8E0B5 0%, #4AB574 100%)',
            color: 'white',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow:
              '0 4px 14px rgba(74, 181, 116, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
            transition: 'all var(--dur-fast) var(--ease-out-expo)',
          }}
        >
          完成这朵云
        </button>
        <button
          onClick={onEasier}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '14px',
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-light)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all var(--dur-fast)',
          }}
        >
          换一朵轻一点的
        </button>
      </div>
    </div>
  );
}
