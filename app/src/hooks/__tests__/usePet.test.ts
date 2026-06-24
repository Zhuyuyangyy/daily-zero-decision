import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePet, derivePetMood } from '../usePet';
import type { AppState } from '../../types';
import { defaultPetState } from '../../types';

const makeState = (overrides: Partial<AppState> = {}): AppState => ({
  tasks: [],
  log: [],
  streak: { current: 0, best: 0, lastCompletedDate: null },
  settings: { defaultPagesPerSession: 10, lastPageRead: 0, lastBookName: '', customPresets: [] },
  achievements: [],
  history: {},
  moods: {},
  pomodoroSessions: 0,
  onboarded: true,
  peace: { cards: 2, protectedDates: [], lastRewardedDate: null },
  pet: { ...defaultPetState },
  ...overrides,
});

/** 用真实 useState 包一层，确保 ref 跟随更新 */
function makePetHook(initial: AppState) {
  return renderHook(() => {
    const [s, setS] = React.useState(initial);
    const pet = usePet(s, setS);
    return { s, setS, pet };
  });
}

describe('usePet.renamePet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T10:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('空字符串不保存', () => {
    const state = makeState();
    const setState = vi.fn();
    const { result } = renderHook(() => usePet(state, setState));
    expect(result.current.renamePet('   ')).toBe(false);
    expect(setState).not.toHaveBeenCalled();
  });

  it('超长名字截断到 8 字', () => {
    const { result } = makePetHook(makeState());
    let ok = false;
    act(() => { ok = result.current.pet.renamePet('一只很长很长的名字字符串'); });
    expect(ok).toBe(true);
    expect(result.current.s.pet.name.length).toBeLessThanOrEqual(8);
  });

  it('首次改名 +1 亲密度', () => {
    const { result } = makePetHook(makeState());
    act(() => result.current.pet.renamePet('豆豆'));
    expect(result.current.s.pet.affection).toBe(1);
    expect(result.current.s.pet.renamed).toBe(true);
  });

  it('二次改名不重复 +1', () => {
    const { result } = makePetHook(makeState());
    act(() => result.current.pet.renamePet('豆豆'));
    act(() => result.current.pet.renamePet('阿白'));
    expect(result.current.s.pet.affection).toBe(1);
  });
});

describe('usePet.rewardPetForCompletion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T10:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('首次完成 +1 亲密度 + mood=celebrating', () => {
    const { result } = makePetHook(makeState());
    let ok = false;
    act(() => { ok = result.current.pet.rewardPetForCompletion(); });
    expect(ok).toBe(true);
    expect(result.current.s.pet.affection).toBe(1);
    expect(result.current.s.pet.mood).toBe('celebrating');
    expect(result.current.s.pet.lastRewardDate).toBe('2026-06-15');
  });

  it('同日重复完成不重复 +1', () => {
    const { result } = makePetHook(makeState());
    act(() => result.current.pet.rewardPetForCompletion());
    let ok = true;
    act(() => { ok = result.current.pet.rewardPetForCompletion(); });
    expect(ok).toBe(false);
    expect(result.current.s.pet.affection).toBe(1);
  });

  it('同 tick 同步多次调用也只 +1（防止 petRef 守卫竞态）', () => {
    const { result } = makePetHook(makeState());
    let ok1 = false, ok2 = false;
    act(() => {
      // 同步连续两次（同 tick）—— 旧实现 petRef 未更新，两次都过守卫
      ok1 = result.current.pet.rewardPetForCompletion();
      ok2 = result.current.pet.rewardPetForCompletion();
    });
    expect(ok1).toBe(true);
    expect(ok2).toBe(false);
    expect(result.current.s.pet.affection).toBe(1);
  });
});

describe('usePet.setPetEnabled', () => {
  it('只切 enabled，不删其他字段', () => {
    const { result } = makePetHook(makeState());
    act(() => result.current.pet.setPetEnabled(false));
    expect(result.current.s.pet.enabled).toBe(false);
    expect(result.current.s.pet.name).toBe('小云');
    expect(result.current.s.pet.affection).toBe(0);
  });
});

describe('usePet.pickGreeting', () => {
  it('返回非空 string 且不增加亲密度', () => {
    const { result } = makePetHook(makeState());
    let line: string | null = null;
    act(() => { line = result.current.pet.pickGreeting(); });
    expect(typeof line).toBe('string');
    expect((line ?? '').length).toBeGreaterThan(0);
    expect(result.current.s.pet.affection).toBe(0);  // 关键反 PUA：不奖励
  });
});

describe('derivePetMood', () => {
  it('保护昨日 → resting', () => {
    expect(derivePetMood({ hasCurrentTask: false, todayCompleted: false, protectedYesterday: true }))
      .toBe('resting');
  });
  it('已完成 → celebrating', () => {
    expect(derivePetMood({ hasCurrentTask: true, todayCompleted: true, protectedYesterday: false }))
      .toBe('celebrating');
  });
  it('有卡未完成 → encouraging', () => {
    expect(derivePetMood({ hasCurrentTask: true, todayCompleted: false, protectedYesterday: false }))
      .toBe('encouraging');
  });
  it('无卡 → waiting', () => {
    expect(derivePetMood({ hasCurrentTask: false, todayCompleted: false, protectedYesterday: false }))
      .toBe('waiting');
  });
  it('完成 + 保护昨日同时 → resting 优先', () => {
    expect(derivePetMood({ hasCurrentTask: false, todayCompleted: true, protectedYesterday: true }))
      .toBe('resting');
  });
});
