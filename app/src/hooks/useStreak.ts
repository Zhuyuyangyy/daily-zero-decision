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

  /**
   * allHistoryTasks：合成视图 = state.history + state.tasks。
   * ⚠️ 这是**只读合成视图**，不是真实持久化状态。
   * - 调用方只应用于渲染 / 检索 / 内存统计
   * - 严禁基于此数据调用 setState 触发持久化 —— 会读到不一致的中间态（未完成任务尚未归档到 history）
   * - 若需写持久化状态，请分别更新 state.tasks 与 state.history
   */
  const allHistoryTasks = useMemo(() => {
    const combined: Record<string, Task[]> = { ...state.history };
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
