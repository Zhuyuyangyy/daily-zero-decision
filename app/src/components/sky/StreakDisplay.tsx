import { useMemo } from 'react';

// 内联一个简单的字符串 hash，避免越界修改 cloudSeed.ts。
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// 主题类型与 HeroSky 对齐。
export type StreakSkyMood = 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

export interface StreakDisplayProps {
  /** 用户完成过的日期字符串数组（按时间顺序） */
  log: string[];
  /** 当前连续天数（弱化使用） */
  streakCurrent: number;
  /** 天空心情 → 决定底色 */
  mood?: StreakSkyMood;
  className?: string;
}

// --------------------------------------------------------------------
// 天空底色：mood → theme/clay.css 的 --sky-dawn-1~4 + 一抹 mint cloud light
// --------------------------------------------------------------------
const SKY_BG: Record<StreakSkyMood, string> = {
  dawn:    'linear-gradient(180deg, var(--sky-dawn-1) 0%, var(--sky-dawn-2) 55%, var(--sky-dawn-3) 100%)',
  morning: 'linear-gradient(180deg, var(--sky-dawn-1) 0%, var(--sky-dawn-2) 50%, var(--sky-dawn-3) 100%)',
  clear:   'linear-gradient(180deg, var(--sky-dawn-1) 0%, var(--sky-dawn-2) 45%, var(--sky-dawn-4) 100%)',
  sunny:   'linear-gradient(180deg, var(--sky-dawn-2) 0%, var(--sky-dawn-3) 50%, var(--sky-dawn-4) 100%)',
  golden:  'linear-gradient(180deg, var(--sky-dawn-3) 0%, var(--sky-dawn-4) 100%)',
};

// --------------------------------------------------------------------
// 用 hash + salt 取 [0,1) 浮点（确定性，与 SkyScene 思路一致）
// --------------------------------------------------------------------
function seeded(seed: number, salt: number): number {
  const x = Math.sin(seed + salt * 9301 + salt * salt * 0.31) * 233280;
  return x - Math.floor(x);
}

function between(seed: number, salt: number, lo: number, hi: number): number {
  return lo + seeded(seed, salt) * (hi - lo);
}

// --------------------------------------------------------------------
// 一朵小云：3~4 个椭圆叠出来的极简形状
// --------------------------------------------------------------------
interface MiniCloud {
  id: string;
  cx: number;     // 0~100 (%) —— 主体中心 X
  cy: number;     // 0~100 (%) —— 主体中心 Y
  width: number;  // 16~32 px
  height: number; // 8~16 px
  opacity: number;
  rotation: number;       // -5 ~ 5 deg
  floatDur: number;       // s
  floatDelay: number;     // s
  // 椭圆细节
  bumps: Array<{ dx: number; dy: number; rx: number; ry: number }>;
}

function buildMiniClouds(log: string[]): MiniCloud[] {
  // 只取最近 8 天
  const recent = log.slice(-8);
  return recent.map((date) => {
    const seed = hashString(date);
    const width  = Math.round(between(seed, 1, 16, 32));
    const height = Math.max(6, Math.round(width * (0.45 + seeded(seed, 11) * 0.15)));
    const bumpCount = 3 + Math.floor(seeded(seed, 2) * 2); // 3 or 4
    const bumps = Array.from({ length: bumpCount }, (_, b) => {
      const t = bumpCount === 1 ? 0.5 : b / (bumpCount - 1); // 0..1
      const cx = -width * 0.35 + t * width * 0.7 + (seeded(seed, 20 + b) - 0.5) * width * 0.12;
      const cy = -height * 0.35 - seeded(seed, 30 + b) * height * 0.35;
      const rx = width * (0.22 + seeded(seed, 40 + b) * 0.14);
      const ry = height * (0.55 + seeded(seed, 50 + b) * 0.25);
      return { dx: cx, dy: cy, rx, ry };
    });
    return {
      id: `mc-${date}`,
      cx: between(seed, 3, 8, 92),
      cy: between(seed, 4, 18, 78),
      width,
      height,
      opacity: between(seed, 5, 0.78, 1),
      rotation: between(seed, 6, -5, 5),
      floatDur: between(seed, 7, 5.5, 8.5),
      floatDelay: seeded(seed, 8) * 2.4,
      bumps,
    };
  });
}

// --------------------------------------------------------------------
// 文案选择 —— "断签不断、文案温柔"
// 只在层数上分四档：1 / 2~6 / 7+ / 30+，不出现任何"失败/断了/再坚持"字样
// --------------------------------------------------------------------
function captionFor(count: number): string {
  if (count <= 1)  return '第一朵云，归位了';
  if (count <= 6)  return '云又添了几朵';
  if (count < 30)  return '这片天，越来越像你养的了';
  return '这片天空，是你亲手养出来的';
}

