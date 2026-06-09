import { useEffect, useMemo, useState } from 'react';

interface CelebrationProps {
  onComplete?: () => void;
}

interface Particle {
  id: number;
  type: 'cloud' | 'star';
  color: string;
  width: number;
  height: number;
  dx: number;
  dy: number;
  delay: number;
  duration: number;
  startAngle: number;
  spin: number;
  variant: number;
}

// 软萌调色板 —— 只用 4 个主题 token
const SOFT_PALETTE = [
  'var(--mint-cloud-light)',
  'var(--warm-coral)',
  'var(--warm-amber)',
  'var(--warm-card)',
];

const EASE_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// 减弱模式下不读取 localStorage（少一次 IO）
function readStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem('daily-zero-decision');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const n = parsed?.streak?.current;
    return typeof n === 'number' && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function generateParticles(): Particle[] {
  // 60% 软云絮 / 40% 软星星 — 总数落在 15-20
  const cloudCount = 11; // ~ 60% of 18
  const starCount = 7;   // ~ 40% of 18
  const particles: Particle[] = [];

  for (let i = 0; i < cloudCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 100;
    particles.push({
      id: i,
      type: 'cloud',
      color: SOFT_PALETTE[Math.floor(Math.random() * SOFT_PALETTE.length)],
      width: 26 + Math.random() * 10,   // mini cloud total bbox
      height: 16 + Math.random() * 6,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.85,
      delay: Math.random() * 280,
      duration: 1200 + Math.random() * 300,
      startAngle: Math.random() * 360,
      spin: 180 + Math.random() * 360,
      variant: Math.floor(Math.random() * 2), // 0 or 1 cloud silhouette
    });
  }

  for (let i = 0; i < starCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 220 + Math.random() * 90;
    particles.push({
      id: cloudCount + i,
      type: 'star',
      color: SOFT_PALETTE[Math.floor(Math.random() * SOFT_PALETTE.length)],
      width: 14 + Math.random() * 8,
      height: 14 + Math.random() * 8,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.85,
      delay: Math.random() * 280,
      duration: 1200 + Math.random() * 300,
      startAngle: Math.random() * 360,
      spin: 360 + Math.random() * 360,
      variant: Math.floor(Math.random() * 2), // 0 star, 1 petal
    });
  }

  return particles;
}

/* ----------------------------------------------------------------
   软云絮 SVG —— 3-4 个椭圆叠成，无硬边，圆角羽化感
   ---------------------------------------------------------------- */
function SoftCloud({ width, height, color, variant }: { width: number; height: number; color: string; variant: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 14"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      {variant === 0 ? (
        <g>
          <ellipse cx="6.5"  cy="9.2" rx="5.5" ry="4.2" fill={color} />
          <ellipse cx="11"   cy="6.4" rx="4.2" ry="4"   fill={color} />
          <ellipse cx="15.5" cy="5.2" rx="3.4" ry="3.4" fill={color} />
          <ellipse cx="19"   cy="8.6" rx="3.6" ry="3.2" fill={color} />
        </g>
      ) : (
        <g>
          <ellipse cx="7"    cy="9"   rx="5"   ry="3.8" fill={color} />
          <ellipse cx="12"   cy="6"   rx="4.6" ry="4.2" fill={color} />
          <ellipse cx="17"   cy="8.4" rx="4"   ry="3.4" fill={color} />
        </g>
      )}
    </svg>
  );
}

/* ----------------------------------------------------------------
   软星星 / 花瓣 SVG —— 圆角 + 软边，绝不锐利
   variant 0: 五角星（圆角化）
   variant 1: 花瓣（心形 + 圆头）
   ---------------------------------------------------------------- */
function SoftSparkle({ size, color, variant }: { size: number; color: string; variant: number }) {
  if (variant === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* 圆角五角星：外圆 R=5, 内圆 r=2.4，配合 stroke-linejoin: round 让尖角变软 */}
        <path
          d="M6 0.8
             L7.18 4.36
             L10.96 4.6
             L8.1 6.96
             L8.96 10.6
             L6 8.66
             L3.04 10.6
             L3.9 6.96
             L1.04 4.6
             L4.82 4.36 Z"
          fill={color}
          stroke={color}
          strokeWidth="0.9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // 花瓣：4 片圆头椭圆
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <ellipse cx="6" cy="2.4" rx="1.6" ry="2.2" fill={color} />
      <ellipse cx="6" cy="9.6" rx="1.6" ry="2.2" fill={color} />
      <ellipse cx="2.4" cy="6" rx="2.2" ry="1.6" fill={color} />
      <ellipse cx="9.6" cy="6" rx="2.2" ry="1.6" fill={color} />
      <circle cx="6" cy="6" r="1.1" fill={color} />
    </svg>
  );
}

