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
    <div className="tdc-shell">
      <CloudCard>
        {/* 主题壳：云朵种类（记忆点） */}
        <div className="tdc-theme-pill">
          <span className="tdc-theme-pill__icon">{theme.icon}</span>
          <span>{theme.label}</span>
        </div>

        {/* 任务核：今天真正要做的事 */}
        <h2 className="clay-card__title tdc-title">
          {task.title}
        </h2>

        {/* 解释：从模糊意图压到一步 */}
        <p className="clay-card__sub tdc-sub">
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
        <div className="tdc-reward">
          <span aria-hidden>☁️</span>
          <span>完成后，天空会多一朵{theme.suffix}</span>
        </div>

        <CardActions>
          <SoftButton variant="mint" size="lg" block onClick={onComplete} aria-label={task ? `完成任务：${task.title}` : '完成这一小步'}>
            完成这一小步
          </SoftButton>
          <SoftButton variant="text" size="md" block onClick={onEasier} aria-label="把今天的任务换成更轻的版本">
            今天换轻一点
          </SoftButton>
        </CardActions>

        {/* 番茄钟降级成内嵌小按钮 */}
        <div className="tdc-pomodoro-row">
          <button
            type="button"
            onClick={onStartPomodoro}
            className="clay-pomodoro-inline"
            aria-label="打开番茄钟计时器"
          >
            <span aria-hidden>⏱️</span> 开始计时
          </button>
        </div>
      </CloudCard>
    </div>
  );
}