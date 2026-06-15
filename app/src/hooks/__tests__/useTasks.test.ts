import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../useTasks';
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

describe('useTasks.handleEasier MAX 守卫', () => {
  it('0 张任务 → seed 1 张', () => {
    const state = makeState();
    const setState = (updater: any) => Object.assign(state, typeof updater === 'function' ? updater(state) : updater);
    const { result } = renderHook(() => useTasks(state, setState, () => {}));
    act(() => result.current.handleEasier());
    expect(state.tasks.length).toBe(1);
  });

  it('1 张 incomplete → return prev（不允许再养）', () => {
    const today = new Date().toISOString().slice(0, 10);
    const incomplete = { id: '1', title: '读 2 页书', type: 'reading' as const, createdAt: today };
    const state = makeState({ tasks: [incomplete] });
    const setState = (updater: any) => Object.assign(state, typeof updater === 'function' ? updater(state) : updater);
    const { result } = renderHook(() => useTasks(state, setState, () => {}));
    act(() => result.current.handleEasier());
    expect(state.tasks.length).toBe(1);
  });

  it('1 张 completed → return prev（不生成第 2 张）', () => {
    const today = new Date().toISOString().slice(0, 10);
    const completed = { id: '1', title: '读 2 页书', type: 'reading' as const, createdAt: today, completedAt: today };
    const state = makeState({ tasks: [completed] });
    const setState = (updater: any) => Object.assign(state, typeof updater === 'function' ? updater(state) : updater);
    const { result } = renderHook(() => useTasks(state, setState, () => {}));
    act(() => result.current.handleEasier());
    expect(state.tasks.length).toBe(1);
  });

  it('addWithValue 第二张卡被拒绝', () => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = { id: '1', title: '读 2 页书', type: 'reading' as const, createdAt: today };
    const state = makeState({ tasks: [existing] });
    const setState = (updater: any) => Object.assign(state, typeof updater === 'function' ? updater(state) : updater);
    const { result } = renderHook(() => useTasks(state, setState, () => {}));
    act(() => result.current.addWithValue('深呼吸三次'));
    expect(state.tasks.length).toBe(1);
  });
});
