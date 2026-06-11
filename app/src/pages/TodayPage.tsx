import type { AppState, Task } from '../types';
import type { Mood } from '../components/shared/MoodWidget';
import { copy } from '../utils/copy';
import DailyQuote from '../components/shared/DailyQuote';
import Pomodoro from '../components/shared/Pomodoro';
import SkyProgress from '../components/sky/SkyProgress';
import TodayDecisionCard from '../components/today/TodayDecisionCard';
import TodayFeedbackStrip from '../components/today/TodayFeedbackStrip';
import { SoftButton } from '../components/ui';
import { type Dispatch, type SetStateAction } from 'react';
import CloudGarden from '../components/today/CloudGarden';

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
  handleReset: _handleReset,
  handleEasier,
  onNavigateToSky,
  pomodoroExpanded,
  setPomodoroExpanded,
  skyMood,
}: TodayPageProps) {
  void _input; void _setInput; void _handleAddTask; void _handleDeleteTask; void _atMaxTasks;
  const currentTask = incompleteTasks[0] ?? completedTasks[0] ?? null;

  // 转换 allHistoryTasks 给 CloudGarden 用
  const last7 = Object.entries(state.history)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([date, tasks]) => ({ date, tasks }));

  return (
    <div
      className="clay-content clay-page"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {/* 头部 */}
      <div
        className="w-full max-w-md mx-auto"
        style={{ flexShrink: 0, padding: '12px 16px 0' }}
      >
        {/* SkyProgress - 简化版天空条 */}
        <div style={{ marginBottom: 8 }}>
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

        {/* 价值主张头 */}
        <div className="clay-fade-up" style={{ marginBottom: 8, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            今天，从一朵云开始
          </h1>
          <p style={{ color: 'var(--ink-light)', fontSize: 12, margin: '4px 0 0' }}>
            不用想太多，先养今天这一朵。
          </p>
        </div>

        {/* 状态 chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <div className="clay-chip">🏆 最佳 {state.streak.best}</div>
          <div className="clay-chip">☁️ 累计 {state.log.length}</div>
        </div>

        {/* CloudGarden - 云朵花园主视觉 */}
        <CloudGarden
          today={currentTask}
          last7={last7}
          onTodayComplete={currentTask && !currentTask.completedAt ? () => handleCompleteTask(currentTask.id) : handleEasier}
          mood={currentTask?.completedAt ? 'celebrate' : skyMood === 'golden' ? 'happy' : 'calm'}
        />

        {/* 今日主行动卡 */}
        {currentTask ? (
          allTodaysTasksDone ? (
            <div className="animate-fade-up" style={{ margin: '16px 0', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px' }}>
                今天的云已经养好
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-light)', margin: '0 0 16px' }}>
                你只做了一小步，但它已经留下来了。
              </p>
              <SoftButton variant="ghost" size="md" onClick={onNavigateToSky}>
                去看看我的天空
              </SoftButton>
            </div>
          ) : (
            <div className="clay-fade-up">
              <TodayDecisionCard
                task={currentTask}
                onComplete={() => handleCompleteTask(currentTask.id)}
                onEasier={handleEasier}
                onStartPomodoro={() => setPomodoroExpanded(p => !p)}
              />
            </div>
          )
        ) : (
          <div className="clay-fade-up" style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-light)', margin: '0 0 12px' }}>
              今天不用想太多，我帮你挑一朵轻的。
            </p>
          </div>
        )}

        {/* 心情小记 — 增强"功能感" */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['平静', '低落', '一般', '期待', '高兴'].map((mood, i) => (
            <button
              key={mood}
              className="clay-chip"
              onClick={() => handleMoodSelect(['calm', 'low', 'okay', 'hopeful', 'happy'][i] as Mood)}
              style={{ fontSize: 12 }}
            >
              {['☁️', '🌧', '🌤', '🌈', '☀️'][i]} {mood}
            </button>
          ))}
        </div>

        {/* 今日反馈 */}
        {allTodaysTasksDone && (
          <TodayFeedbackStrip
            completed={true}
            streak={state.streak.current}
            total={state.log.length}
          />
        )}
      </div>

      {/* 弱化区 */}
      <div className="clay-scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '100px', position: 'relative' }}>
        {/* Dawn Aura — 顶部金色渐变融入天空 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '100px',
          background: 'linear-gradient(180deg, rgba(255, 230, 180, 0.3) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div className="w-full max-w-md mx-auto" style={{ padding: '8px 16px', position: 'relative', zIndex: 1 }}>
          {/* 快捷入口 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
            {[
              { label: '读一点', hint: '读 2 页书', emoji: '📖' },
              { label: '走一走', hint: '出门走走 5 分钟', emoji: '🏃' },
              { label: '写一句', hint: '写一行日记', emoji: '📝' },
              { label: '随便养一朵', hint: '深呼吸三次', emoji: '✨' },
            ].map(s => (
              <button
                key={s.label}
                className="clay-quick-suggest"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 16,
                  background: 'var(--surface-1)', border: '1px solid var(--hairline)',
                  cursor: 'pointer', transition: 'all 0.2s ease-out'
                }}
                onClick={() => addWithValue(s.hint)}
              >
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* 番茄钟折叠入口 */}
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

          <div style={{ opacity: 0.7, marginTop: 16 }}>
            <DailyQuote />
          </div>

          <div style={{ marginTop: 24, textAlign: 'center', opacity: 0.5 }}>
            <p style={{ color: 'var(--ink-muted)', fontSize: 12, fontFamily: 'var(--font-body)', margin: 0 }}>
              {copy.footer()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
