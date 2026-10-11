import { useState, useCallback, useMemo } from 'react';
import type { AppState, ActionReceipt, Project, ResumeState } from '../types';
import {
  pickOne,
  shrink as shrinkAction,
  alternative as alternativeAction,
  parseDump,
  splitDump,
  energyFromMood,
  type NextAction,
  type DumpItem,
} from '../utils/zeroDecisionEngine';
import { calculateStreak, generateId, getToday } from '../utils/storage';

const nowIso = () => new Date().toISOString();

function projectToItem(p: Project): DumpItem {
  // 不持久化解析结果:引擎纯函数现算(sourceText 是原文,信息不丢)
  return { id: p.id, text: p.sourceText, category: p.category };
}

export interface UseZeroDecisionResult {
  /** 当前唯一动作(断点 > 手动缩微 > 引擎选一) */
  action: NextAction | null;
  /** 有没有在养的项目(决定首页是"倒脑子"还是"唯一动作卡") */
  hasProjects: boolean;
  /** 提交一段脑内倾倒 → 建成 projects */
  submitDump: (text: string) => void;
  /** 再小一点 */
  shrink: () => void;
  /** 换一个 */
  alternative: () => void;
  /** 完成当前动作 → 写回执 + 断点 + log + 宠物奖励 */
  complete: () => void;
  /** 最近一张回执(完成反馈卡用) */
  lastReceipt: ActionReceipt | null;
  clearLastReceipt: () => void;
}

/**
 * v0.5 零决策执行流(ADR-0004):
 * 把一摊事倒进来 → 引擎永远只给一个下一步 → 完成留痕 → 断点续接。
 *
 * 与 useTasks 的旧"每日一卡"流并存:P3 起新流是首页主角,旧流保持兼容。
 * 铁律:只增不删(回执/亲密度)、不伪造 log、电量不追问(没选过心情 = mid)。
 */
export function useZeroDecision(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
): UseZeroDecisionResult {
  const today = getToday();
  const [manual, setManual] = useState<{ at: string | null; action: NextAction } | null>(null);
  const [lastReceipt, setLastReceipt] = useState<ActionReceipt | null>(null);

  const activeProjects = useMemo(
    () => state.projects.filter((p) => p.status === 'active'),
    [state.projects],
  );

  // 电量:今天选过心情 → 映射;没选过 → mid(不问第二个问题)
  const energy = energyFromMood(state.moods[today] ?? '');

  const input = useMemo(
    () => ({
      items: activeProjects.map(projectToItem),
      energy,
      minutes: null,
      resume: state.resume,
    }),
    [activeProjects, energy, state.resume],
  );

  // 手动缩微/换一个:只在断点没变时有效(完成会更新断点 → 交给引擎走断点优先)
  const resumeAt = state.resume?.updatedAt ?? null;
  const current: NextAction | null =
    manual && manual.at === resumeAt ? manual.action : pickOne(input);

  const submitDump = useCallback(
    (text: string) => {
      const lines = splitDump(text);
      if (lines.length === 0) return;
      const stamp = nowIso();
      const created: Project[] = lines.map((line) => {
        const id = generateId();
        return {
          id,
          title: line.length > 24 ? `${line.slice(0, 24)}…` : line,
          sourceText: line,
          category: parseDump(line).category,
          status: 'active' as const,
          createdAt: stamp,
          lastTouchedAt: stamp,
          cloudSeed: id,
        };
      });
      setState((prev) => ({ ...prev, projects: [...prev.projects, ...created] }));
      setLastReceipt(null);
    },
    [setState],
  );

  const shrink = useCallback(() => {
    if (!current) return;
    setManual({ at: resumeAt, action: shrinkAction(current) });
  }, [current, resumeAt]);

  const alternative = useCallback(() => {
    if (!current) return;
    const next = alternativeAction(input, current.itemId);
    if (next) setManual({ at: resumeAt, action: next });
  }, [current, input, resumeAt]);

  const complete = useCallback(() => {
    if (!current) return;
    const stamp = nowIso();
    const receipt: ActionReceipt = {
      id: generateId(),
      projectId: current.itemId,
      actionText: current.action,
      level: current.level,
      plannedMinutes: current.minutes,
      createdAt: stamp,
      completedAt: stamp,
    };
    const newResume: ResumeState = {
      projectId: current.itemId,
      lastAction: current.action,
      lastLevel: current.level,
      object: current.object,
      target: current.target,
      updatedAt: stamp,
    };
    setState((prev) => {
      const newLog = prev.log.includes(today) ? prev.log : [...prev.log, today];
      const next: AppState = {
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === current.itemId ? { ...p, lastTouchedAt: stamp } : p,
        ),
        actionReceipts: [...prev.actionReceipts, receipt],
        resume: newResume,
        log: newLog,
        streak: calculateStreak(newLog),
      };
      // 宠物奖励与 useTasks 同规则:同日不重复 +1(反 PUA:只增不减)
      if (prev.pet.lastRewardDate !== today) {
        next.pet = {
          ...prev.pet,
          affection: prev.pet.affection + 1,
          mood: 'celebrating',
          lastRewardDate: today,
          lastInteractionAt: stamp,
        };
      }
      return next;
    });
    setManual(null);
    setLastReceipt(receipt);
  }, [current, today, setState]);

  const clearLastReceipt = useCallback(() => setLastReceipt(null), []);

  return {
    action: current,
    hasProjects: activeProjects.length > 0,
    submitDump,
    shrink,
    alternative,
    complete,
    lastReceipt,
    clearLastReceipt,
  };
}
