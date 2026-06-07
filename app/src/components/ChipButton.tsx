import type { CSSProperties } from 'react';

interface ChipButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'mint' | 'sakura' | 'clay' | 'default';
  isSelected?: boolean;
}

export function ChipButton({
  label,
  icon,
  onClick,
  variant = 'default',
  isSelected = false,
}: ChipButtonProps) {
  // 暖粉橙+薄荷配色：跟着 variant 走（用 CSS 变量，便于在 tailwind 未注册时也能命中 token）
  // sakura -> 暖粉橙（coral），5% 透明感用 95% 实色
  const bgMap: Record<NonNullable<ChipButtonProps['variant']>, string> = {
    default: 'var(--warm-card)',
    mint: 'var(--mint-cloud-light)',
    sakura: 'rgba(255, 155, 133, 0.12)', // 暖粉橙 5% 透明
    clay: 'var(--warm-card-deep)',
  };

  // hover 阴影：mint 用绿调阴影，其余用通用粘土阴影
  const hoverShadow =
    variant === 'mint' ? 'hover:shadow-clay-mint' : 'hover:shadow-clay';

  // active 阴影：按下时只有内凹
  const activeShadow =
    variant === 'mint'
      ? 'active:shadow-clay-mint-pressed'
      : 'active:shadow-clay-pressed';

  // 选中态：mint 绿双层 ring + 文字加深
  // ring color / offset 走 inline style 命中 token
  const selectedStyle: CSSProperties | undefined = isSelected
    ? {
        boxShadow:
          '0 0 0 2px var(--mint-cloud-deep), 0 0 0 4px var(--warm-canvas), var(--shadow-clay-mint)',
      }
    : undefined;

  const selectedClasses = isSelected
    ? 'text-ink'
    : 'text-ink-light hover:text-ink';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      style={{
        backgroundColor: bgMap[variant],
        borderColor: 'var(--warm-border)',
        ...(selectedStyle ?? {}),
      }}
      className={[
        // 形状：粘土胶囊
        'inline-flex items-center gap-1',
        'rounded-full',
        'px-4 py-2.5',
        // 1px 暖米描边（颜色走 inline style，命中 token）
        'border',
        // 最小触点 44x44
        'min-h-[44px] min-w-[44px]',
        // 默认阴影
        'shadow-clay-soft',
        // hover: 抬起 + 更深阴影
        hoverShadow,
        'hover:-translate-y-px',
        // active: 下沉 + 内凹阴影
        activeShadow,
        'active:translate-y-0',
        // 过渡：150ms ease-out-quart
        'transition-all duration-150 ease-clay-out',
        // 文字
        'font-body font-medium text-[15px] leading-none',
        // 选中态
        selectedClasses,
        // 焦点环：颜色走 token 变量
        'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--mint-cloud-deep)] focus-visible:outline-offset-2',
        // 取消浏览器默认 button 样式
        'appearance-none cursor-pointer select-none',
        // 不允许子元素被选中
        '[&>span]:select-none',
      ].join(' ')}
    >
      {icon && <span className="text-[16px] leading-none">{icon}</span>}
      <span className="leading-none">{label}</span>
    </button>
  );
}

export default ChipButton;
