import { useState, useCallback } from 'react';
import { Celebration } from './components/shared/Celebration';
import TabBar, { TabId } from './components/shared/TabBar';
import CompletionNote from './components/shared/CompletionNote';
import Onboarding from './components/shared/Onboarding';
import ShareCard from './components/shared/ShareCard';

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
    handleCompleteTask,
    handleConfirmComplete,
    handleCancelComplete,
    handleDeleteTask,
    handleReset,
    handleMoodSelect,
    handleOnboardingFinish,
    handlePomodoroComplete,
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
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          handleMoodSelect={handleMoodSelect}
          handlePomodoroComplete={handlePomodoroComplete}
          handleReset={handleReset}
          pomodoroExpanded={pomodoroExpanded}
          setPomodoroExpanded={setPomodoroExpanded}
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
