import type { AppState, Task } from '../types';
import type { Mood } from '../components/shared/MoodWidget';
import { copy } from '../utils/copy';
import DailyQuote from '../components/shared/DailyQuote';
import Pomodoro from '../components/shared/Pomodoro';
import SkyProgress from '../components/sky/SkyProgress';
import TodayDecisionCard from '../components/today/TodayDecisionCard';
import EmptyCloudCard from '../components/today/EmptyCloudCard';
import type { Dispatch, SetStateAction } from 'react';

interface TodayPageProps {
  state: AppState;
  today: string;
  todaysTasks: Task[];
  incompleteTasks: Task[];
  completedTasks: Task[];
  allTodaysTasksDone: boolean;
  atMaxTasks: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleAddTask: () => void;
  addWithValue: (value: string) => void;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  handleMoodSelect: (mood: Mood) => void;
  handlePomodoroComplete: (sessionType: 'focus' | 'shortBreak' | 'longBreak') => void;
  handleReset: () => void;
  handleEasier: () => void;
  pomodoroExpanded: boolean;
  setPomodoroExpanded: Dispatch<SetStateAction<boolean>>;
  skyMood: import('../utils/skyMood').SkyMood;
}

/**
 * Today 页 — Round 1 零决策主页
 *
 * 视觉顺序：
 *   1. 天空状态（SkyProgress）— 情绪基调
 *   2. 今日零决策卡 — 唯一主角
 *   3. 弱化：引用 + 番茄钟 + Footer
 *
 * 决策消除：
 *   - 分类 chip 移除了 — 不是分类，是降低决策成本
 *   - FAB 退场 — 让"完成这朵云"成为唯一主按钮
 *   - 轻建议只做辅助，弱化
 */
export default function TodayPage({
  state,
  today,
  todaysTasks,
  incompleteTasks,
  completedTasks,
  allTodaysTasksDone,
  atMaxTasks,
  input,
  setInput,
  handleAddTask,
  addWithValue,
  handleCompleteTask,
  handleDeleteTask,
  handleMoodSelect,
  handlePomodoroComplete,
  handleReset,
  handleEasier,
  pomodoroExpanded,
  setPomodoroExpanded,
  skyMood,
}: TodayPageProps) {
  // atMaxTasks / input / setInput / handleAddTask / handleDeleteTask 暂时未使用
  // 保留 props 以备未来扩展（FAB 输入流、编辑任务、删除任务等）
  void atMaxTasks; void input; void setInput; void handleAddTask; void handleDeleteTask;

  // 当前唯一在养的那朵云（如果存在）
  const currentTask = incompleteTasks[0] ?? completedTasks[0] ?? null;

  return (
    <div className="clay-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* ============================================================
          天空状态 — 情绪基调（不滚动）
          ============================================================ */}
      <div className="w-full max-w-md mx-auto" style={{ flexShrink: 0, padding: '10px 16px 0' }}>
        <SkyProgress
          mood={skyMood}
          completedCount={completedTasks.length}
          totalCount={todaysTasks.length}
          streak={state.streak.current}
          bestStreak={state.streak.best}
          totalDays={state.log.length}
          today={today}
          selectedMood={state.moods[today] as Mood | undefined}
          onMoodSelect={handleMoodSelect}
        />

        {/* ============================================================
            今日零决策卡 — 主角
            ============================================================ */}
        {currentTask ? (
          allTodaysTasksDone ? (
            // 全部完成
            <div
              className="animate-fade-up"
              style={{
                margin: '16px 0 0',
                borderRadius: '28px',
                padding: '32px 24px',
                background: 'linear-gradient(180deg, #F5FFF7 0%, #EDFAF0 100%)',
                border: '1px solid var(--mint-cloud-light)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: '0 0 6px',
                }}
              >
                {copy.completed(state.streak.current)}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-light)', margin: '0 0 16px' }}>
                今天完成了 {completedTasks.length} 朵云
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 18px',
                  borderRadius: '12px',
                  background: 'var(--mint-cloud-cta)',
                  color: 'white',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(111, 207, 138, 0.35)',
                }}
              >
                再养一朵
              </button>
            </div>
          ) : (
            <TodayDecisionCard
              task={currentTask}
              onComplete={() => handleCompleteTask(currentTask.id)}
              onEasier={handleEasier}
            />
          )
        ) : (
          <EmptyCloudCard
            onGrow={handleEasier}
            onSuggest={addWithValue}
          />
        )}
      </div>

      {/* ============================================================
          弱化区 — 引用 / 番茄钟 / 底部 whisper
          可滚动
          ============================================================ */}
      <div
        className="clay-scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          paddingBottom: '100px',
        }}
      >
        <div className="w-full max-w-md mx-auto" style={{ padding: '8px 16px' }}>
          {/* Daily Quote — 弱化（更小的字号，更弱的颜色） */}
          <div style={{ opacity: 0.7 }}>
            <DailyQuote />
          </div>

          {/* Pomodoro — 折叠入口 */}
          <button
            onClick={() => setPomodoroExpanded((p) => !p)}
            style={{
              width: '100%',
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'var(--hairline-subtle)',
              background: 'var(--surface-1)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink-light)',
              cursor: 'pointer',
            }}
          >
            <span>⏱️ 番茄钟 · {state.pomodoroSessions || 0} 次专注</span>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              {pomodoroExpanded ? '收起 ▲' : '展开 ▼'}
            </span>
          </button>
          {pomodoroExpanded && (
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
              <Pomodoro onComplete={handlePomodoroComplete} />
            </div>
          )}

          {/* Footer whisper */}
          <div style={{ marginTop: 24, textAlign: 'center', opacity: 0.5 }}>
            <p
              style={{
                color: 'var(--ink-muted)',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                margin: 0,
              }}
            >
              {copy.footer()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
