import { useMemo, type CSSProperties } from 'react';
import { Task, TaskType } from '../../types';

interface StatsDashboardProps {
  history: Record<string, Task[]>;
  streak: { current: number; best: number };
  moods?: Record<string, string>;
  className?: string;
}

// --------------------------------------------------------------------
// 配色 / 任务类型映射
// --------------------------------------------------------------------
const TYPE_COLOR: Record<TaskType, string> = {
  reading: '#FFE2D5',
  exercise: '#D1FAE5',
  coding: '#DBEAFE',
  other: '#F3E8FF',
};

const TYPE_LABEL: Record<TaskType, string> = {
  reading: '阅读',
  exercise: '运动',
  coding: '编码',
  other: '其他',
};

const MOOD_LEVEL: Record<string, number> = {
  down: 1,
  gloomy: 2,
  okay: 3,
  low: 4,
  hopeful: 5,
};
const MOOD_LABEL: Record<string, string> = {
  1: 'down',
  2: 'gloomy',
  3: 'okay',
  4: 'low',
  5: 'hopeful',
};

// 工具：根据 Date 得到 YYYY-MM-DD
function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// 工具：加 N 天
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// --------------------------------------------------------------------
// 主组件
// --------------------------------------------------------------------
export default function StatsDashboard({
  history,
  streak,
  moods,
  className = '',
}: StatsDashboardProps) {
  // 全部扁平化
  const allTasks = useMemo(() => {
    const arr: Task[] = [];
    Object.values(history).forEach((list) => arr.push(...list));
    return arr;
  }, [history]);

  // 无数据：返回空态
  if (allTasks.length === 0) {
    return <EmptyState className={className} />;
  }

  // 概览 4 卡
  const totalTasks = allTasks.length;
  const totalCompleted = allTasks.filter((t) => t.completedAt).length;
  const totalPages = allTasks.reduce((sum, t) => {
    if (typeof t.endPage === 'number') return sum + t.endPage;
    return sum;
  }, 0);
  const totalFavorites = allTasks.filter(
    (t) => t.note && t.note.trim().length > 0
  ).length;

  // 类型分布
  const typeCounts: Record<TaskType, number> = {
    reading: 0,
    exercise: 0,
    coding: 0,
    other: 0,
  };
  allTasks.forEach((t) => {
    typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
  });

  // 7 天热力图
  const heatmapData = useMemo(() => buildHeatmap(history), [history]);

  // 心情趋势
  const moodSeries = useMemo(
    () => buildMoodSeries(moods, 30),
    [moods]
  );

  // 星期完成率
  const weekdayData = useMemo(() => buildWeekdayRates(history), [history]);

  // Top 5 任务
  const topTasks = useMemo(() => buildTopTasks(allTasks, 5), [allTasks]);

  const totalForPercent = (typeCounts.reading + typeCounts.exercise + typeCounts.coding + typeCounts.other) || 1;

  return (
    <section
      aria-label="数据统计"
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 24,
        padding: '8px 0 32px',
      }}
    >
      {/* ==== 概览 4 卡 ==== */}
      <OverviewCards
        totalTasks={totalTasks}
        totalCompleted={totalCompleted}
        totalPages={totalPages}
        totalFavorites={totalFavorites}
        streak={streak}
      />

      {/* ==== 7 天热力图 ==== */}
      <Card
        title="近 7 天节奏"
        subtitle="颜色越深，那天做的事越多"
      >
        <Heatmap data={heatmapData} />
      </Card>

      {/* ==== 任务类型分布 ==== */}
      <Card
        title="任务类型分布"
        subtitle="四象限看你最近在忙什么"
      >
        <Donut
          counts={typeCounts}
          total={totalForPercent}
        />
      </Card>

      {/* ==== 心情趋势 ==== */}
      <Card
        title="心情小记"
        subtitle="最近 30 天的云层起伏"
      >
        <MoodLine series={moodSeries} />
      </Card>

      {/* ==== 星期分析 ==== */}
      <Card
        title="星期节奏"
        subtitle="哪天最容易完成？"
      >
        <WeekdayBars data={weekdayData} />
      </Card>

      {/* ==== Top 5 任务 ==== */}
      <Card
        title="最常做的事"
        subtitle="Top 5 复现最高的任务"
      >
        <TopTasks items={topTasks} maxCount={topTasks[0]?.count || 1} />
      </Card>
    </section>
  );
}

