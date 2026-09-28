import { useEffect, useState } from 'react';

export interface SkyNameModalProps {
  isOpen: boolean;
  currentName: string;
  /** 确认命名;返回 false 表示空名(由调用方保留弹窗) */
  onConfirm: (name: string) => boolean;
  onClose: () => void;
}

const SUGGESTIONS = ['我的天空', '晴天花圃', '云上小院', '慢慢天', '向阳坡'];

/**
 * SkyNameModal — 给天空起名字
 *
 * 时机:完成首卡之后(与宠物命名同场情感高点),用户可跳过。
 * 轻量 modal:与 PetNameModal 同构(role=dialog + Esc + focus + 简单 trap),
 * 但用 state.skyNamed 持久化"已处理过"。
 */
export function SkyNameModal({ isOpen, currentName, onConfirm, onClose }: SkyNameModalProps) {
  const [name, setName] = useState(currentName || '我的天空');

  useEffect(() => {
    if (isOpen) setName(currentName || '我的天空');
  }, [isOpen, currentName]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (onConfirm(name.trim())) return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, name, onConfirm, onClose]);

  if (!isOpen) return null;

  const submit = () => {
    onConfirm(name.trim());
  };

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(4px)',
        animation: 'sky-name-fade 220ms var(--ease-out-expo, ease-out)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sky-name-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-0, #FFFAF3)',
          borderRadius: 24,
          padding: '28px 24px',
          maxWidth: 340,
          width: '100%',
          border: 'var(--hairline-subtle, 1px solid rgba(245, 220, 200, 0.6))',
          boxShadow: '0 18px 44px rgba(120, 90, 70, 0.22)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 6 }} aria-hidden>☁️</div>
        <h2
          id="sky-name-modal-title"
          style={{
            margin: '0 0 6px',
            fontSize: 19,
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--font-display)',
          }}
        >
          给你的天空起个名字
        </h2>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--ink-light)',
            fontFamily: 'var(--font-body)',
          }}
        >
          从今天起，这片天空就是你的了。<br />起个名字，它会一直在这里。
        </p>

        <input
          aria-label="天空的名字"
          maxLength={8}
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 14,
            border: '1px solid var(--warm-border, #F5DCC8)',
            background: 'var(--surface-1, #FFF5EC)',
            color: 'var(--ink)',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            outline: 'none',
            minHeight: 44,
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '12px 0 18px' }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="clay-chip"
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => setName(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 14,
              background: 'var(--surface-2, #FFE9D6)',
              color: 'var(--ink-light)',
              border: 'var(--hairline, 1px solid rgba(245, 220, 200, 0.8))',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              minHeight: 44,
              cursor: 'pointer',
            }}
          >
            以后再说
          </button>
          <button
            type="button"
            onClick={submit}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 14,
              background: 'var(--mint-cloud-cta, #4AB574)',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 14,
              minHeight: 44,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(74, 181, 116, 0.35)',
            }}
          >
            就是它了
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sky-name-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
