import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type SkyDensity = 'minimal' | 'comfortable' | 'rich';
export type SkyVariant = 'today' | 'garden';
export type SkyMood = 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

const SUN_PARAMS: Record<SkyMood, { top: string; color: string; glow: number }> = {
  dawn:    { top: '18%', color: 'var(--sun-dawn)',    glow: 0.5  },
  morning: { top: '22%', color: 'var(--sun-morning)', glow: 0.6  },
  clear:   { top: '28%', color: 'var(--sun-clear)',   glow: 0.55 },
  sunny:   { top: '32%', color: 'var(--sun-sunny)',   glow: 0.7  },
  golden:  { top: '25%', color: 'var(--sun-golden)',  glow: 0.75 },
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

  // Sun layer needs per-mood dynamic position + radial gradient — kept as CSS var.
  const sunStyle: CSSProperties = {
    top: sun.top,
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: sun.glow,
    background: `radial-gradient(circle, ${sun.color} 0%, color-mix(in srgb, ${sun.color} 50%, transparent) 40%, transparent 70%)`,
  };

  // Background gradient uses var() so live tokens drive it; only the
  // multi-stop radial mosaic is inline (data-driven, not tokenizable).
  const bgStyle: CSSProperties = {
    background: `
      radial-gradient(ellipse 40% 30% at 50% 10%, rgba(255, 245, 220, 0.6) 0%, transparent 70%),
      radial-gradient(ellipse 70% 50% at 50% 85%, rgba(255, 190, 110, 0.45) 0%, transparent 70%),
      radial-gradient(ellipse 60% 30% at 30% 70%, rgba(255, 215, 175, 0.40) 0%, transparent 60%),
      radial-gradient(ellipse 50% 25% at 70% 65%, rgba(255, 200, 165, 0.35) 0%, transparent 60%),
      linear-gradient(180deg, var(--sky-dawn-1) 0%, var(--sky-dawn-2) 45%, var(--sky-dawn-3) 100%)
    `,
  };

  const atmosphereStyle: CSSProperties = {
    background: 'radial-gradient(ellipse 80% 30% at 50% 60%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
  };

  return (
    <div className={`clay-sky-scene sky-scene ${className ?? ''}`}>
      <div
        data-sky-layer="background"
        aria-hidden="true"
        className="sky-layer"
        style={bgStyle}
      />

      <div
        data-sky-layer="sun"
        aria-hidden="true"
        className="sky-layer sky-layer--sun"
        style={sunStyle}
      />

      {effectiveDensity !== 'minimal' && (
        <svg data-sky-layer="far-mountains" aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none"
          className="sky-layer--mountains sky-layer--mountains-far">
          <path d="M0 25 Q 15 15, 30 20 T 55 18 T 80 22 T 100 20 L 100 30 L 0 30 Z" fill="rgba(180, 130, 110, 0.25)" />
        </svg>
      )}

      {effectiveDensity !== 'minimal' && (
        <svg data-sky-layer="mid-mountains" aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none"
          className="sky-layer--mountains sky-layer--mountains-mid">
          <path d="M0 22 Q 20 18, 40 20 T 70 19 T 100 21 L 100 30 L 0 30 Z" fill="rgba(150, 110, 90, 0.35)" />
        </svg>
      )}

      {effectiveDensity !== 'minimal' && (
        <div data-sky-layer="atmosphere" aria-hidden="true" className="sky-layer sky-atmosphere"
          style={atmosphereStyle}
        />
      )}

      {(effectiveDensity === 'comfortable' || effectiveDensity === 'rich') && !reducedMotion && (
        <div data-sky-layer="birds" aria-hidden="true" className="sky-layer--birds">
          {Array.from({ length: effectiveDensity === 'rich' ? 6 : 3 }).map((_, i) => (
            <span key={i} className="sky-bird sky-bird--fly"
              style={{ top: `${20 + i * 8}%`, left: `${10 + i * 15}%` }}>
              🕊
            </span>
          ))}
        </div>
      )}

      {effectiveDensity === 'rich' && !reducedMotion && (
        <div data-sky-layer="balloon" aria-hidden="true" className="sky-balloon">
          🎈
        </div>
      )}

      <div className="sky-content">{children}</div>

      <div
        data-sky-layer="grass"
        aria-hidden="true"
        className={`sky-layer--grass ${variant === 'today' ? 'sky-layer--grass-today' : 'sky-layer--grass-garden'}`}
        style={{ height: variant === 'today' ? 12 : 6 }}
      />

      {variant === 'today' && (
        <div data-sky-layer="foreground-fade" aria-hidden="true" className="sky-layer--fade" />
      )}
    </div>
  );
}