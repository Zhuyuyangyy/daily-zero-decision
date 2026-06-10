import { useMemo } from 'react';

interface RealCloudProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'mint' | 'coral' | 'lavender' | 'warm';
  state?: 'default' | 'today' | 'completed';
  mood?: 'calm' | 'happy' | 'celebrate';
  type?: 'reading' | 'exercise' | 'coding' | 'other';
  expression?: 'calm' | 'happy' | 'sleep' | 'wink' | 'neutral';
}

const SIZE_MAP = {
  xs: 48,
  sm: 64,
  md: 100,
  lg: 160,
};

/**
 * RealCloud — CSS 实现的"真云"
 * 用多个 div + radial-gradient + blur 模拟体积/层叠/光感
 * 通过 type 和 expression 参数实现差异化外观
 */
export default function RealCloud({
  size = 'md',
  color = 'warm',
  state = 'default',
  mood = 'calm',
  type = 'other',
  expression = 'calm'
}: RealCloudProps) {
  const px = SIZE_MAP[size];
  const isCelebrate = mood === 'celebrate' || state === 'completed';

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

    switch (expression) {
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
      case 'wink':
        return (
          <>
            <div style={{ ...eyeStyle, top: '40%', left: '35%' }} />
            <div style={{ ...eyeStyle, top: '40%', right: '35%', height: px * 0.02, width: px * 0.08 }} />
            <div style={{ ...mouthStyle, top: '55%', left: '40%', width: '20%' }} />
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
      style={{
        width: typeStyles.width,
        height: typeStyles.height,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: 'drop-shadow(0 6px 12px rgba(121, 98, 82, 0.18))',
        animation: 'real-cloud-breathe 6s ease-in-out infinite',
        borderRadius: typeStyles.borderRadius
      }}
    >
      {/* 金边光感 — 早晨阳光从左上角打过来 */}
      <div style={{
        position: 'absolute',
        inset: '10% 15% 25% 20%',
        background: 'rgba(255, 245, 220, 0.55)',
        borderRadius: 'inherit',
        filter: 'blur(12px)',
        zIndex: 0
      }} />

      {/* 基础云体 4-6 个圆团 */}
      <div style={{ ...puffStyle, position: 'absolute', bottom: '15%', left: '10%', width: '30%', height: '45%', background: `radial-gradient(ellipse at 30% 25%, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 3px 3px 6px rgba(255,255,255,0.9), inset -3px -3px 6px rgba(121, 98, 82, 0.08)` }} />
      <div style={{ ...puffStyle, position: 'absolute', bottom: '20%', left: '25%', width: '35%', height: '55%', background: `radial-gradient(ellipse at 30% 25%, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 3px 3px 6px rgba(255,255,255,0.9), inset -3px -3px 6px rgba(121, 98, 82, 0.08)`, zIndex: 2 }} />
      <div style={{ ...puffStyle, position: 'absolute', bottom: '15%', right: '15%', width: '28%', height: '40%', background: `radial-gradient(ellipse at 70% 25%, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 3px 3px 6px rgba(255,255,255,0.9), inset -3px -3px 6px rgba(121, 98, 82, 0.08)`, zIndex: 1 }} />
      <div style={{ ...puffStyle, position: 'absolute', bottom: '0', left: '5%', right: '5%', height: '35%', background: `radial-gradient(ellipse, ${colors.main} 0%, ${colors.shadow} 100%)`, boxShadow: `inset 3px 3px 6px rgba(255,255,255,0.9), inset -3px -3px 6px rgba(121, 98, 82, 0.08)` }} />

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

      {/* 外层 rim 光 */}
      <div style={{
        position: 'absolute',
        inset: '-5%',
        borderRadius: 'inherit',
        boxShadow: `0 0 20px 4px ${colors.rim}`,
        opacity: isCelebrate ? 0.8 : 0.4,
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
      `}</style>
    </div>
  );
}
