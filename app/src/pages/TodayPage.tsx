import type { AppState, Task } from '../types';
import type { Mood } from '../components/shared/MoodWidget';
import { copy } from '../utils/copy';
import DailyQuote from '../components/shared/DailyQuote';
import Pomodoro from '../components/shared/Pomodoro';
import SkyProgress from '../components/sky/SkyProgress';
import TodayDecisionCard from '../components/today/TodayDecisionCard';
import EmptyCloudCard from '../components/today/EmptyCloudCard';
import { SoftButton } from '../components/ui';
import { useState, type Dispatch, type SetStateAction } from 'react';

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
  onNavigateToSky: () => void;
  pomodoroExpanded: boolean;
  setPomodoroExpanded: Dispatch<SetStateAction<boolean>>;
  skyMood: import('../utils/skyMood').SkyMood;
}

/**
 * Today 页 — Round 5 重塑
 * 一、价值主张：每天不知道从哪开始？今天只做这一小步。
 * 二、唯一主角：今日最小行动卡（主题型壳 + 任务型核 + 奖励闭环）
 * 三、番茄钟降级成内联小按钮，不再独立成块
 */
export default function TodayPage({
  state,
  today,
  todaysTasks,
  incompleteTasks,
  completedTasks,
  allTodaysTasksDone,
  atMaxTasks: _atMaxTasks,
  input: _input,
  setInput: _setInput,
  handleAddTask: _handleAddTask,
  addWithValue,
  handleCompleteTask,
  handleDeleteTask: _handleDeleteTask,
  handleMoodSelect,
  handlePomodoroComplete,
  handleReset: _handleReset,  // 完成态不再使用（避免"再养一朵"破坏"每日单卡"语义），保留给 App.tsx 接口兼容
  handleEasier,
  onNavigateToSky,
  pomodoroExpanded: _pomodoroExpanded,
  setPomodoroExpanded: _setPomodoroExpanded,
  skyMood,
}: TodayPageProps) {
  void _input; void _setInput; void _handleAddTask; void _handleDeleteTask; void _atMaxTasks; void _pomodoroExpanded; void _setPomodoroExpanded;
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const currentTask = incompleteTasks[0] ?? completedTasks[0] ?? null;

  return (
    <div
      className="clay-content clay-page"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {/* 头部（不可滚动） */}
      <div
        className="w-full max-w-md mx-auto"
        style={{ flexShrink: 0, padding: '12px 16px 0' }}
      >
        {/* 价值主张：3 秒内让客户知道这是干嘛的 */}
        {todaysTasks.length === 0 ? (
          <div style={{ marginBottom: 10, textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              每天不知道从哪开始？
            </h1>
            <p
              style={{
                color: 'var(--ink-light)',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                lineHeight: 1.55,
                margin: '4px 0 0',
              }}
            >
              我帮你把想坚持的事，变成今天能完成的一小步。
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              padding: '0 4px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              今日只做这一小步
            </span>
            <span
              style={{
                color: 'var(--ink-faint)',
                fontSize: 11,
                fontFamily: 'var(--font-body)',
                flex: 1,
                textAlign: 'right',
              }}
            >
              ☁️ {state.streak.current} 天
            </span>
          </div>
        )}

        {/* SkyProgress 降级为小状态条（不在首屏占大块） */}
        <div style={{ marginBottom: 4 }}>
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
            compact
          />
        </div>

        {currentTask ? (
          allTodaysTasksDone ? (
            <div className="animate-fade-up" style={{ margin: '12px 0 0' }}>
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
                  今天的云长出来了 ☁️
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '0 0 16px', lineHeight: 1.55 }}>
                  你已经回来 {state.streak.current} 天了，
                  天空里有 {state.log.length} 朵云。
                  <br />
                  明天不用多做，再回来养一朵就好。
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <SoftButton
                    variant="mint"
                    size="md"
                    onClick={onNavigateToSky}
                  >
                    ☁️ 看看我的天空
                  </SoftButton>
                </div>
              </div>
            </div>
          ) : (
            <TodayDecisionCard
              task={currentTask}
              onComplete={() => handleCompleteTask(currentTask.id)}
              onEasier={handleEasier}
              onStartPomodoro={() => setPomodoroOpen((p) => !p)}
            />
          )
        ) : (
          <EmptyCloudCard
            onGrow={handleEasier}
            onSuggest={addWithValue}
          />
        )}

        {/* 番茄钟下拉（被点击展开时显示完整组件） */}
        {pomodoroOpen && !allTodaysTasksDone && currentTask && (
          <div
            className="animate-fade-up"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            <Pomodoro onComplete={handlePomodoroComplete} />
          </div>
        )}
        {void _pomodoroExpanded}
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
