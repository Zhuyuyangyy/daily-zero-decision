import type { Dispatch, SetStateAction } from 'react';
import type { AppState, Task, TaskType } from '../types';
import type { SkyMood } from '../utils/skyMood';
import StreakDisplay from '../components/sky/StreakDisplay';
import AchievementGrid from '../components/stats/AchievementGrid';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import TaskHistory from '../components/task/TaskHistory';

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

export default function SkyPage({
  state,
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
  return (
    <div
      className="clay-content clay-scroll-area"
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        paddingBottom: '80px',
      }}
    >
      <div className="w-full max-w-md mx-auto px-5">
        <div
          style={{
            textAlign: 'center',
            paddingTop: '40px',
            paddingBottom: '24px',
          }}
        >
          <h1
            className="clay-text-h1 clay-balance tracking-heading"
            style={{ fontSize: 40, marginBottom: 8 }}
          >
            我的天空
          </h1>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            每一朵云，都是你认真过的日子
          </p>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 0 16px' }}>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="搜索任务名 / 备注 / 日期…"
          />
        </div>

        {/* Search results */}
        {searchQuery ? (
          <SearchResults
            history={allHistoryTasks}
            query={searchQuery}
            typeFilter={searchType}
            onClose={() => { setSearchQuery(''); setSearchType('all'); }}
          />
        ) : (
          <>
            {/* Achievements */}
            <AchievementGrid achievements={state.achievements} />

            {/* Stats cards */}
            {hasLog && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                {[
                  {
                    label: '连续天数',
                    value: state.streak.current,
                    color: 'var(--ink)',
                  },
                  {
                    label: '最佳记录',
                    value: state.streak.best,
                    color: 'var(--warm-coral)',
                  },
                  {
                    label: '总天数',
                    value: totalDays,
                    color: 'var(--mint-cloud-text)',
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="shadow-tinted"
                    style={{
                      borderRadius: '16px',
                      padding: '20px 14px',
                      textAlign: 'center',
                      background: 'var(--surface-1)',
                      border: 'var(--hairline-subtle)',
                    }}
                  >
                    <div
                      className="clay-tnum"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 36,
                        fontWeight: 700,
                        color,
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        color: 'var(--ink-light)',
                        fontSize: 12,
                        marginTop: 6,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* StreakDisplay */}
            {hasLog && (
              <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
                <StreakDisplay
                  log={todayLog}
                  streakCurrent={state.streak.current}
                  mood={skyMood}
                />
              </div>
            )}

            {/* Task History */}
            <TaskHistory history={allHistoryTasks} />

            {/* Empty state */}
            {!hasLog && (
              <div
                className="shadow-tinted"
                style={{
                  borderRadius: 'var(--radius-chunk, 20px)',
                  padding: '48px 32px',
                  textAlign: 'center',
                  background: 'var(--surface-1)',
                  border: 'var(--hairline-subtle)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>☁️</div>
                <h2
                  className="clay-text-h2 clay-balance"
                  style={{ fontSize: 22, marginBottom: 8 }}
                >
                  天空还空着呢
                </h2>
                <p
                  style={{
                    color: 'var(--ink-light)',
                    fontSize: 15,
                    lineHeight: 'var(--leading-relaxed)',
                    marginBottom: 24,
                  }}
                >
                  去「今天」页面，养下第一朵云吧
                </p>
                <button
                  onClick={onNavigateToToday}
                  className="clay-focusable"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '14px 28px',
                    borderRadius: '14px',
                    background: 'var(--mint-cloud-cta)',
                    color: 'white',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 15,
                    minHeight: 44,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(111, 207, 138, 0.35)',
                    transition: 'all var(--dur-fast) var(--ease-out-expo)',
                  }}
                >
                  ☁️ 去养今天的云
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
