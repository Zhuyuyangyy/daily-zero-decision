// ==================================================================
// Onboarding —— 首次启动 3 步引导（全屏浮层，淡入切换）
// ------------------------------------------------------------------
// 设计原则（来自 copy.ts 注释 + clay.css 设计令牌）：
//   - 不横滑、不炫技：每一步都是一次"呼吸"，按 OK 就走
//   - 文案直接写在组件里（一次性引导，没有变量），但与 copy.ts 同源语气
//   - 视觉：半透明暖米底 + 背后模糊，居中一张粘土卡 + 大云朵插画
//   - 进度点：右端那颗用 warm-coral，前两颗用 neutral-300
//   - 跳过极淡，存在感低，但永远在右上角
// ==================================================================

import { useState, useEffect, useCallback } from 'react';

export interface OnboardingProps {
  onFinish: () => void;
  onSkip?: () => void;
}

type Step = 0 | 1 | 2;

const STEPS: {
  title: string;
  body: string;
  cloudVariant: 0 | 1 | 2;
}[] = [
  {
    title: '今天少一朵云，明天补一朵',
    body: '每天说一句话，天空里就多一朵云。\n漏签了也没关系，云会飘回来。',
    cloudVariant: 0,
  },
  {
    title: '一片云都是自己挣的',
    body: '不说「再坚持一次」，不说「你断了」。\n这片天空，是你自己慢慢养出来的。',
    cloudVariant: 1,
  },
  {
    title: '那就开始吧',
    body: '点下面这朵云，去养今天的云 ☁️',
    cloudVariant: 2,
  },
];

