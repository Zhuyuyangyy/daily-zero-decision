export type TaskType = 'reading' | 'exercise' | 'coding' | 'other';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  bookName?: string;
  currentPage?: number;
  pagesPerSession?: number;
  startPage?: number;
  endPage?: number;
  place?: string;
  time?: string;
  note?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Preset {
  id: string;
  label: string;
  icon: string;
  value: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: AppState) => boolean;
}

export interface StreakState {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

export interface Settings {
  defaultPagesPerSession: number;
  lastPageRead: number;
  lastBookName: string;
  customPresets: Preset[];
}

export interface AppState {
  tasks: Task[];
  log: string[];
  streak: StreakState;
  settings: Settings;
  achievements: string[];
  history: Record<string, Task[]>;
  /** date → mood ('down'|'low'|'okay'|'gloomy'|'hopeful') */
  moods: Record<string, string>;
  pomodoroSessions: number;
  onboarded: boolean;
  /** Premium features */
  premium: PremiumState;
}

export interface PremiumState {
  protectionCards: number;  // 天空投资保护卡数量
  subscription: Subscription | null;
}

export interface Subscription {
  active: boolean;
  startDate: string;
  expiresAt: string;
  plan: 'monthly' | 'yearly';
}

export type Mood = 'down' | 'low' | 'okay' | 'gloomy' | 'hopeful';

export type CloudMood = 'calm' | 'happy' | 'celebrate';