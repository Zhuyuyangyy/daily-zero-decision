import { AppState, Task, defaultPetState } from '../types';

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
  // 新用户默认2张安心卡
  peace: {
    cards: 2,
    protectedDates: [],
    lastRewardedDate: null,
  },
  // 天空宠物系统（cloud_cat MVP）
  pet: defaultPetState,
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
    // H9: onboarded 三态兼容 — 显式 true / false 保留，缺失走 defaultState.onboarded
    if (parsed.onboarded == null) parsed.onboarded = false;

    // H8: 老用户 backfill — 同步 importState 行为
    const backfillType = (task: any) => {
      if (!task || task.type !== 'other') return task;
      const lower = (task.title || '').toLowerCase();
      if (lower.includes('书') || lower.includes('读') || lower.includes('页') || lower.includes('新词') || lower.includes('单词')) {
        return { ...task, type: 'reading' };
      }
      if (lower.includes('走') || lower.includes('跑') || lower.includes('运动') || lower.includes('健身') || lower.includes('瑜伽')) {
        return { ...task, type: 'exercise' };
      }
      if (lower.includes('代码') || lower.includes('编程')) {
        return { ...task, type: 'coding' };
      }
      return task;
    };
    if (Array.isArray(parsed.tasks)) {
      parsed.tasks = parsed.tasks.map(backfillType);
    }
    if (parsed.history && typeof parsed.history === 'object') {
      for (const [date, tasks] of Object.entries(parsed.history)) {
        if (Array.isArray(tasks)) {
          (parsed.history as any)[date] = (tasks as any[]).map(backfillType);
        }
      }
    }

    return {
      ...defaultState,
      ...parsed,
      peace: parsed.peace || parsed.premium || defaultState.peace,
      pet: { ...defaultPetState, ...(parsed.pet || {}) },
    };
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

    if (!Array.isArray(parsed.log)) return null;
    if (!parsed.streak || typeof parsed.streak.current !== 'number') return null;

    // H9: onboarded 三态规则
    let onboarded: boolean;
    if (parsed.onboarded === true) onboarded = true;
    else if (parsed.onboarded === false) onboarded = false;
    else onboarded = defaultState.onboarded;

    // H8: 老用户 backfill
    const backfillType = (task: any) => {
      if (!task || task.type !== 'other') return task;
      const lower = (task.title || '').toLowerCase();
      if (lower.includes('书') || lower.includes('读') || lower.includes('页') || lower.includes('新词') || lower.includes('单词')) {
        return { ...task, type: 'reading' as const };
      }
      if (lower.includes('走') || lower.includes('跑') || lower.includes('运动') || lower.includes('健身') || lower.includes('瑜伽')) {
        return { ...task, type: 'exercise' as const };
      }
      if (lower.includes('代码') || lower.includes('编程')) {
        return { ...task, type: 'coding' as const };
      }
      return task;
    };

    const history: Record<string, Task[]> = {};
    if (parsed.history && typeof parsed.history === 'object') {
      for (const [date, tasks] of Object.entries(parsed.history)) {
        history[date] = Array.isArray(tasks) ? (tasks as any[]).map(backfillType) : [];
      }
    }
    const tasks = Array.isArray(parsed.tasks) ? (parsed.tasks as any[]).map(backfillType) : [];

    return {
      ...defaultState,
      ...parsed,
      tasks,
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
      },
      achievements: parsed.achievements || [],
      history,
      moods: parsed.moods || {},
      pomodoroSessions: parsed.pomodoroSessions ?? 0,
      onboarded,
      peace: parsed.peace || parsed.premium || defaultState.peace,
      pet: { ...defaultPetState, ...(parsed.pet || {}) },
    };
  } catch {
    return null;
  }
}

