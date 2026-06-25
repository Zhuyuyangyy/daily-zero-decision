import { useState, useCallback, useRef, useEffect } from 'react';
import { Task, AppState } from '../types';
import {
  getToday,
  calculateStreak,
  parseTaskFromInput,
  generateId,
} from '../utils/storage';
import { checkAchievements } from '../utils/achievements';
import type { Mood } from '../components/shared/MoodWidget';

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 每日只做 1 小步：与"今天只做这一小步"产品定位对齐
// （Round 7：从 5 降到 1；原代码里残留的 5 是历史默认）
const MAX_TASKS_PER_DAY = 1;

/**
 * Task CRUD operations hook.
 */
export function useTasks(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  onAllTasksComplete: () => void
) {
  const [input, setInput] = useState('');
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  const today = getToday();
  const todaysTasks = state.tasks.filter((t) => t.createdAt === today);
  const incompleteTasks = todaysTasks.filter((t) => !t.completedAt);
  const completedTasks = todaysTasks.filter((t) => t.completedAt);
  const allTodaysTasksDone = todaysTasks.length > 0 && incompleteTasks.length === 0;
  const atMaxTasks = todaysTasks.length >= MAX_TASKS_PER_DAY;

  // 用最新值添加（避免 closure 陷阱：用户从 EmptyCloudCard 点"读一点"时不需要先 setInput 再 add）
  const addWithValue = useCallback(
    (rawValue: string) => {
      const trimmed = rawValue.trim();
      if (!trimmed || trimmed === '​') return;
      if (state.tasks.filter((t) => t.createdAt === today && !t.completedAt).length >= MAX_TASKS_PER_DAY) return;

      const parsed = parseTaskFromInput(trimmed);

      let startPage = state.settings.lastPageRead + 1;
      let endPage = startPage + (parsed.pagesPerSession || 10) - 1;

      // 时间优先用 hint 里解析出来的"X 分钟"，否则按页数/默认推一个温柔时间
      const inferredTime =
        parsed.time ||
        (parsed.pagesPerSession && parsed.pagesPerSession <= 2
          ? '5 分钟'
          : parsed.pagesPerSession && parsed.pagesPerSession <= 10
          ? '15 分钟'
          : '30 分钟');

      const newTask: Task = {
        id: generateId(),
        title: trimmed,
        type: parsed.type || 'other',
        bookName: parsed.bookName,
        currentPage: endPage,
        pagesPerSession: parsed.pagesPerSession || 10,
        startPage,
        endPage,
        place: '安静的地方',
        time: inferredTime,
        createdAt: today,
      };

      setState((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
      setInput('');
    },
    [state.tasks, state.settings, today, setState]
  );

  const handleAddTask = useCallback(() => {
    addWithValue(input);
  }, [addWithValue, input]);

  const handleCompleteTask = useCallback((taskId: string) => {
    setCompletingTaskId(taskId);
  }, []);

  // 用 ref 读最新 onAllTasksComplete，避免闭包陷阱
  const onAllCompleteRef = useRef(onAllTasksComplete);
  useEffect(() => { onAllCompleteRef.current = onAllTasksComplete; }, [onAllTasksComplete]);

  const handleConfirmComplete = useCallback((note: string, explicitTaskId?: string) => {
    // 优先用 explicitTaskId（来自 App.tsx 当时的 completingTaskId），
    // 避免闭包陷阱：用户连点不同任务的"完成"时，completingTaskId state 可能尚未更新
    const taskId = explicitTaskId ?? completingTaskId;
    if (!taskId) return;

    // 标志：是否在 setState updater 内检测到"全部完成"
    // 必须在闭包外声明，setState updater 是同步执行的
    let allDone = false;

    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const updatedTask: Task = {
        ...task,
        completedAt: today,
        currentPage: task.endPage,
        note: note || undefined,
      };

      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId ? updatedTask : t
      );

      // 在 prev 上算"今日剩余"（更新后的）—— 不依赖外层 todaysTasks 闭包
      const remainingToday = updatedTasks.filter(
        (t) => t.createdAt === today && !t.completedAt
      );
      allDone = remainingToday.length === 0;

      const newLog = prev.log.includes(today) ? prev.log : [...prev.log, today];

      // 安心卡逻辑：只在 setState updater 内读 prev（prev.log.length / prev.peace.cards / prev.pet），
      // 不再用外层闭包的 today 派生 yesterday（避免时区问题 + stale 风险）
      let peaceUsed = false;
      if (prev.log.length > 0) {
        const lastLogDate = prev.log[prev.log.length - 1];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = localDateString(yesterdayDate);
        if (lastLogDate !== today && lastLogDate !== yesterdayStr && prev.peace.cards > 0) {
          // 昨天断了 + 有安心卡：记录被保护的日子，消耗一张卡
          peaceUsed = true;
        }
      }

      const newStreak = calculateStreak(newLog);

      const newSettings = {
        ...prev.settings,
        lastPageRead: task.endPage || 0,
        lastBookName: task.bookName || prev.settings.lastBookName,
      };

      // Archive completed task to history
      const newHistory = { ...prev.history };
      if (!newHistory[today]) newHistory[today] = [];
      newHistory[today] = [...newHistory[today], updatedTask];

      const newState: AppState = {
        ...prev,
        tasks: updatedTasks,
        log: newLog,  // 不伪造log，保持诚实
        streak: newStreak,
        settings: newSettings,
        history: newHistory,
      };

      // 如果用了安心卡，减少一张卡，并记录被保护的日子
      if (peaceUsed) {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = localDateString(yesterdayDate);
        newState.peace = {
          ...prev.peace,
          cards: prev.peace.cards - 1,
          protectedDates: [...prev.peace.protectedDates, yesterdayStr],
        };
      }

      // Check achievements
      const unlocked = checkAchievements(newState);
      if (unlocked.length > 0) {
        newState.achievements = [...new Set([...newState.achievements, ...unlocked])];
      }

      // 天空宠物奖励：完成今日卡 +1 亲密度（防同日重复）
      // 在 updater 内读 prev，守卫可靠（与 F6 usePet 修法同构）
      if (prev.pet.lastRewardDate !== today) {
        newState.pet = {
          ...prev.pet,
          affection: prev.pet.affection + 1,
          mood: 'celebrating',
          lastRewardDate: today,
          lastInteractionAt: today,
        };
      }

      return newState;
    });

    setCompletingTaskId(null);

    // 触发庆祝：基于 setState 内基于 prev 算的 allDone（避免依赖外层 todaysTasks 闭包）
    if (allDone) {
      onAllCompleteRef.current();
      setHasCompletedToday(true);
    }
  }, [completingTaskId, today, setState]);

  const handleCancelComplete = useCallback(() => {
    setCompletingTaskId(null);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, [setState]);

  const handleReset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.createdAt !== today),
    }));
    setHasCompletedToday(false);
  }, [today, setState]);

  /**
   * 换一朵轻一点的 — 不是给 3 个候选，是直接降难度
   * - 今天没任务：填一个最轻的预设
   * - 已有不完整任务：把它的时间/页数都调小，且按任务类型重写主标题
   * - 已完成：什么都不做
   */
  const handleEasier = useCallback(() => {
    const LIGHT_TEMPLATES: Array<{ title: string; type: Task['type']; minutes: number; pages?: number; place: string }> = [
      { title: '读 2 页书', type: 'reading', minutes: 5, pages: 2, place: '沙发' },
      { title: '出门走走', type: 'exercise', minutes: 10, place: '楼下' },
      { title: '看 5 分钟代码', type: 'coding', minutes: 5, place: '电脑前' },
      { title: '深呼吸三次', type: 'other', minutes: 1, place: '原地' },
      { title: '写一行日记', type: 'other', minutes: 3, place: '桌前' },
    ];

    const halved = (n: number) => Math.max(1, Math.floor(n / 2));

    // 按任务类型重写主标题（而不是字符串替换数字）
    const makeEasierTitle = (task: Task, newMinutes: number, newPages?: number): string => {
      if (task.type === 'reading' && newPages) return `读 ${newPages} 页书`;
      if (task.type === 'coding') return `看 ${newMinutes} 分钟代码`;
      if (task.type === 'exercise') return `出门走走 ${newMinutes} 分钟`;
      // other：保持原意（深呼吸/日记），只动时间
      return task.title;
    };

    setState((prev) => {
      const allTodays = prev.tasks.filter((t) => t.createdAt === today);
      const todaysCount = allTodays.length;
      const hasIncomplete = allTodays.some((t) => !t.completedAt);

      if (todaysCount > 1) {
        // 不应该发生（MAX=1 守卫），但若是脏数据导入导致，让用户知情
        // eslint-disable-next-line no-console
        console.warn(`[handleEasier] tasks 数组今日项数 (${todaysCount}) 超过 MAX`);
        if (typeof window !== 'undefined') {
          window.alert('今日已有多个任务，请先删除多余的，再"换轻一点"。');
        }
        return prev;
      }

      if (todaysCount === 1 && !hasIncomplete) {
        return prev;
      }

      if (todaysCount === 0) {
        const seed = prev.tasks.length;
        const tpl = LIGHT_TEMPLATES[seed % LIGHT_TEMPLATES.length];
        const newTask: Task = {
          id: generateId(),
          title: tpl.title,
          type: tpl.type,
          bookName: tpl.type === 'reading' ? prev.settings.lastBookName : undefined,
          startPage: tpl.pages ? prev.settings.lastPageRead + 1 : undefined,
          endPage: tpl.pages ? prev.settings.lastPageRead + tpl.pages : undefined,
          currentPage: tpl.pages ? prev.settings.lastPageRead + tpl.pages : undefined,
          pagesPerSession: tpl.pages,
          place: tpl.place,
          time: `${tpl.minutes} 分钟`,
          createdAt: today,
        };
        return { ...prev, tasks: [...prev.tasks, newTask] };
      }

      return {
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (t.completedAt) return t;
          const minMatch = t.time?.match(/(\d+)/);
          const newMinutes = minMatch ? halved(parseInt(minMatch[1], 10)) : 5;
          const newPages = t.pagesPerSession ? halved(t.pagesPerSession) : undefined;
          return {
            ...t,
            title: makeEasierTitle(t, newMinutes, newPages),
            time: `${newMinutes} 分钟`,
            pagesPerSession: newPages,
            endPage: newPages && t.startPage ? t.startPage + newPages - 1 : t.endPage,
            currentPage: newPages && t.startPage ? t.startPage + newPages - 1 : t.currentPage,
          };
        }),
      };
    });
  }, [today, setState]);

  const handleMoodSelect = useCallback((mood: Mood) => {
    setState((prev) => ({
      ...prev,
      moods: { ...prev.moods, [today]: mood },
    }));
  }, [today, setState]);

  const handleOnboardingFinish = useCallback(() => {
    // 只翻转 React 状态。useAppState 的 useEffect 会负责持久化——
    // 避免与 useAppState 的 saveState 形成双写竞态（前者写"刚加载的快照"会覆盖后者的最新值）。
    setState((prev) => ({ ...prev, onboarded: true }));
  }, [setState]);

  const handlePomodoroComplete = useCallback((sessionType: 'focus' | 'shortBreak' | 'longBreak') => {
    if (sessionType === 'focus') {
      setState((prev) => ({
        ...prev,
        pomodoroSessions: (prev.pomodoroSessions || 0) + 1,
      }));
    }
  }, [setState]);

  return {
    input,
    setInput,
    completingTaskId,
    setCompletingTaskId,
    hasCompletedToday,
    setHasCompletedToday,
    todaysTasks,
    incompleteTasks,
    completedTasks,
    allTodaysTasksDone,
    atMaxTasks,
    handleAddTask,
    addWithValue,
    handleCompleteTask,
    handleConfirmComplete,
    handleCancelComplete,
    handleDeleteTask,
    handleReset,
    handleMoodSelect,
    handleOnboardingFinish,
    handlePomodoroComplete,
    handleEasier,
    today,
  };
}
