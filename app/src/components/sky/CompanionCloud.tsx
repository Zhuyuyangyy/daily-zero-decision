import { useMemo } from 'react';
import type { CompanionMood, CompanionStage } from '../../utils/companion';

/**
 * CompanionCloud — 本命云(天空里始终陪着用户的那朵)
 *
 * 与 SkyPet(云猫)的区别:
 * - 云猫是"宠物";本命云是"你自己长出来的伙伴"
 * - 形态随陪伴天数成长:seed(一小团) → small → fluffy → glow(发光) → crowned(小冠)
 * - 情绪只通过眼睛/位置/速度表达,不说话,不评分
 * - 反 PUA:久未打开只是睡着,不枯萎不变灰
 *
 * 纯 SVG,无外部资源;动画遵循 prefers-reduced-motion(由调用方传 reducedMotion)。
 */

export interface CompanionCloudProps {
  stage: CompanionStage;
  mood: CompanionMood;
  name: string | null;
  size?: number;
  reducedMotion?: boolean;
  /** 点击:冒出咕噜气泡文本(由调用方给) */
  onClick?: () => void;
  /** 被摸:播放一次 squash 弹跳 */
  poked?: boolean;
}

const STAGE_SIZE: Record<CompanionStage, number> = {
  seed: 0.42,
  small: 0.62,
  fluffy: 0.82,
  glow: 1.0,
  crowned: 1.15,
};

