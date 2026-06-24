import { AppState } from '../types';

export const ACHIEVEMENT_INFO: Record<
  string,
  { icon: string; title: string; description: string }
> = {
  'first-cloud': { icon: '🌱', title: '第一朵云', description: '完成第一次打卡' },
  'streak-7': { icon: '🌤', title: '七天连晴', description: '连续打卡 7 天' },
  'streak-30': { icon: '☀️', title: '三十天金空', description: '连续打卡 30 天' },
  'total-100': { icon: '⭐', title: '百天不落', description: '累计打卡 100 天' },
  bookworm: { icon: '📚', title: '书虫', description: '累计完成 50 次阅读任务' },
  runner: { icon: '🏃', title: '跑者', description: '累计完成 30 次运动任务' },
  geek: { icon: '💻', title: '极客', description: '累计完成 50 次编码任务' },
};

/** Check and return newly unlocked achievement IDs */
export function checkAchievements(state: AppState): string[] {
  const newlyUnlocked: string[] = [];

  // 只统计 history 里已完成（completedAt 存在）的任务。
  // 不要合并 state.tasks：未完成的任务不应计入成就进度，否则用户改主意删除时会触发误判。
  const completedTasks = Object.values(state.history)
    .flat()
    .filter((t) => !!t.completedAt);

  const conditions: { id: string; check: (s: AppState) => boolean }[] = [
    { id: 'first-cloud', check: (s) => s.log.length >= 1 },
    { id: 'streak-7', check: (s) => s.streak.best >= 7 },
    { id: 'streak-30', check: (s) => s.streak.best >= 30 },
    { id: 'total-100', check: (s) => s.log.length >= 100 },
    { id: 'bookworm', check: () => completedTasks.filter(t => t.type === 'reading').length >= 50 },
    { id: 'runner', check: () => completedTasks.filter(t => t.type === 'exercise').length >= 30 },
    { id: 'geek', check: () => completedTasks.filter(t => t.type === 'coding').length >= 50 },
  ];

  for (const { id, check } of conditions) {
    if (!state.achievements.includes(id) && check(state)) {
      newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}
