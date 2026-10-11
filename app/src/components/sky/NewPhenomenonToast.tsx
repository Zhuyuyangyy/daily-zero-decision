import { useEffect, useState } from 'react';
import type { AppState } from '../../types';
import { getPhenomenon, newlyDiscovered, type PhenomenonId } from '../../utils/atlas';

/**
 * NewPhenomenonToast — 「✨ 新天象」首次遇见提示
 *
 * 触发:今日 atlas 里的天象里,存在整个图鉴从未收录过的。
 * 只在该次会话内提示一次,不重复打扰;5.5s 自动消失。
 * 反 PUA:只说"遇见",没有任何"错过/未解锁"的措辞。
 */
export function NewPhenomenonToast({ state }: { state: AppState }) {
  const [hit, setHit] = useState<PhenomenonId | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todays = (state.atlas[today] ?? []) as PhenomenonId[];
    const fresh = newlyDiscovered(state.atlas as Record<string, PhenomenonId[]>, todays);
    if (fresh.length > 0) {
      const timer = setTimeout(() => setHit(fresh[0]), 900);
      return () => clearTimeout(timer);
    }
  }, [state.atlas]);

  if (!hit) return null;
  const def = getPhenomenon(hit);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 96,
        transform: 'translateX(-50%)',
        zIndex: 1150,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        borderRadius: 999,
        background: 'rgba(45, 40, 60, 0.92)',
        color: '#FFF7F0',
        fontFamily: 'var(--font-body)',
        boxShadow: '0 10px 30px rgba(40, 30, 60, 0.35)',
        animation: 'new-phenomenon-in 0.45s var(--ease-out-expo)',
        maxWidth: '86vw',
      }}
    >
      <span style={{ fontSize: 22 }} aria-hidden="true">
        {def.icon}
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.5 }}>
        <strong style={{ display: 'block', fontWeight: 700 }}>✨ 新天象 · {def.name}</strong>
        <span style={{ opacity: 0.75 }}>{date} 首次遇见</span>
      </span>
      <style>{`
        @keyframes new-phenomenon-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
