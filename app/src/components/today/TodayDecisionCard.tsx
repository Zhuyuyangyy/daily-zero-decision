import type { Task } from '../../types';
import {
  CloudCard,
  CardEyebrow,
  CardTitle,
  CardSub,
  CardMeta,
  CardMetaItem,
  CardActions,
  SoftButton,
} from '../ui';

interface TodayDecisionCardProps {
  task: Task;
  onComplete: () => void;
  onEasier: () => void;
}

/**
 * 今日零决策卡 — Round 1 的主视觉
 * 用户进来看到的唯一主角：今天只需要养这一朵云
 */
export default function TodayDecisionCard({ task, onComplete, onEasier }: TodayDecisionCardProps) {
  return (
    <div style={{ margin: '16px 16px 0' }}>
      <CloudCard>
        <CardEyebrow>
          <span>☁️</span>
          <span>今天养这朵云</span>
        </CardEyebrow>

        <CardTitle>{task.title}</CardTitle>

        <CardSub>
          不用完成很多，
          让今天轻轻往前一点就好。
        </CardSub>

        <CardMeta>
          {task.time && <CardMetaItem>⏱ 预计 {task.time}</CardMetaItem>}
          {task.place && <CardMetaItem>📍 {task.place}</CardMetaItem>}
        </CardMeta>

        <CardActions>
          <SoftButton variant="mint" size="lg" block onClick={onComplete}>
            完成这朵云
          </SoftButton>
          <SoftButton variant="text" size="md" block onClick={onEasier}>
            换一朵轻一点的
          </SoftButton>
        </CardActions>
      </CloudCard>
    </div>
  );
}
