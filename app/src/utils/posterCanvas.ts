/**
 * 把 PosterVisual 画到 Canvas,导出 PNG。
 * 纯绘制函数:不依赖 React,方便测试与复用。
 */

import type { PosterVisual } from './poster';

export const POSTER_W = 1080;
export const POSTER_H = 1440; // 3:4,小红书/朋友圈竖版

interface PhasePalette {
  top: string;
  mid: string;
  bottom: string;
  sun: string;
  cloud: { light: string; mid: string; deep: string };
  text: string;
}

const PALETTE: Record<PosterVisual['phase'], PhasePalette> = {
  dawn: {
    top: '#FFD9C4', mid: '#FFC0A0', bottom: '#FFE8DC',
    sun: '#FFB37A', cloud: { light: '#FFF6EE', mid: '#FFE4D6', deep: '#F7C9B4' },
    text: '#4A3A33',
  },
  day: {
    top: '#A8D8FF', mid: '#CFE9FF', bottom: '#F0FAFF',
    sun: '#FFE4A8', cloud: { light: '#FFFFFF', mid: '#F3F8FC', deep: '#DCE9F2' },
    text: '#3A4450',
  },
  dusk: {
    top: '#F7B48A', mid: '#FF9E80', bottom: '#FFD9C9',
    sun: '#FF8A5C', cloud: { light: '#FFF2E6', mid: '#FFDCC8', deep: '#EFB79B' },
    text: '#4A3A33',
  },
  night: {
    top: '#101C3F', mid: '#1C2A55', bottom: '#2E3A6B',
    sun: '#F4F0D8', cloud: { light: '#D8DEF5', mid: '#AEB8DC', deep: '#7C87B8' },
    text: '#EDF1FF',
  },
};

/** 画一朵软云(多个圆叠加) */
function drawCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  colors: PhasePalette['cloud'],
) {
  const parts: Array<[number, number, number]> = [
    [0, 10, 62],
    [-48, 18, 44],
    [46, 20, 46],
    [-16, -22, 42],
    [20, -14, 34],
  ];
  ctx.fillStyle = colors.mid;
  for (const [dx, dy, r] of parts) {
    ctx.beginPath();
    ctx.arc(cx + (dx / 100) * w, cy + (dy / 100) * w, (r / 100) * w, 0, Math.PI * 2);
    ctx.fill();
  }
  // 顶部高光
  ctx.fillStyle = colors.light;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.1, cy - w * 0.28, w * 0.3, w * 0.12, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // 底部暖影
  ctx.fillStyle = colors.deep;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.06, cy + w * 0.24, w * 0.42, w * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface PosterText {
  skyName: string;
  dateLabel: string;   // 2026.09.10
  dayIndex: string;    // 第 27 天
  moodLabel: string;   // 期待
  moodQuote: string;   // 一句轻文案
}

/** 在 canvas 上画完整海报 */
export function renderPoster(
  canvas: HTMLCanvasElement,
  visual: PosterVisual,
  text: PosterText,
): void {
  const dpr = 2;
  canvas.width = POSTER_W * dpr;
  canvas.height = POSTER_H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const W = POSTER_W, H = POSTER_H;
  const pal = PALETTE[visual.phase];

  // 天空渐变
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.78);
  sky.addColorStop(0, pal.top);
  sky.addColorStop(0.55, pal.mid);
  sky.addColorStop(1, pal.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // 星星
  for (const s of visual.stars) {
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.twinkle));
    ctx.fillStyle = `rgba(255, 250, 230, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H * 0.8, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 太阳 / 月亮(光晕)
  const sx = visual.sun.x * W, sy = visual.sun.y * H;
  const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150 * visual.sun.glow);
  halo.addColorStop(0, pal.sun);
  halo.addColorStop(0.35, `${pal.sun}66`);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(sx, sy, 150 * visual.sun.glow, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.sun;
  ctx.beginPath();
  ctx.arc(sx, sy, visual.phase === 'night' ? 34 : 46, 0, Math.PI * 2);
  ctx.fill();

  // 流星(确定性:同一天同一道)
  if (visual.meteor) {
    const m = visual.meteor;
    const mx = m.x * W, my = m.y * H;
    const rad = (m.angle * Math.PI) / 180;
    const ex = mx + Math.cos(rad) * m.length;
    const ey = my + Math.sin(rad) * m.length;
    const grad = ctx.createLinearGradient(mx, my, ex, ey);
    grad.addColorStop(0, 'rgba(255, 252, 236, 0)');
    grad.addColorStop(0.6, 'rgba(255, 252, 236, 0.95)');
    grad.addColorStop(1, 'rgba(255, 252, 236, 0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // 小云
  for (const mc of visual.miniClouds) {
    ctx.globalAlpha = mc.opacity;
    drawCloud(ctx, mc.x * W, mc.y * H, 120 * mc.scale, pal.cloud);
    ctx.globalAlpha = 1;
  }

  // 主云
  drawCloud(ctx, visual.cloud.x * W, visual.cloud.y * H, 260 * visual.cloud.scale, pal.cloud);

  // 草地上缘(柔和过渡)
  const grass = ctx.createLinearGradient(0, H * 0.72, 0, H);
  grass.addColorStop(0, 'rgba(200, 226, 180, 0)');
  grass.addColorStop(0.25, 'rgba(180, 210, 155, 0.55)');
  grass.addColorStop(1, 'rgba(150, 190, 130, 0.9)');
  ctx.fillStyle = grass;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // ---- 文字层 ----
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 顶部日期 + 天空名
  ctx.fillStyle = pal.text;
  ctx.globalAlpha = 0.92;
  ctx.font = '600 34px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  ctx.fillText(text.dateLabel, 64, 118);
  ctx.font = '700 58px "ZCOOL KuaiLe", "PingFang SC", system-ui, sans-serif';
  ctx.fillText(text.skyName, 64, 190);
  ctx.font = '400 28px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  ctx.globalAlpha = 0.7;
  ctx.fillText(text.dayIndex, 64, 236);
  ctx.globalAlpha = 1;

  // 底部卡片:心情 + 文案
  const cardY = H - 300;
  ctx.fillStyle = visual.phase === 'night' ? 'rgba(16, 24, 48, 0.62)' : 'rgba(255, 252, 246, 0.78)';
  roundRect(ctx, 56, cardY, W - 112, 216, 36);
  ctx.fill();

  ctx.fillStyle = visual.moodHue;
  ctx.beginPath();
  ctx.arc(112, cardY + 68, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = pal.text;
  ctx.font = '700 38px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  ctx.fillText(`今天是「${text.moodLabel}」`, 158, cardY + 80);

  ctx.font = '400 28px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  ctx.globalAlpha = 0.82;
  wrapText(ctx, text.moodQuote, 158, cardY + 130, W - 260, 42);
  ctx.globalAlpha = 1;

  // 底部轻文案
  ctx.font = '400 26px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  ctx.globalAlpha = 0.75;
  ctx.fillText('今天的天空，被你养成了这个样子。', 64, H - 44);
  ctx.globalAlpha = 1;

  // 右下角小 logo 文字
  ctx.textAlign = 'right';
  ctx.font = '600 24px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  ctx.globalAlpha = 0.6;
  ctx.fillText('☁️ 养天空', W - 64, H - 44);
  ctx.globalAlpha = 1;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let line = '';
  let yy = y;
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}
