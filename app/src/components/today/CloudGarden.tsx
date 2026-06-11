import RealCloud from './RealCloud';
import CloudSparkles from './CloudSparkles';
import type { Task } from '../../types';
import { useState, useEffect } from 'react';

interface CloudGardenProps {
  today: Task | null;
  last7: Array<{ date: string; tasks: Task[] }>;
  onTodayComplete: () => void;
  mood: 'calm' | 'happy' | 'celebrate';
}

/**
 * CloudGarden — "今日云朵花园"
 * 承载"资产感"：
 * - 今日主云（中心、大、交互）
 * - 记忆云（左右两侧，淡、远、层叠）
 */
export default function CloudGarden({ today, last7, onTodayComplete, mood }: CloudGardenProps) {
  const [sparkles, setSparkles] = useState(false);

  // 检测完成动作
  useEffect(() => {
    if (today?.completedAt) {
      setSparkles(true);
      const timer = setTimeout(() => setSparkles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [today?.completedAt]);

  return (
    <div className="clay-noise" style={{
      position: 'relative',
      height: 260,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      // 早晨天空三层 radial-gradient
      background: `
        radial-gradient(ellipse 70% 50% at 50% 85%, rgba(255, 190, 110, 0.45) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 30% 70%, rgba(255, 215, 175, 0.40) 0%, transparent 60%),
        radial-gradient(ellipse 50% 25% at 70% 65%, rgba(255, 200, 165, 0.35) 0%, transparent 60%),
        linear-gradient(180deg, var(--sky-dawn-1) 0%, var(--sky-dawn-2) 45%, var(--sky-dawn-3) 100%)
      `
    }}>
      {/* 第四层晨光：极淡的暖黄在地平线上方 */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: '15%',
        height: '30%',
        background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255, 230, 180, 0.5) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* 第五层晨光：极淡的粉色在最底层，模拟大气散射 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(255, 240, 225, 0.1) 0%, rgba(255, 230, 210, 0.2) 100%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* 远山轮廓 */}
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '25%', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 25 Q 15 15, 30 20 T 55 18 T 80 22 T 100 20 L 100 30 L 0 30 Z"
          fill="rgba(180, 130, 110, 0.25)"
        />
      </svg>

      {/* 记忆云 */}
      {last7.slice(0, 5).map((day, i) => (
        <div key={day.date} className="clay-cloud-drift" style={{
          position: 'absolute',
          left: `${10 + i * 15}%`,
          bottom: `${15 + i * 10}%`,
          opacity: 0.4 - i * 0.05,
          transform: `scale(${0.5 + i * 0.05})`,
          filter: 'blur(2px)',
          zIndex: i,
          animationDelay: `${i * 2}s`, // 错开动画
          animationDuration: `${10 + i * 5}s` // 不同云漂浮速度
        }}>
          <RealCloud
            size="sm"
            color={getCloudColor(day.tasks[0]?.type || 'other')}
            type={day.tasks[0]?.type || 'other'}
            expression={['happy', 'calm', 'sleep', 'wink', 'neutral'][i % 5] as any}
            state="default"
          />
        </div>
      ))}

      {/* 今日主云 */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        animation: 'float 6s ease-in-out infinite',
        transform: today?.completedAt ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <RealCloud
          size="lg"
          color={today ? getCloudColor(today.type) : 'warm'}
          state={today?.completedAt ? 'completed' : 'default'}
          mood={mood}
        />

        <CloudSparkles active={sparkles} />

        {/* 如果没任务，中间显示引导 */}
        {!today && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
            <p style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink)',
              textShadow: '0 2px 4px rgba(255,255,255,0.8)',
            }}>
              云朵还没发芽
            </p>
          </div>
        )}

        {/* 如果有任务未完成，显示完成按钮 */}
        {today && !today.completedAt && (
          <button
            onClick={onTodayComplete}
            style={{
              position: 'absolute',
              bottom: '-10%',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 20px',
              background: 'var(--mint-cloud-cta)',
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 4px 12px rgba(74, 181, 116, 0.4)',
              cursor: 'pointer',
              zIndex: 100,
              whiteSpace: 'nowrap'
            }}
          >
            让今天养一朵云
          </button>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes cloud-drift {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(5px) rotate(0.5deg); }
          75% { transform: translateX(-5px) rotate(-0.5deg); }
        }
        .clay-cloud-drift {
          animation: cloud-drift 15s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}

function getCloudColor(type: Task['type']) {
  switch(type) {
    case 'reading': return 'mint';
    case 'exercise': return 'coral';
    case 'coding': return 'lavender';
    default: return 'warm';
  }
}