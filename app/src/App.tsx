import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, AppState } from './types';
import {
  loadState,
  saveState,
  getToday,
  isYesterday,
  calculateStreak,
  parseTaskFromInput,
  generateId,
  exportState,
} from './utils/storage';
import { copy } from './utils/copy';
import StreakDisplay from './components/StreakDisplay';
import { Celebration } from './components/Celebration';
import TabBar, { TabId } from './components/TabBar';
import TaskHistory from './components/TaskHistory';
import AchievementGrid from './components/AchievementGrid';
import CompletionNote from './components/CompletionNote';
import PresetManager from './components/PresetManager';
import Onboarding from './components/Onboarding';
import DailyQuote from './components/DailyQuote';
import MoodWidget from './components/MoodWidget';
import Pomodoro from './components/Pomodoro';
import ShareCard from './components/ShareCard';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import StatsDashboard from './components/StatsDashboard';
import type { Mood } from './components/MoodWidget';

const MAX_TASKS_PER_DAY = 5;

// Compute hero sky mood (kept inline so the today view can tint the hero)
function skyMoodFromStreak(
  completedToday: boolean,
  missedRecently: boolean,
  isFirstEver: boolean,
  streak: number
): 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden' {
  if (isFirstEver && !completedToday) return 'dawn';
  if (completedToday) {
    if (streak >= 30) return 'golden';
    if (streak >= 14) return 'sunny';
    if (streak >= 7) return 'clear';
    if (streak >= 2) return 'morning';
    return 'dawn';
  }
  if (missedRecently) return 'morning';
  if (streak >= 30) return 'golden';
  if (streak >= 14) return 'sunny';
  if (streak >= 7) return 'clear';
  if (streak >= 2) return 'morning';
  return 'dawn';
}

