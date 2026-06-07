/**
 * Compute hero sky mood based on streak and completion status.
 */
export type SkyMood = 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

export function skyMoodFromStreak(
  completedToday: boolean,
  missedRecently: boolean,
  isFirstEver: boolean,
  streak: number
): SkyMood {
  if (isFirstEver && !completedToday) return 'dawn';
  if (completedToday) {
    if (streak >= 30) return 'golden';
    if (streak >= 14) return 'sunny';
    if (streak >= 7) return 'clear';
    if (streak >= 2) return 'morning';
    return 'dawn';
  }
  if (missedRecently) return 'morning';
  if (streak >= 30) return 'golden';
  if (streak >= 14) return 'sunny';
  if (streak >= 7) return 'clear';
  if (streak >= 2) return 'morning';
  return 'dawn';
}
