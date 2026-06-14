import { useState } from 'react';
import './PurchaseModal.css';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (type: 'card' | 'subscription', plan: 'monthly' | 'yearly') => void;
  currentCards: number;
}

export function PurchaseModal({
  isOpen,
  onClose,
  onPurchase,
  currentCards,
}: PurchaseModalProps) {
  const [tab, setTab] = useState<'card' | 'subscription'>('card');

  if (!isOpen) return null;

  return (
    <div className="purchase-modal-overlay" onClick={onClose}>
      <div className="purchase-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>🌤️ 天空投资</h2>
          <p>保护你的努力，让连续天数更安心</p>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${tab === 'card' ? 'active' : ''}`}
            onClick={() => setTab('card')}
          >
            单次购买
          </button>
          <button
            className={`tab ${tab === 'subscription' ? 'active' : ''}`}
            onClick={() => setTab('subscription')}
          >
            订阅
          </button>
        </div>

        {tab === 'card' && (
          <div className="purchase-options">
            <div className="purchase-option" onClick={() => onPurchase('card', 'monthly')}>
              <div className="option-header">
                <span className="option-icon">🛡️</span>
                <span className="option-name">2张保护卡</span>
              </div>
              <div className="option-price">
                <span className="price-amount">¥30</span>
                <span className="price-unit">/ 次</span>
              </div>
              <div className="option-desc">
                立即获得2张天空投资保护卡<br/>
                可囤卡，无有效期
              </div>
              <button className="option-btn">购买</button>
            </div>

            <div className="purchase-option featured" onClick={() => onPurchase('card', 'monthly')}>
              <div className="option-badge">最受欢迎</div>
              <div className="option-header">
                <span className="option-icon">🛡️×3</span>
                <span className="option-name">5张保护卡</span>
              </div>
              <div className="option-price">
                <span className="price-amount">¥68</span>
                <span className="price-unit">/ 次</span>
              </div>
              <div className="option-desc">
                立即获得5张天空投资保护卡<br/>
                相当于¥13.6/张，囤卡更划算
              </div>
              <button className="option-btn">购买</button>
            </div>

            <div className="purchase-option" onClick={() => onPurchase('card', 'yearly')}>
              <div className="option-header">
                <span className="option-icon">🛡️×10</span>
                <span className="option-name">10张保护卡</span>
              </div>
              <div className="option-price">
                <span className="price-amount">¥128</span>
                <span className="price-unit">/ 次</span>
              </div>
              <div className="option-desc">
                立即获得10张天空投资保护卡<br/>
                相当于¥12.8/张，长期用户首选
              </div>
              <button className="option-btn">购买</button>
            </div>
          </div>
        )}

        {tab === 'subscription' && (
          <div className="purchase-options">
            <div className="purchase-option" onClick={() => onPurchase('subscription', 'monthly')}>
              <div className="option-header">
                <span className="option-icon">☁️</span>
                <span className="option-name">月卡会员</span>
              </div>
              <div className="option-price">
                <span className="price-amount">¥30</span>
                <span className="price-unit">/ 月</span>
              </div>
              <div className="option-desc">
                每月自动获得2张保护卡<br/>
                订阅期间持续保护
              </div>
              <button className="option-btn">订阅</button>
            </div>

            <div className="purchase-option featured" onClick={() => onPurchase('subscription', 'yearly')}>
              <div className="option-badge">省钱40%</div>
              <div className="option-header">
                <span className="option-icon">⭐</span>
                <span className="option-name">年卡会员</span>
              </div>
              <div className="option-price">
                <span className="price-amount">¥216</span>
                <span className="price-unit">/ 年</span>
              </div>
              <div className="option-desc">
                每月自动获得2张保护卡<br/>
                年均¥18/月，比月卡省40%
              </div>
              <button className="option-btn">订阅</button>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <p>🛡️ 保护卡说明</p>
          <ul>
            <li>断签时自动消耗1张保护卡</li>
            <li>保护卡不清零，连续天数保留</li>
            <li>无保护卡时按正常规则清零</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