/** Check and return newly unlocked achievement IDs */
function checkAchievements(state: AppState): string[] {
  const newlyUnlocked: string[] = [];

  const conditions: { id: string; check: (s: AppState) => boolean }[] = [
    { id: 'first-cloud', check: (s) => s.log.length >= 1 },
    { id: 'streak-7', check: (s) => s.streak.best >= 7 },
    { id: 'streak-30', check: (s) => s.streak.best >= 30 },
    { id: 'total-100', check: (s) => s.log.length >= 100 },
    { id: 'bookworm', check: (s) => {
      const allTasks = [...s.tasks, ...Object.values(s.history).flat()];
      return allTasks.filter(t => t.type === 'reading').length >= 50;
    }},
    { id: 'runner', check: (s) => {
      const allTasks = [...s.tasks, ...Object.values(s.history).flat()];
      return allTasks.filter(t => t.type === 'exercise').length >= 30;
    }},
    { id: 'geek', check: (s) => {
      const allTasks = [...s.tasks, ...Object.values(s.history).flat()];
      return allTasks.filter(t => t.type === 'coding').length >= 50;
    }},
  ];

  for (const { id, check } of conditions) {
    if (!state.achievements.includes(id) && check(state)) {
      newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [input, setInput] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | Task['type']>('all');
  const [pomodoroExpanded, setPomodoroExpanded] = useState(false);

  // Sync hasCompletedToday from log
  useEffect(() => {
    const today = getToday();
    setHasCompletedToday(state.log.includes(today));
  }, [state]);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = getToday();
  const todaysTasks = state.tasks.filter((t) => t.createdAt === today);
  const incompleteTasks = todaysTasks.filter((t) => !t.completedAt);
  const completedTasks = todaysTasks.filter((t) => t.completedAt);
  const allTodaysTasksDone = todaysTasks.length > 0 && incompleteTasks.length === 0;

  const missedRecently = useMemo(() => {
    if (state.log.length === 0) return false;
    const last = state.log[state.log.length - 1];
    if (last === today) return false;
    if (isYesterday(last)) return false;
    return true;
  }, [state.log, today]);

  const isFirstEver = state.log.length === 0;

  const skyMood = useMemo(
    () => skyMoodFromStreak(hasCompletedToday, missedRecently, isFirstEver, state.streak.current),
    [hasCompletedToday, missedRecently, isFirstEver, state.streak.current]
  );

  const handleAddTask = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === '​') return;
    if (todaysTasks.length >= MAX_TASKS_PER_DAY) return;

    const parsed = parseTaskFromInput(input.trim());

    let startPage = state.settings.lastPageRead + 1;
    let endPage = startPage + (parsed.pagesPerSession || 10) - 1;

    if (parsed.bookName && parsed.bookName === state.settings.lastBookName) {
      startPage = state.settings.lastPageRead + 1;
      endPage = startPage + (parsed.pagesPerSession || 10) - 1;
    }

    const newTask: Task = {
      id: generateId(),
      title: trimmed,
      type: parsed.type || 'other',
      bookName: parsed.bookName,
      currentPage: endPage,
      pagesPerSession: parsed.pagesPerSession || 10,
      startPage,
      endPage,
      place: '安静的地方',
      time: '30分钟',
      createdAt: today,
    };

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    setInput('');
  }, [input, todaysTasks.length, state.settings, today]);

  const handleCompleteTask = useCallback((taskId: string) => {
    setCompletingTaskId(taskId);
  }, []);

  const handleConfirmComplete = useCallback((note: string) => {
    if (!completingTaskId) return;

    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === completingTaskId);
      if (!task) return prev;

      const updatedTask: Task = {
        ...task,
        completedAt: today,
        currentPage: task.endPage,
        note: note || undefined,
      };

      const updatedTasks = prev.tasks.map((t) =>
        t.id === completingTaskId ? updatedTask : t
      );

      const newLog = prev.log.includes(today) ? prev.log : [...prev.log, today];
      const newStreak = calculateStreak(newLog);

      const newSettings = {
        ...prev.settings,
        lastPageRead: task.endPage || 0,
        lastBookName: task.bookName || prev.settings.lastBookName,
      };

      // Archive completed task to history
      const newHistory = { ...prev.history };
      if (!newHistory[today]) newHistory[today] = [];
      newHistory[today] = [...newHistory[today], updatedTask];

      const newState = {
        ...prev,
        tasks: updatedTasks,
        log: newLog,
        streak: newStreak,
        settings: newSettings,
        history: newHistory,
      };

      // Check achievements
      const unlocked = checkAchievements(newState);
      if (unlocked.length > 0) {
        newState.achievements = [...new Set([...newState.achievements, ...unlocked])];
      }

      return newState;
    });

    setCompletingTaskId(null);

    // Check if all tasks done — trigger celebration
    const remaining = todaysTasks.filter(
      (t) => t.id !== completingTaskId && !t.completedAt
    );
    if (remaining.length === 0) {
      setShowCelebration(true);
      setHasCompletedToday(true);
    }
  }, [completingTaskId, today, todaysTasks]);

  const handleCancelComplete = useCallback(() => {
    setCompletingTaskId(null);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.createdAt !== today),
    }));
    setHasCompletedToday(false);
  }, [today]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setShowShareCard(true);
  }, []);

  const handleMoodSelect = useCallback((mood: Mood) => {
    setState((prev) => ({
      ...prev,
      moods: { ...prev.moods, [today]: mood },
    }));
  }, [today]);

  const handleOnboardingFinish = useCallback(() => {
    setState((prev) => ({ ...prev, onboarded: true }));
  }, []);

  const handlePomodoroComplete = useCallback((sessionType: 'focus' | 'shortBreak' | 'longBreak') => {
    if (sessionType === 'focus') {
      setState((prev) => ({
        ...prev,
        pomodoroSessions: (prev.pomodoroSessions || 0) + 1,
      }));
    }
  }, []);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          if (window.confirm('导入数据将覆盖当前数据，确定继续？')) {
            setState(json);
          }
        } catch {
          alert('文件格式不正确');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const totalDays = state.log.length;
  const todayLog = state.log;
  const hasLog = state.log.length > 0;
  const atMaxTasks = todaysTasks.length >= MAX_TASKS_PER_DAY;

  // Get all tasks for history (combine current + archived)
  const allHistoryTasks = useMemo(() => {
    const combined: Record<string, Task[]> = { ...state.history };
    // Add current tasks that aren't in history yet
    state.tasks.forEach((task) => {
      const date = task.createdAt;
      if (!combined[date]) combined[date] = [];
      if (!combined[date].some((t) => t.id === task.id)) {
        combined[date] = [...combined[date], task];
      }
    });
    return combined;
  }, [state.tasks, state.history]);

  return (
    <div
      className="clay-page-grain"
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at top, #FFE9DF 0%, #FDF4F0 60%, #FAE6DC 100%)',
      }}
    >
      {/* Onboarding overlay */}
      {!state.onboarded && (
        <Onboarding onFinish={handleOnboardingFinish} />
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <Celebration onComplete={handleCelebrationComplete} />
      )}

      {/* Share card */}
      {showShareCard && (
        <ShareCard
          completedTasks={completedTasks}
          streak={state.streak.current}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* Completion note modal */}
      {completingTaskId && (
        <CompletionNote
          onConfirm={handleConfirmComplete}
          onCancel={handleCancelComplete}
        />
      )}

      {/* ==================================================================
          TAB 1: 今天
          ================================================================== */}
      {activeTab === 'today' && (
        <div className="clay-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* ============================================================
              HEADER — 不滚动区域
              ============================================================ */}
          <div className="w-full max-w-md mx-auto" style={{ flexShrink: 0 }}>

            {/* ============================================================
                TOP BAR — 日期 + 问候 + 连续天数，一行搞定
                ============================================================ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px 6px',
              }}
            >
              <div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--ink-light)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.3,
                }}>
                  {(() => {
                    const d = new Date();
                    const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
                    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
                  })()}
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.3,
                }}>
                  {(() => {
                    const h = new Date().getHours();
                    if (h < 6) return '夜深了 🌙';
                    if (h < 9) return '早上好 ☀️';
                    if (h < 12) return '上午好 🌤';
                    if (h < 14) return '中午好 ☁️';
                    if (h < 18) return '下午好 🌈';
                    return '晚上好 ✨';
                  })()}
                </div>
              </div>
              {/* 连续天数徽章 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: state.streak.current > 0
                  ? 'linear-gradient(135deg, var(--warm-coral) 0%, var(--warm-amber) 100%)'
                  : 'var(--neutral-200)',
                color: state.streak.current > 0 ? '#fff' : 'var(--ink-light)',
                boxShadow: state.streak.current > 0
                  ? '0 3px 12px rgba(255, 155, 133, 0.4)'
                  : 'none',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                  {state.streak.current}
                </span>
                <span style={{ fontSize: '9px', lineHeight: 1, opacity: 0.85, marginTop: 2 }}>
                  天
                </span>
              </div>
            </div>

            {/* ============================================================
                PROGRESS RING + QUICK STATS — 今日进度 + 迷你统计
                ============================================================ */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '8px 20px 12px',
            }}>
              {/* 进度环 */}
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="var(--neutral-200)" strokeWidth="6" />
                  {todaysTasks.length > 0 && (
                    <circle
                      cx="36" cy="36" r="30" fill="none"
                      stroke="var(--mint-cloud)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - completedTasks.length / todaysTasks.length)}`}
                      style={{ transition: 'stroke-dashoffset 0.6s var(--ease-out-quart)' }}
                    />
                  )}
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)', lineHeight: 1 }}>
                    {completedTasks.length}/{todaysTasks.length || '0'}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--ink-light)', lineHeight: 1, marginTop: 1 }}>
                    完成
                  </span>
                </div>
              </div>

              {/* 迷你统计卡片 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* 心情 / 连续 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 10,
                  background: 'var(--surface-1)', fontSize: 12,
                  color: 'var(--ink-light)', fontFamily: 'var(--font-body)',
                }}>
                  <span style={{ fontSize: 16 }}>
                    {state.moods[today]
                      ? {down:'☁️',low:'🌧',okay:'🌤',gloomy:'⛈',hopeful:'🌈'}[state.moods[today]]
                      : '🤔'}
                  </span>
                  <span>{state.moods[today] ? '今天心情' : '记录心情'}</span>
                </div>
                {/* 最佳记录 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 10,
                  background: 'var(--surface-1)', fontSize: 12,
                  color: 'var(--ink-light)', fontFamily: 'var(--font-body)',
                }}>
                  <span style={{ fontSize: 16 }}>🏆</span>
                  <span>最佳 {state.streak.best} 天</span>
                </div>
                {/* 总任务 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 10,
                  background: 'var(--surface-1)', fontSize: 12,
                  color: 'var(--ink-light)', fontFamily: 'var(--font-body)',
                }}>
                  <span style={{ fontSize: 16 }}>📋</span>
                  <span>累计 {state.log.length} 天</span>
                </div>
              </div>
            </div>

            {/* ============================================================
                DAILY QUOTE — 紧凑引用条
                ============================================================ */}
            <div style={{ padding: '0 20px 6px' }}>
              <DailyQuote />
            </div>

            {/* ============================================================
                MOOD WIDGET — 心情选择（仅今天未选时显示）
                ============================================================ */}
            {!state.moods[today] && (
              <div style={{ padding: '0 20px 8px' }}>
                <MoodWidget
                  selected={(state.moods[today] as Mood) || undefined}
                  onSelect={handleMoodSelect}
                />
              </div>
            )}

            {/* ============================================================
                CATEGORY CHIPS — 快速添加分类
                ============================================================ */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                padding: '0 20px 10px',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
              className="clay-cat-scroll"
            >
              {[
                { id: 'all', label: '全部', icon: '☁️' },
                { id: 'reading', label: '阅读', icon: '📖' },
                { id: 'exercise', label: '运动', icon: '🏃' },
                { id: 'coding', label: '编码', icon: '💻' },
                { id: 'other', label: '其他', icon: '✨' },
              ].map((cat) => {
                const isActive = (input === '' && cat.id === 'all') || input === cat.label;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === 'all') setInput('');
                      else setInput(cat.label);
                    }}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: isActive
                        ? '1px solid var(--mint-cloud-deep)'
                        : '1px solid var(--hairline)',
                      background: isActive ? 'var(--mint-cloud-light)' : 'var(--surface-0)',
                      color: isActive ? 'var(--mint-cloud-text)' : 'var(--ink-light)',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      transition: 'all var(--dur-fast)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: '13px' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* ============================================================
              SCROLLABLE — 任务列表滚动区域
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
            <div className="w-full max-w-md mx-auto">
              {/* 任务计数小条 */}
              {todaysTasks.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px 6px',
                    fontSize: '11px',
                    color: 'var(--ink-light)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span>今天 · {completedTasks.length}/{todaysTasks.length}</span>
                  <span>{todaysTasks.filter(t => !t.completedAt).length} 待办</span>
                </div>
              )}

              {/* 任务列表 */}
              <div style={{ padding: '0 20px' }}>
                {incompleteTasks.map((task) => (
                  <CompactTaskRow
                    key={task.id}
                    task={task}
                    onComplete={() => handleCompleteTask(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
                {completedTasks.map((task) => (
                  <CompactTaskRow
                    key={task.id}
                    task={task}
                    completed
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}

                {/* Empty state */}
                {todaysTasks.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '32px 20px 20px',
                      color: 'var(--ink-light)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {/* 大云朵插画 */}
                    <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.7 }}>☁️</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                      今天还没有云
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-light)', marginBottom: '16px', lineHeight: 1.5 }}>
                      说一句话，养下今天的第一朵云
                    </div>
                    {/* 快速建议 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: 280, margin: '0 auto' }}>
                      {[
                        { label: '📖 读10页书', value: '读10页书' },
                        { label: '🏃 出门走走', value: '出门走走' },
                        { label: '💻 写代码', value: '写代码' },
                        { label: '📝 写日记', value: '写日记' },
                        { label: '🧘 冥想5分钟', value: '冥想5分钟' },
                        { label: '🎵 练琴', value: '练琴' },
                      ].map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setInput(s.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '999px',
                            border: '1px solid var(--hairline)',
                            background: 'var(--surface-0)',
                            fontSize: '12px',
                            fontFamily: 'var(--font-body)',
                            color: 'var(--ink-light)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all var(--dur-fast)',
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pomodoro — collapsible */}
              <div style={{ padding: '4px 20px 0' }}>
                <button
                  onClick={() => setPomodoroExpanded((p) => !p)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: 'var(--hairline-subtle)',
                    background: 'var(--surface-1)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-light)',
                    cursor: 'pointer',
                  }}
                >
                  <span>⏱️ 番茄钟 · {state.pomodoroSessions || 0} 次专注</span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                    {pomodoroExpanded ? '收起 ▲' : '展开 ▼'}
                  </span>
                </button>
                {pomodoroExpanded && (
                  <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                    <Pomodoro onComplete={handlePomodoroComplete} />
                  </div>
                )}
              </div>

              {/* All done state */}
              {allTodaysTasksDone && completedTasks.length > 0 && (
                <div
                  className="animate-fade-up"
                  style={{
                    margin: '16px 20px 0',
                    borderRadius: '20px',
                    padding: '24px 20px',
                    background: 'linear-gradient(180deg, #F5FFF7 0%, #EDFAF0 100%)',
                    border: '1px solid var(--mint-cloud-light)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      margin: '0 0 4px',
                    }}
                  >
                    {copy.completed(state.streak.current)}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--ink-light)', margin: '0 0 12px' }}>
                    今天完成了 {completedTasks.length} 个任务
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
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(111, 207, 138, 0.35)',
                    }}
                  >
                    再养一朵
                  </button>
                </div>
              )}

              {/* Footer whisper */}
              <div className="text-center" style={{ marginTop: '24px', opacity: 0.5 }}>
                <p
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {copy.footer()}
                </p>
              </div>
            </div>
          </div>

            {/* ============================================================
              FAB — 右下角悬浮 + 按钮
              模仿"我的笔记"那个粉圆 +
              点击 → 弹出一个内联输入条，按 Enter 提交
              ============================================================ */}
          {input !== '' ? (
            /* 输入态：左侧输入条 + 右侧添加按钮（替代 FAB） */
            <div
              style={{
                position: 'fixed',
                left: '20px',
                right: '20px',
                bottom: '88px',
                zIndex: 95,
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTask();
                  } else if (e.key === 'Escape') {
                    setInput('');
                  }
                }}
                placeholder={atMaxTasks ? `每天最多 ${MAX_TASKS_PER_DAY} 个任务` : copy.inputPlaceholder()}
                disabled={atMaxTasks}
                style={{
                  flex: 1,
                  height: '48px',
                  padding: '0 18px',
                  borderRadius: '24px',
                  border: '1px solid var(--mint-cloud)',
                  background: 'var(--surface-0)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  boxShadow: '0 4px 16px rgba(74, 181, 116, 0.25)',
                }}
              />
              <button
                onClick={() => input.trim() && handleAddTask()}
                disabled={!input.trim() || atMaxTasks}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--mint-cloud-cta)',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(111, 207, 138, 0.4)',
                  flexShrink: 0,
                }}
              >
                →
              </button>
              <button
                onClick={() => setInput('')}
                aria-label="取消"
                style={{
                  width: '40px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink-light)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            /* 闲置态：单个 FAB */
            <button
              onClick={() => {
                if (atMaxTasks) return;
                setInput('​'); // zero-width space triggers input mode
              }}
              disabled={atMaxTasks}
              aria-label="添加新任务"
              style={{
                position: 'fixed',
                right: '20px',
                bottom: '88px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: atMaxTasks
                  ? 'var(--neutral-300)'
                  : 'linear-gradient(180deg, #FFC288 0%, #FF9B85 100%)',
                color: 'white',
                fontSize: '30px',
                fontWeight: 300,
                cursor: atMaxTasks ? 'not-allowed' : 'pointer',
                boxShadow: atMaxTasks
                  ? 'none'
                  : '0 6px 20px rgba(255, 155, 133, 0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(200, 100, 80, 0.15)',
                zIndex: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--dur-fast) var(--ease-out-expo)',
              }}
              onMouseDown={(e) => {
                if (atMaxTasks) return;
                e.currentTarget.style.transform = 'translateY(2px) scale(0.96)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 155, 133, 0.4), inset 0 2px 4px rgba(200, 100, 80, 0.2)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 155, 133, 0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(200, 100, 80, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 155, 133, 0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(200, 100, 80, 0.15)';
              }}
            >
              +
            </button>
          )}
        </div>
      )}

      {/* ==================================================================
          TAB 2: 我的天空
          ================================================================== */}
      {activeTab === 'sky' && (
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
                  onClick={() => setActiveTab('today')}
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
      )}

      {/* ==================================================================
          TAB 3: 统计
          ================================================================== */}
      {activeTab === 'stats' && (
        <div
          className="clay-content clay-scroll-area"
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            paddingBottom: '80px',
          }}
        >
          <StatsDashboard
            history={allHistoryTasks}
            streak={state.streak}
            moods={state.moods}
          />
        </div>
      )}

      {/* ==================================================================
          TAB 4: 设置
          ================================================================== */}
      {activeTab === 'settings' && (
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
                style={{ fontSize: 40 }}
              >
                设置
              </h1>
            </div>

            {/* Preset Manager */}
            <PresetManager
              presets={state.settings.customPresets}
              onUpdate={(presets) =>
                setState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, customPresets: presets },
                }))
              }
            />

            {/* Data export/import */}
            <div
              className="shadow-tinted"
              style={{
                borderRadius: 'var(--radius-chunk, 20px)',
                padding: '28px 24px',
                marginBottom: '16px',
                background: 'var(--surface-1)',
                border: 'var(--hairline-subtle)',
              }}
            >
              <h2
                className="clay-text-h2"
                style={{ fontSize: 20, marginBottom: 8 }}
              >
                数据管理
              </h2>
              <p
                style={{
                  color: 'var(--ink-light)',
                  fontSize: 14,
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: 20,
                }}
              >
                导出或导入你的数据，云朵不会丢。
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => exportState(state)}
                  className="clay-focusable"
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: 'var(--surface-2)',
                    color: 'var(--ink)',
                    border: 'var(--hairline)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 14,
                    minHeight: 44,
                    cursor: 'pointer',
                    transition: 'all var(--dur-fast) var(--ease-out-expo)',
                  }}
                >
                  📤 导出
                </button>
                <button
                  onClick={handleImportData}
                  className="clay-focusable"
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: 'var(--surface-2)',
                    color: 'var(--ink)',
                    border: 'var(--hairline)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 14,
                    minHeight: 44,
                    cursor: 'pointer',
                    transition: 'all var(--dur-fast) var(--ease-out-expo)',
                  }}
                >
                  📥 导入
                </button>
              </div>
            </div>

            {/* Reset card */}
            <div
              className="shadow-tinted"
              style={{
                borderRadius: 'var(--radius-chunk, 20px)',
                padding: '28px 24px',
                marginBottom: '16px',
                background: 'var(--surface-1)',
                border: 'var(--hairline-subtle)',
              }}
            >
              <h2
                className="clay-text-h2"
                style={{ fontSize: 20, marginBottom: 8 }}
              >
                重置数据
              </h2>
              <p
                style={{
                  color: 'var(--ink-light)',
                  fontSize: 14,
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: 20,
                }}
              >
                清空所有任务记录和连续天数，天空会回到最初的样子。
              </p>
              <button
                onClick={() => {
                  if (window.confirm(copy.resetConfirm())) {
                    localStorage.removeItem('daily-zero-decision');
                    window.location.reload();
                  }
                }}
                className="clay-focusable"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: 'var(--surface-2)',
                  color: 'var(--warm-coral)',
                  border: 'var(--hairline)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 15,
                  minHeight: 44,
                  cursor: 'pointer',
                  transition: 'all var(--dur-fast) var(--ease-out-expo)',
                }}
              >
                {copy.reset()}
              </button>
            </div>

            {/* About card */}
            <div
              className="shadow-tinted"
              style={{
                borderRadius: 'var(--radius-chunk, 20px)',
                padding: '28px 24px',
                marginBottom: '16px',
                background: 'var(--surface-1)',
                border: 'var(--hairline-subtle)',
              }}
            >
              <h2
                className="clay-text-h2"
                style={{ fontSize: 20, marginBottom: 8 }}
              >
                关于
              </h2>
              <p
                style={{
                  color: 'var(--ink-light)',
                  fontSize: 14,
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                每日零决策卡 · 养一朵云
              </p>
              <p
                style={{
                  color: 'var(--ink-light)',
                  fontSize: 13,
                  lineHeight: 'var(--leading-relaxed)',
                  marginTop: 4,
                  opacity: 0.7,
                }}
              >
                每天说一句话，天空里就多一朵云。
                漏签了也没关系，云会飘回来。
              </p>
            </div>

            {/* Footer */}
            <div
              className="text-center"
              style={{ marginTop: '24px', opacity: 0.5 }}
            >
              <p
                style={{
                  color: 'var(--ink-muted)',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                }}
              >
                v0.2.0 · 用 ☁️ 做的
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// Achievement display info → see utils/achievements.ts

// ============================================================
// CompactTaskRow — 紧凑任务行（参考图列表风格）
// ============================================================
const TYPE_INFO: Record<Task['type'], { icon: string; bg: string; color: string; label: string }> = {
  reading: { icon: '📖', bg: '#FFE2D5', color: '#C2410C', label: '阅读' },
  exercise: { icon: '🏃', bg: '#D1FAE5', color: '#047857', label: '运动' },
  coding: { icon: '💻', bg: '#DBEAFE', color: '#1D4ED8', label: '编码' },
  other: { icon: '✨', bg: '#F3E8FF', color: '#7E22CE', label: '其他' },
};

function CompactTaskRow({
  task,
  completed,
  onComplete,
  onDelete,
}: {
  task: Task;
  completed?: boolean;
  onComplete?: () => void;
  onDelete?: () => void;
}) {
  const typeInfo = TYPE_INFO[task.type] || TYPE_INFO.other;

  return (
    <div
      className="shadow-tinted"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        marginBottom: '8px',
        borderRadius: '14px',
        background: completed
          ? 'linear-gradient(180deg, #F5FFF7 0%, #EDFAF0 100%)'
          : 'var(--surface-0)',
        border: completed
          ? '1px solid var(--mint-cloud-light)'
          : 'var(--hairline-subtle)',
        opacity: completed ? 0.85 : 1,
        transition: 'all var(--dur-fast) var(--ease-out-expo)',
      }}
    >
      {/* 类型色块 */}
      <div
        style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: typeInfo.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}
        aria-hidden
      >
        {typeInfo.icon}
      </div>

      {/* 标题 + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: completed ? 'var(--ink-light)' : 'var(--ink)',
            textDecoration: completed ? 'line-through' : 'none',
            textDecorationColor: 'var(--mint-cloud)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </div>
        {task.startPage !== undefined && task.endPage !== undefined && !completed && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-faint)',
              marginTop: '2px',
              fontFamily: 'var(--font-body)',
            }}
          >
            📖 {task.startPage} → {task.endPage} 页
          </div>
        )}
        {task.note && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-light)',
              fontStyle: 'italic',
              marginTop: '2px',
              fontFamily: 'var(--font-body)',
            }}
          >
            💭 {task.note}
          </div>
        )}
      </div>

      {/* 操作 */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {onComplete && !completed && (
          <button
            onClick={onComplete}
            aria-label="完成任务"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--mint-cloud-light)',
              color: 'var(--mint-cloud-text)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--dur-fast) var(--ease-out-expo)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.92)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✓
          </button>
        )}
        {completed && (
          <span
            aria-label="已完成"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--mint-cloud)',
              color: 'white',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✓
          </span>
        )}
        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm('删除这个任务？')) onDelete();
            }}
            aria-label="删除任务"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-faint)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
