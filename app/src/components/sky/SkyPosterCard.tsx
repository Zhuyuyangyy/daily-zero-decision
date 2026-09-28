import { useEffect, useRef } from 'react';
import type { AppState } from '../../types';
import { getPhenomenon } from '../../utils/atlas';
import type { PhenomenonId } from '../../utils/atlas';
import { getToday } from '../../utils/storage';
import { buildPosterVisual } from '../../utils/poster';
import type { PosterText } from '../../utils/posterCanvas';

/** 海报尺寸(与 posterCanvas 一致,此处仅用于预览宽高比) */
const POSTER_W = 1080;
const POSTER_H = 1440;

/**
 * SkyPosterCard — 今日天空卡(可保存分享的海报)
 *
 * - Canvas 绘制(1080x1440 @2x),确定性 seed:同一天同一片天空
 * - 预览为等比缩放;点击"保存图片"导出 PNG
 * - 文案轻,logo 小:右下角 ☁️ 养天空
 */
export interface SkyPosterCardProps {
  state: AppState;
  dayIndex: number;
  onClose: () => void;
}

function moodLabel(mood: string | undefined): string {
  switch (mood) {
    case 'down': return '很低落';
    case 'low': return '一般';
    case 'okay': return '平静';
    case 'gloomy': return '低落';
    case 'hopeful': return '期待';
    default: return '平静';
  }
}

const MOOD_QUOTES = [
  '云不赶时间，你也不用。',
  '这一小步，天空记住了。',
  '慢慢来，天空一直在。',
  '今天也把自己照顾好了一点。',
];

export function SkyPosterCard({ state, dayIndex, onClose }: SkyPosterCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const today = getToday();
  const hour = new Date().getHours();
  const mood = state.moods[today];
  const visual = buildPosterVisual(today, state.skyName, mood, hour);

  const todayPhenomena = (state.atlas[today] ?? []) as PhenomenonId[];
  const hasMeteor = todayPhenomena.includes('meteor') || todayPhenomena.includes('double-meteor');

  const text: PosterText = {
    skyName: state.skyName || '我的天空',
    dateLabel: today.replace(/-/g, '.'),
    dayIndex: `我的天空 · 第 ${Math.max(1, dayIndex)} 天`,
    moodLabel: moodLabel(mood),
    moodQuote: hasMeteor
      ? '今晚有流星来过，我把它留在你的天空里了。'
      : MOOD_QUOTES[hour % MOOD_QUOTES.length],
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    // 按需加载海报绘制器:首屏 bundle 不含 Canvas 绘制代码
    import('../../utils/posterCanvas').then(({ renderPoster }) => {
      if (!cancelled) renderPoster(canvas, visual, text);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visual.seed, text.skyName]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sky-${today}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Safari 需要延时 revoke
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const handleShareText = async () => {
    const shareText = `${text.dateLabel} ${text.skyName} · 第 ${Math.max(1, dayIndex)} 天\n今天是「${text.moodLabel}」\n${text.moodQuote}\n— 来自「养天空」`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // 剪贴板失败静默:用户仍可保存图片
    }
  };

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(60, 45, 40, 0.45)',
        backdropFilter: 'blur(6px)',
        gap: 14,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="今日天空卡"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(78vw, 320px)',
          maxHeight: '70vh',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(60, 40, 30, 0.35)',
          background: '#fff',
        }}
      >
        <canvas
          ref={canvasRef}
          aria-label="今日天空卡预览"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            aspectRatio: `${POSTER_W} / ${POSTER_H}`,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '12px 22px',
            borderRadius: 999,
            border: 'none',
            background: 'var(--mint-cloud-cta, #4AB574)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(74, 181, 116, 0.35)',
          }}
        >
          保存图片
        </button>
        <button
          type="button"
          onClick={handleShareText}
          style={{
            padding: '12px 22px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.16)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          复制文案
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '12px 22px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.16)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          关闭
        </button>
      </div>

      {todayPhenomena.length > 0 && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
          }}
        >
          今天遇见：
          {todayPhenomena.map((id) => getPhenomenon(id).icon + getPhenomenon(id).name).join('、')}
        </p>
      )}
    </div>
  );
}
