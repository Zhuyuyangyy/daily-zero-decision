import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { copy } from '../../utils/copy';

interface RealCloudProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'mint' | 'coral' | 'lavender' | 'warm';
  state?: 'default' | 'today' | 'completed';
  mood?: 'calm' | 'happy' | 'celebrate';
  type?: 'reading' | 'exercise' | 'coding' | 'other';
  expression?: 'calm' | 'happy' | 'sleep' | 'wink' | 'neutral';
  /** 点击云朵的额外回调（如统计埋点）；萌互动始终内置 */
  onPoke?: () => void;
}

const SIZE_MAP = {
  xs: 48,
  sm: 64,
  md: 100,
  lg: 160,
};

/** 摸云互动时长(ms):squash + 萌语冒泡都在这个窗口内 */
const POKE_MS = 900;

/**
 * RealCloud — CSS 实现的"真云"
 * 用多个 div + radial-gradient + blur 模拟体积/层叠/光感
 * 通过 type 和 expression 参数实现差异化外观
 *
 * 萌互动(内置,零配置):
 * - 点击 → squash&stretch 软弹动画 + 眨眼(wink)瞬切
 * - 冒出一条摸云萌语气泡(少量 emoji 星星粒子)
 * - 尊重 prefers-reduced-motion:只冒泡,不弹跳
 */
