import { useEffect, useRef, useState } from 'react';
import type { PetMood } from '../../types';
import './SkyPet.css';
import { PetBubble } from './PetBubble';

interface SkyPetProps {
  mood: PetMood;
  name: string;
  /** 点击云猫的反馈；不传则纯装饰 */
  onClick?: () => string | null;
  /** 尺寸：mobile / desktop / skyline */
  size?: 'mobile' | 'desktop' | 'skyline';
  /** 是否显示气泡；默认 true（点击和 mood 切换时显示） */
  showBubble?: boolean;
  /** 受控气泡文本；为空则不展示 */
  bubbleText?: string | null;
  reducedMotion?: boolean;
  /** 当 pet.enabled=false 时不渲染整个组件由父级控制 */
}

/**
 * SkyPet — 一只住在天空里的云猫
 *
 * 设计要点：
 * - 6 个 mood → 姿态 + 气泡
 * - SVG 绘制，圆润低细节
 * - 呼吸 / 眨眼 / 摇尾 等微动效；reduced-motion 全部禁用
 * - 颜色：白 + 奶油色（与现有薄荷绿云朵区分）
 */
export function SkyPet({
  mood,
  name,
  onClick,
  size = 'mobile',
  showBubble = true,
  bubbleText,
  reducedMotion,
}: SkyPetProps) {
  const [bump, setBump] = useState(false);     // 点击瞬时反馈
  const [bubbleOverride, setBubbleOverride] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // 切 mood 时清掉 override
  useEffect(() => {
    setBubbleOverride(null);
  }, [mood]);

  // 受控/非受控气泡
  const activeBubble =
    bubbleText !== undefined ? bubbleText : bubbleOverride;

  const handleClick = () => {
    if (!onClick) return;
    setBump(true);
    setTimeout(() => setBump(false), 800);

    const line = onClick();
    if (line) {
      setBubbleOverride(line);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setBubbleOverride(null), 3000);
    }
  };

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const reduced = !!reducedMotion;
  const isInteractive = !!onClick;
  const Tag: any = isInteractive ? 'button' : 'div';

  return (
    <div className={`sky-pet-wrap sky-pet-wrap--${size}`}>
      {showBubble && activeBubble && (
        <PetBubble text={activeBubble} name={name} />
      )}

      <Tag
        type={isInteractive ? 'button' : undefined}
        aria-label={isInteractive ? `和天空宠物${name}打个招呼` : undefined}
        aria-hidden={isInteractive ? undefined : true}
        className={[
          'sky-pet',
          `sky-pet--${mood}`,
          reduced ? 'sky-pet--reduced' : '',
          bump ? 'sky-pet--bump' : '',
          isInteractive ? 'sky-pet--interactive' : '',
        ].filter(Boolean).join(' ')}
        onClick={isInteractive ? handleClick : undefined}
      >
        <CloudCatSVG mood={mood} reduced={reduced} />
      </Tag>
    </div>
  );
}

/**
 * CloudCatSVG — 云猫的视觉本体
 *  - 主体：白色奶油色椭圆身体
 *  - 耳朵：两个小三角
 *  - 尾巴：像一缕云（mood 不同轻微摆动）
 *  - 眼睛：mood 控制睁/闭
 *  - 嘴：encouraging/celebrating 微微上翘
 *  - 床/毯子：resting 出现
 */
function CloudCatSVG({ mood, reduced }: { mood: PetMood; reduced: boolean }) {
  const eyesOpen = mood !== 'sleeping' && mood !== 'resting';
  const smile = mood === 'celebrating' || mood === 'encouraging';

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      {/* 影子 */}
      <ellipse
        cx="50" cy="88" rx="22" ry="3"
        fill="rgba(120, 90, 80, 0.18)"
      />

      {/* 尾巴：resting 时卷起来；其他时候云形轻摆 */}
      <g className={reduced ? '' : 'sky-pet__tail'}>
        <path
          d="M22 60 Q 8 55, 12 40 Q 18 32, 24 38"
          stroke="#F4ECE0"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* 身体 */}
      <ellipse cx="50" cy="62" rx="28" ry="20" fill="#FFFAF1" />
      <ellipse cx="50" cy="58" rx="22" ry="14" fill="#FFFCF6" />

      {/* 耳朵 */}
      <path d="M32 42 L 36 30 L 42 42 Z" fill="#FFFAF1" />
      <path d="M68 42 L 64 30 L 58 42 Z" fill="#FFFAF1" />
      <path d="M34 40 L 36 34 L 40 40 Z" fill="#FFE0CC" />
      <path d="M66 40 L 64 34 L 60 40 Z" fill="#FFE0CC" />

      {/* resting：抱小毯子 */}
      {mood === 'resting' && (
        <g>
          <rect x="32" y="66" width="36" height="10" rx="4" fill="#C9B5E0" />
          <rect x="34" y="68" width="6" height="2" rx="1" fill="#A993C5" />
          <rect x="44" y="68" width="6" height="2" rx="1" fill="#A993C5" />
          <rect x="54" y="68" width="6" height="2" rx="1" fill="#A993C5" />
        </g>
      )}

      {/* 眼睛 */}
      {eyesOpen ? (
        <>
          <ellipse cx="42" cy="55" rx="2.4" ry="3" fill="#3A2E26" className="sky-pet__eye sky-pet__eye--left" />
          <ellipse cx="58" cy="55" rx="2.4" ry="3" fill="#3A2E26" className="sky-pet__eye sky-pet__eye--right" />
          {/* celebrating 星星粒子 */}
          {mood === 'celebrating' && !reduced && (
            <g className="sky-pet__sparkle">
              <text x="20" y="35" fontSize="10" fill="#F5C66B">✦</text>
              <text x="78" y="32" fontSize="8" fill="#F5C66B">✦</text>
              <text x="82" y="55" fontSize="6" fill="#F5C66B">·</text>
            </g>
          )}
        </>
      ) : (
        <>
          <path d="M38 55 Q 42 57, 46 55" stroke="#3A2E26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M54 55 Q 58 57, 62 55" stroke="#3A2E26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* 嘴 */}
      {smile ? (
        <path d="M46 64 Q 50 68, 54 64" stroke="#3A2E26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M48 65 Q 50 67, 52 65" stroke="#3A2E26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* 腮红 */}
      <ellipse cx="38" cy="62" rx="3" ry="1.6" fill="#FFD0C2" opacity="0.7" />
      <ellipse cx="62" cy="62" rx="3" ry="1.6" fill="#FFD0C2" opacity="0.7" />
    </svg>
  );
}
