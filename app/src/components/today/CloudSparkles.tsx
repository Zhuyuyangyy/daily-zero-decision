interface CloudSparklesProps {
  active: boolean;
  count?: number;
}

export default function CloudSparkles({ active, count = 5 }: CloudSparklesProps) {
  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: '-20%', pointerEvents: 'none', zIndex: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 40}%`,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)',
            animation: `sparkle-anim 0.8s ${i * 0.1}s ease-out forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle-anim {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(0.5) translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}