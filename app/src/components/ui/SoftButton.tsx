import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'mint' | 'ghost' | 'text';
type Size = 'sm' | 'md' | 'lg';

interface SoftButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

/**
 * SoftButton — 治愈系柔和按钮
 * variant: mint(主CTA) / ghost(次级) / text(文字)
 * size: sm(12px) / md(14px) / lg(16px)
 * block: 是否宽度 100%
 */
export default function SoftButton({
  variant = 'mint',
  size = 'md',
  block = false,
  className,
  children,
  ...rest
}: SoftButtonProps) {
  const cls = [
    'clay-btn',
    `clay-btn--${variant}`,
    `clay-btn--${size}`,
    block ? 'clay-btn--block' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
