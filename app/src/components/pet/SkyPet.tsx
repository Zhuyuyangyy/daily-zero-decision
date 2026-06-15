import { useEffect, useRef, useState } from 'react';
import type { PetMood } from '../../types';
import { getPetStage } from '../../types';
import './SkyPet.css';
import { PetBubble } from './PetBubble';

interface SkyPetProps {
  mood: PetMood;
  name: string;
  /** 点击云猫的反馈；不传则纯装饰 */
  onClick?: () => string | null;
  /** 尺寸：mobile / desktop / skyline */
  size?: 'mobile' | 'desktop' | 'skyline';
  /** 是否显示气泡；默认 true */
  showBubble?: boolean;
  /** 受控气泡文本；为空则不展示 */
  bubbleText?: string | null;
  reducedMotion?: boolean;
  /** 亲密度，用于在 trusted 阶段换更"亲密"的庆祝图；不传则从 stage 自动算 */
  affection?: number;
}

/**
 * 6 mood → PNG 资源映射
 *  - waiting 复用 idle（同样静坐）
 *  - celebrating 在 trusted 阶段换 stars 版（抱小云带星星）
 */
const PET_IMAGES: Record<PetMood, { regular: string; trusted?: string }> = {
  idle:         { regular: '/pet/pet-idle.png' },
  waiting:      { regular: '/pet/pet-idle.png' },            // 复用
  encouraging:  { regular: '/pet/pet-encouraging.png' },
  celebrating:  { regular: '/pet/pet-celebrating.png', trusted: '/pet/pet-celebrating-stars.png' },
  resting:      { regular: '/pet/pet-resting.png' },
  sleeping:     { regular: '/pet/pet-sleeping.png' },
};

function pickImageSrc(mood: PetMood, affection: number): string {
  const entry = PET_IMAGES[mood];
  if (mood === 'celebrating' && entry.trusted && getPetStage(affection) === 'trusted') {
    return entry.trusted;
  }
  return entry.regular;
}

/**
 * SkyPet — 一只住在天空里的云猫
 *
 * 设计要点：
 * - 6 mood → 6 张 PNG（提供方：用户 / ChatGPT Image）
 * - idle/waiting 同一张；celebrating 在 trusted 用 stars 版
 * - 微动效：庆祝小跳、点击 bump；reduced-motion 全部禁用
 * - 呼吸 / 眨眼 / 尾巴摆 改为整体"轻微浮动"（不依赖具体身体部位，因为是位图）
 */
export function SkyPet({
  mood,
  name,
  onClick,
  size = 'mobile',
  showBubble = true,
  bubbleText,
  reducedMotion,
  affection = 0,
}: SkyPetProps) {
  const [bump, setBump] = useState(false);
  const [bubbleOverride, setBubbleOverride] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

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
  const src = pickImageSrc(mood, affection);

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
          imgLoaded ? 'sky-pet--loaded' : 'sky-pet--loading',
        ].filter(Boolean).join(' ')}
        onClick={isInteractive ? handleClick : undefined}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          onLoad={() => setImgLoaded(true)}
          className="sky-pet__img"
        />
      </Tag>
    </div>
  );
}
