import { useMemo } from 'react';
import Cloud from './Cloud';
import { copy } from '../../utils/copy';

/**
 * HeroSky — 首屏 Hero 区域（暖粉橙晨昏天空）
 *
 * 设计要点：
 *  - 35vh 高度的 rounded-[36px] 容器（var(--radius-hero)）
 *  - 暖粉橙大渐变（按 mood 调整冷暖/金度）
 *  - 右上角柔光太阳（sunny/golden 时出现 sun-rays）
 *  - 3-5 朵薄荷绿云朵（远景 + 近景分层）
 *  - 居中略偏右的云朵大吉祥物（用 Cloud 组件）
 *  - 容器底部 horizon glow、整体 inset shadow 让天空"凹"进去
 *  - 极淡噪点（var(--noise-svg)）
 */

export type HeroMood = 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

export interface HeroSkyProps {
  mood: HeroMood;
  streakCurrent: number;
  className?: string;
}

// ---- mood → 渐变 token 映射 ---------------------------------------------
// 全部走 theme/clay.css 的 --sky-dawn-* / --warm-* token；
// 1=顶部 4=底部；3 段 + 兜底
const MOOD_GRADIENT: Record<HeroMood, {
  from: string; via: string; to: string;
  sunGlow: string;
  sunCore: string;
  sunRays: boolean;
  horizonTint: string;
  innerShadow: string;
  cloudShadow: string;
}> = {
  dawn: {
    from: 'var(--sky-dawn-1)',                                    // 顶部：高光蜜桃
    via: 'var(--sky-dawn-2)',                                     // 中部：暖蜜桃
    to: 'var(--sky-dawn-3)',                                      // 底部：粉橙
    sunGlow: 'rgba(255, 220, 180, 0.45)',
    sunCore: 'rgba(255, 235, 210, 0.85)',
    sunRays: false,
    horizonTint: 'rgba(255, 200, 170, 0.35)',
    innerShadow: 'inset 0 -8px 24px rgba(180,100,90,0.10), inset 0 4px 14px rgba(255, 240, 225, 0.55)',
    cloudShadow: 'rgba(190, 140, 150, 0.25)',
  },
  morning: {
    from: 'var(--sky-dawn-1)',
    via: 'var(--sky-dawn-2)',
    to: 'var(--sky-dawn-4)',                                      // 暖度+1：底部更橙
    sunGlow: 'rgba(255, 220, 170, 0.50)',
    sunCore: 'rgba(255, 240, 210, 0.90)',
    sunRays: false,
    horizonTint: 'rgba(255, 190, 150, 0.42)',
    innerShadow: 'inset 0 -8px 24px rgba(180,100,90,0.10), inset 0 4px 14px rgba(255, 240, 225, 0.55)',
    cloudShadow: 'rgba(190, 140, 150, 0.25)',
  },
  clear: {
    from: 'var(--sky-dawn-2)',                                    // 暖度+1：顶部往下挪一档
    via: 'var(--sky-dawn-3)',
    to: 'var(--warm-coral)',                                      // 暖度+2
    sunGlow: 'rgba(255, 215, 160, 0.55)',
    sunCore: 'rgba(255, 235, 200, 0.92)',
    sunRays: false,
    horizonTint: 'rgba(255, 180, 130, 0.48)',
    innerShadow: 'inset 0 -8px 24px rgba(180,100,90,0.12), inset 0 4px 14px rgba(255, 235, 220, 0.55)',
    cloudShadow: 'rgba(190, 140, 150, 0.26)',
  },
  sunny: {
    from: 'var(--sky-dawn-2)',
    via: 'var(--sky-dawn-4)',
    to: 'var(--warm-coral)',                                      // 暖度+3
    sunGlow: 'rgba(255, 210, 140, 0.60)',
    sunCore: 'rgba(255, 240, 195, 0.95)',
    sunRays: false,                                                // 仅有 golden 才显示 rays
    horizonTint: 'rgba(255, 170, 110, 0.55)',
    innerShadow: 'inset 0 -8px 24px rgba(180,100,90,0.13), inset 0 4px 14px rgba(255, 230, 215, 0.55)',
    cloudShadow: 'rgba(190, 140, 150, 0.28)',
  },
  golden: {
    from: 'var(--sky-dawn-3)',                                    // 暖+金：顶部直接到粉橙
    via: 'var(--warm-amber)',                                     // 中部暖琥珀
    to: 'var(--warm-coral)',                                      // 底部粉珊瑚
    sunGlow: 'rgba(255, 200, 120, 0.70)',
    sunCore: 'rgba(255, 245, 210, 1)',
    sunRays: true,
    horizonTint: 'rgba(255, 160, 90, 0.60)',
    innerShadow: 'inset 0 -8px 26px rgba(180, 90, 70, 0.16), inset 0 4px 14px rgba(255, 225, 205, 0.55)',
    cloudShadow: 'rgba(200, 140, 110, 0.32)',
  },
};

