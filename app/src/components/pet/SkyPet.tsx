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
 * 6 mood → sprite sheet 资源
 * - 每张 sprite 是 4 帧横排
 * - idle: 呼吸 + 偶尔眨眼  (4 帧 × 1.6s)
 * - waiting: 静坐          (复用 idle)
 * - encouraging: 转头/抖耳  (4 帧 × 0.8s)
 * - celebrating (new/familiar): 跳起/抖动  (4 帧 × 0.4s 快)
 * - celebrating (trusted): 抱云+星星+爱    (4 帧 × 1.0s)
 * - resting: 静态           (单图)
 * - sleeping: 打呼          (4 帧 × 1.2s)
 *
 * 注意：所有 sprite sheet 都是 4 帧等宽 25% 步进切帧
 */
type Sprite = { src: string; frames: number; durationSec: number };

const SPRITES: Record<PetMood, Sprite> = {
  idle:         { src: '/pet/anim-idle-breath.png',   frames: 4, durationSec: 1.6 },
  waiting:      { src: '/pet/anim-idle-breath.png',   frames: 4, durationSec: 1.6 },
  encouraging:  { src: '/pet/anim-encouraging.png',   frames: 4, durationSec: 0.8 },
  celebrating:  { src: '/pet/anim-celebrating-jump.png', frames: 4, durationSec: 0.8 },
  resting:      { src: '/pet/pet-resting.png',         frames: 1, durationSec: 0   },
  sleeping:     { src: '/pet/anim-sleeping.png',      frames: 4, durationSec: 1.2 },
};

/**
 * Trusted 阶段 celebrating 用更亲密的图（抱云+星星+爱眼）
 */
const TRUSTED_CELEBRATING: Sprite = {
  src: '/pet/anim-celebrating-stars.png',
  frames: 4,
  durationSec: 1.2,
};

function pickSprite(mood: PetMood, affection: number): Sprite {
  if (mood === 'celebrating' && getPetStage(affection) === 'trusted') {
    return TRUSTED_CELEBRATING;
  }
  return SPRITES[mood];
}

/**
 * SkyPet — 一只住在天空里的云猫（带 sprite 动画）
 *
 * 工作原理：
 * - 渲染一张 4 帧横排大图作为 <img>
 * - CSS animation 切 `background-position` / `transform: translateX(-X%)`
 *   + `animation-timing-function: steps(N)` 做硬切帧（不是平滑插值）
 * - 这样就是"一帧一帧"的真实动画
 * - 切 mood → 换 src + 重新启动动画
 *
 * 注：因为是 <img>，我们要用 wrapper overflow:hidden + img width: 400% 来切。
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

  // 切 mood 时清掉 override
  useEffect(() => {
    setBubbleOverride(null);
  }, [mood]);

  const activeBubble =
    bubbleText !== undefined ? bubbleText : bubbleOverride;

  const bumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (!onClick) return;
    setBump(true);
    // bump 用 ref 持有 timer，cleanup 中 clearTimeout 避免 unmount 后 setState 警告
    if (bumpTimerRef.current) window.clearTimeout(bumpTimerRef.current);
    bumpTimerRef.current = window.setTimeout(() => setBump(false), 600);

    const line = onClick();
    if (line) {
      setBubbleOverride(line);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setBubbleOverride(null), 3000);
    }
  };

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (bumpTimerRef.current) window.clearTimeout(bumpTimerRef.current);
  }, []);

  const reduced = !!reducedMotion;
  const isInteractive = !!onClick;
  const Tag: 'button' | 'div' = isInteractive ? 'button' : 'div';
  const sprite = pickSprite(mood, affection);
  const FRAMES = sprite.frames;
  const DURATION = sprite.durationSec;

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
        {/*
          viewport: 容器 overflow:hidden，宽度 100%（一帧）
          stage:    内部 <img> 宽度 400%（4 帧横排），animation 切 translateX
        */}
        <div
          className="sky-pet__viewport"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={sprite.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={[
              'sky-pet__sprite',
              `sky-pet__sprite--${mood}`,
              reduced ? 'sky-pet__sprite--reduced' : '',
            ].filter(Boolean).join(' ')}
            style={{ '--duration': `${DURATION}s` } as React.CSSProperties}
            data-frames={FRAMES}
          />
        </div>
      </Tag>
    </div>
  );
}