export default function RealCloud({
  size = 'md',
  color = 'warm',
  state = 'default',
  mood = 'calm',
  type = 'other',
  expression = 'calm',
  onPoke,
}: RealCloudProps) {
  const px = SIZE_MAP[size];
  const isCelebrate = mood === 'celebrate' || state === 'completed';

  // ---- 摸云互动状态 ----
  const [poked, setPoked] = useState(false);
  const [pokeLine, setPokeLine] = useState<string | null>(null);
  const pokeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    try {
      reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reducedMotionRef.current = false;
    }
    return () => {
      if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
    };
  }, []);

  const handlePoke = useCallback(() => {
    onPoke?.();
    setPoked(true);
    setPokeLine(copy.pokeLine());
    if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = setTimeout(() => {
      setPoked(false);
      setPokeLine(null);
    }, POKE_MS);
  }, [onPoke]);

  // 键盘可达:Enter/Space 触发
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePoke();
      }
    },
    [handlePoke],
  );

  const colors = useMemo(() => {
    switch (color) {
      case 'mint': return { main: '#E0FFF0', shadow: '#A4E9C4', rim: 'rgba(168, 232, 200, 0.6)' };
      case 'coral': return { main: '#FFF0F0', shadow: '#F8C8C8', rim: 'rgba(248, 200, 200, 0.6)' };
      case 'lavender': return { main: '#F0F0FF', shadow: '#D0C8F8', rim: 'rgba(208, 200, 248, 0.6)' };
      default: return { main: '#FFFFFF', shadow: '#F8E8E0', rim: 'rgba(255, 255, 255, 0.7)' };
    }
  }, [color]);

  // 阴影/光感增强
  const puffStyle = {
    borderRadius: '50%',
    transition: 'all 0.3s ease-out'
  };

  // 根据 type 决定云的形状
  const typeStyles = useMemo(() => {
    switch (type) {
      case 'reading': // 书页云：扁平一些
        return {
          width: px * 1.1,
          height: px * 0.5,
          borderRadius: '30% 70% 60% 40% / 50% 40% 60% 50%', // 不规则边缘
        };
      case 'exercise': // 散步云：更圆润，像棉花
        return {
          width: px * 0.9,
          height: px * 0.65,
          borderRadius: '50% 50% 50% 50%',
        };
      case 'coding': // 编码云：稍微方正一点
        return {
          width: px,
          height: px * 0.55,
          borderRadius: '20% 80% 40% 60% / 50% 30% 70% 50%',
        };
      default: // 其他：标准圆云
        return {
          width: px,
          height: px * 0.6,
          borderRadius: '50% 50% 50% 50%',
        };
    }
  }, [type, px]);

  // 被摸时强制 wink;平时用传入的 expression
  const effectiveExpression: RealCloudProps['expression'] = poked ? 'wink' : expression;

  // 表情实现（通过 CSS 伪元素或绝对定位的小圆点）
  const renderExpression = () => {
    if (isCelebrate) return null; // 庆祝态不显示表情

    const eyeStyle: React.CSSProperties = {
      position: 'absolute',
      width: px * 0.06,
      height: px * 0.06,
      borderRadius: '50%',
      background: 'var(--ink)',
      zIndex: 10
    };

    const mouthStyle: React.CSSProperties = {
      position: 'absolute',
      width: px * 0.1,
      height: px * 0.05,
      borderRadius: '0 0 50% 50%',
      border: `1.5px solid var(--ink)`,
      zIndex: 10
    };

    // 摸云瞬间的"^ ^"眯眼(比圆眼更萌)
    const winkEyeStyle: React.CSSProperties = {
      ...eyeStyle,
      height: px * 0.025,
      borderRadius: `${px * 0.03}px ${px * 0.03}px 0 0`,
    };

    switch (effectiveExpression) {
      case 'wink':
        return (
          <>
            <div style={{ ...winkEyeStyle, top: '41%', left: '35%' }} />
            <div style={{ ...winkEyeStyle, top: '41%', right: '35%' }} />
            <div style={{ ...mouthStyle, top: '55%', left: '40%', width: '20%', borderRadius: '50% 50% 50% 50%' }} />
          </>
        );
      case 'happy':
        return (
          <>
            <div style={{ ...eyeStyle, top: '40%', left: '35%' }} />
            <div style={{ ...eyeStyle, top: '40%', right: '35%' }} />
            <div style={{ ...mouthStyle, top: '55%', left: '40%', width: '20%' }} />
          </>
        );
      case 'sleep':
        return (
          <>
            <div style={{ ...eyeStyle, top: '40%', left: '35%', height: px * 0.02, width: px * 0.08 }} />
            <div style={{ ...eyeStyle, top: '40%', right: '35%', height: px * 0.02, width: px * 0.08 }} />
          </>
        );
      default: // calm / neutral
        return (
          <>
            <div style={{ ...eyeStyle, top: '40%', left: '35%' }} />
            <div style={{ ...eyeStyle, top: '40%', right: '35%' }} />
          </>
        );
    }
  };

  return (
    <div
      className="clay-real-cloud"
      role={size === 'lg' || size === 'md' ? 'button' : undefined}
      tabIndex={size === 'lg' || size === 'md' ? 0 : undefined}
      aria-label={size === 'lg' || size === 'md' ? '摸一摸这朵云' : undefined}
      onClick={size === 'lg' || size === 'md' ? handlePoke : undefined}
      onKeyDown={size === 'lg' || size === 'md' ? handleKeyDown : undefined}
      style={{
        width: typeStyles.width,
        height: typeStyles.height,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: 'drop-shadow(0 6px 12px rgba(121, 98, 82, 0.18))',
        animation: poked && !reducedMotionRef.current
          ? 'cloud-poke-squash 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'real-cloud-breathe 6s ease-in-out infinite',
        borderRadius: typeStyles.borderRadius,
        transformOrigin: '50% 80%',
      }}
    >
      {/* 萌语气泡 */}
      {pokeLine && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: `-${px * 0.34}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(242, 138, 158, 0.45)',
            color: 'var(--ink, #4A3A33)',
            fontSize: Math.max(11, px * 0.11),
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 14,
            whiteSpace: 'nowrap',
            boxShadow: '0 3px 8px rgba(248, 140, 130, 0.25)',
            zIndex: 30,
            animation: 'cloud-poke-bubble 0.9s ease-out',
            pointerEvents: 'none',
          }}
        >
          {pokeLine}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              width: 8,
              height: 8,
              background: 'rgba(255, 255, 255, 0.95)',
              borderRight: '1.5px solid rgba(242, 138, 158, 0.45)',
              borderBottom: '1.5px solid rgba(242, 138, 158, 0.45)',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* 摸云时冒出的小星星粒子 */}
      {poked && !reducedMotionRef.current && (
        <>
          <span className="cloud-poke-spark" style={{ left: '8%', top: '12%', animationDelay: '0s' }} aria-hidden="true">✦</span>
          <span className="cloud-poke-spark" style={{ right: '6%', top: '4%', animationDelay: '0.12s' }} aria-hidden="true">✧</span>
          <span className="cloud-poke-spark" style={{ left: '20%', top: '-10%', animationDelay: '0.24s' }} aria-hidden="true">✦</span>
        </>
      )}

      {/* 金边光感 — 早晨阳光从左上角打过来 */}
      <div style={{
        position: 'absolute',
        inset: '10% 15% 25% 20%',
        background: 'rgba(255, 245, 220, 0.55)',
        borderRadius: 'inherit',
        filter: 'blur(12px)',
        zIndex: 0
      }} />

      {/* 基础云体 4-6 个圆团 — 更强的阴影/高光对比 + 核心高光 */}
      <div style={{ ...puffStyle, position: 'absolute', bottom: '15%', left: '10%', width: '30%', height: '45%', background: `radial-gradient(ellipse at 30% 25%, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 4px 4px 8px rgba(255,255,255,0.95), inset -4px -4px 8px rgba(121, 98, 82, 0.12)` }}>
        <div style={{ position: 'absolute', top: '20%', left: '25%', width: '30%', height: '30%', background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(2px)' }} />
      </div>
      <div style={{ ...puffStyle, position: 'absolute', bottom: '20%', left: '25%', width: '35%', height: '55%', background: `radial-gradient(ellipse at 30% 25%, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 4px 4px 8px rgba(255,255,255,0.95), inset -4px -4px 8px rgba(121, 98, 82, 0.12)`, zIndex: 2 }}>
        <div style={{ position: 'absolute', top: '15%', left: '30%', width: '35%', height: '35%', background: `radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(3px)' }} />
      </div>
      <div style={{ ...puffStyle, position: 'absolute', bottom: '15%', right: '15%', width: '28%', height: '40%', background: `radial-gradient(ellipse at 70% 25%, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 4px 4px 8px rgba(255,255,255,0.95), inset -4px -4px 8px rgba(121, 98, 82, 0.12)`, zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '20%', left: '25%', width: '30%', height: '30%', background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(2px)' }} />
      </div>
      <div style={{ ...puffStyle, position: 'absolute', bottom: '0', left: '5%', right: '5%', height: '35%', background: `radial-gradient(ellipse, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 4px 4px 8px rgba(255,255,255,0.95), inset -4px -4px 8px rgba(121, 98, 82, 0.12)` }}>
        <div style={{ position: 'absolute', top: '15%', left: '30%', width: '40%', height: '40%', background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(3px)' }} />
      </div>

      {/* 中心层 — 让云更立体 */}
      <div style={{ ...puffStyle, position: 'absolute', bottom: '10%', left: '30%', width: '40%', height: '50%', background: `radial-gradient(ellipse at 50% 50%, ${colors.main} 0%, ${colors.shadow} 100%)`, zIndex: 3 }} />

      {/* 高光层 — 更亮，更聚焦，带点暖色 */}
      <div style={{
        position: 'absolute',
        top: '6%', left: '18%',
        width: '38%', height: '28%',
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,240,220,0.6) 100%)',
        borderRadius: '50%',
        filter: 'blur(4px)',
        opacity: 0.95,
        zIndex: 4
      }} />

      {/* 体积感阴影层 — 底部右侧加一个淡淡的投影 */}
      <div style={{
        position: 'absolute',
        bottom: '5%', right: '10%',
        width: '40%', height: '30%',
        background: 'rgba(121, 98, 82, 0.12)',
        borderRadius: '50%',
        filter: 'blur(6px)',
        zIndex: -1
      }} />

      {/* 外层 rim 光 — 增加空气感 */}
      <div style={{
        position: 'absolute',
        inset: '-3%',
        borderRadius: 'inherit',
        boxShadow: `0 0 15px 6px rgba(255, 255, 255, 0.5), 0 0 30px 10px ${colors.rim}`,
        opacity: isCelebrate ? 0.9 : 0.6,
        transition: 'opacity 0.5s ease-out',
        zIndex: 5
      }} />

      {/* 完成态光晕 */}
      {isCelebrate && (
        <div style={{
          position: 'absolute',
          inset: '-25%',
          background: `radial-gradient(circle, ${colors.rim} 0%, transparent 70%)`,
          opacity: 0.7,
          animation: 'breathe 3s ease-in-out infinite',
          zIndex: 6
        }} />
      )}

      {/* 表情 */}
      {renderExpression()}

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes real-cloud-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.015) translateY(-3px); }
        }
        /* 摸云 squash&stretch:压扁 → 拉长回弹(软软的手感) */
        @keyframes cloud-poke-squash {
          0%   { transform: scale(1, 1); }
          30%  { transform: scale(1.12, 0.82); }
          55%  { transform: scale(0.94, 1.1); }
          75%  { transform: scale(1.04, 0.96); }
          100% { transform: scale(1, 1); }
        }
        /* 萌语气泡:从下方轻浮上来 + 淡出 */
        @keyframes cloud-poke-bubble {
          0%   { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.9); }
          18%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.04); }
          30%  { transform: translateX(-50%) translateY(0) scale(1); }
          78%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.98); }
        }
        /* 小星星上飘淡出 */
        .cloud-poke-spark {
          position: absolute;
          z-index: 20;
          color: rgba(255, 214, 130, 0.95);
          font-size: ${Math.max(10, px * 0.12)}px;
          pointer-events: none;
          animation: cloud-poke-spark-float 0.8s ease-out both;
        }
        @keyframes cloud-poke-spark-float {
          0%   { opacity: 0; transform: translateY(4px) scale(0.5) rotate(0deg); }
          30%  { opacity: 1; transform: translateY(-6px) scale(1.1) rotate(18deg); }
          100% { opacity: 0; transform: translateY(-22px) scale(0.6) rotate(-10deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cloud-poke-spark { animation: none; opacity: 0; }
          .clay-real-cloud { animation: real-cloud-breathe 6s ease-in-out infinite !important; }
        }
      `}</style>
    </div>
  );
}
