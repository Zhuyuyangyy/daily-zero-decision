import { useMemo, useState } from 'react';
import { Task, TaskType } from '../../types';

interface SearchResultsProps {
  history: Record<string, Task[]>;
  query: string;
  typeFilter: 'all' | TaskType;
  onClose: () => void;
}

const TYPE_LABELS: Record<'all' | TaskType, string> = {
  all: '全部',
  reading: '阅读',
  exercise: '运动',
  coding: '编码',
  other: '其他',
};

const FILTER_ORDER: Array<'all' | TaskType> = [
  'all',
  'reading',
  'exercise',
  'coding',
];

const MAX_RESULTS = 30;

export default function SearchResults({
  history,
  query,
  typeFilter,
  onClose,
}: SearchResultsProps) {
  const [activeType, setActiveType] = useState<'all' | TaskType>(typeFilter);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Task[];

    const all: Task[] = [];
    const dates = Object.keys(history).sort().reverse();
    for (const date of dates) {
      for (const t of history[date]) {
        const title = (t.title || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        if (title.includes(q) || note.includes(q)) {
          all.push(t);
        }
      }
    }
    return all;
  }, [history, query]);

  const filtered = useMemo(() => {
    if (activeType === 'all') return matches;
    return matches.filter((t) => t.type === activeType);
  }, [matches, activeType]);

  // 按日期分组
  const grouped = useMemo(() => {
    const limit = Math.min(filtered.length, MAX_RESULTS);
    const slice = filtered.slice(0, limit);
    const map = new Map<string, Task[]>();
    for (const t of slice) {
      const dateKey = (t.completedAt || t.createdAt || '').split('T')[0];
      if (!dateKey) continue;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const totalCount = filtered.length;
  const showResults = query.trim().length > 0;

  return (
    <div
      style={{
        background: 'var(--warm-card)',
        borderRadius: '16px',
        padding: '12px',
        border: 'var(--hairline-subtle)',
        boxShadow: 'var(--shadow-clay-soft)',
      }}
    >
      {/* Header: 关闭按钮 + 过滤 chip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {FILTER_ORDER.map((key) => {
            const isActive = activeType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveType(key)}
                aria-pressed={isActive}
                style={{
                  padding: '8px 12px',
                  borderRadius: '14px',
                  border: 'var(--hairline-subtle)',
                  background: isActive
                    ? 'var(--mint-cloud-light)'
                    : 'var(--surface-0)',
                  color: isActive ? 'var(--mint-cloud-text)' : 'var(--ink-light)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  cursor: 'pointer',
                  transition: 'all 150ms var(--ease-out-quart)',
                  boxShadow: isActive
                    ? '0 0 0 2px var(--mint-cloud-deep), 0 0 0 4px var(--warm-canvas)'
                    : 'none',
                }}
              >
                {TYPE_LABELS[key]}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭搜索"
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'var(--hairline-subtle)',
            background: 'var(--surface-0)',
            color: 'var(--ink-light)',
            fontSize: '14px',
            lineHeight: 1,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* 内容区 */}
      {!showResults ? (
        <div
          style={{
            padding: '24px 12px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--ink-faint)',
            fontFamily: 'var(--font-body)',
          }}
        >
          输入关键词开始搜索…
        </div>
      ) : totalCount === 0 ? (
        <div
          style={{
            padding: '32px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '40px', lineHeight: 1 }}>☁️</div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-light)',
            }}
          >
            没找到相关的云
          </div>
        </div>
      ) : (
        <>
          {grouped.map(([date, tasks]) => (
            <div key={date} style={{ marginBottom: '14px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink-light)',
                  marginBottom: '6px',
                  paddingLeft: '4px',
                }}
              >
                {formatDate(date)}
              </div>
              <div
                style={{
                  background: 'var(--surface-1)',
                  borderRadius: '14px',
                  padding: '8px 12px',
                  border: 'var(--hairline-subtle)',
                }}
              >
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '8px 0',
                      borderBottom:
                        idx < tasks.length - 1
                          ? '1px solid var(--neutral-100)'
                          : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        flexShrink: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {task.completedAt ? '✅' : '⬜'}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        lineHeight: 1.3,
                      }}
                    >
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
                        {highlight(task.title, query)}
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
                          💭 {highlight(task.note, query)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ink-faint)',
              paddingTop: '4px',
            }}
          >
            共 {totalCount} 条结果
            {totalCount > MAX_RESULTS ? `（仅显示前 ${MAX_RESULTS} 条）` : ''}
          </div>
        </>
      )}
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerQ, i);
    if (idx === -1) {
      out.push(text.slice(i));
      break;
    }
    if (idx > i) out.push(text.slice(i, idx));
    out.push(
      <mark
        key={`m-${key++}`}
        style={{
          background: 'rgba(255, 194, 136, 0.45)',
          color: 'var(--ink)',
          padding: '0 2px',
          borderRadius: '4px',
        }}
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    i = idx + q.length;
  }
  return out;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
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
  return `${month}月${day}日 周${weekdays[date.getDay()]}`;
}
