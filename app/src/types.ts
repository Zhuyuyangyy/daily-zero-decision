export type TaskType = 'reading' | 'exercise' | 'coding' | 'other';

/** v0.5 起与 zeroDecisionEngine 共用的倾倒分类(单一来源在此) */
export type DumpCategory = 'study' | 'project' | 'life' | 'body' | 'rest';

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
  schemaVersion: number;
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
  /** v0.3 天空归属:用户给天空起的名字(最多 8 字) */
  skyName: string;
  /** 用户是否已命名过天空(决定是否再弹命名引导) */
  skyNamed: boolean;
  /** v0.3 天象图鉴:date → 当日遇见的天象 id 列表 */
  atlas: Record<string, string[]>;
  /** v0.4 本命云:天空里始终陪着用户的那朵云 */
  companion: CompanionState;
  /** v0.5 项目池:从脑子里倒进来的事,active 的才在首页竞争"唯一动作" */
  projects: Project[];
  /** v0.5 行动回执:真正完成过的小动作(不是待办步骤),项目云成长的数据源 */
  actionReceipts: ActionReceipt[];
  /** v0.5 断点:null = 此刻没有半途之事;回来时"接着上次来"读它 */
  resume: ResumeState | null;
}

export const CURRENT_SCHEMA_VERSION = 5;

/**
 * v0.5 项目 — 长成云的最小单位。
 * 不存 steps 列表:步骤由引擎的意图阶梯现算,避免退化成 Todo App。
 */
export interface Project {
  id: string;
  /** 展示名(通常是原文提炼,如「论文 Figure 3」) */
  title: string;
  /** 用户 dump 原文 */
  sourceText: string;
  category: DumpCategory;
  status: 'active' | 'parked' | 'done';
  createdAt: string;      // ISO 8601
  lastTouchedAt: string;  // ISO 8601
  /** 云朵种子:与 cloudSeed 同风格,决定这朵项目云长什么样 */
  cloudSeed: string;
}

/** v0.5 行动回执 — 我真的完成过的小动作,永久沉淀(零删除) */
export interface ActionReceipt {
  id: string;
  projectId: string;
  actionText: string;
  level: number;
  plannedMinutes: number;
  createdAt: string;     // ISO 8601
  completedAt: string;   // ISO 8601
}

/** v0.5 断点 — 停下时存"做到哪、下一步是什么",回来直接续接 */
export interface ResumeState {
  projectId: string;
  lastAction?: string;
  nextHint?: string;
  lastLevel?: number;
  object?: string;
  target?: string;
  updatedAt: string;     // ISO 8601
}

/** v0.4 本命云 —— 不是宠物系统,是"自己长出来的云" */
export interface CompanionState {
  /** 云的名字;未命名为 null 时显示"未命名" */
  name: string | null;
  /** 第一次见面的日期(命名后才写入) */
  metAt: string | null;
  /** 累计陪伴天数(只用 log 长度派生,不单独存) */
  nicknamed: boolean;
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

/** v0.4 本命云默认状态 */
export const defaultCompanionState: CompanionState = {
  name: null,
  metAt: null,
  nicknamed: false,
};

export function getPetStage(affection: number): 'new' | 'familiar' | 'trusted' {
  if (affection >= 14) return 'trusted';
  if (affection >= 5)  return 'familiar';
  return 'new';
}