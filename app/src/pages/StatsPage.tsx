import { useMemo, useState } from 'react';
import type { Task, StreakState } from '../types';

interface StatsPageProps {
  history: Record<string, Task[]>;
  streak: StreakState;
  moods: Record<string, string>;
}

const MOOD_ICON: Record<string, string> = {
  down: '☁️',
  low: '🌧',
  okay: '🌤',
  gloomy: '⛈',
  hopeful: '🌈',
};

const TYPE_ICON: Record<string, string> = {
  reading: '📖',
  exercise: '🏃',
  coding: '💻',
  other: '✨',
};

/**
 * 回顾 — Round 5
 * 答的是"我坚持了什么"
 * 自然语言总结代替工具指标
 * 让用户每次打开都觉得:原来我真的在慢慢坚持
 */
export default function StatsPage({ history, streak, moods }: StatsPageProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  // 最近 7 天的云朵故事
  const last7 = useMemo(() => {
    return Object.keys(history)
      .sort()
      .reverse()
      .slice(0, 7);
  }, [history]);

  // 叙事摘要
  const summary = useMemo(() => {
    const last14 = Object.entries(history)
      .filter(([date]) => {
        const d = new Date(date);
        const now = new Date();
        return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 14;
      })
      .map(([, tasks]) => tasks)
      .flat();

    const typeCount: Record<string, number> = {};
    last14.forEach((t) => {
      typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    });
    const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    const recentMoods = Object.entries(moods).slice(-7).map(([, m]) => m);
    const moodCount: Record<string, number> = {};
    recentMoods.forEach((m) => {
      moodCount[m] = (moodCount[m] || 0) + 1;
    });
    const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { topType, topMood, total14: last14.length };
  }, [history, moods]);

  return (
    <div
      className="clay-content clay-scroll-area"
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        paddingBottom: '100px',
      }}
    >
      <div className="w-full max-w-md mx-auto" style={{ padding: '24px 16px' }}>
        {/* 标题 — 叙事化 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden>👣</div>
          <h1
            className="clay-balance"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            回顾
          </h1>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
              margin: '6px 0 0',
            }}
          >
            原来我真的在慢慢坚持。
          </p>
        </div>

        {/* 最近 14 天的总结 */}
        {summary.total14 > 0 ? (
          <div
            className="shadow-tinted"
            style={{
              borderRadius: 'var(--radius-chunk, 20px)',
              padding: '20px',
              marginBottom: 20,
              background: 'var(--surface-1)',
              border: 'var(--hairline-subtle)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              最近两周，{streak.current > 0 && (
                <>你连续 <strong style={{ color: 'var(--mint-cloud-text)' }}>{streak.current}</strong> 天回来了，</>
              )}
              你养了 <strong>{summary.total14}</strong> 朵云
              {summary.topType && (
                <>，其中最多的是 <strong>{TYPE_ICON[summary.topType]} {summary.topType === 'reading' ? '阅读云' : summary.topType === 'exercise' ? '运动云' : summary.topType === 'coding' ? '编码云' : '日常云'}</strong></>
              )}
              {summary.topMood && (
                <>，心情最多是 <strong>{MOOD_ICON[summary.topMood]}</strong></>
              )}
              。
            </p>
          </div>
        ) : (
          <div
            className="shadow-tinted"
            style={{
              borderRadius: 'var(--radius-chunk, 20px)',
              padding: '40px 28px',
              textAlign: 'center',
              background: 'var(--surface-1)',
              border: 'var(--hairline-subtle)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }} aria-hidden>👣</div>
            <h2
              className="clay-balance"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '0 0 6px',
              }}
            >
              还没有云迹
            </h2>
            <p
              style={{
                color: 'var(--ink-light)',
                fontSize: 14,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              走起第一朵，云就开始记录你的脚步。
            </p>
          </div>
        )}

        {/* 最近 7 天足迹 — 叙事而非表格 */}
        {last7.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '24px 4px 12px',
              }}
            >
              最近一周的云
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {last7.map((date) => {
                const tasks = history[date] ?? [];
                const mood = moods[date];
                const isToday = date === today;
                const isOpen = expandedDay === date;
                return (
                  <button
                    key={date}
                    onClick={() => setExpandedDay(isOpen ? null : date)}
                    className="shadow-tinted"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: 16,
                      background: isOpen ? 'var(--surface-0)' : 'var(--surface-1)',
                      border: isOpen ? '1px solid var(--mint-cloud-deep)' : 'var(--hairline-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--dur-fast) var(--ease-out-quart)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--ink)',
                        }}
                      >
                        {isToday ? '今天' : date}
                        {mood && (
                          <span style={{ marginLeft: 8, fontSize: 16 }}>{MOOD_ICON[mood]}</span>
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 12,
                          color: 'var(--ink-light)',
                        }}
                      >
                        {tasks.length} 朵 {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hairline-subtle)' }}>
                        {tasks.map((t) => (
                          <div
                            key={t.id}
                            style={{
                              fontSize: 13,
                              color: 'var(--ink)',
                              padding: '4px 0',
                              fontFamily: 'var(--font-body)',
                            }}
                          >
                            {TYPE_ICON[t.type] || '✨'} {t.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
