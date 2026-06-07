import { useState, useCallback } from 'react';
import { Task, AppState } from '../types';
import {
  getToday,
  calculateStreak,
  parseTaskFromInput,
  generateId,
} from '../utils/storage';
import { checkAchievements } from '../utils/achievements';
import type { Mood } from '../components/shared/MoodWidget';

const MAX_TASKS_PER_DAY = 5;

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

  const handleAddTask = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === '​') return;
    if (todaysTasks.length >= MAX_TASKS_PER_DAY) return;

    const parsed = parseTaskFromInput(input.trim());

    let startPage = state.settings.lastPageRead + 1;
    let endPage = startPage + (parsed.pagesPerSession || 10) - 1;

    if (parsed.bookName && parsed.bookName === state.settings.lastBookName) {
      startPage = state.settings.lastPageRead + 1;
      endPage = startPage + (parsed.pagesPerSession || 10) - 1;
    }

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
      time: '30分钟',
      createdAt: today,
    };

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    setInput('');
  }, [input, todaysTasks.length, state.settings, today, setState]);

  const handleCompleteTask = useCallback((taskId: string) => {
    setCompletingTaskId(taskId);
  }, []);

  const handleConfirmComplete = useCallback((note: string) => {
    if (!completingTaskId) return;

    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === completingTaskId);
      if (!task) return prev;

      const updatedTask: Task = {
        ...task,
        completedAt: today,
        currentPage: task.endPage,
        note: note || undefined,
      };

      const updatedTasks = prev.tasks.map((t) =>
        t.id === completingTaskId ? updatedTask : t
      );

      const newLog = prev.log.includes(today) ? prev.log : [...prev.log, today];
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

      const newState = {
        ...prev,
        tasks: updatedTasks,
        log: newLog,
        streak: newStreak,
        settings: newSettings,
        history: newHistory,
      };

      // Check achievements
      const unlocked = checkAchievements(newState);
      if (unlocked.length > 0) {
        newState.achievements = [...new Set([...newState.achievements, ...unlocked])];
      }

      return newState;
    });

    setCompletingTaskId(null);

    // Check if all tasks done — trigger celebration
    const remaining = todaysTasks.filter(
      (t) => t.id !== completingTaskId && !t.completedAt
    );
    if (remaining.length === 0) {
      onAllTasksComplete();
      setHasCompletedToday(true);
    }
  }, [completingTaskId, today, todaysTasks, setState, onAllTasksComplete]);

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

  const handleMoodSelect = useCallback((mood: Mood) => {
    setState((prev) => ({
      ...prev,
      moods: { ...prev.moods, [today]: mood },
    }));
  }, [today, setState]);

  const handleOnboardingFinish = useCallback(() => {
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
    handleCompleteTask,
    handleConfirmComplete,
    handleCancelComplete,
    handleDeleteTask,
    handleReset,
    handleMoodSelect,
    handleOnboardingFinish,
    handlePomodoroComplete,
    today,
  };
}
