import { useCallback, useMemo } from 'react';
import type { AppState, PetState, PetMood } from '../types';
import { getToday } from '../utils/storage';

/**
 * 天空宠物系统 hook
 *
 * 核心原则（反 PUA）：
 * - 亲密度只增不减
 * - 不催、不责怪、不惩罚
 * - 点击云猫只换气泡，不加亲密度
 * - 完成今日卡每天只 +1（用 lastRewardDate 防重）
 */

const PET_LINES: Record<PetMood | 'greeting', readonly string[]> = {
  waiting: [
    '今天还没开始也没关系。',
    '我在云边等你慢慢来。',
    '先把它变成一小步吧。',
  ],
  encouraging: [
    '不用急，今天只要这一小步。',
    '我陪你做完这张卡。',
    '做一点点也算数。',
  ],
  celebrating: [
    '我看到啦，今天的云长出来了。',
    '这一步很小，但真的发生了。',
    '天空又多了一点点光。',
  ],
  resting: [
    '昨天休息了也没关系。',
    '天空没有责怪你。',
    '今天回来就很好。',
  ],
  sleeping: [
    '它睡得正香，不打扰它。',
  ],
  greeting: [
    '你来啦。',
    '嗯，我在。',
    '今天也轻一点。',
  ],
  // idle 默认沉默，不展示气泡
  idle: [],
};

/** 从只读数组里随机取一条，每次重新摇号 */
function pick<T>(arr: readonly T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface UsePetResult {
  pet: PetState;
  petLine: string | null;             // 今日气泡（每次重渲染重新 pick）
  renamePet: (name: string) => boolean;
  rewardPetForCompletion: () => boolean;
  setPetEnabled: (enabled: boolean) => void;
  markPetMet: () => void;
  pickGreeting: () => string | null;
}

export function usePet(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
): UsePetResult {
  const pet = state.pet;

  // 当前气泡 = mood 对应的话术
  const petLine = useMemo(() => pick(PET_LINES[pet.mood] ?? []), [pet.mood]);

  /** 改名：最多 8 字；空字符串不保存；首次改名 +1 亲密度 */
  const renamePet = useCallback((name: string): boolean => {
    const safe = name.trim().slice(0, 8);
    if (!safe) return false;
    setState((prev) => ({
      ...prev,
      pet: {
        ...prev.pet,
        name: safe,
        renamed: true,
        affection: prev.pet.renamed ? prev.pet.affection : prev.pet.affection + 1,
        lastInteractionAt: getToday(),
      },
    }));
    return true;
  }, [setState]);

  /** 完成今日卡：+1 亲密度 + mood='celebrating'；同日重复防重
   *  守卫写在 setState updater 里读 prev，避免同 tick 多次调用都通过 ref 守卫。
   */
  const rewardPetForCompletion = useCallback((): boolean => {
    const today = getToday();
    let rewarded = false;
    setState((prev) => {
      if (prev.pet.lastRewardDate === today) return prev;
      rewarded = true;
      return {
        ...prev,
        pet: {
          ...prev.pet,
          affection: prev.pet.affection + 1,
          mood: 'celebrating',
          lastRewardDate: today,
          lastInteractionAt: today,
        },
      };
    });
    return rewarded;
  }, [setState]);

  /** 显隐开关：不删数据，只切 enabled */
  const setPetEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      pet: { ...prev.pet, enabled },
    }));
  }, [setState]);

  /** 标记"已初见"：第一次生成任务时调用 */
  const markPetMet = useCallback(() => {
    setState((prev) => {
      if (prev.pet.firstMetAt) return prev;
      return {
        ...prev,
        pet: {
          ...prev.pet,
          firstMetAt: getToday(),
          lastInteractionAt: getToday(),
        },
      };
    });
  }, [setState]);

  /** 打招呼：点击云猫触发；不奖励亲密度 */
  const pickGreeting = useCallback((): string | null => {
    const line = pick(PET_LINES.greeting);
    if (line) {
      setState((prev) => ({
        ...prev,
        pet: { ...prev.pet, lastInteractionAt: getToday() },
      }));
    }
    return line;
  }, [setState]);

  return {
    pet,
    petLine,
    renamePet,
    rewardPetForCompletion,
    setPetEnabled,
    markPetMet,
    pickGreeting,
  };
}

/**
 * 根据今日卡状态推导 mood（纯函数）
 *   安心卡保护昨日 → resting
 *   已完成今日卡  → celebrating
 *   有卡未完成    → encouraging
 *   否则          → waiting
 */
export function derivePetMood({
  hasCurrentTask,
  todayCompleted,
  protectedYesterday,
}: {
  hasCurrentTask: boolean;
  todayCompleted: boolean;
  protectedYesterday: boolean;
}): PetMood {
  if (protectedYesterday) return 'resting';
  if (todayCompleted)      return 'celebrating';
  if (hasCurrentTask)      return 'encouraging';
  return 'waiting';
}