// ============================================================
// 卡片壳
// ============================================================
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className="shadow-tinted"
      style={{
        background: 'var(--surface-1)',
        borderRadius: 20,
        padding: 24,
        border: 'var(--hairline-subtle)',
        lineHeight: 1.6,
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--ink-light)',
              margin: '4px 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </header>
      <div>{children}</div>
    </article>
  );
}

// ============================================================
// 概览 4 卡
// ============================================================
function OverviewCards({
  totalTasks,
  totalCompleted,
  totalPages,
  totalFavorites,
  streak,
}: {
  totalTasks: number;
  totalCompleted: number;
  totalPages: number;
  totalFavorites: number;
  streak: { current: number; best: number };
}) {
  const cells: Array<{ label: string; value: number | string; unit?: string; color: string }> = [
    { label: '总任务数', value: totalTasks, color: 'var(--warm-coral)' },
    { label: '已完成', value: totalCompleted, color: 'var(--mint-cloud-deep)' },
    { label: '累计页数', value: totalPages, color: 'var(--warm-amber)' },
    { label: '收藏 / 备注', value: totalFavorites, color: 'var(--sky-dawn-3)' },
  ];

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {cells.map((c) => (
          <div
            key={c.label}
            className="shadow-tinted"
            style={{
              background: 'var(--surface-1)',
              borderRadius: 16,
              padding: '16px 14px',
              border: 'var(--hairline-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--ink-light)',
              }}
            >
              {c.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 700,
                color: c.color,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                lineHeight: 1.1,
              }}
            >
              {c.value}
            </span>
          </div>
        ))}
      </div>

      {/* 连续天数单独行 */}
      <div
        className="shadow-tinted"
        style={{
          marginTop: 12,
          background: 'var(--surface-1)',
          borderRadius: 16,
          padding: '14px 18px',
          border: 'var(--hairline-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--ink-light)',
              marginBottom: 2,
            }}
          >
            连续打卡
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum"',
            }}
          >
            当前 <span style={{ color: 'var(--warm-coral)' }}>{streak.current}</span> 天
            <span
              style={{
                marginLeft: 10,
                fontSize: 13,
                color: 'var(--ink-light)',
                fontWeight: 500,
              }}
            >
              · 最佳 {streak.best} 天
            </span>
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--ink-faint)',
          }}
        >
          一朵云 = 一天
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 7 天热力图
// ============================================================
type HeatmapCell = { date: string; count: number; isToday: boolean };

function buildHeatmap(history: Record<string, Task[]>): HeatmapCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: HeatmapCell[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = isoDay(d);
    const count = (history[key] || []).length;
    cells.push({ date: key, count, isToday: i === 0 });
  }
  return cells;
}

function heatColor(count: number): string {
  if (count <= 0) return 'var(--neutral-200)';
  if (count <= 2) return 'var(--mint-cloud-light)';
  if (count <= 4) return 'var(--mint-cloud)';
  return 'var(--mint-cloud-deep)';
}

function Heatmap({ data }: { data: HeatmapCell[] }) {
  // 0-5+ 阶梯标签
  const labels = ['0', '1-2', '3-4', '5+'];
  const legendColors = [
    'var(--neutral-200)',
    'var(--mint-cloud-light)',
    'var(--mint-cloud)',
    'var(--mint-cloud-deep)',
  ];

  // 数据不足（任意一天 < 2）
  const minAnyDay = data.some((c) => c.count >= 2);
  if (!minAnyDay) {
    return (
      <div
        style={{
          padding: '20px 4px 8px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--ink-light)',
        }}
      >
        刚刚开始 ✨ 再做几天，热力图就亮起来啦
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, 36px)`,
          gap: 4,
          justifyContent: 'start',
        }}
        role="grid"
        aria-label="近 7 天任务密度"
      >
        {data.map((c) => {
          return (
            <div
              key={c.date}
              role="gridcell"
              title={`${c.date} · ${c.count} 个任务`}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: heatColor(c.count),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.count >= 5 ? '#fff' : 'var(--ink-light)',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 600,
                boxShadow: c.isToday
                  ? 'inset 0 0 0 2px var(--warm-coral)'
                  : 'none',
              }}
            >
              {c.count > 0 ? c.count : ''}
            </div>
          );
        })}
      </div>

      {/* 星期标签 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, 36px)`,
          gap: 4,
          marginTop: 6,
          justifyContent: 'start',
        }}
      >
        {data.map((c) => {
          const d = new Date(c.date);
          const weekdayShort = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
          return (
            <div
              key={`${c.date}-w`}
              style={{
                width: 36,
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: c.isToday ? 'var(--warm-coral)' : 'var(--ink-faint)',
                fontWeight: c.isToday ? 700 : 400,
              }}
            >
              {weekdayShort}
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 16,
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--ink-light)',
        }}
      >
        <span>少</span>
        {legendColors.map((c, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: 3,
              background: c,
            }}
          />
        ))}
        <span>多</span>
        <span style={{ marginLeft: 12, color: 'var(--ink-faint)' }}>
          {labels.join(' · ')}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// 任务类型分布（Donut）
