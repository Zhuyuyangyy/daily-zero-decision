// ==================================================================
// Onboarding —— A-lite 首次激活
// 一屏完成：用户只需"输入想坚持什么 + 点生成"
// 不做多页教程，不介绍天空/云迹/番茄钟/心情
// 价值主张一上来就打在屏上：今天只做这一小步
// ==================================================================

import { useState, useEffect, useCallback, type CSSProperties } from 'react';

export interface OnboardingProps {
  onFinish: () => void;
  onSelect: (hint: string) => void; // 由父组件注入：用 hint 创建今日卡
  onTryDemo?: () => void; // 用户点"先看看示例"时填一张示范卡
}

const SUGGEST: { id: string; label: string; icon: string; hint: string }[] = [
  { id: 'reading',  label: '读书',   icon: '📖', hint: '读 2 页书' },
  { id: 'exercise', label: '运动',   icon: '🏃', hint: '出门走走 5 分钟' },
  { id: 'coding',   label: '写代码', icon: '💻', hint: '看 5 分钟代码' },
  { id: 'vocab',    label: '背单词', icon: '📝', hint: '背 5 个新词' },
];
// 每个 hint 已经被 parseTaskFromInput 解释成"今天只做这一小步"，数量字眼（2 页/5 分钟）是反例式的友好提示。

const INPUT_PLACEHOLDER = '或者输入你想坚持的事…';

export default function Onboarding({ onFinish, onSelect, onTryDemo }: OnboardingProps) {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  // 首次挂载：先透明，下一帧变不透明，让淡入动画跑得起来
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSelectPreset = useCallback(
    (s: { id: string; label: string; icon: string; hint: string }) => {
      onSelect(s.hint);
      onFinish();
    },
    [onSelect, onFinish]
  );

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    onSelect(inputValue.trim());
    onFinish();
  }, [inputValue, onSelect, onFinish]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="首次激活"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(74, 58, 51, 0.32)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 320ms var(--ease-out-quart)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          padding: '32px 28px 24px',
          borderRadius: 28,
          background: 'var(--warm-card)',
          border: '1px solid var(--warm-border)',
          boxShadow:
            '0 24px 60px rgba(180, 100, 80, 0.22), 0 8px 24px rgba(180, 100, 80, 0.10), inset 0 2px 3px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(248, 140, 130, 0.10)',
        }}
      >
        {/* 大云朵插画 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 8,
          }}
          aria-hidden
        >
          <svg viewBox="0 0 100 70" width="64" height="44" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="48" rx="18" ry="12" fill="#fff" opacity="0.95" />
            <ellipse cx="40" cy="32" rx="22" ry="20" fill="#fff" />
            <ellipse cx="62" cy="34" rx="20" ry="18" fill="#fff" opacity="0.95" />
            <ellipse cx="80" cy="50" rx="14" ry="12" fill="#fff" opacity="0.9" />
            {/* 暖粉橙光点 — 承诺 = 给你留一点温度 */}
            <circle cx="65" cy="18" r="3" fill="var(--warm-coral)" opacity="0.7" />
          </svg>
        </div>

        {/* 价值主张 + 副标 */}
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--ink)',
            textAlign: 'center',
            lineHeight: 1.35,
            letterSpacing: 'var(--tracking-heading)',
          }}
        >
          每天不知道从哪开始？
        </h1>
        <p
          style={{
            margin: '8px 0 18px',
            color: 'var(--ink-light)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            lineHeight: 1.55,
            textAlign: 'center',
          }}
        >
          我帮你把想坚持的事，
          <br />
          变成今天能完成的一小步。
        </p>

        {/* 输入区（可选展开） */}
        {showInput ? (
          <div style={{ marginBottom: 14 }}>
            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  e.preventDefault();
                  handleSubmit();
                } else if (e.key === 'Escape') {
                  setShowInput(false);
                  setInputValue('');
                }
              }}
              placeholder={INPUT_PLACEHOLDER}
              style={inputStyle}
              aria-label="想坚持的事"
            />
          </div>
        ) : (
          <>
            <p
              style={{
                color: 'var(--ink-light)',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                lineHeight: 1.4,
                textAlign: 'center',
                margin: '0 0 10px',
              }}
            >
              你想坚持什么？
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 14,
              }}
            >
              {SUGGEST.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectPreset(s)}
                  className="clay-suggest-chip"
                >
                  <span className="clay-suggest-chip__icon" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="clay-suggest-chip__label">{s.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {showInput ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="clay-btn clay-btn--mint clay-btn--lg clay-btn--block"
            style={{ minHeight: 48 }}
          >
            生成我的第一张今日卡
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="clay-btn clay-btn--ghost clay-btn--md clay-btn--block"
            >
              或者输入一句话…
            </button>
            <button
              type="button"
              onClick={() => {
                // 注入一张示范卡，让用户立刻看到完整主页
                if (onTryDemo) onTryDemo();
                onFinish();
              }}
              className="clay-btn clay-btn--text clay-btn--md clay-btn--block"
            >
              先看看示例
            </button>
          </div>
        )}

        <p
          style={{
            margin: '14px 0 0',
            color: 'var(--ink-faint)',
            fontSize: 11,
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          漏一天也没关系，
          <br />
          云不会骂你，明天回来就好。
        </p>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 16px',
  borderRadius: 14,
  border: '1px solid var(--mint-cloud)',
  background: 'var(--surface-0)',
  color: 'var(--ink)',
  fontSize: 15,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxShadow: '0 2px 8px rgba(74, 181, 116, 0.2)',
};