/** 心情 → 眼睛表情 */
function Eyes({ mood }: { mood: CompanionMood }) {
  const ink = '#4A3A33';
  const dx = 13, y = 54, r = 3.6;

  if (mood === 'sleep') {
    // 闭眼弧线 + 小 z 呼吸感
    return (
      <g>
        <path d={`M ${50 - dx - 4} ${y} Q ${50 - dx} ${y - 4.6} ${50 - dx + 4} ${y}`} fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
        <path d={`M ${50 + dx - 4} ${y} Q ${50 + dx} ${y - 4.6} ${50 + dx + 4} ${y}`} fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
        <path d={`M 62 42 q 4 -5 8 0 q 4 5 8 0`} fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
        <path d={`M 46 64 Q 50 67 54 64`} fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </g>
    );
  }

  if (mood === 'close') {
    // 低落:眼睛半垂 + 身体靠近由外层 transform 完成
    return (
      <g>
        <path d={`M ${50 - dx - 4} ${y - 1} Q ${50 - dx} ${y + 1.6} ${50 - dx + 4} ${y - 1}`} fill="none" stroke={ink} strokeWidth="1.9" strokeLinecap="round" opacity="0.85" />
        <path d={`M ${50 + dx - 4} ${y - 1} Q ${50 + dx} ${y + 1.6} ${50 + dx + 4} ${y - 1}`} fill="none" stroke={ink} strokeWidth="1.9" strokeLinecap="round" opacity="0.85" />
        <path d={`M 45 66 Q 50 63 55 66`} fill="none" stroke={ink} strokeWidth="1.7" strokeLinecap="round" opacity="0.8" />
      </g>
    );
  }

  if (mood === 'happy') {
    // 高兴:弯月眼 + 大笑
    return (
      <g>
        <path d={`M ${50 - dx - 4.4} ${y + 1} Q ${50 - dx} ${y - 4.6} ${50 - dx + 4.4} ${y + 1}`} fill="none" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
        <path d={`M ${50 + dx - 4.4} ${y + 1} Q ${50 + dx} ${y - 4.6} ${50 + dx + 4.4} ${y + 1}`} fill="none" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
        <path d={`M 40 62 Q 40 76 50 76 Q 60 76 60 62 Q 60 57 50 57 Q 40 57 40 62 Z`} fill={ink} />
        <path d={`M 45 71 Q 50 75.5 55 71`} fill="none" stroke="rgba(242, 138, 158, 0.95)" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="28" cy="69" rx="6.4" ry="3.6" fill="rgba(242, 138, 158, 0.6)" />
        <ellipse cx="72" cy="69" rx="6.4" ry="3.6" fill="rgba(242, 138, 158, 0.6)" />
      </g>
    );
  }

  if (mood === 'proud') {
    // 发光阶段的自信:星星眼
    const star = (cx: number) => {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? r + 0.6 : (r + 0.6) * 0.45;
        pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(y + rad * Math.sin(a)).toFixed(2)}`);
      }
      return pts.join(' ');
    };
    return (
      <g>
        <polygon points={star(50 - dx)} fill={ink} />
        <polygon points={star(50 + dx)} fill={ink} />
        <path d={`M 44 66 Q 50 71 56 66`} fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="29" cy="68" rx="5.8" ry="3.4" fill="rgba(242, 138, 158, 0.5)" />
        <ellipse cx="71" cy="68" rx="5.8" ry="3.4" fill="rgba(242, 138, 158, 0.5)" />
      </g>
    );
  }

  // calm:大圆眼 + 高光 + 微笑 + 腮红
  return (
    <g>
      <ellipse cx={50 - dx} cy={y} rx={r} ry={r + 0.4} fill={ink} />
      <ellipse cx={50 + dx} cy={y} rx={r} ry={r + 0.4} fill={ink} />
      <circle cx={50 - dx + 1.1} cy={y - 1.1} r="1.1" fill="#FFFFFF" />
      <circle cx={50 + dx + 1.1} cy={y - 1.1} r="1.1" fill="#FFFFFF" />
      <circle cx={50 - dx - 0.7} cy={y + 1.3} r="0.45" fill="rgba(255,255,255,0.75)" />
      <circle cx={50 + dx - 0.7} cy={y + 1.3} r="0.45" fill="rgba(255,255,255,0.75)" />
      <path d={`M 43 65 Q 43 74 50 74 Q 57 74 57 65`} fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="30" cy="68" rx="5.6" ry="3.2" fill="rgba(242, 138, 158, 0.45)" />
      <ellipse cx="70" cy="68" rx="5.6" ry="3.2" fill="rgba(242, 138, 158, 0.45)" />
    </g>
  );
}

export default function CompanionCloud({
  stage,
  mood,
  name,
  size = 160,
  reducedMotion = false,
  poked = false,
  onClick,
}: CompanionCloudProps) {
  const scale = STAGE_SIZE[stage];

  // 云团形状:seed 一小团 → crowned 大而多层
  const puffs = useMemo(() => {
    const base = [
      { cx: 50, cy: 62, rx: 30, ry: 17 },
      { cx: 33, cy: 58, rx: 16, ry: 15 },
      { cx: 66, cy: 56, rx: 17, ry: 16 },
      { cx: 48, cy: 46, rx: 18, ry: 17 },
    ];
    return base.map((p) => ({ ...p, rx: p.rx * scale, ry: p.ry * scale }));
  }, [scale]);

  const bodyClass = [
    'companion-body',
    poked && !reducedMotion ? 'companion-body--poked' : '',
    reducedMotion ? 'companion-body--static' : `companion-body--${mood}`,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`clay-companion companion-${mood}`}
      style={{ width: size, height: size * 0.8, position: 'relative' }}
    >
      <style>{`
        .clay-companion { cursor: ${onClick ? 'pointer' : 'default'}; }
        .companion-body { transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 50% 80%; }
        .companion-body--calm  { animation: companion-breathe 4.2s ease-in-out infinite; }
        .companion-body--happy { animation: companion-bob 1.6s ease-in-out infinite; }
        .companion-body--sleep { animation: companion-sleep 5s ease-in-out infinite; }
        .companion-body--close { animation: none; }
        .companion-body--proud { animation: companion-breathe 3.4s ease-in-out infinite; }
        .companion-body--static { animation: none; }
        .companion-body--poked { animation: companion-poke 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .companion-close .companion-body { transform: scale(1.02) translateY(2px); }
        .companion-glow { filter: drop-shadow(0 0 18px rgba(255, 236, 170, 0.55)) drop-shadow(0 8px 18px rgba(248, 140, 130, 0.2)); }
        .companion-sleep .companion-body { opacity: 0.94; }
        @keyframes companion-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03) translateY(-2px); }
        }
        @keyframes companion-bob {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes companion-sleep {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(0.99) translateY(1px); }
        }
        @keyframes companion-poke {
          0% { transform: scale(1, 1); }
          30% { transform: scale(1.1, 0.86); }
          55% { transform: scale(0.95, 1.08); }
          75% { transform: scale(1.03, 0.97); }
          100% { transform: scale(1, 1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .companion-body { animation: none !important; }
        }
      `}</style>

      <svg
        viewBox="0 0 100 80"
        style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `和${name ?? '本命云'}互动` : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <defs>
          <linearGradient id="cc-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F3F8FC" />
            <stop offset="100%" stopColor="#E3ECF5" />
          </linearGradient>
          <radialGradient id="cc-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(255, 240, 190, 0.55)" />
            <stop offset="100%" stopColor="rgba(255, 240, 190, 0)" />
          </radialGradient>
        </defs>

        {/* glow/crowned 阶段的光晕 */}
        {(stage === 'glow' || stage === 'crowned') && (
          <ellipse cx="50" cy="46" rx="40" ry="30" fill="url(#cc-glow)" />
        )}

        <g className={bodyClass}>
          {/* 厚度层 */}
          <g transform="translate(0, 2)">
            {puffs.map((p, i) => (
              <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="rgba(190, 170, 190, 0.22)" />
            ))}
          </g>
          {/* 主体 */}
          {puffs.map((p, i) => (
            <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="url(#cc-body)" />
          ))}
          {/* 顶部高光 */}
          <ellipse cx="44" cy="42" rx="14" ry="6" fill="rgba(255,255,255,0.9)" style={{ filter: 'blur(2px)' }} />
          {/* 腮红底色 */}
          <ellipse cx="28" cy="64" rx="7" ry="4" fill="rgba(242, 138, 158, 0.28)" />
          <ellipse cx="72" cy="64" rx="7" ry="4" fill="rgba(242, 138, 158, 0.28)" />

          <Eyes mood={mood} />

          {/* crowned 阶段:头顶小冠(三个尖) */}
          {stage === 'crowned' && (
            <g>
              <path d="M 42 32 L 46 22 L 50 30 L 54 20 L 58 32 Z" fill="#FFD98A" stroke="rgba(220, 170, 90, 0.6)" strokeWidth="0.6" />
              <circle cx="46" cy="22" r="1.4" fill="#FFF3D0" />
              <circle cx="54" cy="20" r="1.4" fill="#FFF3D0" />
            </g>
          )}

          {/* glow 阶段:两侧小星点 */}
          {stage === 'glow' && (
            <g opacity="0.9">
              <circle cx="12" cy="38" r="1.8" fill="rgba(255, 240, 190, 0.95)" />
              <circle cx="88" cy="34" r="1.5" fill="rgba(255, 240, 190, 0.9)" />
              <circle cx="18" cy="60" r="1.2" fill="rgba(255, 240, 190, 0.8)" />
            </g>
          )}
        </g>

        {/* 睡态:飘出的小 z */}
        {mood === 'sleep' && (
          <g opacity="0.55">
            <text x="72" y="34" fontSize="10" fill="#6B5B70" style={{ fontFamily: 'system-ui' }}>z</text>
            <text x="80" y="26" fontSize="13" fill="#6B5B70" style={{ fontFamily: 'system-ui' }}>Z</text>
          </g>
        )}
      </svg>
    </div>
  );
}