// ---- 容器内静态"小云"（薄荷绿 SVG 形状） ---------------------------------
// 3-5 朵：2 朵远景（淡、小、blurred）+ 2-3 朵近景（饱和、大、带 mint 渐变）

interface MiniCloud {
  id: string;
  x: number;          // 0-100 (% of container width)
  y: number;          // 0-100 (% of container height)
  scale: number;      // 0.4-1.0
  opacity: number;
  blur: number;       // px
  drift: number;      // animation duration seconds
  delay: number;      // animation delay seconds
  variant: 'far' | 'near';
}

function buildClouds(): MiniCloud[] {
  return [
    // 远景（淡、小、blurred）
    { id: 'far-a', x: 14, y: 22, scale: 0.55, opacity: 0.55, blur: 3.5, drift: 18, delay: 0,    variant: 'far' },
    { id: 'far-b', x: 82, y: 36, scale: 0.48, opacity: 0.50, blur: 4.0, drift: 22, delay: 1.5,  variant: 'far' },
    { id: 'far-c', x: 45, y: 14, scale: 0.40, opacity: 0.45, blur: 4.5, drift: 26, delay: 3.0,  variant: 'far' },
    // 近景（饱和、大、薄荷绿渐变）
    { id: 'near-a', x: 22, y: 58, scale: 0.95, opacity: 0.92, blur: 0, drift: 9,  delay: 0.3,  variant: 'near' },
    { id: 'near-b', x: 78, y: 64, scale: 0.85, opacity: 0.88, blur: 0, drift: 11, delay: 1.8,  variant: 'near' },
  ];
}

// 薄荷云 SVG（极简版本：3 个相连圆 + 底部椭圆，mint 渐变 + drop shadow）
function MiniCloudSVG({ cloud, shadowColor }: { cloud: MiniCloud; shadowColor: string }) {
  if (cloud.variant === 'far') {
    // 远景：单色 + 高斯模糊，shape 极简
    return (
      <g style={{ filter: `blur(${cloud.blur}px)` }} opacity={cloud.opacity}>
        <ellipse cx="0" cy="0" rx="22" ry="8"  fill="var(--mint-cloud-light)" />
        <ellipse cx="-12" cy="-3" rx="9" ry="7" fill="var(--mint-cloud-light)" />
        <ellipse cx="8"   cy="-5" rx="11" ry="9" fill="var(--mint-cloud-light)" />
        <ellipse cx="18"  cy="-1" rx="8" ry="6" fill="var(--mint-cloud-light)" />
      </g>
    );
  }
  // 近景：mint 渐变 + drop shadow（落影投到天上）+ 顶部高光
  return (
    <g
      style={{
        filter: `drop-shadow(0 6px 10px ${shadowColor}) drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5))`,
      }}
      opacity={cloud.opacity}
    >
      {/* 底部 underbelly 暗面 */}
      <ellipse cx="0" cy="6" rx="28" ry="6" fill="var(--mint-cloud-deep)" opacity="0.35" />
      {/* 主体：3 圆 + 底部椭圆 */}
      <ellipse cx="0"  cy="2"  rx="28" ry="11" fill="var(--mint-cloud)" />
      <ellipse cx="-14" cy="-4" rx="11" ry="9"  fill="var(--mint-cloud)" />
      <ellipse cx="6"  cy="-7" rx="13" ry="11" fill="var(--mint-cloud)" />
      <ellipse cx="20" cy="-2" rx="9"  ry="7"  fill="var(--mint-cloud)" />
      {/* 顶部高光 */}
      <ellipse cx="0"  cy="-7" rx="14" ry="3" fill="var(--mint-cloud-light)" opacity="0.85" />
      <ellipse cx="-2" cy="-10" rx="4"  ry="1.5" fill="#FFFFFF" opacity="0.7" />
    </g>
  );
}

// ---- component ---------------------------------------------------------

