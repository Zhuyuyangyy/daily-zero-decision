import { Task } from '../types';

interface TaskHistoryProps {
  history: Record<string, Task[]>;
}

export default function TaskHistory({ history }: TaskHistoryProps) {
  const dates = Object.keys(history).sort().reverse();

  if (dates.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2
        className="clay-text-h2"
        style={{
          fontSize: 20,
          marginBottom: 16,
          color: 'var(--ink)',
        }}
      >
        历史记录
      </h2>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: '7px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'var(--neutral-200)',
            borderRadius: '1px',
          }}
        />

        {dates.map((date) => {
          const tasks = history[date];
          const completedCount = tasks.filter((t) => t.completedAt).length;
          const isToday =
            date === new Date().toISOString().split('T')[0];

          return (
            <div key={date} style={{ marginBottom: '20px' }}>
              {/* Date dot + label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  marginLeft: '-24px',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background:
                      completedCount === tasks.length
                        ? 'var(--mint-cloud)'
                        : completedCount > 0
                        ? 'var(--warm-amber)'
                        : 'var(--neutral-300)',
                    border: '2px solid var(--surface-0)',
                    boxShadow: '0 0 0 2px var(--neutral-200)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  {isToday ? '今天' : formatDate(date)}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--ink-light)',
                  }}
                >
                  {completedCount}/{tasks.length} 完成
                </span>
              </div>

              {/* Task cards */}
              <div
                className="shadow-tinted"
                style={{
                  borderRadius: '14px',
                  padding: '16px',
                  background: 'var(--surface-1)',
                  border: 'var(--hairline-subtle)',
                }}
              >
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '8px 0',
                      borderBottom:
                        task !== tasks[tasks.length - 1]
                          ? '1px solid var(--neutral-100)'
                          : 'none',
                    }}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {task.completedAt ? '✅' : '⬜'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: task.completedAt
                            ? 'var(--ink)'
                            : 'var(--ink-light)',
                          textDecoration: task.completedAt
                            ? 'line-through'
                            : 'none',
                          textDecorationColor: 'var(--mint-cloud)',
                        }}
                      >
                        {task.title}
                      </div>
                      {task.note && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--ink-light)',
                            fontStyle: 'italic',
                            marginTop: '2px',
                            opacity: 0.8,
                          }}
                        >
                          💭 {task.note}
                        </div>
                      )}
                      {task.startPage !== undefined &&
                        task.endPage !== undefined && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--ink-faint)',
                              marginTop: '2px',
                            }}
                          >
                            {task.startPage} → {task.endPage} 页
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];

  return `${month}月${day}日 周${weekday}`;
}