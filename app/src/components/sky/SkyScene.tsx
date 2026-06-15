import { useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type SkyDensity = 'minimal' | 'comfortable' | 'rich';
export type SkyVariant = 'today' | 'garden';
export type SkyMood = 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

const SUN_PARAMS: Record<SkyMood, { top: string; color: string; glow: number }> = {
  dawn:    { top: '18%', color: '#FFB37A', glow: 0.5 },
  morning: { top: '22%', color: '#FFD89B', glow: 0.6 },
  clear:   { top: '28%', color: '#FFE4A8', glow: 0.55 },
  sunny:   { top: '32%', color: '#FFCB6B', glow: 0.7 },
  golden:  { top: '25%', color: '#FF9D5C', glow: 0.75 },
};

export interface SkySceneProps {
  mood: SkyMood;
  density: SkyDensity;
  variant: SkyVariant;
  reducedMotion?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SkyScene({ mood, density, variant, reducedMotion: propReducedMotion, className, children }: SkySceneProps) {
  const hookReducedMotion = useReducedMotion();
  const reducedMotion = propReducedMotion ?? hookReducedMotion;

  const [isNarrow, setIsNarrow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 375;
  });
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth <= 375);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const effectiveDensity: SkyDensity = isNarrow ? 'minimal' : density;
  const sun = SUN_PARAMS[mood];

  return (
    <div
      className={`clay-sky-scene ${className ?? ''}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        data-sky-layer="background"
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 40% 30% at 50% 10%, rgba(255, 245, 220, 0.6) 0%, transparent 70%),
            radial-gradient(ellipse 70% 50% at 50% 85%, rgba(255, 190, 110, 0.45) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 30% 70%, rgba(255, 215, 175, 0.40) 0%, transparent 60%),
            radial-gradient(ellipse 50% 25% at 70% 65%, rgba(255, 200, 165, 0.35) 0%, transparent 60%),
            linear-gradient(180deg, var(--sky-dawn-1, #FFE9DF) 0%, var(--sky-dawn-2, #FDF4F0) 45%, var(--sky-dawn-3, #FAE6DC) 100%)
          `,
        }}
      />

      <div
        data-sky-layer="sun"
        aria-hidden="true"
        style={{
          position: 'absolute', top: sun.top, left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 80, borderRadius: '50%',
          background: `radial-gradient(circle, ${sun.color} 0%, ${sun.color}88 40%, transparent 70%)`,
          opacity: sun.glow, pointerEvents: 'none',
        }}
      />

      {effectiveDensity !== 'minimal' && (
        <svg data-sky-layer="far-mountains" aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '20%', pointerEvents: 'none' }}>
          <path d="M0 25 Q 15 15, 30 20 T 55 18 T 80 22 T 100 20 L 100 30 L 0 30 Z" fill="rgba(180, 130, 110, 0.25)" />
        </svg>
      )}

      {effectiveDensity !== 'minimal' && (
        <svg data-sky-layer="mid-mountains" aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '15%', pointerEvents: 'none' }}>
          <path d="M0 22 Q 20 18, 40 20 T 70 19 T 100 21 L 100 30 L 0 30 Z" fill="rgba(150, 110, 90, 0.35)" />
        </svg>
      )}

      {effectiveDensity !== 'minimal' && (
        <div data-sky-layer="atmosphere" aria-hidden="true" className="sky-atmosphere"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 30% at 50% 60%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          }}
        />
      )}

      {(effectiveDensity === 'comfortable' || effectiveDensity === 'rich') && !reducedMotion && (
        <div data-sky-layer="birds" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: effectiveDensity === 'rich' ? 6 : 3 }).map((_, i) => (
            <span key={i} className="sky-bird"
              style={{ position: 'absolute', top: `${20 + i * 8}%`, left: `${10 + i * 15}%`, fontSize: 14, opacity: 0.6 }}>
              🕊
            </span>
          ))}
        </div>
      )}

      {effectiveDensity === 'rich' && !reducedMotion && (
        <div data-sky-layer="balloon" aria-hidden="true" className="sky-balloon"
          style={{ position: 'absolute', top: '15%', right: '20%', fontSize: 24, pointerEvents: 'none' }}>
          🎈
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>

      <div data-sky-layer="grass" aria-hidden="true"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: variant === 'today' ? 12 : 6,
          background: variant === 'today'
            ? 'linear-gradient(180deg, transparent 0%, rgba(180, 200, 150, 0.5) 100%)'
            : 'rgba(180, 200, 150, 0.3)',
          pointerEvents: 'none',
        }}
      />

      {variant === 'today' && (
        <div data-sky-layer="foreground-fade" aria-hidden="true"
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 80,
            background: 'linear-gradient(180deg, transparent 0%, var(--bg-page, #FDF4F0) 100%)',
            pointerEvents: 'none', zIndex: 5,
          }}
        />
      )}
    </div>
  );
}