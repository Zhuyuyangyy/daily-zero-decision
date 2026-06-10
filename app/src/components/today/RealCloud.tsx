import { useMemo } from 'react';

interface RealCloudProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'mint' | 'coral' | 'lavender' | 'warm';
  state?: 'default' | 'today' | 'completed';
  mood?: 'calm' | 'happy' | 'celebrate';
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
 */
export default function RealCloud({ size = 'md', color = 'warm', state = 'default', mood = 'calm' }: RealCloudProps) {
  const px = SIZE_MAP[size];
  const isCelebrate = mood === 'celebrate' || state === 'completed';

  const colors = useMemo(() => {
    switch (color) {
      case 'mint': return { main: '#E0FFF0', shadow: '#A4E9C4' };
      case 'coral': return { main: '#FFF0F0', shadow: '#F8C8C8' };
      case 'lavender': return { main: '#F0F0FF', shadow: '#D0C8F8' };
      default: return { main: '#FFFFFF', shadow: '#F8E8E0' };
    }
  }, [color]);

  return (
    <div
      style={{
        width: px,
        height: px * 0.6,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* 基础云体 4-6 个圆团 */}
      <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: '30%', height: '45%', background: `radial-gradient(${colors.main}, ${colors.shadow})`, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '25%', width: '35%', height: '55%', background: `radial-gradient(${colors.main}, ${colors.shadow})`, borderRadius: '50%', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '28%', height: '40%', background: `radial-gradient(${colors.main}, ${colors.shadow})`, borderRadius: '50%', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '0', left: '5%', right: '5%', height: '35%', background: `radial-gradient(ellipse, ${colors.main}, ${colors.shadow})`, borderRadius: '50%' }} />

      {/* 高光层 */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '20%',
        width: '40%', height: '30%',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '50%',
        filter: 'blur(4px)',
        opacity: 0.8,
        zIndex: 3
      }} />

      {/* 完成态光晕 */}
      {isCelebrate && (
        <div style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(circle, ${colors.main} 0%, transparent 70%)`,
          opacity: 0.6,
          animation: 'breathe 3s ease-in-out infinite',
          zIndex: 0
        }} />
      )}

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}