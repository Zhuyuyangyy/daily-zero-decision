// Cloud seed generator
// Given a date string, deterministically generate a unique cloud
// Same date → same cloud. Different dates → different clouds.

export interface CloudShape {
  id: string;
  date: string;
  // Visual properties
  size: number;        // 0.7 - 1.5
  cx: number;          // x position % in sky  8 - 92
  cy: number;          // y position % in sky  15 - 70
  rotation: number;    // -6 to 6 degrees
  rx: number;          // base ellipse rx
  ry: number;          // base ellipse ry
  bumpCount: number;   // 2-4 top bumps
  bumpSize: number;    // 0.8 - 1.2
  // Color
  hue: number;         // hue base
  saturation: number;  // 22 - 50
  lightness: number;   // 84 - 96
  opacity: number;     // 0.85 - 1
  // Mood
  expression: 'calm' | 'smile' | 'sleep' | 'wink' | 'tiny-smile' | 'peeking' | 'neutral' | 'peaceful';
  // Movement
  drift: number;       // horizontal drift amplitude 0 - 6
  floatSpeed: number;   // seconds for one float cycle 5-9
  // Layer (parallax-like depth) — 0 = front, 1 = back
  layer: number;       // 0 - 1.5
}

// Simple deterministic hash
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number, salt: number): number {
  const x = Math.sin(seed + salt * 9301) * 233280;
  return x - Math.floor(x);
}

function range(seed: number, salt: number, min: number, max: number): number {
  const v = seededRandom(seed, salt);
  return min + v * (max - min);
}

function pick<T>(seed: number, salt: number, options: T[]): T {
  const idx = Math.floor(seededRandom(seed, salt) * options.length);
  return options[idx];
}

const expressions: CloudShape['expression'][] = [
  'calm', 'smile', 'sleep', 'wink', 'tiny-smile', 'peeking', 'neutral', 'peaceful',
];

export function generateCloud(date: string): CloudShape {
  const seed = hashString(date);

  // Hue: warm cream-pink base + a hint of variation, never harsh blue/green
  // Range: 10-50 (pinks, peaches, creams) with occasional pastel mint
  const baseHue = range(seed, 9, 10, 50);
  const hue = seededRandom(seed, 16) > 0.85 ? range(seed, 17, 80, 140) : baseHue;

  return {
    id: `cloud-${date}`,
    date,
    size: range(seed, 1, 0.7, 1.5),
    cx: range(seed, 2, 8, 92),
    cy: range(seed, 3, 15, 70),
    rotation: range(seed, 4, -6, 6),
    rx: range(seed, 5, 22, 38),
    ry: range(seed, 6, 12, 18),
    bumpCount: Math.floor(range(seed, 7, 2, 4.99)),
    bumpSize: range(seed, 8, 0.85, 1.2),
    hue,
    saturation: range(seed, 10, 22, 50),
    lightness: range(seed, 11, 84, 96),
    opacity: range(seed, 12, 0.85, 1),
    expression: pick(seed, 13, expressions),
    drift: range(seed, 14, 0, 6),
    floatSpeed: range(seed, 15, 5, 9),
    layer: seededRandom(seed, 18),
  };
}

// Generate cloud field for a date range
export function generateCloudsForRange(
  dates: string[],
  maxClouds: number = 12
): CloudShape[] {
  const recent = dates.slice(-maxClouds);
  return recent.map(generateCloud);
}

// Sky mood based on streak length + recency
export type SkyMood = 'foggy' | 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

export interface SkyState {
  mood: SkyMood;
  gradient: { top: string; middle: string; bottom: string };
  sunPosition: { x: number; y: number };
  glow: string;
  accentGlow: string; // horizon-level warmth
}

export function getSkyState(streakCurrent: number, missedRecently: boolean): SkyState {
  let mood: SkyMood;
  if (streakCurrent >= 30) mood = 'golden';
  else if (streakCurrent >= 14) mood = 'sunny';
  else if (streakCurrent >= 7) mood = 'clear';
  else if (streakCurrent >= 2) mood = 'morning';
  else mood = 'dawn';

  if (missedRecently && streakCurrent > 0) {
    if (mood === 'golden') mood = 'sunny';
    else if (mood === 'sunny') mood = 'clear';
    else if (mood === 'clear') mood = 'morning';
  }

  // Claymorphism palette: warm pinks/creams/peach — never cold blue
  const palettes: Record<SkyMood, { top: string; middle: string; bottom: string; glow: string; accentGlow: string; sun: { x: number; y: number } }> = {
    foggy:  { top: '#F4DCD4', middle: '#FCE4D8', bottom: '#FFEEDC', glow: 'rgba(255,235,215,0.5)', accentGlow: 'rgba(255,200,180,0.3)', sun: { x: 78, y: 22 } },
    dawn:   { top: '#F2C9B5', middle: '#FCDCC8', bottom: '#FDE5C7', glow: 'rgba(255,200,160,0.55)', accentGlow: 'rgba(255,180,140,0.4)', sun: { x: 75, y: 20 } },
    morning:{ top: '#E8D5DA', middle: '#F4DCDC', bottom: '#FBE0CC', glow: 'rgba(255,210,170,0.55)', accentGlow: 'rgba(255,200,170,0.4)', sun: { x: 72, y: 18 } },
    clear:  { top: '#DBC4D6', middle: '#EFD6D9', bottom: '#FBD8C2', glow: 'rgba(255,200,140,0.6)', accentGlow: 'rgba(255,190,140,0.45)', sun: { x: 68, y: 16 } },
    sunny:  { top: '#D0B5D5', middle: '#ECC9B8', bottom: '#FBC9A2', glow: 'rgba(255,200,120,0.65)', accentGlow: 'rgba(255,180,100,0.5)', sun: { x: 65, y: 14 } },
    golden: { top: '#C49AC0', middle: '#E0A89A', bottom: '#FFB87A', glow: 'rgba(255,180,100,0.75)', accentGlow: 'rgba(255,150,80,0.6)', sun: { x: 60, y: 12 } },
  };

  const p = palettes[mood];
  return {
    mood,
    gradient: { top: p.top, middle: p.middle, bottom: p.bottom },
    sunPosition: p.sun,
    glow: p.glow,
    accentGlow: p.accentGlow,
  };
}
