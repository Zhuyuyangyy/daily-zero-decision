import { useEffect, useRef } from 'react';
import './PeaceCardInfoModal.css';

interface PeaceCardInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: number;
}

/**
 * 安心卡说明弹窗
 *
 * 不卖东西，只解释概念
 * 符合产品调性：柔软、不焦虑、允许休息
 */
export function PeaceCardInfoModal({ isOpen, onClose, cards }: PeaceCardInfoModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'peace-info-title';

  useEffect(() => {
    if (!isOpen) return;
    // 初始聚焦关闭按钮
    closeRef.current?.focus();

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="peace-info-overlay"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="peace-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>

        <div className="modal-header">
          <div className="peace-icon-large" aria-hidden="true">☁️</div>
          <h2 id={titleId}>安心卡是什么？</h2>
        </div>

        <div className="modal-content">
          <p className="peace-intro">
            有时候真的会太累。
          </p>

          <p className="peace-explain">
            如果你漏了一天，安心卡会自动保护你的连续记录一次。
          </p>

          <div className="peace-rules">
            <div className="rule">
              <span className="rule-icon" aria-hidden="true">🌱</span>
              <span>新用户默认获得 <strong>2 张</strong> 安心卡</span>
            </div>
            <div className="rule">
              <span className="rule-icon" aria-hidden="true">⭐</span>
              <span>连续 7 天回来，奖励 <strong>1 张</strong> 安心卡</span>
            </div>
            <div className="rule">
              <span className="rule-icon" aria-hidden="true">☁️</span>
              <span>最多持有 <strong>2 张</strong></span>
            </div>
            <div className="rule">
              <span className="rule-icon" aria-hidden="true">💤</span>
              <span>断签时自动消耗 1 张，天空不会责怪你</span>
            </div>
          </div>

          <div className="peace-cards-display" aria-label={`当前持有 ${cards} 张安心卡`}>
            <span className="cards-count">{cards}</span>
            <span className="cards-label">张安心卡</span>
          </div>

          <p className="peace-note">
            它不会伪造一朵云，<br />
            只是告诉你：明天回来也没关系。
          </p>
        </div>

        <div className="modal-footer">
          <p className="peace-quote">
            "漏一天也没关系，云不会骂你。"
          </p>
        </div>
      </div>
    </div>
  );
}
