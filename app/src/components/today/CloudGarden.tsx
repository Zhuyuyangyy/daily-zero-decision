import { useState, useEffect } from 'react';
import type { Task } from '../../types';
import RealCloud from './RealCloud';
import CloudSparkles from './CloudSparkles';

export type CloudGardenMode = 'today' | 'garden';
export type { GardenMood } from '../../utils/cloudGardenMood';

const CLOUD_GARDEN_CONFIG = {
  today: {
    maxClouds: 7,
    draggable: false,
    showTodayMainCloud: true,
    showEmptyState: true,
    showCompleteButton: true,
    minOpacity: 0.18,
  },
  garden: {
    maxClouds: 30,
    draggable: true,
    showTodayMainCloud: false,
    showEmptyState: false,
    showCompleteButton: false,
    minOpacity: 0.32,
  },
} as const;

export interface CloudGardenProps {
  mode: CloudGardenMode;
  today?: Task | null;
  last7?: Array<{ date: string; tasks: Task[] }>;
  history?: Record<string, Task[]>;
  onTodayComplete?: () => void;
  onOpenCloud?: (date: string) => void;
  mood: 'calm' | 'happy' | 'celebrate';
}

function getCloudColor(type: Task['type']) {
  switch (type) {
    case 'reading': return 'mint';
    case 'exercise': return 'coral';
    case 'coding': return 'lavender';
    default: return 'warm';
  }
}

export default function CloudGarden({
  mode,
  today,
  last7,
  history: _history,
  onTodayComplete,
  onOpenCloud: _onOpenCloud,
  mood,
}: CloudGardenProps) {
  const config = CLOUD_GARDEN_CONFIG.today;
  const [sparkles, setSparkles] = useState(false);

  useEffect(() => {
    if (today?.completedAt) {
      setSparkles(true);
      const timer = setTimeout(() => setSparkles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [today?.completedAt]);

  if (mode === 'garden') {
    return null;
  }

  return (
    <div
      className="clay-cloud-garden"
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {last7?.slice(0, config.maxClouds).map((day, i) => (
        <div
          key={day.date}
          className="clay-cloud-drift sky-cloud-drift"
          style={{
            position: 'absolute',
            left: `${10 + (i % 5) * 15}%`,
            bottom: `${15 + Math.floor(i / 5) * 12}%`,
            opacity: Math.max(config.minOpacity, 0.6 - i * 0.06),
            transform: `scale(${0.5 + (i % 4) * 0.1})`,
            zIndex: i,
            animationDelay: `${i * 2}s`,
            animationDuration: `${10 + i * 5}s`,
          }}
        >
          <RealCloud
            size="sm"
            color={getCloudColor(day.tasks[0]?.type || 'other')}
            type={day.tasks[0]?.type || 'other'}
            expression={['happy', 'calm', 'sleep', 'wink', 'neutral', 'tiny-smile', 'peeking'][i % 7] as any}
            state="default"
          />
        </div>
      ))}

      {config.showTodayMainCloud && (
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            transform: today?.completedAt ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <RealCloud
            size="lg"
            color={today ? getCloudColor(today.type) : 'warm'}
            state={today?.completedAt ? 'completed' : 'default'}
            mood={mood}
          />
          <CloudSparkles active={sparkles} />

          {!today && config.showEmptyState && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  textShadow: '0 2px 4px rgba(255,255,255,0.8)',
                }}
              >
                云朵还没发芽
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '4px 0 0' }}>
                选一个轻的开始，今天就够了。
              </p>
            </div>
          )}

          {today && !today.completedAt && config.showCompleteButton && onTodayComplete && (
            <button
              onClick={onTodayComplete}
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 20px',
                background: 'var(--mint-cloud-cta, #4AB574)',
                color: 'white',
                borderRadius: 20,
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(74, 181, 116, 0.4)',
                cursor: 'pointer',
                zIndex: 100,
                whiteSpace: 'nowrap',
              }}
            >
              让今天养一朵云
            </button>
          )}
        </div>
      )}
    </div>
  );
}
