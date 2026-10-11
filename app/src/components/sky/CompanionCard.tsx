import { useMemo, useRef, useState, useEffect } from 'react';
import type { AppState } from '../../types';
import { companionView, stageProgress, nextStage } from '../../utils/companion';
import CompanionCloud from './CompanionCloud';
import { SkyNameModal } from '../shared/SkyNameModal';

/**
 * CompanionCard — 本命云的家
 *
 * - 顶部:本命云(点它只 squash 回应,不吐字——今日页已有云猫负责台词)
 * - 名字:未命名时显示"未命名"+ 命名按钮;已命名直接显示
 * - 成长:阶段名 + 距下一阶段天数(满级显示"已经长大啦")
 * - 反 PUA:无任何"你该来看它了"的催促文案
 */

export interface CompanionCardProps {
  state: AppState;
  reducedMotion?: boolean;
  /** 改名:返回 true 表示已保存(关闭弹窗) */
  onRename: (name: string) => boolean;
}

export function CompanionCard({ state, reducedMotion, onRename }: CompanionCardProps) {
  const [naming, setNaming] = useState(false);
  // 摸一下只 squash 回应,不吐字(今日页云猫负责台词,本命云保持安静陪伴)
  const [poked, setPoked] = useState(false);

  const view = useMemo(() => companionView(state), [state]);

  const poke = () => {
    setPoked(true);
    if (pokeTimer.current) clearTimeout(pokeTimer.current);
    pokeTimer.current = setTimeout(() => setPoked(false), 700);
  };
  const pokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pokeTimer.current) clearTimeout(pokeTimer.current);
  }, []);

  const next = nextStage(view.days);
  const progress = Math.round(stageProgress(view.days) * 100);

  return (
    <section
      style={{
        marginTop: 16,
        borderRadius: 24,
        padding: '18px 18px 20px',
        background: 'linear-gradient(160deg, rgba(255, 252, 246, 0.95) 0%, rgba(240, 246, 255, 0.9) 100%)',
        border: '1px solid var(--hairline-subtle, rgba(245, 220, 200, 0.7))',
        boxShadow: '0 10px 28px rgba(160, 130, 110, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 云朵本体 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className={view.mood === 'close' ? 'companion-glow' : view.mood === 'proud' ? 'companion-glow' : ''}>
          <CompanionCloud
            stage={view.stage}
            mood={view.mood}
            name={view.name}
            size={132}
            reducedMotion={reducedMotion}
            poked={poked}
            onClick={poke}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 700,
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {view.name ?? '未命名的小云'}
            </h2>
            <button
              type="button"
              onClick={() => setNaming(true)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--mint-cloud-cta, #4AB574)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {view.name ? '改名' : '给它起名'}
            </button>
          </div>

          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
            {view.stageLabel} · 陪你 {view.days} 天
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-light)', fontFamily: 'var(--font-body)' }}>
            {view.stageDesc}
          </p>

          {/* 成长进度 */}
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: 'rgba(190, 170, 190, 0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #C9F0D5, #8ADBA8)',
                  transition: 'width 600ms ease-out',
                }}
              />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
              {next ? `再 ${next.minDays - view.days} 天长成「${next.label}」` : '它已经长大啦'}
            </p>
          </div>
        </div>
      </div>

      {/* v0.4 本命云不吐字:点它只有 squash 回应,台词交给云猫 */}

      {/* 未命名引导 */}
      {!view.name && (
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 12,
            color: 'var(--ink-light)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
          }}
        >
          它一直在你的天空里。给它起个名字，它就知道你在叫它了。
        </p>
      )}

      <SkyNameModal
        isOpen={naming}
        currentName={view.name ?? '我的小云'}
        onConfirm={(name) => {
          const ok = onRename(name);
          if (ok) setNaming(false);
          return ok;
        }}
        onClose={() => setNaming(false)}
      />
    </section>
  );
}
