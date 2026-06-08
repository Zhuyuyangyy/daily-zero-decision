import {
  CloudCard,
  CardCloud,
  CardTitle,
  CardSub,
  CardActions,
  SoftButton,
  PillChip,
} from '../ui';

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
    <div style={{ margin: '24px 16px 0' }}>
      <CloudCard variant="dashed" style={{ textAlign: 'center', padding: '36px 24px 28px' }}>
        <CardCloud>☁️</CardCloud>
        <CardTitle style={{ textAlign: 'center' }}>云朵还没发芽</CardTitle>
        <CardSub style={{ textAlign: 'center', marginBottom: 22 }}>
          今天不用想太多，
          <br />
          我帮你挑一朵轻的。
        </CardSub>

        <CardActions>
          <SoftButton variant="mint" size="lg" block onClick={onGrow}>
            让今天养一朵云
          </SoftButton>
        </CardActions>

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
            <PillChip key={s.value} bare onClick={() => onSuggest(s.value)}>
              {s.label}
            </PillChip>
          ))}
        </div>
      </CloudCard>
    </div>
  );
}
