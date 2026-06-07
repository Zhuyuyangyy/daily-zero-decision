import { AppState, Task } from '../types';

const STORAGE_KEY = 'daily-zero-decision';

const defaultState: AppState = {
  tasks: [],
  log: [],
  streak: {
    current: 0,
    best: 0,
    lastCompletedDate: null,
  },
  settings: {
    defaultPagesPerSession: 10,
    lastPageRead: 0,
    lastBookName: '',
    customPresets: [],
  },
  achievements: [],
  history: {},
  moods: {},
  pomodoroSessions: 0,
  onboarded: false,
};

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    const parsed = JSON.parse(stored);
    // Migrate old single-task format
    if (parsed.task && !parsed.tasks) {
      parsed.tasks = parsed.task ? [parsed.task] : [];
      delete parsed.task;
    }
    if (!parsed.achievements) parsed.achievements = [];
    if (!parsed.history) parsed.history = {};
    if (!parsed.settings) parsed.settings = defaultState.settings;
    if (!parsed.settings.customPresets) parsed.settings.customPresets = [];
    if (!parsed.moods) parsed.moods = {};
    if (parsed.pomodoroSessions == null) parsed.pomodoroSessions = 0;
    if (parsed.onboarded == null) parsed.onboarded = false;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Failed to save state');
  }
}

export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `daily-cloud-backup-${getToday()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json);
    // Validate basic shape
    if (!Array.isArray(parsed.log)) return null;
    if (!parsed.streak || typeof parsed.streak.current !== 'number') return null;
    return loadState(); // just return valid — caller decides merge strategy
  } catch {
    return null;
  }
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

export function calculateStreak(log: string[]): { current: number; best: number; lastCompletedDate: string | null } {
  if (log.length === 0) {
    return { current: 0, best: 0, lastCompletedDate: null };
  }

  const sortedDates = [...new Set(log)].sort().reverse();
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let current = 0;
  let best = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);

    if (prevDate === null) {
      if (dateStr === today || dateStr === yesterdayStr) {
        tempStreak = 1;
        current = 1;
      } else {
        tempStreak = 1;
      }
    } else {
      const diffDays = Math.round((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (current > 0) current = tempStreak;
      } else {
        best = Math.max(best, tempStreak);
        tempStreak = 1;
      }
    }

    prevDate = date;
  }

  best = Math.max(best, tempStreak, current);

  return {
    current,
    best,
    lastCompletedDate: sortedDates[0] || null,
  };
}

export function parseTaskFromInput(input: string): Partial<Task> {
  const lower = input.toLowerCase();

  let type: Task['type'] = 'other';
  let bookName = '';
  let pagesPerSession = 10;
  let startPage = 0;

  if (lower.includes('书') || lower.includes('read') || lower.includes('阅读')) {
    type = 'reading';
    const bookMatch = input.match(/《([^》]+)》/);
    if (bookMatch) {
      bookName = bookMatch[1];
    } else {
      const afterKeyword = input.replace(/[^]*书[^]*/i, '').trim();
      if (afterKeyword && afterKeyword.length > 0 && afterKeyword.length < 20) {
        bookName = afterKeyword;
      }
    }
  } else if (lower.includes('单词') || lower.includes('背单词') || lower.includes('背词')) {
    type = 'reading';
    bookName = '单词本';
    pagesPerSession = 20;
  } else if (lower.includes('代码') || lower.includes('写代码') || lower.includes('编程')) {
    type = 'coding';
  } else if (lower.includes('运动') || lower.includes('跑步') || lower.includes('健身') || lower.includes('瑜伽')) {
    type = 'exercise';
  }

  return {
    type,
    bookName: bookName || undefined,
    pagesPerSession,
    startPage,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}