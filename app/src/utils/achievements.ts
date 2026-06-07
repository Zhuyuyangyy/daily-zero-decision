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
