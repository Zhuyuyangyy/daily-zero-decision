import type { NextAction, DumpCategory } from '../../utils/zeroDecisionEngine';
import { SoftButton } from '../ui';

const CATEGORY_ICON: Record<DumpCategory, string> = {
  study: '📚',
  project: '💻',
  life: '🧺',
  body: '🏃',
  rest: '🌙',
};

interface OneActionCardProps {
  action: NextAction;
  projectTitle: string;
  onComplete: () => void;
  onShrink: () => void;
  onAlternative: () => void;
  canAlternative: boolean;
}

/**
 * 状态 B — 唯一动作卡(Zero Decision 的主角)
 * 屏幕上只有这一个动作;[就做这一步]之外只剩两个很弱的按钮。
 */
export default function OneActionCard({
  action,
  projectTitle,
  onComplete,
  onShrink,
  onAlternative,
  canAlternative,
}: OneActionCardProps) {
  const icon = CATEGORY_ICON[action.category] ?? '✨';
  return (
    <div className="clay-fade-up" style={{ margin: '16px 16px 0' }}>
      <div
        style={{
          padding: '20px',
          borderRadius: 'var(--radius-chunk)',
          background: 'var(--surface-1)',
          border: 'var(--hairline-subtle)',
          boxShadow: '0 6px 18px rgba(180, 100, 80, 0.10)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(134, 239, 172, 0.25)',
              border: '1px solid rgba(111, 190, 140, 0.45)',
              fontSize: 12,
              fontWeight: 700,
              color: '#2F6B45',
            }}
          >
            <span aria-hidden>{icon}</span>
            {projectTitle}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>约 {action.minutes} 分钟</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.45,
            color: 'var(--ink)',
            margin: '0 0 8px',
          }}
        >
          {action.action}
        </h2>

        <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '0 0 16px' }}>
          {action.reason}。不用完成很多,这一步就算数。
        </p>

        <SoftButton variant="mint" size="lg" block onClick={onComplete} aria-label="完成这一小步">
          就做这一步
        </SoftButton>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <SoftButton
            variant="text"
            size="md"
            block
            disabled={!action.canSmaller}
            onClick={onShrink}
            aria-label="把这一步缩得更小"
          >
            再小一点
          </SoftButton>
          <SoftButton
            variant="text"
            size="md"
            block
            disabled={!canAlternative}
            onClick={onAlternative}
            aria-label="换一件事做"
          >
            换一个
          </SoftButton>
        </div>
      </div>
    </div>
  );
}
