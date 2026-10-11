import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZeroDecision } from '../useZeroDecision';
import type { AppState } from '../../types';
import { defaultPetState, defaultCompanionState } from '../../types';
import { getToday } from '../../utils/storage';

const makeState = (overrides: Partial<AppState> = {}): AppState => ({
  schemaVersion: 5,
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
  skyName: '我的天空',
  skyNamed: false,
  atlas: {},
  companion: { ...defaultCompanionState },
  projects: [],
  actionReceipts: [],
  resume: null,
  ...overrides,
});

/** 与 useTasks 测试同款可变 state 模式 */
const setup = (over: Partial<AppState> = {}) => {
  const state = makeState(over);
  const setState = (updater: any) =>
    Object.assign(state, typeof updater === 'function' ? updater(state) : updater);
  const view = renderHook(() => useZeroDecision(state, setState));
  return { state, ...view };
};

const DUMP = '下午有高数作业,论文 Figure 3 还没换,想去跑步,但我现在好累不知道干嘛';

describe('useZeroDecision — 倾倒 → 建项目', () => {
  it('初始无项目 → action null, hasProjects false', () => {
    const { result } = setup();
    expect(result.current.action).toBeNull();
    expect(result.current.hasProjects).toBe(false);
  });

  it('一段倾倒 → 项目按行建立,情绪尾巴被丢', () => {
    const { result, state, rerender } = setup();
    act(() => result.current.submitDump(DUMP));
    rerender();
    expect(state.projects).toHaveLength(3); // 高数作业 / 论文 / 跑步;"好累"被丢
    expect(state.projects.map((p) => p.category)).toEqual(['study', 'project', 'body']);
    expect(result.current.hasProjects).toBe(true);
    expect(result.current.action).not.toBeNull();
  });

  it('空倾倒 / 纯情绪 → 不建项目', () => {
    const { result, state } = setup();
    act(() => result.current.submitDump('   '));
    act(() => result.current.submitDump('但我现在好累不知道干嘛'));
    expect(state.projects).toHaveLength(0);
    expect(result.current.action).toBeNull();
  });

  it('项目带 cloudSeed 与 sourceText(云朵种子 = id)', () => {
    const { result, state } = setup();
    act(() => result.current.submitDump('论文 Figure 3 还没换'));
    expect(state.projects[0].cloudSeed).toBe(state.projects[0].id);
    expect(state.projects[0].sourceText).toBe('论文 Figure 3 还没换');
  });
});

describe('useZeroDecision — 只给一个动作', () => {
  it('默认电量(mid):给一个动作,带上下文', () => {
    const { result, rerender } = setup();
    act(() => result.current.submitDump(DUMP));
    rerender();
    const action = result.current.action!;
    expect(action.itemText).toContain('高数'); // urgency today 胜出
    expect(typeof action.action).toBe('string');
    expect(action.action.length).toBeGreaterThan(0);
  });

  it('再小一点:分钟不增,层级不变或更弱', () => {
    const { result, rerender } = setup();
    act(() => result.current.submitDump(DUMP));
    rerender();
    const before = result.current.action!;
    act(() => result.current.shrink());
    rerender();
    const after = result.current.action!;
    expect(after.minutes).toBeLessThanOrEqual(before.minutes);
    expect(after.itemId).toBe(before.itemId);
  });

  it('一路缩到地板后稳定,不归零', () => {
    const { result, rerender } = setup();
    act(() => result.current.submitDump('论文 Figure 3 还没换'));
    rerender();
    for (let i = 0; i < 20; i++) {
      act(() => result.current.shrink());
      rerender();
    }
    const floor = result.current.action!;
    expect(floor.canSmaller).toBe(false);
    expect(floor.action.length).toBeGreaterThan(0);
  });

  it('换一个:切到另一件事', () => {
    const { result, rerender } = setup();
    act(() => result.current.submitDump(DUMP));
    rerender();
    const before = result.current.action!;
    act(() => result.current.alternative());
    rerender();
    const after = result.current.action!;
    expect(after.itemId).not.toBe(before.itemId);
  });

  it('今天选过低落心情 → empty 电量 → opening 级', () => {
    const { result, rerender } = setup({ moods: { [getToday()]: 'down' } });
    act(() => result.current.submitDump(DUMP));
    rerender();
    expect(result.current.action!.level).toBe(0);
  });
});

describe('useZeroDecision — 完成即留痕', () => {
  it('完成 → 回执/log/断点/宠物/项目时间戳全部落库', () => {
    const { result, state, rerender } = setup();
    act(() => result.current.submitDump(DUMP));
    rerender();
    const action = result.current.action!;
    act(() => result.current.complete());
    rerender();

    // 回执
    expect(state.actionReceipts).toHaveLength(1);
    const r = state.actionReceipts[0];
    expect(r.projectId).toBe(action.itemId);
    expect(r.actionText).toBe(action.action);
    expect(r.level).toBe(action.level);
    expect(r.plannedMinutes).toBe(action.minutes);
    // log / streak
    expect(state.log).toContain(getToday());
    expect(state.streak.current).toBe(1);
    // 断点
    expect(state.resume).not.toBeNull();
    expect(state.resume!.projectId).toBe(action.itemId);
    expect(state.resume!.lastAction).toBe(action.action);
    expect(state.resume!.lastLevel).toBe(action.level);
    // 宠物(同日 +1)
    expect(state.pet.affection).toBe(1);
    expect(state.pet.mood).toBe('celebrating');
    // 项目 lastTouchedAt
    expect(state.projects.find((p) => p.id === action.itemId)!.lastTouchedAt).not.toBe('');
    // 反馈卡
    expect(result.current.lastReceipt).not.toBeNull();
  });

  it('完成后的下一个动作 = 断点续接(同项目,更上一级)', () => {
    const { result, state, rerender } = setup();
    act(() => result.current.submitDump('论文 Figure 3 还没换'));
    rerender();
    const first = result.current.action!;
    act(() => result.current.complete());
    rerender();
    const next = result.current.action!;
    expect(next.itemId).toBe(first.itemId);
    expect(next.level).toBeGreaterThan(first.level);
    expect(next.reason).toContain('接着上次');
    expect(state.resume!.nextHint).toBeUndefined();
  });

  it('同日再次完成 → 宠物只 +1 一次(反 PUA 守卫)', () => {
    const { result, state, rerender } = setup();
    act(() => result.current.submitDump(DUMP));
    rerender();
    act(() => result.current.complete());
    rerender();
    act(() => result.current.complete());
    rerender();
    expect(state.pet.affection).toBe(1);
    expect(state.actionReceipts).toHaveLength(2);
  });

  it('断点优先于新倒进来的急事', () => {
    const { result, rerender } = setup();
    act(() => result.current.submitDump('论文 Figure 3 还没换'));
    rerender();
    const first = result.current.action!;
    act(() => result.current.complete());
    rerender();
    act(() => result.current.submitDump('今晚截止的高数作业'));
    rerender();
    expect(result.current.action!.itemId).toBe(first.itemId);
  });

  it('清掉反馈卡后,当前动作仍是断点的下一步', () => {
    const { result, state, rerender } = setup();
    act(() => result.current.submitDump('论文 Figure 3 还没换'));
    rerender();
    act(() => result.current.complete());
    rerender();
    expect(result.current.lastReceipt).not.toBeNull();
    act(() => result.current.clearLastReceipt());
    rerender();
    expect(result.current.lastReceipt).toBeNull();
    expect(result.current.action).not.toBeNull();
    expect(state.projects.map((p) => p.id)).toContain(result.current.action!.itemId);
  });
});
