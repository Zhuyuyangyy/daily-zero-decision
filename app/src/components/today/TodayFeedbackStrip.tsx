import { useEffect, useState } from 'react';

interface TodayFeedbackStripProps {
  completed: boolean;
  streak: number;
  total: number;
}

export default function TodayFeedbackStrip({ completed, streak, total }: TodayFeedbackStripProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => setVisible(true), 600); // 等云朵动画和光晕结束
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [completed]);

  if (!completed || !visible) return null;

  return (
    <div className="clay-fade-up" style={{
      marginTop: 20,
      padding: '16px 20px',
      borderRadius: 20,
      background: 'linear-gradient(135deg, rgba(255, 240, 210, 0.8) 0%, rgba(255, 220, 130, 0.6) 100%)',
      border: '1px solid rgba(255, 210, 100, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.6), 0 4px 12px rgba(200, 160, 80, 0.15)',
    }}>
      {/* 图标 — 带缓慢呼吸 */}
      <div
        className="clay-feedback-cloud-breathe"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.9)',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        ☁️
      </div>

      {/* 文案 */}
      <div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
          {streak > 1 ? `这是你连续第 ${streak} 天留下云朵` : '今天养成了第一朵云'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.4 }}>
          天空中现在有 {total} 朵云了。
        </p>
      </div>

      <style>{`
        .clay-feedback-cloud-breathe {
          animation: feedback-cloud-breathe 4s ease-in-out infinite;
        }
        @keyframes feedback-cloud-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}