import { useMemo, useState } from 'react';
import type { AppState } from '../../types';
import { PHENOMENA, atlasStats, type PhenomenonId } from '../../utils/atlas';

/**
 * AtlasPanel — 天象图鉴
 *
 * 融合调研后 v0.3 的核心惊喜系统:把日夜系统从"装饰"升级为"收集"。
 * - 已收录:彩色 icon + 名字 + 稀有度标签
 * - 未收录:剪影 + hint 提示(制造期待,不剧透具体日期)
 * - 反 PUA:没有任何"你错过 X"的文案,只有"遇见"的记录
 */
export function AtlasPanel({ state }: { state: AppState }) {
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => atlasStats(state.atlas as Record<string, PhenomenonId[]>), [state.atlas]);
  const seen = useMemo(() => {
    const s = new Set<PhenomenonId>();
    for (const list of Object.values(state.atlas)) {
      for (const id of list as PhenomenonId[]) s.add(id);
    }
    return s;
  }, [state.atlas]);

  // 最近遇见:按日期倒序取最近 3 条记录(用于"最新遇见"行)
  const latest = useMemo(() => {
    const entries = Object.entries(state.atlas).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    for (const [date, ids] of entries) {
      if (ids.length > 0) return { date, ids: ids as PhenomenonId[] };
    }
    return null;
  }, [state.atlas]);

  const progress = `${stats.collected} / ${stats.total}`;

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
        <span style={{ fontSize: 22 }} aria-hidden>🌌</span>
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
            天象图鉴
          </span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
            我的天空图鉴 <b style={{ color: 'var(--mint-cloud-cta, #4AB574)' }}>{progress}</b>
          </span>
        </span>
        <span aria-hidden style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
          {open ? '收起 ▲' : '展开 ▼'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {latest && (
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 12,
                color: 'var(--ink-light)',
                fontFamily: 'var(--font-body)',
              }}
            >
              最近遇见 {latest.date.replace(/-/g, '.')}：
              {latest.ids.map((id) => PHENOMENA.find((p) => p.id === id)?.icon).join(' ')}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PHENOMENA.map((p) => {
              const owned = seen.has(p.id);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: owned ? 'rgba(255, 250, 240, 0.9)' : 'rgba(240, 232, 224, 0.4)',
                    border: owned
                      ? '1px solid rgba(255, 200, 140, 0.45)'
                      : '1px dashed rgba(190, 175, 160, 0.4)',
                    opacity: owned ? 1 : 0.75,
                  }}
                >
                  <span style={{ fontSize: 20, filter: owned ? 'none' : 'grayscale(1) opacity(0.5)' }} aria-hidden>
                    {p.icon}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {owned ? p.name : '未收录'}
                      {p.rarity === 'rare' && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: 'rgba(255, 214, 140, 0.35)',
                            color: '#8A6A2E',
                          }}
                        >
                          稀有
                        </span>
                      )}
                      {p.rarity === 'hidden' && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: 'rgba(196, 181, 253, 0.35)',
                            color: '#5B4B9E',
                          }}
                        >
                          隐藏
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 11,
                        color: 'var(--ink-light)',
                        marginTop: 2,
                      }}
                    >
                      {owned ? p.hint : `线索:${p.hint}`}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 11,
              color: 'var(--ink-faint)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
            }}
          >
            天象在天空自己出现的时间里偶然遇见，不用等，也不用找。
          </p>
        </div>
      )}
    </section>
  );
}
