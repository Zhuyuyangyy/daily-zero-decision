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
      const timer = setTimeout(() => setVisible(true), 400); // 等动画
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [completed]);

  if (!completed || !visible) return null;

  return (
    <div className="clay-fade-up" style={{
      marginTop: 16,
      padding: '12px 16px',
      borderRadius: 16,
      background: 'var(--mint-cloud-light)',
      border: '1px solid rgba(74, 181, 116, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <div style={{ fontSize: 24 }}>☁️</div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--mint-cloud-text)' }}>
          {streak > 1 ? `这是你连续第 ${streak} 天留下云朵` : '今天养成了第一朵云'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-light)' }}>
          天空中现在有 {total} 朵云了。
        </p>
      </div>
    </div>
  );
}