export function Celebration({ onComplete }: CelebrationProps) {
  const [active, setActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const particles = useMemo(() => generateParticles(), []);

  useEffect(() => {
    // 读 streak 用于弹出符号（不导入 storage.ts，只读 localStorage）
    setStreak(readStreak());

    // 启动动画
    const raf = requestAnimationFrame(() => setActive(true));
    // 总时长：粒子最长 ~1.5s + 一点缓冲；弹出符号在 0.3s 开始 0.9s 持续
    const totalMs = 1700;
    const timer = setTimeout(() => onComplete?.(), totalMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onComplete]);

  // 云朵联动：把一只"领飞"云固定在稍偏左上（屏幕中心相对位置），让它在 0ms 弹一下
  // 位置：dx = -40, dy = -60 —— 距离中心 72px，避开完全中心位置（让"+"更醒目）
  // 关键：云朵大小按 streak 累积缩放，让"我养出来的"有时间累积感
  //   streak=1: 44px、streak=7: 56px、streak=30: 72px、streak=100: 96px
  const growth = Math.min(2, 1 + Math.log10(Math.max(1, streak)) * 0.7);
  const leadCloud = {
    dx: -40,
    dy: -60,
    delay: 0,
    duration: 700,
    color: 'var(--mint-cloud-light)',
    width: Math.round(44 * growth),
    height: Math.round(26 * growth),
    variant: 0,
  };

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .celebration-particle,
          .celebration-lead-cloud,
          .celebration-streak-pop {
            transition: opacity 280ms ease-out !important;
            transform: none !important;
            animation: none !important;
          }
          .celebration-particle {
            opacity: 0 !important;
          }
          .celebration-streak-pop {
            opacity: 0.9 !important;
            transform: translate(-50%, -50%) scale(1) !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
        {/* 云朵联动：屏幕中心附近 0ms 弹一下的大云 */}
        {active && (
          <div
            className="celebration-lead-cloud absolute"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: 'center',
              willChange: 'transform, opacity',
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: 1,
              animation: 'celebrate-lead-cloud-pop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <SoftCloud
              width={leadCloud.width}
              height={leadCloud.height}
              color={leadCloud.color}
              variant={leadCloud.variant}
            />
            <style>{`
              @keyframes celebrate-lead-cloud-pop {
                0%   { transform: translate(-50%, -50%) scale(1)   rotate(0deg); opacity: 0; }
                18%  { transform: translate(-50%, -50%) scale(1.15) rotate(-4deg); opacity: 1; }
                45%  { transform: translate(calc(-50% + ${leadCloud.dx}px), calc(-50% + ${leadCloud.dy}px)) scale(1.1) rotate(-2deg); opacity: 1; }
                100% { transform: translate(calc(-50% + ${leadCloud.dx * 1.2}px), calc(-50% + ${leadCloud.dy * 1.2 - 12}px)) scale(0.92) rotate(2deg); opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {/* 散开粒子：从中心四散飞出 */}
        {particles.map((p) => {
          const finalTransform = `translate(calc(-50% + ${p.dx}px), calc(-50% + ${p.dy}px)) scale(0.8) rotate(${p.startAngle + p.spin}deg)`;
          const initialTransform = `translate(-50%, -50%) scale(0) rotate(${p.startAngle}deg)`;
          const fadeStart = p.delay + p.duration * 0.45;
          return (
            <div
              key={p.id}
              className="celebration-particle absolute"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: 'center',
                willChange: 'transform, opacity',
                transform: active ? finalTransform : initialTransform,
                opacity: active ? 0 : 1,
                transition: `transform ${p.duration}ms ${EASE_BACK} ${p.delay}ms, opacity ${Math.round(p.duration * 0.55)}ms ease-out ${Math.round(fadeStart)}ms`,
              }}
            >
              {p.type === 'cloud' ? (
                <SoftCloud width={p.width} height={p.height} color={p.color} variant={p.variant} />
              ) : (
                <SoftSparkle size={p.width} color={p.color} variant={p.variant} />
              )}
            </div>
          );
        })}

        {/* 连续天数弹出：屏幕中央 0.3s 后 fade-in 大号符号，cubic-bezier 微超调后 fade-out */}
        <div
          className="celebration-streak-pop absolute"
          style={{
            left: '50%',
            top: '50%',
            transformOrigin: 'center',
            willChange: 'transform, opacity',
            transform: 'translate(-50%, -50%) scale(0.6)',
            opacity: 0,
            animation: 'celebrate-streak-pop 1100ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms forwards',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '5rem',
            lineHeight: 1,
            color: 'var(--warm-coral)',
            textShadow:
              '0 4px 16px rgba(255, 155, 133, 0.35), 0 1px 2px rgba(255, 255, 255, 0.8)',
            letterSpacing: '-0.02em',
            userSelect: 'none',
          }}
        >
          <style>{`
            @keyframes celebrate-streak-pop {
              0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
              35%  { transform: translate(-50%, -50%) scale(1.18); opacity: 1; }
              55%  { transform: translate(-50%, -50%) scale(1.0); opacity: 1; }
              100% { transform: translate(-50%, -55%) scale(0.95); opacity: 0; }
            }
          `}</style>
          {streak > 1 ? `+${streak}` : '+'}
        </div>
      </div>
    </>
  );
}

export default Celebration;
