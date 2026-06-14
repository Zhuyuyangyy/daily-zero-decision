import { useCallback } from 'react';
import { AppState } from '../types';

/**
 * 安心卡系统 hook
 *
 * 核心原则：
 * - 安心卡不伪造log，它只保护streak不断
 * - 新用户默认2张，最多2张
 * - 连续7天回来，奖励1张
 * - 断签时自动消耗1张
 */
interface UsePeace {
  cards: number;
  protectedDates: string[];
  hasCard: boolean;
  useCard: (date: string) => boolean;  // 消耗安心卡
  rewardCard: () => boolean;  // 奖励安心卡（连续7天）
}

export function usePeace(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
): UsePeace {
  const { cards, protectedDates, lastRewardedDate } = state.peace;
  const hasCard = cards > 0;

  // 消耗安心卡（断签时调用）
  const useCard = useCallback((date: string): boolean => {
    if (cards <= 0) return false;

    setState(prev => {
      // 不伪造log，只记录被保护的日子
      const newProtectedDates = [...prev.peace.protectedDates, date];
      const newCards = prev.peace.cards - 1;

      return {
        ...prev,
        peace: {
          ...prev.peace,
          cards: newCards,
          protectedDates: newProtectedDates,
        },
      };
    });

    return true;
  }, [cards, setState]);

  // 奖励安心卡（连续7天回来后调用）
  const rewardCard = useCallback((): boolean => {
    if (cards >= 2) return false;  // 最多2张

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // 检查过去7天是否每天都回来了
    const recentDays = state.log.slice(-7);
    const allRecent = recentDays.length >= 7;

    if (!allRecent) return false;

    setState(prev => ({
      ...prev,
      peace: {
        ...prev.peace,
        cards: Math.min(2, prev.peace.cards + 1),  // 最多2张
        lastRewardedDate: today,
      },
    }));

    return true;
  }, [cards, state.log, setState]);

  return {
    cards,
    protectedDates,
    hasCard,
    useCard,
    rewardCard,
  };
}
