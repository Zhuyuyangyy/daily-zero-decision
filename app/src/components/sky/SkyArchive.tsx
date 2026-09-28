import { useMemo, useState } from 'react';
import type { AppState, Task, TaskType } from '../../types';
import { buildMonthSummary } from '../../utils/archive';
import { getPhenomenon, type PhenomenonId } from '../../utils/atlas';

/**
 * SkyArchive — 天空档案馆(月历格子)
 *
 * 每天一个小格子:当天云朵 + 心情 + 天象小角标。
 * 点格子看当日详情。底部是本月自然语言总结(不画折线图)。
 */
export function SkyArchive({ state }: { state: AppState }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const summary = useMemo(() => buildMonthSummary(state, yearMonth), [state, yearMonth]);

  // 当月格子:1 号 ~ 月末(只渲染到今天,未来留空)
  const cells = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: Array<{
      day: number;
      date: string;
      logged: boolean;
      tasks: Task[];
      phenomena: PhenomenonId[];
      mood: string | null;
      isFuture: boolean;
    }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${yearMonth}-${String(d).padStart(2, '0')}`;
      const logged = state.log.includes(date);
      const isFuture = d > today.getDate();
      const tasks = state.history[date] ?? [];
      out.push({
        day: d,
        date,
        logged: logged && !isFuture,
        tasks: isFuture ? [] : tasks,
        phenomena: isFuture ? [] : ((state.atlas[date] ?? []) as PhenomenonId[]),
        mood: state.moods[date] ?? null,
        isFuture,
      });
    }
    return out;
  }, [state, today, yearMonth]);

  const moodIcon: Record<string, string> = {
    down: '☁️', low: '🌤', okay: '⛅', gloomy: '🌧', hopeful: '🌈',
  };
  const typeHue: Record<TaskType, string> = {
    reading: 'rgba(168, 216, 181, 0.85)',
    exercise: 'rgba(255, 170, 130, 0.85)',
    coding: 'rgba(168, 176, 204, 0.85)',
    other: 'rgba(255, 235, 215, 0.9)',
  };

  const selectedCell = selected ? cells.find((c) => c.date === selected) : null;

  return (
    <section
      style={{
        marginTop: 16,
        borderRadius: 20,
        background: 'var(--surface-1, #FFF5EC)',
        border: '1px solid var(--hairline-subtle, rgba(245, 220, 200, 0.6))',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 22 }} aria-hidden>📔</span>
        <span style={{ flex: 1 }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            天空档案馆
          </span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
            {yearMonth.replace('-', ' 年 ')} 月 · {summary.totalDays} 天有记录
          </span>
        </span>
        <span aria-hidden style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
          {open ? '收起 ▲' : '展开 ▼'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* 月历格子 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
            }}
          >
            {cells.map((c) => {
              const first = c.tasks[0];
              const phenIcon = c.phenomena.length > 0
                ? getPhenomenon(c.phenomena[0]).icon
                : null;
              return (
                <button
                  key={c.date}
                  type="button"
                  disabled={!c.logged}
                  onClick={() => setSelected(c.date === selected ? null : c.date)}
                  aria-label={`${c.date}${c.logged ? '有云' : ''}`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: selected === c.date
                      ? '1.5px solid var(--mint-cloud-cta, #4AB574)'
                      : c.logged
                      ? '1px solid rgba(255, 200, 140, 0.4)'
                      : '1px dashed rgba(190, 175, 160, 0.3)',
                    background: c.logged && first
                      ? typeHue[first.type]
                      : c.isFuture
                      ? 'transparent'
                      : 'rgba(240, 232, 224, 0.5)',
                    opacity: c.isFuture ? 0.35 : 1,
                    cursor: c.logged ? 'pointer' : 'default',
                    position: 'relative',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <span style={{ fontSize: 9, color: 'rgba(74, 58, 51, 0.55)', lineHeight: 1 }}>
                    {c.day}
                  </span>
                  <span
                    aria-hidden
                    style={{
                      width: 14,
                      height: 9,
                      borderRadius: '50%',
                      background: c.logged ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
                      boxShadow: c.logged ? '0 1px 2px rgba(120, 90, 70, 0.2)' : 'none',
                    }}
                  />
                  {phenIcon && (
                    <span style={{ position: 'absolute', top: 1, right: 2, fontSize: 8 }} aria-hidden>
                      {phenIcon}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 当日详情 */}
          {selectedCell?.logged && (
            <div
              style={{
                marginTop: 12,
                padding: '12px 14px',
                borderRadius: 14,
                background: 'rgba(255, 250, 240, 0.9)',
                border: '1px solid rgba(255, 200, 140, 0.35)',
              }}
            >
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                {selectedCell.date.replace(/-/g, '.')}
                {selectedCell.mood && ` · ${moodIcon[selectedCell.mood] ?? ''}`}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
                {selectedCell.tasks[0]?.title ?? '一朵安静的小云'}
              </p>
              {selectedCell.phenomena.length > 0 && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
                  当天遇见：
                  {selectedCell.phenomena
                    .map((id) => getPhenomenon(id).icon + getPhenomenon(id).name)
                    .join('、')}
                </p>
              )}
            </div>
          )}

          {/* 本月自然语言总结 */}
          <div style={{ marginTop: 14 }}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--ink)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {summary.sentence}
            </p>

            {summary.moodCounts.length > 0 && (
              <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
                这个月你有{' '}
                {summary.moodCounts.slice(0, 3).map((m) => `${m.count} 个${m.label}天空`).join('、')}
              </p>
            )}

            {summary.phenomenonCounts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {summary.phenomenonCounts.map((p) => (
                  <span
                    key={p.id}
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(255, 250, 240, 0.9)',
                      border: '1px solid rgba(255, 200, 140, 0.4)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {p.icon} {p.name} ×{p.count}
                  </span>
                ))}
              </div>
            )}

            {summary.phenomenonCounts.length === 0 && summary.totalDays > 0 && (
              <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                这个月还没有遇见特殊天象，它们会在天空自己的时间里来。
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
