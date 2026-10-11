import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  /** 头部（不可滚动） */
  header?: ReactNode;
  /** 主体（可滚动） */
  body?: ReactNode;
  /** 浮动元素（如 FAB / FloatingInput） */
  floating?: ReactNode;
  /** 主体 padding-bottom，避免被底部 TabBar 遮挡 */
  bodyBottomPad?: number;
}

/**
 * PageShell — 页面通用骨架
 *  - header: 不滚动（顶部天空/标题）
 *  - body: 可滚动，自动避开 TabBar
 *  - floating: 浮在底部 TabBar 之上
 */
export default function PageShell({
  children,
  header,
  body,
  floating,
  bodyBottomPad = 80,
}: PageShellProps) {
  return (
    <div className="clay-content clay-page" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {header}
      {body ? (
        <div
          className="clay-scroll-area"
          style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: bodyBottomPad }}
        >
          <div className="w-full max-w-md mx-auto" style={{ padding: '8px 16px' }}>
            {body}
          </div>
        </div>
      ) : children}
      {floating}
    </div>
  );
}