// 复用 Celebration 里的软云絮 SVG 思路 —— 椭圆叠成，无硬边
function BigCloud({ variant }: { variant: 0 | 1 | 2 }) {
  if (variant === 0) {
    return (
      <svg
        viewBox="0 0 100 80"
        xmlns="http://www.w3.org/2000/svg"
        width={80}
        height={64}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <ellipse cx="20" cy="56" rx="20" ry="14" fill="#fff" opacity="0.9" />
        <ellipse cx="40" cy="38" rx="22" ry="20" fill="#fff" opacity="1" />
        <ellipse cx="65" cy="42" rx="20" ry="18" fill="#fff" opacity="0.95" />
        <ellipse cx="82" cy="58" rx="16" ry="14" fill="#fff" opacity="0.9" />
      </svg>
    );
  }
  if (variant === 1) {
    return (
      <svg
        viewBox="0 0 100 80"
        xmlns="http://www.w3.org/2000/svg"
        width={80}
        height={64}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <ellipse cx="22" cy="58" rx="22" ry="15" fill="#fff" opacity="0.95" />
        <ellipse cx="46" cy="36" rx="24" ry="22" fill="#fff" opacity="1" />
        <ellipse cx="72" cy="44" rx="20" ry="18" fill="#fff" opacity="0.95" />
        <ellipse cx="86" cy="60" rx="12" ry="11" fill="#fff" opacity="0.9" />
        {/* 一颗暖粉橙小光点，承诺 = 给你留一点温度 */}
        <circle cx="62" cy="22" r="3" fill="var(--warm-coral)" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 100 80"
      xmlns="http://www.w3.org/2000/svg"
      width={80}
      height={64}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <ellipse cx="20" cy="58" rx="18" ry="13" fill="#fff" opacity="0.85" />
      <ellipse cx="40" cy="38" rx="22" ry="20" fill="#fff" opacity="0.95" />
      <ellipse cx="62" cy="36" rx="22" ry="20" fill="#fff" opacity="1" />
      <ellipse cx="82" cy="56" rx="16" ry="14" fill="#fff" opacity="0.9" />
      {/* 开始：薄荷绿小芽，从云里冒出来一点点 */}
      <ellipse cx="50" cy="62" rx="2" ry="4" fill="var(--mint-cloud-deep)" opacity="0.75" />
      <ellipse cx="46" cy="60" rx="1.5" ry="2.5" fill="var(--mint-cloud)" opacity="0.7" />
    </svg>
  );
}

export default function Onboarding({ onFinish, onSkip }: OnboardingProps) {
  const [step, setStep] = useState<Step>(0);
  const [visible, setVisible] = useState(false);

  // 首次挂载：先透明，next frame 变不透明，让淡入动画跑得起来
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleNext = useCallback(() => {
    if (step < 2) {
      setStep((s) => (s + 1) as Step);
    } else {
      onFinish();
    }
  }, [step, onFinish]);

  const handlePrev = useCallback(() => {
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }, []);

  const handleSkip = useCallback(() => {
    if (onSkip) onSkip();
    onFinish();
  }, [onSkip, onFinish]);

  // 步骤切换时：先淡出，切换内容，再淡入
  const [contentVisible, setContentVisible] = useState(true);
  useEffect(() => {
    setContentVisible(false);
    const t = setTimeout(() => setContentVisible(true), 120);
    return () => clearTimeout(t);
  }, [step]);

  const current = STEPS[step];
  const isLast = step === 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="首次使用引导"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(74, 58, 51, 0.28)', // 暖墨色，半透明
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 320ms var(--ease-out-quart)',
        pointerEvents: 'auto',
      }}
    >
      {/* 跳过 —— fixed overlay 右上角 */}
      <button
        type="button"
        onClick={handleSkip}
        className="clay-focusable"
        aria-label="跳过引导"
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          minHeight: 44,
          minWidth: 44,
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          color: 'var(--warm-coral)',
          opacity: 0.55,
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: 0.5,
          cursor: 'pointer',
          borderRadius: 12,
          transition: 'opacity var(--dur-fast) var(--ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.55';
        }}
      >
        跳过
      </button>

      {/* 粘土卡 */}
      <div
        className="shadow-tinted-lg"
        style={{
          position: 'relative',
          width: 'calc(100% - 40px)',
          maxWidth: 360,
          padding: '32px 28px 24px',
          borderRadius: 28,
          background: 'var(--warm-card)',
          border: '1px solid var(--warm-border)',
          boxShadow:
            '0 20px 50px rgba(200, 140, 110, 0.18), 0 8px 20px rgba(200, 140, 110, 0.08), inset 0 2px 3px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(248, 140, 130, 0.08)',
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
          transition:
            'opacity 280ms var(--ease-out-quart), transform 280ms var(--ease-out-quart)',
        }}
      >
        {/* 大云朵插画 —— 卡片顶部 80px 高 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 80,
            marginBottom: 12,
          }}
        >
          <BigCloud variant={current.cloudVariant} />
        </div>

        {/* 标题 */}
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--ink)',
            textAlign: 'center',
            lineHeight: 1.25,
            letterSpacing: 'var(--tracking-heading)',
          }}
        >
          {current.title}
        </h1>

        {/* 说明 */}
        <p
          style={{
            margin: '14px 0 24px',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontWeight: 400,
            color: 'var(--ink-light)',
            textAlign: 'center',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            minHeight: 48,
          }}
        >
          {current.body}
        </p>

        {/* 进度点 —— 12px 圆 + 4px 间隔，最右一颗用 warm-coral */}
        <div
          role="presentation"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            marginBottom: 20,
          }}
        >
          {STEPS.map((_, i) => {
            const isRight = i === STEPS.length - 1;
            const isCurrent = i === step;
            return (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: isCurrent
                    ? isRight
                      ? 'var(--warm-coral)'
                      : 'var(--warm-amber)'
                    : 'var(--neutral-300)',
                  transition: 'background 220ms var(--ease-out-quart)',
                }}
              />
            );
          })}
        </div>

        {/* 操作行：上一步（文字按钮）+ 下一步（渐变主按钮） */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="clay-focusable"
              aria-label="上一步"
              style={{
                minHeight: 44,
                minWidth: 64,
                padding: '10px 8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-light)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: 12,
                transition: 'color var(--dur-fast) var(--ease-out-quart)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--ink-light)';
              }}
            >
              ← 上一步
            </button>
          ) : (
            // 占位：保持下一步按钮靠右
            <span aria-hidden="true" style={{ minWidth: 64 }} />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="clay-focusable"
            aria-label={isLast ? '开始使用' : '下一步'}
            style={{
              flex: 1,
              minHeight: 44,
              padding: '12px 20px',
              borderRadius: 22,
              border: 'none',
              background:
                'linear-gradient(180deg, var(--warm-coral) 0%, var(--warm-amber) 100%)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: 'pointer',
              boxShadow:
                '0 4px 12px rgba(255, 155, 133, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(200, 100, 80, 0.18)',
              transition:
                'transform var(--dur-fast) var(--ease-out-quart), box-shadow var(--dur-fast) var(--ease-out-quart)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1px)';
              e.currentTarget.style.boxShadow =
                'inset 0 3px 5px rgba(200, 100, 80, 0.25), inset 0 -1px 2px rgba(255, 255, 255, 0.3)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(255, 155, 133, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(200, 100, 80, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(255, 155, 133, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(200, 100, 80, 0.18)';
            }}
          >
            {isLast ? '那就开始吧 ☁️' : '下一步 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
