import type { AppState, Task } from '../types';
import type { Mood } from '../components/shared/MoodWidget';
import { copy } from '../utils/copy';
import DailyQuote from '../components/shared/DailyQuote';
import Pomodoro from '../components/shared/Pomodoro';
import SkyProgress from '../components/sky/SkyProgress';
import TodayDecisionCard from '../components/today/TodayDecisionCard';
import EmptyCloudCard from '../components/today/EmptyCloudCard';
import { SoftButton } from '../components/ui';
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
  void atMaxTasks; void input; void setInput; void handleAddTask; void handleDeleteTask;
  const currentTask = incompleteTasks[0] ?? completedTasks[0] ?? null;

  return (
    <div
      className="clay-content clay-page"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {/* 头部（不可滚动） */}
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

        {currentTask ? (
          allTodaysTasksDone ? (
            <div className="animate-fade-up" style={{ margin: '16px 0 0' }}>
              <div className="clay-card clay-card--celebrate" style={{ textAlign: 'center' }}>
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
                <SoftButton variant="mint" size="md" onClick={handleReset}>
                  再养一朵
                </SoftButton>
              </div>
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

      {/* 弱化区（可滚动） */}
      <div
        className="clay-scroll-area"
        style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '100px' }}
      >
        <div className="w-full max-w-md mx-auto" style={{ padding: '8px 16px' }}>
          <div style={{ opacity: 0.7 }}>
            <DailyQuote />
          </div>

          <button
            onClick={() => setPomodoroExpanded((p) => !p)}
            className="clay-collapse"
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
