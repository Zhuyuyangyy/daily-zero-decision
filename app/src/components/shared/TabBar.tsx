import type { CSSProperties } from 'react';

export type TabId = 'today' | 'sky' | 'stats' | 'settings';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

/**
 * 自绘 SVG 图标 — clay 系统语言，避免 emoji 通用 iOS 感
 * - 今日卡：3 团云 + 一颗心电图呼吸光环
 * - 我的天空：云朵漂浮在暖光里
 * - 回顾：3 个脚印（足迹叙事）
 * - 设置：圆角齿轮 8 齿
 */
function TabIcon({ id }: { id: TabId }) {
  switch (id) {
    case 'today':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" viewBox-aria-hidden="true">
          <g fill="currentColor">
            <ellipse cx="7"  cy="15" rx="5"  ry="4" />
            <ellipse cx="13" cy="11" rx="5.5" ry="5" />
            <ellipse cx="19" cy="13" rx="4"  ry="3.5" />
            <circle cx="17.5" cy="6" r="1.6" opacity="0.8" />
          </g>
        </svg>
      );
    case 'sky':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          {/* 地平线暖光 */}
          <ellipse cx="12" cy="20" rx="10" ry="2.5" fill="rgba(255, 180, 100, 0.35)" />
          {/* 主体云团 */}
          <g fill="currentColor">
            <ellipse cx="9"  cy="13" rx="5"  ry="4" />
            <ellipse cx="15" cy="10" rx="5"  ry="4.5" />
            <ellipse cx="18" cy="14" rx="3"  ry="3" />
          </g>
        </svg>
      );
    case 'stats':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
          {/* 3 个脚印，叙事感 */}
          <ellipse cx="6"  cy="14" rx="2.4" ry="3.2" />
          <circle cx="6"  cy="8.5" r="1" />
          <circle cx="5"  cy="6"  r="0.9" />
          <circle cx="7"  cy="6"  r="0.9" />

          <ellipse cx="12" cy="18" rx="2.4" ry="3.2" />
          <circle cx="12" cy="12.5" r="1" />
          <circle cx="11" cy="10"  r="0.9" />
          <circle cx="13" cy="10"  r="0.9" />

          <ellipse cx="18" cy="14" rx="2.4" ry="3.2" />
          <circle cx="18" cy="8.5" r="1" />
          <circle cx="17" cy="6"  r="0.9" />
          <circle cx="19" cy="6"  r="0.9" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
          {/* 圆角齿轮 8 齿（用 transform 替代也行，这里用径向分散的小圆点） */}
          <circle cx="12" cy="12" r="4" />
          <g>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const a = (i * Math.PI) / 4;
              return <circle key={i} cx={12 + 8 * Math.cos(a)} cy={12 + 8 * Math.sin(a)} r="1.6" />;
            })}
          </g>
        </svg>
      );
  }
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: '今日卡' },
  { id: 'sky', label: '我的天空' },
  { id: 'stats', label: '回顾' },
  { id: 'settings', label: '设置' },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      className="clay-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        padding: '8px 16px calc(8px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(254, 250, 247, 0.88)',
        borderTop: 'var(--hairline)',
        boxShadow: '0 -8px 30px rgba(200, 140, 110, 0.10)',
        zIndex: 100,
        backdropFilter: 'blur(16px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabStyle: CSSProperties = {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '8px 20px',
          minWidth: 80,
          minHeight: 44,
          border: 'none',
          borderRadius: 'var(--radius-btn)',
          background: isActive ? 'var(--mint-cloud-light)' : 'transparent',
          color: isActive ? 'var(--mint-cloud-text)' : 'var(--ink-light)',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: isActive ? 700 : 500,
          cursor: 'pointer',
          transition: 'all var(--dur-fast) var(--ease-out-quart)',
          boxShadow: isActive ? 'var(--shadow-clay-mint)' : 'none',
          letterSpacing: '0.02em',
        };
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={tabStyle}
            className="clay-focus"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              <TabIcon id={tab.id} />
            </span>
            <span style={{ lineHeight: 1 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
