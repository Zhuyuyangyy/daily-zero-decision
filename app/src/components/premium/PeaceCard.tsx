import './PeaceCard.css';

interface PeaceCardProps {
  count: number;
  onInfo: () => void;
}

/**
 * 安心卡显示组件
 *
 * 核心理念：
 * - 允许用户休息一天
 * - 不否定之前的坚持
 * - 天空不会责怪你
 */
export function PeaceCard({ count, onInfo }: PeaceCardProps) {
  return (
    <div className="peace-card-container" onClick={onInfo}>
      <div className="peace-card">
        <div className="peace-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="peace-info">
          <span className="peace-count">{count}</span>
          <span className="peace-label">安心卡</span>
        </div>
      </div>

      <div className="peace-hint">
        忙的时候，它会帮你温柔保住连续记录。
      </div>
    </div>
  );
}
