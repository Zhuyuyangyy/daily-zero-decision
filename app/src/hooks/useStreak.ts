import { useMemo } from 'react';
import { Task, AppState } from '../types';
import { getToday, isYesterday } from '../utils/storage';
import { skyMoodFromStreak, type SkyMood } from '../utils/skyMood';

/**
 * Streak-related derived values hook.
 */
export function useStreak(state: AppState, hasCompletedToday: boolean) {
  const today = getToday();
  const isFirstEver = state.log.length === 0;

  const missedRecently = useMemo(() => {
    if (state.log.length === 0) return false;
    const last = state.log[state.log.length - 1];
    if (last === today) return false;
    if (isYesterday(last)) return false;
    return true;
  }, [state.log, today]);

  // 安心卡保护状态：昨天断了但有安心卡
  const hasProtectionForYesterday = useMemo(() => {
    if (!missedRecently) return false;
    return state.peace.cards > 0;
  }, [missedRecently, state.peace.cards]);

  const skyMood: SkyMood = useMemo(
    () => skyMoodFromStreak(hasCompletedToday, missedRecently, isFirstEver, state.streak.current),
    [hasCompletedToday, missedRecently, isFirstEver, state.streak.current]
  );

  const totalDays = state.log.length;
  const hasLog = state.log.length > 0;
  const todayLog = state.log;

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

  return {
    missedRecently,
    hasProtectionForYesterday,
    skyMood,
    totalDays,
    hasLog,
    todayLog,
    allHistoryTasks,
    isFirstEver,
  };
}
