import type { ReactNode } from 'react';

export interface SkyHeaderContentProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function SkyHeaderContent({ title, subtitle, children }: SkyHeaderContentProps) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 16px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {title ?? '今天只做这一小步'}
      </h1>
      {subtitle !== undefined && (
        <p style={{ color: 'var(--ink-light)', fontSize: 12, margin: '4px 0 0' }}>{subtitle}</p>
      )}
      {children && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}