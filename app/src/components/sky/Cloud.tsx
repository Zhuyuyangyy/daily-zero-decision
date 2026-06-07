import { useMemo } from 'react';

interface CloudProps {
  mood: 'calm' | 'happy' | 'celebrate';
  size?: 'sm' | 'md' | 'lg';
  showCelebration?: boolean;
}

const SIZE_MAP: Record<NonNullable<CloudProps['size']>, number> = {
  sm: 80,
  md: 120,
  lg: 168,
};

// 治愈系治愈缓动
const EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
const EASE_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function Cloud({ mood, size = 'md', showCelebration = false }: CloudProps) {
  const px = SIZE_MAP[size];

  // 用 useMemo 缓存所有 gradient id,避免每次渲染随机抖动
  const gradIds = useMemo(() => {
    const s = Math.random().toString(36).slice(2, 9);
    return {
      root: `clay-cloud-${s}`,
      body: `clay-cloud-body-${s}`,
      rim: `clay-cloud-rim-${s}`,
      hi: `clay-cloud-hi-${s}`,
      sh: `clay-cloud-sh-${s}`,
      cheek: `clay-cloud-cheek-${s}`,
      blurHi: `clay-cloud-blurHi-${s}`,
      blurSh: `clay-cloud-blurSh-${s}`,
      silhouette: `clay-cloud-sil-${s}`,
      clip: `clay-cloud-clip-${s}`,
    };
  }, []);

  const animClass =
    mood === 'calm' ? 'clay-cloud-breathe' : mood === 'happy' ? 'clay-cloud-float' : 'clay-cloud-jump';

  return (
    <div
      className={`clay-cloud-wrap clay-cloud-${mood} ${animClass}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <style>{`
        .clay-cloud-wrap {
          display: inline-block;
          transform-origin: 50% 55%;
          will-change: transform;
          /* 外阴影:暖珊瑚柔光 */
          filter: drop-shadow(0 8px 18px rgba(248, 140, 130, 0.20))
                  drop-shadow(0 2px 6px rgba(248, 140, 130, 0.10));
        }
        .clay-cloud-breathe { animation: clay-cloud-breathe 3.6s var(--ease-out-quart, ${EASE}) infinite; }
        .clay-cloud-float   { animation: clay-cloud-float   4.2s var(--ease-out-quart, ${EASE}) infinite; }
        .clay-cloud-jump    { animation: clay-cloud-jump    0.7s var(--ease-out-quart, ${EASE}) infinite; }
        .clay-cloud-wrap > svg { display: block; width: 100%; height: 100%; overflow: visible; }

        /* 呼吸:轻微胀缩,像在打盹 */
        @keyframes clay-cloud-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50%      { transform: scale(1.035) translateY(-1px); }
        }
        /* 漂浮:上下缓动 */
        @keyframes clay-cloud-float {
          0%, 100% { transform: translateY(0) rotate(-0.6deg); }
          50%      { transform: translateY(-7px) rotate(0.6deg); }
        }
        /* 跳跃:三段 bounce, 配合 showCelebration */
        @keyframes clay-cloud-jump {
          0%   { transform: translateY(0)    scale(1, 1); }
          35%  { transform: translateY(-22px) scale(1.05, 0.95); }
          55%  { transform: translateY(-18px) scale(0.97, 1.04); }
          100% { transform: translateY(0)    scale(1, 1); }
        }

        /* 庆祝:小星星与亮片 */
        .clay-spark {
          transform-box: fill-box;
          transform-origin: center;
          animation: clay-spark 0.9s var(--ease-back, ${EASE_BACK}) infinite;
        }
        .clay-spark.s1 { animation-delay: 0s;   }
        .clay-spark.s2 { animation-delay: 0.15s; }
        .clay-spark.s3 { animation-delay: 0.3s;  }
        .clay-spark.s4 { animation-delay: 0.45s; }
        .clay-spark.s5 { animation-delay: 0.6s;  }

        @keyframes clay-spark {
          0%   { opacity: 0;   transform: scale(0.3) translate(0, 0); }
          45%  { opacity: 1;   transform: scale(1.15) translate(1.5px, -5px); }
          100% { opacity: 0;   transform: scale(0.5) translate(-1.5px, -12px); }
        }

        /* 腮红微闪:在 happy/celebrate 状态让腮红更明显 */
        .clay-cheek { transition: opacity 300ms var(--ease-out-quart, ${EASE}); }

        @media (prefers-reduced-motion: reduce) {
          .clay-cloud-breathe,
          .clay-cloud-float,
          .clay-cloud-jump { animation: none; }
          .clay-spark { animation: none; opacity: 0; }
        }
      `}</style>

      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 主体渐变:薄荷亮 → 薄荷主 → 薄荷深 */}
          <linearGradient id={gradIds.body} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="var(--mint-cloud-light, #C9F0D5)" />
            <stop offset="45%" stopColor="var(--mint-cloud,       #8ADBA8)" />
            <stop offset="100%" stopColor="var(--mint-cloud-deep,  #5FCB86)" />
          </linearGradient>

          {/* 边缘厚度:暖珊瑚半透明渐变 */}
          <linearGradient id={gradIds.rim} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(248, 140, 130, 0)" />
            <stop offset="100%" stopColor="rgba(248, 140, 130, 0.35)" />
          </linearGradient>

          {/* 顶部高光:白色径向 */}
          <radialGradient id={gradIds.hi} cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.95)" />
            <stop offset="55%"  stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* 底部暖色阴影:珊瑚径向 */}
          <radialGradient id={gradIds.sh} cx="50%" cy="60%" r="60%">
            <stop offset="0%"   stopColor="rgba(248, 140, 130, 0.55)" />
            <stop offset="60%"  stopColor="rgba(248, 140, 130, 0.20)" />
            <stop offset="100%" stopColor="rgba(248, 140, 130, 0)" />
          </radialGradient>

          {/* 腮红:粉珊瑚径向 */}
          <radialGradient id={gradIds.cheek} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(242, 138, 158, 0.85)" />
            <stop offset="60%"  stopColor="rgba(242, 138, 158, 0.35)" />
            <stop offset="100%" stopColor="rgba(242, 138, 158, 0)" />
          </radialGradient>

          {/* 柔光模糊 */}
          <filter id={gradIds.blurHi} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter id={gradIds.blurSh} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>

          {/* 蓬松云团轮廓:5 个叠加椭圆,顶部团子状凸起,主体宽厚 */}
          <g id={gradIds.silhouette}>
            {/* 底层:宽厚主体,形成稳定基底 */}
            <ellipse cx="50" cy="64" rx="36" ry="18" />
            {/* 左团子 */}
            <ellipse cx="28" cy="58" rx="18" ry="16" />
            {/* 中团子(最高最鼓) */}
            <ellipse cx="46" cy="42" rx="22" ry="22" />
            {/* 右团子 */}
            <ellipse cx="70" cy="44" rx="20" ry="20" />
            {/* 远右小团子 */}
            <ellipse cx="84" cy="56" rx="14" ry="14" />
          </g>

          {/* 剪裁路径,用于高光/阴影只显示在身体内 */}
          <clipPath id={gradIds.clip}>
            <use href={`#${gradIds.silhouette}`} />
          </clipPath>
        </defs>

        {/* 地面投影:在云下方加一圈极淡的软阴影 */}
        <ellipse
          cx="50" cy="88" rx="34" ry="3"
          fill="rgba(170, 140, 175, 0.18)"
          filter={`url(#${gradIds.blurSh})`}
        />

        {/* 厚度层:同轮廓下移 1px,制造"鼓起"立体感 */}
        <g transform="translate(0, 1)">
          <use
            href={`#${gradIds.silhouette}`}
            fill="rgba(248, 140, 130, 0.45)"
            filter={`url(#${gradIds.blurSh})`}
          />
        </g>

        {/* 主体填充 */}
        <use
          href={`#${gradIds.silhouette}`}
          fill={`url(#${gradIds.body})`}
        />

        {/* 双内阴影(剪裁在云体内部):
            1) 顶部 1px 亮线(白色)   inset 0 1px 1px white
            2) 底部 1px 暖色暗线(珊瑚) inset 0 -1px 1px coral
            表现为剪裁内的两条柔光椭圆 */}
        <g clipPath={`url(#${gradIds.clip})`}>
          {/* 顶部亮色高光斑块 */}
          <ellipse
            cx="44" cy="32" rx="26" ry="11"
            fill={`url(#${gradIds.hi})`}
            filter={`url(#${gradIds.blurHi})`}
            opacity="0.95"
          />
          {/* 顶部高光小光斑(specular dot) */}
          <ellipse
            cx="34" cy="28" rx="5" ry="2.4"
            fill="rgba(255,255,255,0.9)"
            filter={`url(#${gradIds.blurHi})`}
            opacity="0.95"
          />
          {/* 底部暖色暗影 */}
          <ellipse
            cx="54" cy="78" rx="38" ry="10"
            fill={`url(#${gradIds.sh})`}
            filter={`url(#${gradIds.blurSh})`}
            opacity="0.9"
          />
        </g>

        {/* 表情 */}
        <Face mood={mood} gradId={gradIds.root} />

        {/* 庆祝:亮片与星点 */}
        {(mood === 'celebrate' || showCelebration) && (
          <g>
            <circle className="clay-spark s1" cx="10"  cy="22" r="2.6" fill="rgba(255, 226, 232, 0.95)" filter={`url(#${gradIds.blurHi})`} />
            <circle className="clay-spark s2" cx="90"  cy="16" r="2.2" fill="rgba(255, 230, 200, 0.95)" filter={`url(#${gradIds.blurHi})`} />
            <circle className="clay-spark s3" cx="14"  cy="78" r="2.0" fill="rgba(196, 237, 207, 0.95)" filter={`url(#${gradIds.blurHi})`} />
            <circle className="clay-spark s4" cx="86"  cy="80" r="2.4" fill="rgba(242, 166, 182, 0.95)" filter={`url(#${gradIds.blurHi})`} />
            <circle className="clay-spark s5" cx="50"  cy="10" r="1.8" fill="rgba(255, 245, 200, 0.95)" filter={`url(#${gradIds.blurHi})`} />
          </g>
        )}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------
   表情:大眼 + 粉嫩腮红 + 柔和弧线
   配色来自 theme/clay.css 的 --ink / 粉珊瑚
   ------------------------------------------------------------ */
function Face({ mood, gradId: _gradId }: { mood: CloudProps['mood']; gradId: string }) {
  const ink = '#4A3A33'; // --ink
  // 眼睛中心,稍微下移一点让脸更"治愈"
  const eyeY = 56;
  const eyeDx = 9;
  const eyeR  = 3.2;  // 大眼(圆)

  if (mood === 'calm') {
    return (
      <g>
        {/* 闭眼:温柔弧线 (^^) */}
        <path
          d={`M ${50 - eyeDx - 4} ${eyeY} Q ${50 - eyeDx} ${eyeY - 4.5} ${50 - eyeDx + 4} ${eyeY}`}
          fill="none"
          stroke={ink}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d={`M ${50 + eyeDx - 4} ${eyeY} Q ${50 + eyeDx} ${eyeY - 4.5} ${50 + eyeDx + 4} ${eyeY}`}
          fill="none"
          stroke={ink}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* 小微笑 */}
        <path
          d={`M 46 67 Q 50 71 54 67`}
          fill="none"
          stroke={ink}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* 粉嫩腮红 */}
        <ellipse className="clay-cheek" cx="32" cy="66" rx="5.5" ry="3.2" fill="rgba(242, 138, 158, 0.45)" />
        <ellipse className="clay-cheek" cx="68" cy="66" rx="5.5" ry="3.2" fill="rgba(242, 138, 158, 0.45)" />
      </g>
    );
  }

  if (mood === 'happy') {
    return (
      <g>
        {/* 大眼:圆形(非眯眯眼),深色实心 + 高光 */}
        <ellipse cx={50 - eyeDx} cy={eyeY} rx={eyeR} ry={eyeR + 0.4} fill={ink} />
        <ellipse cx={50 + eyeDx} cy={eyeY} rx={eyeR} ry={eyeR + 0.4} fill={ink} />
        {/* 眼内白色高光点(双点,大治愈感) */}
        <circle cx={50 - eyeDx + 1.0} cy={eyeY - 1.0} r="1.0" fill="#FFFFFF" />
        <circle cx={50 + eyeDx + 1.0} cy={eyeY - 1.0} r="1.0" fill="#FFFFFF" />
        <circle cx={50 - eyeDx - 0.6} cy={eyeY + 1.2} r="0.4" fill="rgba(255,255,255,0.7)" />
        <circle cx={50 + eyeDx - 0.6} cy={eyeY + 1.2} r="0.4" fill="rgba(255,255,255,0.7)" />
        {/* 弧线大嘴:柔和 Q 形 */}
        <path
          d={`M 42 65 Q 42 74 50 74 Q 58 74 58 65`}
          fill="none"
          stroke={ink}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* 嘴内粉嫩小舌尖 */}
        <path
          d={`M 47 71 Q 50 73.5 53 71`}
          fill="none"
          stroke="rgba(242, 138, 158, 0.9)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* 浓腮红 */}
        <ellipse className="clay-cheek" cx="30" cy="68" rx="6" ry="3.4" fill="rgba(242, 138, 158, 0.65)" />
        <ellipse className="clay-cheek" cx="70" cy="68" rx="6" ry="3.4" fill="rgba(242, 138, 158, 0.65)" />
      </g>
    );
  }

  // celebrate:星形眼 + 张大笑 + 浓腮红
  return (
    <g>
      <Star cx={50 - eyeDx} cy={eyeY} r={4.2} fill={ink} />
      <Star cx={50 + eyeDx} cy={eyeY} r={4.2} fill={ink} />
      {/* 张大的笑:填充实心 D 形 */}
      <path
        d={`M 39 62 Q 39 76 50 76 Q 61 76 61 62 Q 61 58 50 58 Q 39 58 39 62 Z`}
        fill={ink}
      />
      {/* 嘴角上扬暗示(笑到眯眼) */}
      <path
        d={`M 44 71 Q 50 75 56 71`}
        fill="none"
        stroke="rgba(242, 138, 158, 0.95)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* 浓腮红(更大更红) */}
      <ellipse className="clay-cheek" cx="28" cy="69" rx="6.8" ry="3.8" fill="rgba(242, 138, 158, 0.78)" />
      <ellipse className="clay-cheek" cx="72" cy="69" rx="6.8" ry="3.8" fill="rgba(242, 138, 158, 0.78)" />
    </g>
  );
}

/* ------------------------------------------------------------
   5 角星(用于 celebrate 状态的星形眼)
   ------------------------------------------------------------ */
function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill?: string }) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return <polygon points={points.join(' ')} fill={fill} />;
}