export default function HeroSky({ mood, streakCurrent: _streakCurrent, className = '' }: HeroSkyProps) {
  const t = MOOD_GRADIENT[mood] ?? MOOD_GRADIENT.morning;
  const clouds = useMemo(buildClouds, []);
  const isGolden = t.sunRays;
  // streakCurrent 当前未直接参与布局；为后续"连击天数→金度微调"预留接口
  void _streakCurrent;

  return (
    <div className={`w-full ${className}`}>
      <div
        className="clay-noise hero-sky"
        style={{
          position: 'relative',
          width: '100%',
          height: '35vh',
          minHeight: 280,
          maxHeight: 340,
          overflow: 'hidden',
          borderRadius: 'var(--radius-hero)',
          // 暖粉橙大渐变（180deg）
          background: `linear-gradient(180deg, ${t.from} 0%, ${t.via} 50%, ${t.to} 100%)`,
          // 让天空"凹"进去的双 inset shadow + 轻微外阴影
          boxShadow: `${t.innerShadow}, var(--shadow-clay-deep)`,
          transition: 'background 1.6s var(--ease-out-quart), box-shadow 1.6s var(--ease-out-quart)',
        }}
      >
        {/* ---- 1) 柔光太阳（右上角，约 200px） -------------------------- */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '6%',
            top: '12%',
            width: 200,
            height: 200,
            transform: 'translate(0, 0)',
            background: `radial-gradient(circle, ${t.sunGlow} 0%, rgba(255, 220, 180, 0.18) 45%, transparent 72%)`,
            filter: 'blur(10px)',
            pointerEvents: 'none',
            transition: 'background 1.6s var(--ease-out-quart)',
          }}
        />
        {/* 太阳本体（柔和的核） */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '10%',
            top: '16%',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${t.sunCore} 0%, rgba(255, 220, 180, 0.35) 55%, transparent 80%)`,
            filter: 'blur(1.5px)',
            pointerEvents: 'none',
            transition: 'background 1.6s var(--ease-out-quart)',
          }}
        />

        {/* ---- 2) Sun rays（仅 golden 显示，3-5 道） ---------------------- */}
        {isGolden && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.55,
            }}
          >
            <g stroke="rgba(255, 220, 150, 0.55)" strokeWidth="0.5" strokeLinecap="round" fill="none">
              <line x1="78" y1="22" x2="78" y2="6"  />
              <line x1="70" y1="24" x2="60" y2="10" />
              <line x1="86" y1="24" x2="96" y2="10" />
              <line x1="64" y1="30" x2="50" y2="22" />
              <line x1="92" y1="30" x2="98" y2="22" />
            </g>
          </svg>
        )}

        {/* ---- 3) 远景 + 近景薄荷云（SVG 层，3-5 朵） ------------------- */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          >
            {clouds.map((c) => (
              <g
                key={c.id}
                transform={`translate(${c.x} ${c.y}) scale(${c.scale})`}
                className={`hero-mini-cloud hero-mini-cloud--${c.variant}`}
                style={
                  {
                    '--drift-duration': `${c.drift}s`,
                    '--drift-delay': `${c.delay}s`,
                  } as React.CSSProperties
                }
              >
                <MiniCloudSVG cloud={c} shadowColor={t.cloudShadow} />
              </g>
            ))}
          </svg>
        </div>

        {/* ---- 4) Horizon glow（容器底部暖色辉光） ---------------------- */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '38%',
            background: `linear-gradient(180deg, transparent 0%, ${t.horizonTint} 100%)`,
            pointerEvents: 'none',
            transition: 'background 1.6s var(--ease-out-quart)',
          }}
        />

        {/* ---- 5) 云朵大吉祥物（约 30% 高度，居中略偏右） ---------------- */}
        <div
          aria-hidden
          className="hero-mascot"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '6%',
            transform: 'translateX(20%)',     // 居中略偏右
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '30%', minWidth: 96, maxWidth: 168, height: 'auto' }}>
            <Cloud
              mood={isGolden ? 'happy' : 'calm'}
              size="md"
            />
          </div>
        </div>

        {/* ---- 6) 顶部 inner-rim 极淡高光线（让"碗"更立体） -------------- */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '8%',
            right: '8%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.65) 50%, transparent 100%)',
            pointerEvents: 'none',
            opacity: 0.7,
          }}
        />

        {/* ---- 7) H1 标题 + 副标（覆盖在天空底部） ------------------------ */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 3,
            width: '90%',
          }}
        >
          <h1
            className="clay-text-h1 clay-balance tracking-display"
            style={{
              margin: 0,
              textShadow: '0 2px 12px rgba(255, 240, 225, 0.8)',
            }}
          >
            {copy.title()}
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              color: 'var(--ink-light)',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              lineHeight: 'var(--leading-relaxed)',
              textShadow: '0 1px 8px rgba(255, 240, 225, 0.6)',
              maxWidth: '28ch',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {copy.subtitle()}
          </p>
        </div>
      </div>

      {/* ---- scoped styles --------------------------------------------- */}
      <style>{`
        .hero-sky {
          will-change: background, box-shadow;
        }

        /* 薄荷云漂浮（极轻缓） */
        .hero-mini-cloud {
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-mini-drift var(--drift-duration, 12s) cubic-bezier(0.25, 1, 0.5, 1) var(--drift-delay, 0s) infinite alternate;
        }
        @keyframes hero-mini-drift {
          0%   { transform: translate(0, 0)     scale(var(--base-scale, 1)); }
          100% { transform: translate(0, -3px)  scale(var(--base-scale, 1)); }
        }
        .hero-mini-cloud--near { --base-scale: 1; }
        .hero-mini-cloud--far  { --base-scale: 1; }

        /* 大吉祥物轻微上下浮动 */
        .hero-mascot > div {
          animation: hero-mascot-float 6s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;
        }
        @keyframes hero-mascot-float {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        /* Reduced motion: 停掉所有漂浮 */
        @media (prefers-reduced-motion: reduce) {
          .hero-mini-cloud,
          .hero-mascot > div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
