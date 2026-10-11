import type { ActionReceipt, Project } from '../../types';
import { SoftButton } from '../ui';

interface ActionDoneCardProps {
  receipt: ActionReceipt;
  project: Project | undefined;
  onContinue: () => void;
  onRest: () => void;
}

/**
 * 状态 C — 完成反馈
 * 不庆祝过度,只陈述事实:这一步长进了云里。
 */
export default function ActionDoneCard({ receipt, project, onContinue, onRest }: ActionDoneCardProps) {
  return (
    <div className="clay-fade-up" style={{ margin: '16px 16px 0' }}>
      <div
        style={{
          padding: '20px',
          borderRadius: 'var(--radius-chunk)',
          background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.35), rgba(255, 255, 255, 0.6))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 6px 18px rgba(180, 100, 80, 0.10)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 6 }} aria-hidden>
          ☁️
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 6px',
          }}
        >
          这一步,长进云里了
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-light)', margin: '0 0 4px' }}>
          {project ? `「${project.title}」` : '这件事'} · {receipt.actionText}
        </p>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '0 0 16px' }}>
          约 {receipt.plannedMinutes} 分钟的一小步,已经留下了。
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <SoftButton variant="mint" size="md" block onClick={onContinue}>
            接着来
          </SoftButton>
          <SoftButton variant="ghost" size="md" block onClick={onRest}>
            今天到这里
          </SoftButton>
        </div>
      </div>
    </div>
  );
}
