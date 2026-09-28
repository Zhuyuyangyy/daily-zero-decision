import { useState, useEffect, useRef, useCallback } from 'react';
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
import { CompanionCard } from '../components/sky/CompanionCard';
import { SkyScene } from '../components/sky/SkyScene';
import { SkyHeaderContent } from '../components/sky/SkyHeaderContent';
import { SkyProgressMini } from '../components/sky/SkyProgressMini';
import { toCloudGardenMood } from '../utils/cloudGardenMood';
import { getLastNDays, getToday } from '../utils/storage';
import { PeaceCard } from '../components/premium/PeaceCard';
import { PeaceCardInfoModal } from '../components/premium/PeaceCardInfoModal';
import { SkyPet } from '../components/pet/SkyPet';
import { PetNameModal } from '../components/pet/PetNameModal';
import { derivePetMood, type UsePetResult } from '../hooks/usePet';

interface TodayPageProps {
  state: AppState;
  incompleteTasks: Task[];
  completedTasks: Task[];
  allTodaysTasksDone: boolean;
  addWithValue: (value: string) => void;
  handleCompleteTask: (id: string) => void;
  handleMoodSelect: (mood: Mood) => void;
  handlePomodoroComplete: (sessionType: 'focus' | 'shortBreak' | 'longBreak') => void;
  handleEasier: () => void;
  onNavigateToSky: () => void;
  pomodoroExpanded: boolean;
  setPomodoroExpanded: Dispatch<SetStateAction<boolean>>;
  skyMood: import('../utils/skyMood').SkyMood;
  pet: UsePetResult;
  reducedMotion?: boolean;
  protectedYesterday?: boolean;
  /** v0.3:命名宠物后顺势请求给天空命名(App 层弹 SkyNameModal) */
  onRequestSkyName?: () => void;
  /** v0.4:给本命云命名(改名);返回 false 表示空名未保存 */
  onRenameCompanion?: (name: string) => boolean;
}

export default function TodayPage({
  state,
  incompleteTasks,
  completedTasks,
  allTodaysTasksDone,
  addWithValue,
  handleCompleteTask,
  handleMoodSelect,
  handlePomodoroComplete,
  handleEasier,
  onNavigateToSky,
  pomodoroExpanded,
  setPomodoroExpanded,
  skyMood,
  pet,
  reducedMotion,
  protectedYesterday,
  onRequestSkyName,
  onRenameCompanion,
}: TodayPageProps) {
  const currentTask = incompleteTasks[0] ?? completedTasks[0] ?? null;

  const last7 = getLastNDays(state.history, 7);

  // 安心卡状态管理
  const [showPeaceInfo, setShowPeaceInfo] = useState(false);
  const peaceCards = state.peace?.cards ?? 0;

  // 宠物相关 UI
  const [showNameModal, setShowNameModal] = useState(false);
  const [hasShownNamePrompt, setHasShownNamePrompt] = useState(() => {
    try { return !!localStorage.getItem('pet:renamePrompted'); } catch { return false; }
  });

  // 摸云时宠物气泡让位:"一个时刻一句话",摸云萌语优先,1.4s 后宠物恢复说话
  const [petSilenced, setPetSilenced] = useState(false);
  const petSilenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePokeCloud = useCallback(() => {
    setPetSilenced(true);
    if (petSilenceTimer.current) clearTimeout(petSilenceTimer.current);
    petSilenceTimer.current = setTimeout(() => setPetSilenced(false), 1400);
  }, []);
  useEffect(() => () => {
    if (petSilenceTimer.current) clearTimeout(petSilenceTimer.current);
  }, []);

  // v0.3 天空命名:首卡完成后的命名链(宠物名 → 天空名)已在 App.tsx 统筹,
  // 这里处理"老用户从未命名过"的兜底:进入今日页 2.6s 后给一次轻引导
  const skyPromptShownRef = useRef(false);
  useEffect(() => {
    if (state.onboarded && !state.skyNamed && !skyPromptShownRef.current) {
      skyPromptShownRef.current = true;
      const t = window.setTimeout(() => onRequestSkyName?.(), 2600);
      return () => window.clearTimeout(t);
    }
  }, [state.onboarded, state.skyNamed, onRequestSkyName]);

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
    const ok = pet.renamePet(name);
    // 命名宠物成功后,如果天空还没名字 → 顺势请用户给天空也起一个
    if (ok && !state.skyNamed) onRequestSkyName?.();
    return ok;
  };

  return (
    <div
      className="clay-content clay-page"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <div className="w-full max-w-md mx-auto" style={{ flexShrink: 0, position: 'relative' }}>
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
            onPokeCloud={handlePokeCloud}
          />

          {state.pet.enabled && (
            <div
              style={{
                position: 'absolute',
                left: 12,
                bottom: 4,
                zIndex: 30,
                pointerEvents: 'auto',
              }}
            >
              <SkyPet
                mood={displayMood}
                name={state.pet.name}
                size="mobile"
                bubbleText={petSilenced ? null : pet.petLine}
                reducedMotion={reducedMotion}
                affection={state.pet.affection}
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
        {([
          { label: '平静', mood: 'calm', emoji: '☁️', macaron: '#EDF2FB' },
          { label: '低落', mood: 'low', emoji: '🌧', macaron: '#F1F0FB' },
          { label: '一般', mood: 'okay', emoji: '🌤', macaron: '#FFFBEA' },
          { label: '期待', mood: 'hopeful', emoji: '🌈', macaron: '#FFF0F5' },
          { label: '高兴', mood: 'happy', emoji: '☀️', macaron: '#FFF4D4' },
        ] as const).map(({ label, mood, emoji, macaron }) => {
          const isActive = state.moods?.[getToday()] === mood;
          return (
            <button
              key={label}
              className="clay-chip"
              aria-pressed={isActive}
              onClick={() => handleMoodSelect(mood as Mood)}
              style={{
                fontSize: 12,
                background: isActive ? macaron : undefined,
                boxShadow: isActive ? `0 2px 8px ${macaron}, inset 0 1px 2px rgba(255,255,255,0.8)` : undefined,
                transform: isActive ? 'scale(1.06)' : undefined,
                transition: 'all var(--dur-fast) var(--ease-out-quart)',
              }}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>

      {allTodaysTasksDone && (
        <TodayFeedbackStrip completed streak={state.streak.current} total={state.log.length} />
      )}

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <PeaceCard count={peaceCards} onInfo={() => setShowPeaceInfo(true)} />
      </div>

      <div className="clay-scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '100px' }}>
        <div className="w-full max-w-md mx-auto" style={{ padding: '8px 16px' }}>
          {/* v0.4 本命云 */}
          <CompanionCard
            state={state}
            reducedMotion={reducedMotion}
            onRename={(name) => onRenameCompanion?.(name) ?? false}
          />

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