// --------------------------------------------------------------------
// 组件
// --------------------------------------------------------------------
export default function StreakDisplay({
  log,
  streakCurrent,
  mood = 'morning',
  className = '',
}: StreakDisplayProps) {
  const clouds = useMemo(() => buildMiniClouds(log), [log]);
  const caption = useMemo(() => captionFor(clouds.length), [clouds.length]);

  // 极简样式表（也兼容 prefers-reduced-motion）
  const styleBlock = `
    .streak-sky {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
      background: ${SKY_BG[mood]};
      box-shadow:
        inset 0 2px 6px rgba(255, 255, 255, 0.55),
        inset 0 -6px 16px rgba(248, 140, 130, 0.10);
      transition: background 600ms var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
    }
    .streak-cloud {
      position: absolute;
      transform-origin: center;
      animation: streak-cloud-float var(--dur, 6s) ease-in-out var(--delay, 0s) infinite alternate;
      will-change: transform;
    }
    @keyframes streak-cloud-float {
      0%   { transform: translate(0, 0) rotate(var(--rot, 0deg)); }
      100% { transform: translate(2px, -3px) rotate(var(--rot, 0deg)); }
    }
    .streak-cloud svg { display: block; overflow: visible; }

    @media (prefers-reduced-motion: reduce) {
      .streak-cloud { animation: none; }
    }
  `;

  return (
    <section
      role="region"
      aria-label="这片天空"
      className={className}
      style={{
        position: 'relative',
        background: 'var(--warm-card)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 22px 22px',
        boxShadow: 'var(--shadow-clay-soft)',
      }}
    >
      <style>{styleBlock}</style>

      {/* 顶部小字标题 */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink-light)',
          letterSpacing: '0.04em',
          marginBottom: 14,
          fontFamily: 'var(--font-body, system-ui)',
        }}
      >
        这片天空
      </div>

      {/* sky 主体 */}
      <div
        className="streak-sky"
        aria-hidden="true"
        style={{ height: 168, borderRadius: '20px' }}
      >
        {clouds.map((c) => (
          <div
            key={c.id}
            className="streak-cloud"
            style={{
              left: `${c.cx}%`,
              top: `${c.cy}%`,
              width: c.width,
              height: c.height,
              opacity: c.opacity,
              // CSS 自定义属性传给 keyframes
              ['--rot' as never]: `${c.rotation}deg`,
              ['--dur' as never]: `${c.floatDur}s`,
              ['--delay' as never]: `${c.floatDelay}s`,
              transform: `translate(-50%, -50%) rotate(${c.rotation}deg)`,
            }}
          >
            <svg
              viewBox={`0 0 ${c.width} ${c.height}`}
              width={c.width}
              height={c.height}
            >
              {/*
                简化小云：底部 1 个主体椭圆 + 上面 3~4 个 bump 椭圆。
                全部用薄荷绿系（--mint-cloud-light / --mint-cloud / --mint-cloud-deep），
                通过 opacity 叠出柔和体积感。
              */}
              {/* 主体（浅薄荷） */}
              <ellipse
                cx={c.width / 2}
                cy={c.height * 0.62}
                rx={c.width * 0.45}
                ry={c.height * 0.32}
                fill="var(--mint-cloud-light)"
                opacity="0.95"
              />
              {/* 主体阴面（深薄荷） */}
              <ellipse
                cx={c.width / 2}
                cy={c.height * 0.74}
                rx={c.width * 0.38}
                ry={c.height * 0.18}
                fill="var(--mint-cloud-deep)"
                opacity="0.18"
              />
              {/* 顶部小包 */}
              {c.bumps.map((b, i) => (
                <g key={i}>
                  <ellipse
                    cx={c.width / 2 + b.dx}
                    cy={c.height * 0.5 + b.dy}
                    rx={b.rx}
                    ry={b.ry}
                    fill="var(--mint-cloud)"
                    opacity="0.85"
                  />
                  <ellipse
                    cx={c.width / 2 + b.dx - b.rx * 0.2}
                    cy={c.height * 0.5 + b.dy - b.ry * 0.35}
                    rx={b.rx * 0.45}
                    ry={b.ry * 0.4}
                    fill="var(--mint-cloud-light)"
                    opacity="0.7"
                  />
                </g>
              ))}
            </svg>
          </div>
        ))}

        {/* 一朵都没有：留一个特别轻的空提示（仍是温柔语气） */}
        {clouds.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              color: 'var(--ink-faint)',
              letterSpacing: '0.06em',
            }}
          >
            天空在等你
          </div>
        )}
      </div>

      {/* 底部一行：左下角 weak 数字 + 右下角温柔文案 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 14,
        }}
      >
        <span
          aria-label={`已 ${streakCurrent} 天`}
          style={{
            fontSize: 12,
            color: 'var(--ink-faint)',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            fontFamily: 'var(--font-body, system-ui)',
          }}
        >
          已 {streakCurrent} 天
        </span>
        <span
          style={{
            fontSize: 13,
            color: 'var(--ink-light)',
            fontFamily: 'var(--font-body, system-ui)',
            textAlign: 'right',
            flex: 1,
            lineHeight: 1.5,
            textWrap: 'pretty',
          }}
        >
          {caption}
        </span>
      </div>
    </section>
  );
}
