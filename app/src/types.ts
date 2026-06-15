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
  /** 安心卡系统 */
  peace: PeaceState;
  /** 天空宠物系统（cloud_cat MVP） */
  pet: PetState;
}

export interface PeaceState {
  cards: number;  // 安心卡数量，最多2张
  protectedDates: string[];  // 被安心卡保护的日子（不伪造log）
  lastRewardedDate: string | null;  // 上次获得奖励的日期
}

/** 安心卡使用记录 */
export interface PeaceUse {
  date: string;
  consumedAt: string;
}

export type Mood = 'down' | 'low' | 'okay' | 'gloomy' | 'hopeful';

export type CloudMood = 'calm' | 'happy' | 'celebrate';

// ===== 天空宠物系统（cloud_cat MVP）=====
// 反 PUA 铁律：亲密度只增不减；不催、不责怪、不惩罚。
export type PetMood =
  | 'idle'          // 静坐云边，呼吸
  | 'waiting'       // 望今日卡方向，眨眼（今天没卡）
  | 'encouraging'   // 看着卡片，小幅身体倾向（有卡未完成）
  | 'celebrating'   // 小跳 0.8s + 星星粒子（已完成）
  | 'resting'       // 抱小毯子坐月亮旁（安心卡保护昨日）
  | 'sleeping';     // 闭眼卷起（预留，MVP 暂不触发）

export type PetSpecies = 'cloud_cat';

export interface PetState {
  enabled: boolean;
  species: PetSpecies;
  name: string;                  // 用户起的名字，最多 8 字
  affection: number;             // 只增不减
  firstMetAt: string | null;
  lastInteractionAt: string | null;
  lastRewardDate: string | null; // 防同日重复 +1
  mood: PetMood;
  renamed: boolean;              // 首次改名 +1 后置 true
}

export const defaultPetState: PetState = {
  enabled: true,
  species: 'cloud_cat',
  name: '小云',
  affection: 0,
  firstMetAt: null,
  lastInteractionAt: null,
  lastRewardDate: null,
  mood: 'idle',
  renamed: false,
};

export function getPetStage(affection: number): 'new' | 'familiar' | 'trusted' {
  if (affection >= 14) return 'trusted';
  if (affection >= 5)  return 'familiar';
  return 'new';
}