/**
 * 用本地时区组件拼出 YYYY-MM-DD。
 * 不用 toISOString().split('T')[0]，避免 UTC+ 时区在凌晨误读前一天。
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
function localDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getToday(): string {
  return localDateString(new Date());
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === localDateString(yesterday);
}

/**
 * 用日历日差（基于日期字符串本身）计算两天间隔。
 * 避免 DST / 跨时区毫秒差导致的误断。
 */
function calendarDayDiff(a: string, b: string): number {
  // parse YYYY-MM-DD 为 noon UTC 避免任何时区偏移影响
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const aMs = Date.UTC(ay, am - 1, ad, 12, 0, 0);
  const bMs = Date.UTC(by, bm - 1, bd, 12, 0, 0);
  return Math.round((aMs - bMs) / 86400000);
}

export function calculateStreak(log: string[]): { current: number; best: number; lastCompletedDate: string | null } {
  if (log.length === 0) {
    return { current: 0, best: 0, lastCompletedDate: null };
  }

  const sortedDates = [...new Set(log)].sort().reverse();
  const today = getToday();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = localDateString(yesterdayDate);

  let current = 0;
  let best = 0;
  let tempStreak = 0;
  let prevDate: string | null = null;

  for (const dateStr of sortedDates) {
    if (prevDate === null) {
      if (dateStr === today || dateStr === yesterdayStr) {
        tempStreak = 1;
        current = 1;
      } else {
        tempStreak = 1;
      }
    } else {
      const diffDays = calendarDayDiff(prevDate, dateStr);
      if (diffDays === 1) {
        tempStreak++;
        if (current > 0) current = tempStreak;
      } else {
        best = Math.max(best, tempStreak);
        tempStreak = 1;
      }
    }

    prevDate = dateStr;
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

  // 1) 抽取"X 页"和"X 分钟"这种量化指标
  const pageMatch = input.match(/(\d+)\s*页/);
  if (pageMatch) pagesPerSession = Number(pageMatch[1]);

  const minuteMatch = input.match(/(\d+)\s*(分钟|min)/i);

  // 2) 主题归类（顺序：先看更具体的"散步/新词"，再回退到原关键词）
  if (lower.includes('散步') || lower.includes('走走') || lower.includes('出门走')) {
    type = 'exercise';
  } else if (lower.includes('新词') || lower.includes('背词') || lower.includes('单词')) {
    type = 'reading';
    bookName = '单词本';
    if (!pageMatch) pagesPerSession = 5;
  } else if (lower.includes('书') || lower.includes('read') || lower.includes('阅读')) {
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
  } else if (lower.includes('代码') || lower.includes('写代码') || lower.includes('编程')) {
    type = 'coding';
  } else if (lower.includes('运动') || lower.includes('跑步') || lower.includes('健身') || lower.includes('瑜伽')) {
    type = 'exercise';
  }

  // === Round 6 H2: time 推算（不修改 Partial<Task> 返回类型）===
  // 优先级: minuteMatch > 背单词特例 > pagesPerSession 推算 > 深呼吸特例 > type 默认
  let finalTime: string;
  if (minuteMatch) {
    finalTime = `${Number(minuteMatch[1])} 分钟`;
  } else if (lower.includes('新词') || lower.includes('背词') || lower.includes('单词')) {
    // 背单词特例：绕过 pagesPerSession 推算
    finalTime = '5 分钟';
  } else if (lower.includes('深呼吸')) {
    finalTime = '1 分钟';
  } else if (type === 'reading' || type === 'exercise' || type === 'coding') {
    finalTime = pagesPerSession && pagesPerSession <= 2 ? '5 分钟'
         : pagesPerSession && pagesPerSession <= 10 ? '15 分钟'
         : '30 分钟';
  } else {
    // type === 'other' 且无 minute / 关键词特例
    finalTime = '3 分钟';
  }

  return {
    type,
    bookName: bookName || undefined,
    pagesPerSession,
    startPage,
    time: finalTime,
  };
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 兜底：极旧浏览器 / 非 https 场景
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 10);
}