import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroProps {
  onComplete?: (sessionType: SessionType) => void;
}

interface ModeConfig {
  id: SessionType;
  label: string;
  minutes: number;
  icon: string;
}

const MODES: ModeConfig[] = [
  { id: 'focus', label: '专注', minutes: 25, icon: '🌱' },
  { id: 'shortBreak', label: '短休', minutes: 5, icon: '☁️' },
  { id: 'longBreak', label: '长休', minutes: 15, icon: '🌙' },
];

// SVG circle geometry — 220px diameter, 8px stroke
const SIZE = 220;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

// Pick the next session in the rotation (focus → shortBreak → focus, longBreak → focus)
function nextMode(current: SessionType): SessionType {
  if (current === 'focus') return 'shortBreak';
  return 'focus';
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Pomodoro({ onComplete }: PomodoroProps) {
  const [mode, setMode] = useState<SessionType>('focus');
  const [duration, setDuration] = useState<number>(MODES[0].minutes * 60);
  const [remaining, setRemaining] = useState<number>(MODES[0].minutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);

  // Refs to keep interval + StrictMode guard stable across renders
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against React 18 StrictMode double-invocation of effects in dev
  const tickerRef = useRef<boolean>(false);
  // Track the original document.title so we can restore on unmount
  const originalTitleRef = useRef<string>('');

  // Current mode config
  const currentMode = useMemo(
    () => MODES.find((m) => m.id === mode) ?? MODES[0],
    [mode]
  );

  // Progress 0..1 (1 = full, 0 = empty). Remaining/Elapsed semantics:
  // The ring should drain as time passes. When remaining === duration, fill is full.
  const progress = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // ---------- Handlers ----------

  const handleStart = useCallback(() => {
    if (remaining <= 0) return;
    setIsRunning(true);
  }, [remaining]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setJustCompleted(false);
    setRemaining(duration);
  }, [duration]);

  const switchMode = useCallback((next: SessionType) => {
    const nextConfig = MODES.find((m) => m.id === next) ?? MODES[0];
    setMode(next);
    setDuration(nextConfig.minutes * 60);
    setRemaining(nextConfig.minutes * 60);
    setIsRunning(false);
    setJustCompleted(false);
  }, []);

  // ---------- Timer effect (StrictMode safe) ----------

  useEffect(() => {
    // The tickerRef guard makes sure even if this effect runs twice in StrictMode,
    // we only ever have one interval ticking. First mount acquires the lock,
    // any duplicate invocation bails out immediately.
    if (tickerRef.current) return;
    if (!isRunning) return;

    tickerRef.current = true;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Stop the interval on completion
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          tickerRef.current = false;
          setIsRunning(false);
          setJustCompleted(true);
          // Fire the completion callback with the current mode
          // (use a local ref of mode via setState callback pattern)
          const completedMode = mode;
          if (onComplete) onComplete(completedMode);
          // Auto-rotate to next session
          const next = nextMode(completedMode);
          const nextConfig = MODES.find((m) => m.id === next) ?? MODES[0];
          setMode(next);
          setDuration(nextConfig.minutes * 60);
          // Reset remaining to the new mode's full duration (paused)
          return nextConfig.minutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      tickerRef.current = false;
    };
  }, [isRunning, mode, onComplete]);

  // ---------- Document title ----------

  useEffect(() => {
    // Capture original title once
    if (originalTitleRef.current === '') {
      originalTitleRef.current = document.title;
    }
    if (isRunning) {
      document.title = `剩 ${formatTime(remaining)} - 养一朵云`;
    } else {
      // Restore the original (or leave whatever the parent set)
      document.title = originalTitleRef.current || document.title;
    }
    return () => {
      // On unmount, restore the title
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isRunning, remaining]);

  // ---------- Auto-clear "justCompleted" highlight after a beat ----------

  useEffect(() => {
    if (!justCompleted) return;
    const t = setTimeout(() => setJustCompleted(false), 1200);
    return () => clearTimeout(t);
  }, [justCompleted]);

  // ---------- Render ----------

  // Decide ring color: mint when just completed, warm-coral otherwise
  const ringColor = justCompleted ? 'var(--mint-cloud)' : 'var(--warm-coral)';

  // Determine the button label/action based on state
  const primaryLabel = remaining <= 0 ? '已完成' : isRunning ? '暂停' : '开始';
  const handlePrimary = () => {
    if (justCompleted || remaining <= 0) return;
    if (isRunning) handlePause();
    else handleStart();
  };

  return (
    <div
      style={{
        width: 280,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
      }}
    >
      {/* ===== Mode chips ===== */}
      <div
        role="tablist"
        aria-label="番茄钟模式"
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {MODES.map((m) => {
          const selected = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => switchMode(m.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 999,
                border: selected
                  ? '1px solid var(--mint-cloud-deep)'
                  : '1px solid var(--warm-border)',
                background: selected
                  ? 'var(--mint-cloud-light)'
                  : 'var(--warm-card)',
                color: selected ? 'var(--mint-cloud-text)' : 'var(--ink-light)',
                fontFamily: 'var(--font-body)',
                fontWeight: selected ? 700 : 500,
                fontSize: 13,
                lineHeight: 1,
                cursor: 'pointer',
                boxShadow: selected
                  ? '0 2px 6px rgba(95, 203, 134, 0.25), inset 0 1px 0 rgba(255,255,255,0.6)'
                  : 'var(--shadow-clay-soft)',
                transition: 'all var(--dur-fast) var(--ease-out-quart)',
                minHeight: 36,
              }}
            >
              <span aria-hidden style={{ fontSize: 14 }}>
                {m.icon}
              </span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== Progress ring + timer ===== */}
      <div
        style={{
          position: 'relative',
          width: SIZE,
          height: SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${currentMode.label}计时中，剩余 ${formatTime(remaining)}`}
          style={{
            // Soft drop shadow + inset highlight baked into the ring via filter
            filter: justCompleted
              ? 'drop-shadow(0 4px 14px rgba(95, 203, 134, 0.35))'
              : 'drop-shadow(0 6px 18px rgba(248, 140, 130, 0.22))',
            transform: 'rotate(-90deg)',
            // Smooth progress sweep, disabled automatically by reduced-motion media query
            transition: 'filter var(--dur-medium) var(--ease-out-quart)',
          }}
        >
          {/* Track (background ring) */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--neutral-200, #EFE4D9)"
            strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition:
                'stroke-dashoffset 950ms linear, stroke var(--dur-medium) var(--ease-out-quart)',
            }}
          />
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            className="clay-tnum"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatTime(remaining)}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: 'var(--ink-light)',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {currentMode.icon} {currentMode.label}
          </div>
        </div>
      </div>

      {/* ===== Controls ===== */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={handlePrimary}
          disabled={justCompleted || remaining <= 0}
          aria-label={primaryLabel}
          className="clay-focusable"
          style={{
            minWidth: 96,
            minHeight: 44,
            padding: '0 22px',
            borderRadius: 22,
            border: 'none',
            background:
              justCompleted || remaining <= 0
                ? 'var(--neutral-200, #EFE4D9)'
                : isRunning
                ? 'var(--warm-coral)'
                : 'var(--mint-cloud-cta)',
            color:
              justCompleted || remaining <= 0 ? 'var(--ink-faint, #C2B5AB)' : 'white',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 15,
            cursor:
              justCompleted || remaining <= 0 ? 'not-allowed' : 'pointer',
            boxShadow:
              justCompleted || remaining <= 0
                ? 'none'
                : isRunning
                ? '0 4px 0 #D97664, inset 0 1px 2px rgba(255,255,255,0.5)'
                : '0 4px 0 #3A9A60, inset 0 1px 2px rgba(255,255,255,0.5)',
            transition: 'all var(--dur-fast) var(--ease-out-quart)',
          }}
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="重置"
          className="clay-focusable"
          style={{
            minWidth: 64,
            minHeight: 44,
            padding: '0 18px',
            borderRadius: 22,
            border: '1px solid var(--warm-border)',
            background: 'var(--warm-card)',
            color: 'var(--ink-light)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-clay-soft)',
            transition: 'all var(--dur-fast) var(--ease-out-quart)',
          }}
        >
          重置
        </button>
      </div>
    </div>
  );
}
