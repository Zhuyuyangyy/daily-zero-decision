import './PetBubble.css';

interface PetBubbleProps {
  text: string;
  name: string;
}

/**
 * PetBubble — 云猫的对话气泡
 *
 * 收口设计：
 * - 文案完全由调用方传入（hook 已经 pick 过）
 * - 字号 12px 起，对比度满足 WCAG AA
 * - 圆角 + 三角指下，不喧宾夺主
 */
export function PetBubble({ text, name }: PetBubbleProps) {
  return (
    <div
      className="pet-bubble"
      role="status"
      aria-live="polite"
      aria-label={`${name}说：${text}`}
    >
      <span className="pet-bubble__text">{text}</span>
      <span className="pet-bubble__tail" aria-hidden="true" />
    </div>
  );
}
