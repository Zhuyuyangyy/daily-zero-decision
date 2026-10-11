import { SoftButton } from '../ui';

interface BrainDumpCardProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

/**
 * 状态 A — 脑内卸载(首页唯一入口)
 * "脑子里现在都有什么?全倒给我。"
 */
export default function BrainDumpCard({ value, onChange, onSubmit }: BrainDumpCardProps) {
  const canSubmit = value.trim().length > 0;
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
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 4px',
          }}
        >
          脑子里现在都有什么?
        </h2>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-light)', margin: '0 0 14px' }}>
          全倒给我。不用整理,想到什么写什么。
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="下午有高数作业,论文图还没改,想去跑步……"
          rows={4}
          aria-label="把脑子里的事情倒出来"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid var(--hairline)',
            background: 'var(--warm-canvas)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--ink)',
            resize: 'none',
            outline: 'none',
          }}
        />
        <div style={{ marginTop: 12 }}>
          <SoftButton
            variant="mint"
            size="lg"
            block
            disabled={!canSubmit}
            onClick={onSubmit}
            aria-label="把倒出来的事情交给我"
          >
            倒进来,告诉我下一件
          </SoftButton>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '10px 0 0', textAlign: 'center' }}>
          我只告诉你现在做哪一件,不会给你列清单。
        </p>
      </div>
    </div>
  );
}
