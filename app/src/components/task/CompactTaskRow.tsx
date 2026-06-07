import { Task } from '../../types';

// CompactTaskRow — 紧凑任务行（参考图列表风格）
export const TYPE_INFO: Record<Task['type'], { icon: string; bg: string; color: string; label: string }> = {
  reading: { icon: '📖', bg: '#FFE2D5', color: '#C2410C', label: '阅读' },
  exercise: { icon: '🏃', bg: '#D1FAE5', color: '#047857', label: '运动' },
  coding: { icon: '💻', bg: '#DBEAFE', color: '#1D4ED8', label: '编码' },
  other: { icon: '✨', bg: '#F3E8FF', color: '#7E22CE', label: '其他' },
};

export function CompactTaskRow({
  task,
  completed,
  onComplete,
  onDelete,
}: {
  task: Task;
  completed?: boolean;
  onComplete?: () => void;
  onDelete?: () => void;
}) {
  const typeInfo = TYPE_INFO[task.type] || TYPE_INFO.other;

  return (
    <div
      className="shadow-tinted"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        marginBottom: '8px',
        borderRadius: '14px',
        background: completed
          ? 'linear-gradient(180deg, #F5FFF7 0%, #EDFAF0 100%)'
          : 'var(--surface-0)',
        border: completed
          ? '1px solid var(--mint-cloud-light)'
          : 'var(--hairline-subtle)',
        opacity: completed ? 0.85 : 1,
        transition: 'all var(--dur-fast) var(--ease-out-expo)',
      }}
    >
      {/* 类型色块 */}
      <div
        style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: typeInfo.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}
        aria-hidden
      >
        {typeInfo.icon}
      </div>

      {/* 标题 + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: completed ? 'var(--ink-light)' : 'var(--ink)',
            textDecoration: completed ? 'line-through' : 'none',
            textDecorationColor: 'var(--mint-cloud)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </div>
        {task.startPage !== undefined && task.endPage !== undefined && !completed && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-faint)',
              marginTop: '2px',
              fontFamily: 'var(--font-body)',
            }}
          >
            📖 {task.startPage} → {task.endPage} 页
          </div>
        )}
        {task.note && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-light)',
              fontStyle: 'italic',
              marginTop: '2px',
              fontFamily: 'var(--font-body)',
            }}
          >
            💭 {task.note}
          </div>
        )}
      </div>

      {/* 操作 */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {onComplete && !completed && (
          <button
            onClick={onComplete}
            aria-label="完成任务"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--mint-cloud-light)',
              color: 'var(--mint-cloud-text)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--dur-fast) var(--ease-out-expo)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.92)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✓
          </button>
        )}
        {completed && (
          <span
            aria-label="已完成"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--mint-cloud)',
              color: 'white',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✓
          </span>
        )}
        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm('删除这个任务？')) onDelete();
            }}
            aria-label="删除任务"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-faint)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
