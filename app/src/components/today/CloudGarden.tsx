import RealCloud from './RealCloud';
import type { Task } from '../../types';

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
 * - 记忆云（左右两侧，淡、小、层叠）
 */
export default function CloudGarden({ today, last7, onTodayComplete, mood }: CloudGardenProps) {
  return (
    <div style={{
      position: 'relative',
      height: 260,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* 记忆云 */}
      {last7.slice(0, 5).map((day, i) => (
        <div key={day.date} style={{
          position: 'absolute',
          left: `${10 + i * 15}%`,
          bottom: `${15 + i * 10}%`,
          opacity: 0.4 - i * 0.05,
          transform: `scale(${0.5 + i * 0.05})`,
          filter: 'blur(2px)',
          zIndex: i
        }}>
          <RealCloud
            size="sm"
            color={getCloudColor(day.tasks[0]?.type || 'other')}
            state="default"
          />
        </div>
      ))}

      {/* 今日主云 */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        animation: 'float 6s ease-in-out infinite',
      }}>
        <RealCloud
          size="lg"
          color={today ? getCloudColor(today.type) : 'warm'}
          state={today?.completedAt ? 'completed' : 'default'}
          mood={mood}
        />

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