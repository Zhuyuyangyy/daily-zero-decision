import './ProtectionCard.css';

interface ProtectionCardProps {
  count: number;
  onPurchase: () => void;
}

/**
 * 天空投资保护卡显示组件
 *
 * 用户痛点：断签清零的焦虑
 * 解决方案：保护卡让努力不白费
 */
export function ProtectionCard({ count, onPurchase }: ProtectionCardProps) {
  return (
    <div className="protection-card-container" onClick={onPurchase}>
      <div className="protection-card">
        <div className="protection-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15l-4 4-2-2 6 6 2-2-2-6z"/>
          </svg>
        </div>
        <div className="protection-info">
          <span className="protection-count">{count}</span>
          <span className="protection-label">天空投资卡</span>
        </div>
      </div>

      {count === 0 && (
        <div className="protection-hint">
          点击购买，保护你的连续天数
        </div>
      )}
    </div>
  );
}
