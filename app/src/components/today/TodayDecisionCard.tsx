import type { Task, TaskType } from '../../types';
import {
  CloudCard,
  CardMeta,
  CardMetaItem,
  CardActions,
  SoftButton,
} from '../ui';

const CLOUD_THEME: Record<TaskType, { label: string; icon: string; suffix: string }> = {
  reading:  { label: '阅读云', icon: '📖', suffix: '阅读云' },
  exercise: { label: '散步云', icon: '🏃', suffix: '散步云' },
  coding:   { label: '编码云', icon: '💻', suffix: '编码云' },
  other:    { label: '日常云', icon: '✨', suffix: '日常云' },
};

interface TodayDecisionCardProps {
  task: Task;
  onComplete: () => void;
  onEasier: () => void;
  onStartPomodoro: () => void;
}

/**
 * 今日卡 — Round 5 重写
 * 主题型壳：阅读云 / 散步云 / 编码云 / 日常云（情绪壳 + 记忆点）
 * 任务型核：用户今天真正要做的事（读 2 页书 / 出门走走）
 * 奖励闭环：完成后，天空 +1 朵云
 */
export default function TodayDecisionCard({
  task,
  onComplete,
  onEasier,
  onStartPomodoro,
}: TodayDecisionCardProps) {
  const theme = CLOUD_THEME[task.type] ?? CLOUD_THEME.other;

  return (
    <div style={{ margin: '16px 16px 0' }}>
      <CloudCard>
        {/* 主题壳：云朵种类（记忆点） */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            fontSize: 12,
            color: 'var(--mint-cloud-text)',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            alignSelf: 'flex-start',
            width: 'fit-content',
          }}
        >
          <span style={{ fontSize: 14 }}>{theme.icon}</span>
          <span>{theme.label}</span>
        </div>

        {/* 任务核：今天真正要做的事 */}
        <h2
          className="clay-card__title"
          style={{ marginTop: 14, marginBottom: 8 }}
        >
          {task.title}
        </h2>

        {/* 解释：从模糊意图压到一步 */}
        <p className="clay-card__sub" style={{ maxWidth: 'none' }}>
          不用完成很多，
          <br />
          轻轻做这一小步就好。
        </p>

        {/* meta：时间 / 地点 */}
        <CardMeta>
          {task.time && <CardMetaItem>⏱ {task.time}</CardMetaItem>}
          {task.place && <CardMetaItem>📍 {task.place}</CardMetaItem>}
        </CardMeta>

        {/* 奖励承诺：完成后天空 +1 朵云 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 12,
            background: 'var(--mint-cloud-light)',
            color: 'var(--mint-cloud-text)',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            marginBottom: 16,
          }}
        >
          <span aria-hidden>☁️</span>
          <span>完成后，天空会多一朵{theme.suffix}</span>
        </div>

        <CardActions>
          <SoftButton variant="mint" size="lg" block onClick={onComplete}>
            完成这一小步
          </SoftButton>
          <SoftButton variant="text" size="md" block onClick={onEasier}>
            今天换轻一点
          </SoftButton>
        </CardActions>

        {/* 番茄钟降级成内嵌小按钮 */}
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <button
            type="button"
            onClick={onStartPomodoro}
            className="clay-pomodoro-inline"
          >
            ⏱️ 开始计时
          </button>
        </div>
      </CloudCard>
    </div>
  );
}
