import { useState, useCallback } from 'react';
import { Celebration } from './components/shared/Celebration';
import TabBar, { TabId } from './components/shared/TabBar';
import CompletionNote from './components/shared/CompletionNote';
import Onboarding from './components/shared/Onboarding';
import ShareCard from './components/shared/ShareCard';
import type { Task } from './types';

// Hooks
import { useAppState } from './hooks/useAppState';
import { useTasks } from './hooks/useTasks';
import { useStreak } from './hooks/useStreak';
import { useSearch } from './hooks/useSearch';
import { usePomodoro } from './hooks/usePomodoro';
import { useFont } from './hooks/useFont';

// Extracted pages
import TodayPage from './pages/TodayPage';
import SkyPage from './pages/SkyPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  // Core state + persistence
  const { state, setState, handleImportData } = useAppState();

  // UI-only state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('today');

  // Celebration handler
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setShowShareCard(true);
  }, []);

  // Task operations
  const {
    input,
    setInput,
    completingTaskId,
    hasCompletedToday,
    todaysTasks,
    incompleteTasks,
    completedTasks,
    allTodaysTasksDone,
    atMaxTasks,
    handleAddTask,
    addWithValue,
    handleCompleteTask,
    handleConfirmComplete,
    handleCancelComplete,
    handleDeleteTask,
    handleReset,
    handleMoodSelect,
    handleOnboardingFinish,
    handlePomodoroComplete,
    handleEasier,
    today,
  } = useTasks(state, setState, () => setShowCelebration(true));

  // Streak + sky mood
  const {
    skyMood,
    totalDays,
    hasLog,
    todayLog,
    allHistoryTasks,
  } = useStreak(state, hasCompletedToday);

  // Search
  const { searchQuery, setSearchQuery, searchType, setSearchType } = useSearch();

  // Pomodoro
  const { pomodoroExpanded, setPomodoroExpanded } = usePomodoro();

  // Font preference
  const { font, setFont } = useFont();

  return (
    <div
      className="clay-page-grain"
      data-font={font}
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
        <Onboarding
          onFinish={handleOnboardingFinish}
          onSelect={addWithValue}
          onTryDemo={() => {
            // 注入示范数据：让"先看看示例"的访客立刻看到完整主页体验
            const today = new Date().toISOString().slice(0, 10);
            const fakeHistory: Record<string, Task[]> = {};
            for (let i = 1; i <= 5; i++) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const key = d.toISOString().slice(0, 10);
              const types: Array<Task['type']> = ['reading', 'exercise', 'coding', 'other', 'reading'];
              const titles = ['读 2 页书', '出门走走 5 分钟', '看 5 分钟代码', '写一行日记', '读 1 页书'];
              fakeHistory[key] = [{
                id: 'demo' + i, title: titles[i - 1], type: types[i - 1],
                createdAt: key, completedAt: key,
                time: '5 分钟', place: '安静的地方',
              }];
            }
            const moodMap: Record<string, 'okay' | 'hopeful' | 'low'> = {};
            Object.keys(fakeHistory).forEach((k, i) => {
              moodMap[k] = (['okay', 'hopeful', 'okay', 'low', 'okay'] as const)[i];
            });
            setState((prev) => ({
              ...prev,
              tasks: [],
              log: [...Object.keys(fakeHistory), today],
              streak: { current: 5, best: 5, lastCompletedDate: today },
              history: { ...fakeHistory, [today]: [] },
              moods: moodMap,
              achievements: ['first-cloud', 'streak-7'],
            }));
          }}
        />
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
        <TodayPage
          state={state}
          today={today}
          skyMood={skyMood}          todaysTasks={todaysTasks}
          incompleteTasks={incompleteTasks}
          completedTasks={completedTasks}
          allTodaysTasksDone={allTodaysTasksDone}
          atMaxTasks={atMaxTasks}
          input={input}
          setInput={setInput}
          handleAddTask={handleAddTask}
          addWithValue={addWithValue}
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          handleMoodSelect={handleMoodSelect}
          handlePomodoroComplete={handlePomodoroComplete}
          handleReset={handleReset}
          handleEasier={handleEasier}
          pomodoroExpanded={pomodoroExpanded}
          setPomodoroExpanded={setPomodoroExpanded}
          onNavigateToSky={() => setActiveTab('sky')}
        />
      )}

      {/* ==================================================================
          TAB 2: 我的天空
          ================================================================== */}
      {activeTab === 'sky' && (
        <SkyPage
          state={state}
          skyMood={skyMood}
          totalDays={totalDays}
          hasLog={hasLog}
          todayLog={todayLog}
          allHistoryTasks={allHistoryTasks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          onNavigateToToday={() => setActiveTab('today')}
        />
      )}

      {/* ==================================================================
          TAB 3: 统计
          ================================================================== */}
      {activeTab === 'stats' && (
        <StatsPage
          history={allHistoryTasks}
          streak={state.streak}
          moods={state.moods}
        />
      )}

      {/* ==================================================================
          TAB 4: 设置
          ================================================================== */}
      {activeTab === 'settings' && (
        <SettingsPage
          state={state}
          presets={state.settings.customPresets}
          onUpdatePresets={(presets) =>
            setState((prev) => ({
              ...prev,
              settings: { ...prev.settings, customPresets: presets },
            }))
          }
          onImport={handleImportData}
          font={font}
          onFontChange={setFont}
        />
      )}

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// Achievement display info → see utils/achievements.ts
