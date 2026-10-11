import type { SkyMood } from '../components/sky/SkyScene';

export type GardenMood = 'calm' | 'happy' | 'celebrate';

export function toCloudGardenMood(skyMood: SkyMood, isCompleted: boolean): GardenMood {
  if (isCompleted) return 'celebrate';
  if (skyMood === 'golden') return 'happy';
  return 'calm';
}
