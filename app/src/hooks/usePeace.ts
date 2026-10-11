import { useCallback } from 'react';
import { AppState } from '../types';
import { getToday } from '../utils/storage';

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
  const { cards, protectedDates } = state.peace;
  const hasCard = cards > 0;

  // 消耗安心卡（断签时调用）
  const useCard = useCallback((date: string): boolean => {
    setState(prev => {
      if (prev.peace.cards <= 0) return prev;
      // 不伪造log，只记录被保护的日子
      return {
        ...prev,
        peace: {
          ...prev.peace,
          cards: prev.peace.cards - 1,
          protectedDates: [...prev.peace.protectedDates, date],
        },
      };
    });
    return true;
  }, [setState]);

  // 奖励安心卡（连续7天回来后调用）
  // 守卫写在 setState updater 里读 prev，避免闭包陷阱 + 同 tick 多次发奖
  const rewardCard = useCallback((): boolean => {
    let rewarded = false;
    setState(prev => {
      if (prev.peace.cards >= 2) return prev;        // 最多2张
      const today = getToday();
      if (prev.peace.lastRewardedDate === today) return prev;  // 同日不重发
      // 检查过去7天是否每天都回来了（取 log 后 7 项去重，按日历日）
      const recentDays = [...new Set(prev.log.slice(-7))];
      if (recentDays.length < 7) return prev;

      rewarded = true;
      return {
        ...prev,
        peace: {
          ...prev.peace,
          cards: Math.min(2, prev.peace.cards + 1),
          lastRewardedDate: today,
        },
      };
    });
    return rewarded;
  }, [setState]);

  return {
    cards,
    protectedDates,
    hasCard,
    useCard,
    rewardCard,
  };
}
