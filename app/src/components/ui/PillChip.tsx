import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PillChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  bare?: boolean; // bare 模式：透明背景无边框，用于 EmptyCloudCard 的轻建议
  children: ReactNode;
}

export default function PillChip({
  active = false,
  bare = false,
  className,
  children,
  ...rest
}: PillChipProps) {
  const cls = [
    'clay-chip',
    bare ? 'clay-chip--bare' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} data-active={active} {...rest}>
      {children}
    </button>
  );
}
