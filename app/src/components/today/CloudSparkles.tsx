import { useMemo } from 'react';

interface CloudSparklesProps {
  active: boolean;
  count?: number;
}

export default function CloudSparkles({ active, count = 8 }: CloudSparklesProps) {
  // 用 useMemo 在 mount 时一次确定 sparkle 位置；避免 active 切换时随机数重置导致视觉抖动
  const sparklePositions = useMemo(
    () => Array.from({ length: count }, () => ({
      left: 30 + Math.random() * 40,
      top: 20 + Math.random() * 40,
    })),
    [count]
  );

  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: '-30%', pointerEvents: 'none', zIndex: 20 }}>
      {/* 金色光晕 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, rgba(255, 220, 130, 0.6) 0%, transparent 60%)',
        animation: 'glow-pulse 1s ease-in-out infinite',
        zIndex: 0
      }} />

      {sparklePositions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 10px 3px rgba(255, 220, 130, 0.9)',
            animation: `sparkle-anim 1.0s ${i * 0.08}s ease-out forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle-anim {
          0% { transform: scale(0) rotate(0); opacity: 1; }
          50% { transform: scale(1.6) rotate(90deg); opacity: 0.9; }
          100% { transform: scale(0.4) rotate(180deg) translateY(-25px); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}