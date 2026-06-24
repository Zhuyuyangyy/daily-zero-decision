import { useState, useCallback, useEffect } from 'react';
import { Celebration } from './components/shared/Celebration';
import { ChangelogOverlay } from './components/shared/ChangelogOverlay';
import { getToday } from './utils/storage';
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
import { usePet } from './hooks/usePet';
import { useReducedMotion } from './hooks/useReducedMotion';

// Extracted pages
import TodayPage from './pages/TodayPage';
import SkyPage from './pages/SkyPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  // Core state + persistence
  const { state, setState, handleImportData, saveError } = useAppState();

  // UI-only state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [showChangelogOverlay, setShowChangelogOverlay] = useState(false);

  useEffect(() => {
    if (state.onboarded && state.log.length > 0) {
      const shown = localStorage.getItem('daily-zero-decision:lastShownChangelog');
      if (shown !== 'v0.1.0') {
        setShowChangelogOverlay(true);
      }
    }
  }, [state.onboarded, state.log.length]);

  // Celebration handler
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setShowShareCard(true);
  }, []);

  // Task operations
  const {
    completingTaskId,
    hasCompletedToday,
    incompleteTasks,
    completedTasks,
    allTodaysTasksDone,
    addWithValue,
    handleCompleteTask,
    handleConfirmComplete,
    handleCancelComplete,
    handleMoodSelect,
    handleOnboardingFinish,
    handlePomodoroComplete,
    handleEasier,
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

  // Pet system
  const pet = usePet(state, setState);
  const reducedMotion = useReducedMotion();

  // Mark pet met on first task creation
  useEffect(() => {
    if (state.tasks.length > 0 && !state.pet.firstMetAt) {
      pet.markPetMet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tasks.length]);

  // Protected yesterday?
  const protectedYesterday = state.peace.protectedDates.includes(
    (() => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return y.toISOString().split('T')[0];
    })()
  );

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
      {/* 持久化错误 banner：仅在 saveError 非空时显示 */}
      {saveError && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 10000,
            padding: '10px 16px',
            background: 'var(--warm-coral, #F88C82)',
            color: 'white',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span>⚠️ {saveError}。请尽快导出数据备份。</span>
          <button
            type="button"
            onClick={() => {
              try {
                const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `daily-cloud-backup-${getToday()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                /* swallow */
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            立即备份
          </button>
        </div>
      )}
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
        <Celebration streak={state.streak.current} onComplete={handleCelebrationComplete} />
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
          onConfirm={(note) => handleConfirmComplete(note, completingTaskId)}
          onCancel={handleCancelComplete}
        />
      )}

      {/* ==================================================================
          TAB 1: 今天
          ================================================================== */}
      {activeTab === 'today' && (
        <TodayPage
          state={state}
          skyMood={skyMood}
          incompleteTasks={incompleteTasks}
          completedTasks={completedTasks}
          allTodaysTasksDone={allTodaysTasksDone}
          addWithValue={addWithValue}
          handleCompleteTask={handleCompleteTask}
          handleMoodSelect={handleMoodSelect}
          handlePomodoroComplete={handlePomodoroComplete}
          handleEasier={handleEasier}
          pomodoroExpanded={pomodoroExpanded}
          setPomodoroExpanded={setPomodoroExpanded}
          onNavigateToSky={() => setActiveTab('sky')}
          pet={pet}
          reducedMotion={reducedMotion}
          protectedYesterday={protectedYesterday}
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
          pet={pet}
          reducedMotion={reducedMotion}
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
          pet={pet}
        />
      )}

      {/* Changelog overlay (v0.1.0 one-time) — accessible modal */}
      {showChangelogOverlay && (
        <ChangelogOverlay
          title="v0.1.0 上线了"
          message={'首屏换成"今天只做这一小步"了。\n每天只生成一张卡，完成后去看看天空。'}
          ctaLabel="开始"
          onClose={() => {
            localStorage.setItem('daily-zero-decision:lastShownChangelog', 'v0.1.0');
            setShowChangelogOverlay(false);
          }}
        />
      )}

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// Achievement display info → see utils/achievements.ts
