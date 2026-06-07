import { describe, it, expect } from 'vitest';
import { skyMoodFromStreak } from '../skyMood';

describe('skyMoodFromStreak', () => {
  it('returns dawn for first ever user who has not completed today', () => {
    expect(skyMoodFromStreak(false, false, true, 0)).toBe('dawn');
  });

  it('returns golden for 30+ day streak', () => {
    expect(skyMoodFromStreak(true, false, false, 30)).toBe('golden');
    expect(skyMoodFromStreak(true, false, false, 60)).toBe('golden');
  });
});
