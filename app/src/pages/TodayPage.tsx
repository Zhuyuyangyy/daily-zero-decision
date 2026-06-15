import { useState, useEffect } from 'react';
import type { AppState, Task } from '../types';
import type { Mood } from '../components/shared/MoodWidget';
import { copy } from '../utils/copy';
import DailyQuote from '../components/shared/DailyQuote';
import Pomodoro from '../components/shared/Pomodoro';
import TodayDecisionCard from '../components/today/TodayDecisionCard';
import TodayFeedbackStrip from '../components/today/TodayFeedbackStrip';
import { SoftButton } from '../components/ui';
import { type Dispatch, type SetStateAction } from 'react';
import CloudGarden from '../components/today/CloudGarden';
import { SkyScene } from '../components/sky/SkyScene';
import { SkyHeaderContent } from '../components/sky/SkyHeaderContent';
import { SkyProgressMini } from '../components/sky/SkyProgressMini';
import { toCloudGardenMood } from '../utils/cloudGardenMood';
import { PeaceCard } from '../components/premium/PeaceCard';
import { PeaceCardInfoModal } from '../components/premium/PeaceCardInfoModal';
import { SkyPet } from '../components/pet/SkyPet';
import { PetNameModal } from '../components/pet/PetNameModal';
import { derivePetMood, type UsePetResult } from '../hooks/usePet';

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
  pet: UsePetResult;
  reducedMotion?: boolean;
  protectedYesterday?: boolean;
}

export default function TodayPage({
  state,
  today: _today,
  todaysTasks: _todaysTasks,
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
  pet,
  reducedMotion,
  protectedYesterday,
}: TodayPageProps) {
  void _input; void _setInput; void _handleAddTask; void _handleDeleteTask; void _atMaxTasks; void _handleReset; void _today; void _todaysTasks;
  const currentTask = incompleteTasks[0] ?? completedTasks[0] ?? null;

  const last7 = Object.entries(state.history)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([date, tasks]) => ({ date, tasks }));

  // 安心卡状态管理
  const [showPeaceInfo, setShowPeaceInfo] = useState(false);
  const peaceCards = state.peace?.cards ?? 0;

  // 宠物相关 UI
  const [showNameModal, setShowNameModal] = useState(false);
  const [hasShownNamePrompt, setHasShownNamePrompt] = useState(() => {
    try { return !!localStorage.getItem('pet:renamePrompted'); } catch { return false; }
  });

  // 推导 mood（不写回 state，避免在 render 中 setState）
  const derivedMood = derivePetMood({
    hasCurrentTask: !!currentTask,
    todayCompleted: allTodaysTasksDone,
    protectedYesterday: !!protectedYesterday,
  });
  // 显示用：state.pet.mood 优先（rewardPetForCompletion 会写 celebrating），否则用推导值
  const displayMood = state.pet.mood === 'celebrating'
    ? 'celebrating'
    : derivedMood;

  // 完成今日卡后第一次 → 弹"给宠物取个名字"
  useEffect(() => {
    if (allTodaysTasksDone && !hasShownNamePrompt && !state.pet.renamed) {
      // 延时让庆祝动画先出现
      const t = window.setTimeout(() => {
        setShowNameModal(true);
        setHasShownNamePrompt(true);
        try { localStorage.setItem('pet:renamePrompted', '1'); } catch { /* noop */ }
      }, 1200);
      return () => window.clearTimeout(t);
    }
  }, [allTodaysTasksDone, hasShownNamePrompt, state.pet.renamed]);

  const handlePetNameConfirm = (name: string): boolean => {
    return pet.renamePet(name);
  };

  return (
    <div
      className="clay-content clay-page"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <div className="w-full max-w-md mx-auto" style={{ flexShrink: 0 }}>
        <SkyScene mood={skyMood} density="comfortable" variant="today">
          <SkyHeaderContent
            title={currentTask ? '今天只做这一小步' : '每天不知道从哪开始？'}
            subtitle={
              currentTask
                ? '完成后，天空会多一朵云'
                : '我帮你把想坚持的事，变成今天能完成的一小步。'
            }
          >
            <SkyProgressMini
              streak={state.streak.current}
              totalClouds={state.log.length}
              mood={skyMood}
              hasTodayCloud={allTodaysTasksDone}
            />
          </SkyHeaderContent>

          <CloudGarden
            mode="today"
            today={currentTask}
            last7={last7}
            onTodayComplete={() => currentTask && handleCompleteTask(currentTask.id)}
            mood={toCloudGardenMood(skyMood, !!currentTask?.completedAt)}
          />

          {state.pet.enabled && (
            <div
              style={{
                position: 'absolute',
                right: 8,
                bottom: 24,
                zIndex: 6,
                pointerEvents: 'auto',
              }}
            >
              <SkyPet
                mood={displayMood}
                name={state.pet.name}
                size="mobile"
                bubbleText={pet.petLine}
                reducedMotion={reducedMotion}
                onClick={pet.pickGreeting}
              />
            </div>
          )}
        </SkyScene>
      </div>

      {currentTask ? (
        allTodaysTasksDone ? (
          <div className="animate-fade-up" style={{ margin: '16px', textAlign: 'center' }}>
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
              onStartPomodoro={() => setPomodoroExpanded((p) => !p)}
            />
          </div>
        )
      ) : null}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['平静', '低落', '一般', '期待', '高兴'].map((m, i) => (
          <button
            key={m}
            className="clay-chip"
            onClick={() => handleMoodSelect(['calm', 'low', 'okay', 'hopeful', 'happy'][i] as Mood)}
            style={{ fontSize: 12 }}
          >
            {['☁️', '🌧', '🌤', '🌈', '☀️'][i]} {m}
          </button>
        ))}
      </div>

      {allTodaysTasksDone && (
        <TodayFeedbackStrip completed streak={state.streak.current} total={state.log.length} />
      )}

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <PeaceCard count={peaceCards} onInfo={() => setShowPeaceInfo(true)} />
      </div>

      <div className="clay-scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '100px' }}>
        <div className="w-full max-w-md mx-auto" style={{ padding: '8px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
            {[
              { label: '读一点', hint: '读 2 页书', emoji: '📖' },
              { label: '走一走', hint: '出门走走 5 分钟', emoji: '🏃' },
              { label: '写一句', hint: '写一行日记', emoji: '📝' },
              { label: '随便养一朵', hint: '深呼吸三次', emoji: '✨' },
            ].map((s) => (
              <button
                key={s.label}
                className="clay-quick-suggest"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 16,
                  background: 'var(--surface-1)', border: '1px solid var(--hairline)',
                  cursor: 'pointer', transition: 'all 0.2s ease-out',
                }}
                onClick={() => addWithValue(s.hint)}
              >
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.label}</span>
              </button>
            ))}
          </div>

          <button onClick={() => setPomodoroExpanded((p) => !p)} className="clay-collapse">
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

      <PeaceCardInfoModal
        isOpen={showPeaceInfo}
        onClose={() => setShowPeaceInfo(false)}
        cards={peaceCards}
      />

      <PetNameModal
        isFirstMeet
        isOpen={showNameModal}
        currentName={state.pet.name}
        onConfirm={handlePetNameConfirm}
        onClose={() => setShowNameModal(false)}
      />
    </div>
  );
}