// ============================================================
function Donut({
  counts,
  total,
}: {
  counts: Record<TaskType, number>;
  total: number;
}) {
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const order: TaskType[] = ['reading', 'exercise', 'coding', 'other'];
  let offset = 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="任务类型占比"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--neutral-200)"
          strokeWidth={stroke}
        />
        {order.map((k) => {
          const v = counts[k];
          if (v <= 0) return null;
          const len = (v / total) * c;
          const el = (
            <circle
              key={k}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={TYPE_COLOR[k]}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 400ms var(--ease-out-quart)' }}
            />
          );
          offset += len;
          return el;
        })}
        {/* 中心数字 */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="28"
          fontWeight="700"
          fill="var(--ink)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize="11"
          fill="var(--ink-light)"
        >
          总任务
        </text>
      </svg>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 140,
        }}
      >
        {order.map((k) => (
          <li
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--ink)',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: 3,
                background: TYPE_COLOR[k],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{TYPE_LABEL[k]}</span>
            <span
              style={{
                color: 'var(--ink-light)',
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                fontWeight: 600,
              }}
            >
              {counts[k]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// 心情趋势（折线）
// ============================================================
type MoodPoint = { date: string; mood: string | null; level: number | null };

function buildMoodSeries(
  moods: Record<string, string> | undefined,
  days: number
): MoodPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series: MoodPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = isoDay(d);
    const m = moods?.[key];
    const level = m ? MOOD_LEVEL[m] ?? null : null;
    series.push({ date: key, mood: m || null, level });
  }
  return series;
}

function MoodLine({ series }: { series: MoodPoint[] }) {
  const width = 320;
  const height = 100;
  const padL = 24;
  const padR = 8;
  const padT = 8;
  const padB = 18;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const n = series.length;
  const stepX = n > 1 ? innerW / (n - 1) : innerW;
  const yFor = (lv: number) => padT + innerH - ((lv - 1) / 4) * innerH;

  // 构造 path：只在有 mood 的点之间连
  const pathSegments: string[] = [];
  let prev: MoodPoint | null = null;
  series.forEach((p, i) => {
    if (p.level == null) {
      prev = null;
      return;
    }
    const x = padL + i * stepX;
    const y = yFor(p.level);
    if (prev == null) {
      pathSegments.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
    } else {
      pathSegments.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    prev = p;
  });
  const linePath = pathSegments.join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="最近 30 天心情"
        style={{ maxWidth: '100%' }}
      >
        {/* 水平网格 */}
        {[1, 2, 3, 4, 5].map((lv) => (
          <line
            key={lv}
            x1={padL}
            x2={width - padR}
            y1={yFor(lv)}
            y2={yFor(lv)}
            stroke="var(--neutral-200)"
            strokeWidth={0.8}
            strokeDasharray="2 3"
          />
        ))}

        {/* Y 轴标签 */}
        {[1, 2, 3, 4, 5].map((lv) => (
          <text
            key={`l-${lv}`}
            x={padL - 6}
            y={yFor(lv) + 3}
            textAnchor="end"
            fontFamily="var(--font-body)"
            fontSize="9"
            fill="var(--ink-faint)"
          >
            {MOOD_LABEL[String(lv)].slice(0, 3)}
          </text>
        ))}

        {/* 没有心情的占位虚线（小竖点） */}
        {series.map((p, i) => {
          if (p.level != null) return null;
          const x = padL + i * stepX;
          return (
            <line
              key={`ph-${p.date}`}
              x1={x}
              x2={x}
              y1={padT}
              y2={padT + innerH}
              stroke="var(--ink-soft)"
              strokeWidth={0.8}
              strokeDasharray="1 3"
            />
          );
        })}

        {/* 主折线 */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--warm-coral)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 点 */}
        {series.map((p, i) => {
          if (p.level == null) return null;
          const x = padL + i * stepX;
          const y = yFor(p.level);
          return (
            <g key={`pt-${p.date}`}>
              <circle cx={x} cy={y} r={4} fill="var(--warm-coral)" />
              <circle cx={x} cy={y} r={1.5} fill="#fff" />
            </g>
          );
        })}

        {/* X 轴日期（首尾两个） */}
        {n > 0 && (
          <>
            <text
              x={padL}
              y={height - 4}
              fontFamily="var(--font-body)"
              fontSize="9"
              fill="var(--ink-faint)"
            >
              {series[0].date.slice(5)}
            </text>
            <text
              x={width - padR}
              y={height - 4}
              textAnchor="end"
              fontFamily="var(--font-body)"
              fontSize="9"
              fill="var(--ink-faint)"
            >
              {series[n - 1].date.slice(5)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ============================================================
// 星期分析
// ============================================================
type WeekdayStat = { day: number; label: string; rate: number; total: number; completed: number };

function buildWeekdayRates(history: Record<string, Task[]>): WeekdayStat[] {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const stats: WeekdayStat[] = labels.map((label, day) => ({
    day,
    label,
    rate: 0,
    total: 0,
    completed: 0,
  }));
  Object.entries(history).forEach(([date, tasks]) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    const w = d.getDay();
    stats[w].total += tasks.length;
    stats[w].completed += tasks.filter((t) => t.completedAt).length;
  });
  stats.forEach((s) => {
    s.rate = s.total === 0 ? 0 : Math.round((s.completed / s.total) * 100);
  });
  return stats;
}

function WeekdayBars({ data }: { data: WeekdayStat[] }) {
  const today = new Date().getDay();
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
          alignItems: 'end',
          height: 130,
        }}
      >
        {data.map((d) => {
          const h = Math.max(4, (d.rate / 100) * 110);
          const isToday = d.day === today;
          return (
            <div
              key={d.day}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                height: '100%',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  color: isToday ? 'var(--warm-coral)' : 'var(--ink-light)',
                  fontWeight: isToday ? 700 : 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {d.total > 0 ? `${d.rate}%` : '—'}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: 28,
                  height: h,
                  background: isToday
                    ? 'var(--warm-coral)'
                    : 'rgba(255, 155, 133, 0.6)',
                  borderRadius: 6,
                  transition: 'height var(--dur-base) var(--ease-out-quart)',
                }}
                aria-label={`${d.label} 完成率 ${d.rate}%`}
              />
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  color: isToday ? 'var(--ink)' : 'var(--ink-light)',
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--ink-faint)',
        }}
      >
        高亮当天 · {data[today]?.label}
      </div>
    </div>
  );
}

