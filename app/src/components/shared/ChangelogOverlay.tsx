import { useEffect, useRef } from 'react';

interface ChangelogOverlayProps {
  title?: string;
  message: string;
  ctaLabel?: string;
  onClose: () => void;
}

/**
 * 轻量 modal：role=dialog + aria-modal + aria-labelledby + Esc 关闭 + focus CTA + 简单 focus trap。
 * 用于一次性 changelog 显示，不替代未来更重的 modal 系统。
 */
export function ChangelogOverlay({
  title = '更新',
  message,
  ctaLabel = '开始',
  onClose,
}: ChangelogOverlayProps) {
  const ctaRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'changelog-title';

  useEffect(() => {
    // 初始聚焦 CTA — 屏幕阅读器会读出 modal 内容
    ctaRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      // 简单 focus trap：Tab 在 modal 内循环
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-1, white)', borderRadius: 24, padding: 32,
          maxWidth: 360, width: '100%', textAlign: 'center',
        }}
      >
        <h2
          id={titleId}
          style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}
        >
          🎉 {title}
        </h2>
        <p
          style={{
            fontSize: 14, color: 'var(--ink-light)', margin: '0 0 16px',
            lineHeight: 1.6, whiteSpace: 'pre-line',
          }}
        >
          {message}
        </p>
        <button
          ref={ctaRef}
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 24px', borderRadius: 16, border: 'none',
            background: 'var(--mint-cloud-cta, #4AB574)', color: 'white',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
