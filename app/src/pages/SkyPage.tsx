import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AppState, Task, TaskType } from '../types';
import type { SkyMood } from '../utils/skyMood';
import Cloud from '../components/sky/Cloud';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import TaskHistory from '../components/task/TaskHistory';
import { SoftButton } from '../components/ui';

interface SkyPageProps {
  state: AppState;
  skyMood: SkyMood;
  totalDays: number;
  hasLog: boolean;
  todayLog: string[];
  allHistoryTasks: Record<string, Task[]>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  searchType: 'all' | TaskType;
  setSearchType: Dispatch<SetStateAction<'all' | TaskType>>;
  onNavigateToToday: () => void;
}

const MOOD_CLOUD: Record<SkyMood, 'calm' | 'happy' | 'celebrate'> = {
  dawn: 'calm',
  morning: 'calm',
  clear: 'happy',
  sunny: 'happy',
  golden: 'celebrate',
};

/**
 * SkyPage — Round 3 重塑
 * - 上半屏：沉浸式天空画布 + 漂浮云朵（点开看当天任务）
 * - 下半屏：最近 7 天云朵故事（叙事而非数字堆砌）
 * - 底部：分享我的天空
 */
export default function SkyPage({
  state: _state,
  skyMood,
  totalDays,
  hasLog,
  todayLog,
  allHistoryTasks,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  onNavigateToToday,
}: SkyPageProps) {
  const [openedDate, setOpenedDate] = useState<string | null>(null);
  const cloudMood = MOOD_CLOUD[skyMood];

  // 最近 7 天（含今天）
  const last7 = todayLog.slice(-7);
  const openedTasks = openedDate ? allHistoryTasks[openedDate] ?? [] : [];

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
      <div className="w-full max-w-md mx-auto" style={{ padding: '12px 16px' }}>
        {/* 上半屏：沉浸式天空画布 */}
        <div className="clay-sky-canvas" aria-label="我的天空">
          {/* 标题叠在画布上 */}
          <div className="clay-sky-canvas__title">
            <h1
              className="clay-balance"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 30,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                letterSpacing: 'var(--tracking-heading)',
                textShadow: '0 2px 14px rgba(255, 240, 225, 0.65)',
              }}
            >
              我的天空
            </h1>
            <p
              style={{
                color: 'var(--ink-light)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                lineHeight: 1.55,
                margin: '6px 0 0',
                textShadow: '0 1px 8px rgba(255, 240, 225, 0.6)',
              }}
            >
              {hasLog ? `你养了 ${totalDays} 朵云` : '天空还空着呢'}
            </p>
          </div>

          {/* 漂浮的云朵 — 来自最近 7 天打卡 */}
          {hasLog && (
            <div className="clay-sky-canvas__clouds">
              {last7.map((date, i) => {
                const isToday = date === todayLog[todayLog.length - 1];
                return (
                  <button
                    key={date}
                    className="clay-sky-cloud"
                    style={{
                      top: `${15 + (i * 17) % 50}%`,
                      left: `${(i * 23) % 70 + 8}%`,
                    }}
                    onClick={() => setOpenedDate(date === openedDate ? null : date)}
                    aria-label={`查看 ${date} 的云`}
                  >
                    <Cloud mood={cloudMood} size={isToday ? 'md' : 'sm'} />
                  </button>
                );
              })}
            </div>
          )}

          {!hasLog && (
            <div className="clay-sky-canvas__clouds" style={{ textAlign: 'center' }}>
              <Cloud mood="calm" size="lg" />
            </div>
          )}
        </div>

        {/* 选中的云朵详情卡 */}
        {openedDate && (
          <div
            className="animate-fade-up"
            style={{
              margin: '20px 0',
              padding: '20px',
              borderRadius: 'var(--radius-chunk)',
              background: 'var(--surface-1)',
              border: 'var(--hairline-subtle)',
              boxShadow: '0 6px 18px rgba(180, 100, 80, 0.10)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                {openedDate}
              </h3>
              <button
                onClick={() => setOpenedDate(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink-light)', cursor: 'pointer' }}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '4px 0 12px' }}>
              {openedTasks.length > 0 ? `你养了 ${openedTasks.length} 朵云` : '这一天没有云'}
            </p>
            {openedTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'var(--warm-canvas)',
                  marginBottom: 6,
                  fontSize: 13,
                  color: 'var(--ink)',
                }}
              >
                {t.type === 'reading' && '📖 '}
                {t.type === 'exercise' && '🏃 '}
                {t.type === 'coding' && '💻 '}
                {t.type === 'other' && '✨ '}
                {t.title}
                {t.note && (
                  <span style={{ marginLeft: 8, fontStyle: 'italic', color: 'var(--ink-light)' }}>
                    💭 {t.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 搜索栏（弱化） */}
        {hasLog && (
          <div style={{ padding: '8px 0 12px' }}>
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="搜索任务名 / 备注 / 日期…"
            />
          </div>
        )}

        {/* 搜索结果 */}
        {searchQuery ? (
          <SearchResults
            history={allHistoryTasks}
            query={searchQuery}
            typeFilter={searchType}
            onClose={() => { setSearchQuery(''); setSearchType('all'); }}
          />
        ) : (
          <>
            {/* 任务历史 — 折叠为"云朵故事" */}
            {hasLog && (
              <div style={{ marginTop: 8 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    margin: '0 4px 12px',
                  }}
                >
                  最近的故事
                </h2>
                <TaskHistory history={allHistoryTasks} />
              </div>
            )}

            {/* 空状态 */}
            {!hasLog && (
              <div
                className="shadow-tinted"
                style={{
                  marginTop: 24,
                  borderRadius: 'var(--radius-chunk, 20px)',
                  padding: '40px 28px',
                  textAlign: 'center',
                  background: 'var(--surface-1)',
                  border: 'var(--hairline-subtle)',
                }}
              >
                <h2
                  className="clay-balance"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    margin: '0 0 8px',
                  }}
                >
                  天空还空着呢
                </h2>
                <p
                  style={{
                    color: 'var(--ink-light)',
                    fontSize: 14,
                    lineHeight: 'var(--leading-relaxed)',
                    margin: '0 0 20px',
                  }}
                >
                  去「今天」页面，养下第一朵云吧
                </p>
                <SoftButton variant="mint" size="md" onClick={onNavigateToToday}>
                  ☁️ 去养今天的云
                </SoftButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
