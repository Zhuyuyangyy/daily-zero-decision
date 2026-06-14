import { useCallback } from 'react';
import { AppState } from '../types';

interface UsePremium {
  protectionCards: number;
  subscription: AppState['premium']['subscription'];
  hasProtection: boolean;
  useProtectionCard: () => boolean;  // returns true if card was used
  addProtectionCards: (count: number) => void;
  subscribe: (plan: 'monthly' | 'yearly') => void;
  cancelSubscription: () => void;
}

export function usePremium(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
): UsePremium {
  const { protectionCards, subscription } = state.premium;

  const hasProtection = protectionCards > 0;

  // 消耗一张保护卡，返回是否成功
  const useProtectionCard = useCallback((): boolean => {
    if (protectionCards <= 0) return false;
    setState(prev => ({
      ...prev,
      premium: {
        ...prev.premium,
        protectionCards: prev.premium.protectionCards - 1,
      },
    }));
    return true;
  }, [protectionCards, setState]);

  // 管理员给用户加卡（购买后调用）
  const addProtectionCards = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      premium: {
        ...prev.premium,
        protectionCards: prev.premium.protectionCards + count,
      },
    }));
  }, [setState]);

  // 订阅（简化版：直接激活）
  const subscribe = useCallback((plan: 'monthly' | 'yearly') => {
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    setState(prev => ({
      ...prev,
      premium: {
        ...prev.premium,
        subscription: {
          active: true,
          startDate: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          plan,
        },
        // 订阅立即给2张卡
        protectionCards: prev.premium.protectionCards + 2,
      },
    }));
  }, [setState]);

  // 取消订阅
  const cancelSubscription = useCallback(() => {
    setState(prev => ({
      ...prev,
      premium: {
        ...prev.premium,
        subscription: null,
      },
    }));
  }, [setState]);

  return {
    protectionCards,
    subscription,
    hasProtection,
    useProtectionCard,
    addProtectionCards,
    subscribe,
    cancelSubscription,
  };
}
