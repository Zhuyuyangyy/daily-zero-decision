import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { currentDayPhase, shouldSpawnMeteor, type DayPhase } from '../../utils/dayPhase';

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

/* ------------------------------------------------------------
   日夜时段层(融合自"云朵祈愿墙"的星空氛围)
   phase 决定天空上部的一层半透明染色 + 夜晚出现星星/流星。
   不改动成就驱动的 SkyMood 渐变,只在其上轻叠。
   ------------------------------------------------------------ */
const PHASE_TINT: Record<DayPhase, { top: string; bottom: string; opacity: number }> = {
  dawn:  { top: 'rgba(255, 214, 170, 0.16)', bottom: 'rgba(255, 170, 150, 0.10)', opacity: 1 },
  day:   { top: 'rgba(168, 216, 255, 0.14)', bottom: 'rgba(220, 245, 255, 0.08)', opacity: 1 },
  dusk:  { top: 'rgba(255, 160, 120, 0.20)', bottom: 'rgba(200, 120, 160, 0.14)', opacity: 1 },
  night: { top: 'rgba(40, 60, 120, 0.38)',  bottom: 'rgba(90, 80, 160, 0.20)', opacity: 1 },
};

interface Meteor {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

export function SkyScene({ mood, density, variant, reducedMotion: propReducedMotion, className, children }: SkySceneProps) {
  const hookReducedMotion = useReducedMotion();
  const reducedMotion = propReducedMotion ?? hookReducedMotion;

  const [isNarrow, setIsNarrow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 375;
  });
  useEffect(() => {
    // 用 matchMedia 替代 resize 事件监听 — 只在跨越 375 边界时触发，零开销
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(max-width: 375px)');
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    setIsNarrow(mql.matches);
    // Safari < 14 用 addListener；现代浏览器用 addEventListener
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  const effectiveDensity: SkyDensity = isNarrow ? 'minimal' : density;
  const sun = SUN_PARAMS[mood];

  // ---- 日夜时段(挂载时定一次,页面会话内不跳变)----
  const [dayPhase] = useState<DayPhase>(() => currentDayPhase().phase);
  const phaseTint = PHASE_TINT[dayPhase];
  const isNight = dayPhase === 'night';

  // ---- 夜晚星星(固定位置,挂载时生成;祈愿墙同款 twinkle)----
  const [stars] = useState(() =>
    isNight
      ? Array.from({ length: 14 }, (_, i) => ({
          id: i,
          top: 4 + Math.random() * 42,
          left: 4 + Math.random() * 92,
          size: 8 + Math.random() * 7,
          delay: Math.random() * 3,
          dur: 2 + Math.random() * 3,
        }))
      : [],
  );

  // ---- 夜晚流星调度(每 8s tick 一次,概率命中才生成)----
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  useEffect(() => {
    if (!isNight || reducedMotion) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = () => {
      if (!alive) return;
      const hour = new Date().getHours();
      if (shouldSpawnMeteor(hour, Math.random())) {
        const meteor: Meteor = {
          id: Date.now() + Math.random(),
          left: 12 + Math.random() * 70,
          top: 6 + Math.random() * 26,
          delay: 0,
          duration: 1.6 + Math.random() * 0.8,
        };
        setMeteors((prev) => [...prev.slice(-2), meteor]);
        timers.push(setTimeout(() => {
          if (alive) setMeteors((prev) => prev.filter((m) => m.id !== meteor.id));
        }, (meteor.duration + 0.4) * 1000));
      }
    };
    const first = setTimeout(tick, 2500);
    const interval = setInterval(tick, 8000);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [isNight, reducedMotion]);

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

  // 日夜染色层:从天空顶部往下轻叠,夜里把上部压成深蓝紫
  const phaseTintStyle: CSSProperties = {
    background: `linear-gradient(180deg, ${phaseTint.top} 0%, ${phaseTint.top} 40%, ${phaseTint.bottom} 75%, transparent 100%)`,
    opacity: phaseTint.opacity,
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

      {/* 日夜时段染色层(夜里变深蓝紫,白天轻叠天青) */}
      <div
        data-sky-layer="phase-tint"
        aria-hidden="true"
        className="sky-layer"
        style={phaseTintStyle}
      />

      {/* 夜晚:星星(祈愿墙同款 twinkle) */}
      {isNight && (
        <div data-sky-layer="stars" aria-hidden="true" className="sky-layer">
          {stars.map((s) => (
            <span
              key={s.id}
              className="sky-star"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 夜晚:偶发流星 */}
      {isNight && !reducedMotion && (
        <div data-sky-layer="meteors" aria-hidden="true" className="sky-layer">
          {meteors.map((m) => (
            <span
              key={m.id}
              className="sky-meteor"
              style={{
                left: `${m.left}%`,
                top: `${m.top}%`,
                animationDuration: `${m.duration}s`,
              }}
            />
          ))}
        </div>
      )}

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