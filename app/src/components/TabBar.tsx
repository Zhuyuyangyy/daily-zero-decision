import type { CSSProperties } from 'react';

export type TabId = 'today' | 'sky' | 'stats' | 'settings';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'today', label: '今天', icon: '☁️' },
  { id: 'sky', label: '我的天空', icon: '🌤' },
  { id: 'stats', label: '统计', icon: '📊' },
  { id: 'settings', label: '设置', icon: '⚙' },
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
            <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ lineHeight: 1 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}