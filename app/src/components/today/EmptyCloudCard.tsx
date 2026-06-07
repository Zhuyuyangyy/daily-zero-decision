interface EmptyCloudCardProps {
  onGrow: () => void;
  onSuggest: (value: string) => void;
}

const SUGGESTIONS: Array<{ label: string; value: string }> = [
  { label: '读一点', value: '读2页书' },
  { label: '走一走', value: '出门走走' },
  { label: '写一句', value: '写一行日记' },
  { label: '随便养一朵', value: '深呼吸三次' },
];

/**
 * 云朵等待发芽 — 空状态零决策卡
 * 主 CTA：让今天养一朵云
 * 4 个轻建议 — 不展示分类，只展示降低决策成本的微行动
 */
export default function EmptyCloudCard({ onGrow, onSuggest }: EmptyCloudCardProps) {
  return (
    <div
      style={{
        margin: '24px 16px 0',
        padding: '36px 24px 28px',
        borderRadius: '28px',
        background: 'linear-gradient(180deg, #FFF8F4 0%, #FFF1E8 100%)',
        border: '1px dashed rgba(180, 165, 152, 0.35)',
        boxShadow: '0 6px 20px rgba(180, 100, 80, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
      }}
    >
      {/* 大云朵插画 */}
      <div
        style={{
          fontSize: 56,
          marginBottom: 12,
          opacity: 0.85,
          filter: 'drop-shadow(0 4px 12px rgba(180, 100, 80, 0.15))',
        }}
        aria-hidden
      >
        ☁️
      </div>

      {/* 主标题 */}
      <h2
        style={{
          margin: '0 0 8px',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.3,
        }}
      >
        云朵还没发芽
      </h2>

      {/* 解释文案 */}
      <p
        style={{
          margin: '0 0 22px',
          fontSize: 14,
          color: 'var(--ink-light)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.65,
        }}
      >
        今天不用想太多，
        <br />
        我帮你挑一朵轻的。
      </p>

      {/* 主 CTA — 唯一大按钮 */}
      <button
        onClick={onGrow}
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(180deg, #A8E0B5 0%, #4AB574 100%)',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow:
            '0 4px 14px rgba(74, 181, 116, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
          transition: 'all var(--dur-fast) var(--ease-out-expo)',
        }}
      >
        让今天养一朵云
      </button>

      {/* 4 个轻建议 — 弱化处理 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          marginTop: 16,
        }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => onSuggest(s.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-light)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all var(--dur-fast)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