// ============================================================
// Top 5 任务
// ============================================================
type TopItem = { title: string; count: number };

function buildTopTasks(allTasks: Task[], k: number): TopItem[] {
  const map = new Map<string, number>();
  allTasks.forEach((t) => {
    const k = (t.title || '未命名').trim() || '未命名';
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, k);
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

function TopTasks({ items, maxCount }: { items: TopItem[]; maxCount: number }) {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '12px 0',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--ink-light)',
          textAlign: 'center',
        }}
      >
        还没有重复出现的任务
      </div>
    );
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it, idx) => {
        const w = Math.max(8, Math.round((it.count / Math.max(maxCount, 1)) * 100));
        return (
          <li
            key={`${it.title}-${idx}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                color: 'var(--ink-faint)',
                width: 18,
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--ink)',
                  marginBottom: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={it.title}
              >
                {truncate(it.title, 22)}
              </div>
              <div
                style={{
                  height: 8,
                  background: 'var(--neutral-200)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${w}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--warm-coral) 0%, var(--warm-amber) 100%)',
                    borderRadius: 4,
                    transition: 'width var(--dur-base) var(--ease-out-quart)',
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--warm-coral)',
                minWidth: 28,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
              }}
            >
              ×{it.count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================
// 空态
// ============================================================
function EmptyState({ className }: { className?: string }) {
  const s: CSSProperties = {
    background: 'var(--surface-1)',
    borderRadius: 20,
    padding: '48px 24px',
    border: 'var(--hairline-subtle)',
    textAlign: 'center',
    lineHeight: 1.7,
  };
  return (
    <section className={className} style={s} aria-label="数据统计空态">
      <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden>☁️</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          color: 'var(--ink)',
          marginBottom: 4,
        }}
      >
        还没有数据
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--ink-light)',
        }}
      >
        几天后再来看看 ☁️
      </div>
    </section>
  );
}
