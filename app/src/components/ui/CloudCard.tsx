import type { ReactNode } from 'react';

type CardVariant = 'solid' | 'dashed' | 'celebrate';

interface CloudCardProps {
  variant?: CardVariant;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

/**
 * CloudCard — 承载"云朵主角"和"空状态"的容器卡
 * variant: solid(实底) / dashed(虚线，空状态) / celebrate(完成态)
 */
export default function CloudCard({
  variant = 'solid',
  className,
  style,
  children,
}: CloudCardProps) {
  const cls = [
    'clay-card',
    variant === 'dashed' ? 'clay-card--dashed' : '',
    variant === 'celebrate' ? 'clay-card--celebrate' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

// 辅助组件
export function CardEyebrow({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div className="clay-card__eyebrow" style={style}>{children}</div>;
}

export function CardTitle({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <h2 className="clay-card__title" style={style}>{children}</h2>;
}

export function CardSub({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <p className="clay-card__sub" style={style}>{children}</p>;
}

export function CardCloud({ children }: { children: ReactNode }) {
  return <div className="clay-card__cloud" aria-hidden>{children}</div>;
}

export function CardMeta({ children }: { children: ReactNode }) {
  return <div className="clay-card__meta">{children}</div>;
}

export function CardMetaItem({ children }: { children: ReactNode }) {
  return <span className="clay-card__meta-item">{children}</span>;
}

export function CardActions({ children }: { children: ReactNode }) {
  return <div className="clay-card__actions">{children}</div>;
}
