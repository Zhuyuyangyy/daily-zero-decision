import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '../../types';
import { copy } from '../../utils/copy';

/**
 * ShareCard — 完成态分享卡（模态对话框）
 *
 * 设计要点：
 *  - 360×520px 居中卡片，圆角 28px
 *  - 暖粉橙大渐变（与 HeroSky golden 一致：sky-dawn-3 → warm-amber → warm-coral）
 *  - 显示完成数 + 任务名（最多 5 个）+ 连续天数徽章
 *  - 三个动作：复制分享文本 / 长按保存提示 / 关闭
 *  - 不用 html2canvas（太重），改用：
 *      1) navigator.clipboard.writeText 写纯文本（带 fallback 文本框）
 *      2) 提示用户"长按或右键卡片另存为图片"
 *  - 减弱模式 / 键盘 Esc 关闭
 */

export interface ShareCardProps {
  completedTasks: Task[];
  streak: number;
  onClose: () => void;
}

const CARD_W = 360;
const CARD_H = 520;

const VISIBLE_TASK_LIMIT = 5;


type CopyState = 'idle' | 'copied' | 'fallback' | 'failed';

function buildShareText(tasks: Task[], streak: number): string {
  const taskLines = tasks
    .slice(0, VISIBLE_TASK_LIMIT)
    .map((t, i) => `${i + 1}. ${t.title}`)
    .join('\n');
  const moodLine = copy.completed(streak);
  const sub = tasks[0] ? copy.completedSub(tasks[0].title) : copy.celebrate();
  const streakLine =
    streak > 1
      ? `已连续 ${streak} 天 ☁️`
      : streak === 1
      ? '第一天的小云 ☁️'
      : '回到这里就好 ☁️';
  return [
    moodLine,
    sub,
    '',
    taskLines,
    '',
    streakLine,
    '',
    '— 来自「每天一朵云」',
  ].join('\n');
}

function MiniCloud({
  size = 28,
  opacity = 0.6,
  variant = 0,
}: {
  size?: number;
  opacity?: number;
  variant?: 0 | 1;
}) {
  return (
    <svg
      width={size}
      height={(size * 14) / 24}
      viewBox="0 0 24 14"
      style={{ display: 'block', overflow: 'visible', opacity }}
      aria-hidden="true"
    >
      {variant === 0 ? (
        <g>
          <ellipse cx="6.5"  cy="9.2" rx="5.5" ry="4.2" fill="var(--mint-cloud-light)" />
          <ellipse cx="11"   cy="6.4" rx="4.2" ry="4"   fill="var(--mint-cloud-light)" />
          <ellipse cx="15.5" cy="5.2" rx="3.4" ry="3.4" fill="var(--mint-cloud-light)" />
          <ellipse cx="19"   cy="8.6" rx="3.6" ry="3.2" fill="var(--mint-cloud-light)" />
        </g>
      ) : (
        <g>
          <ellipse cx="7"  cy="9"   rx="5"   ry="3.8" fill="var(--mint-cloud-light)" />
          <ellipse cx="12" cy="6"   rx="4.6" ry="4.2" fill="var(--mint-cloud-light)" />
          <ellipse cx="17" cy="8.4" rx="4"   ry="3.4" fill="var(--mint-cloud-light)" />
        </g>
      )}
    </svg>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  const label = streak > 0 ? `${streak}` : '1';
  return (
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'var(--mint-cloud-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow:
          '0 4px 12px rgba(248, 140, 130, 0.18), 0 1px 3px rgba(248, 140, 130, 0.10), inset 0 2px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(95, 203, 134, 0.20)',
        fontFamily: 'var(--font-display)',
        color: 'var(--mint-cloud-text)',
        lineHeight: 1,
      }}
      aria-label={`连续 ${streak} 天`}
    >
      <span style={{ fontSize: 22, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 9, marginTop: 2, opacity: 0.85 }}>天</span>
    </div>
  );
}

export default function ShareCard({ completedTasks, streak, onClose }: ShareCardProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const visibleTasks = useMemo(
    () => completedTasks.slice(0, VISIBLE_TASK_LIMIT),
    [completedTasks]
  );
  const overflowCount = Math.max(0, completedTasks.length - VISIBLE_TASK_LIMIT);
  const shareText = useMemo(
    () => buildShareText(completedTasks, streak),
    [completedTasks, streak]
  );

  // 入场动画
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 当切到 fallback 模式时聚焦文本框
  useEffect(() => {
    if (copyState === 'fallback' && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [copyState]);

  const handleCopy = async () => {
    // 优先使用 Clipboard API
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(shareText);
        setCopyState('copied');
        window.setTimeout(() => setCopyState('idle'), 1800);
        return;
      }
    } catch {
      // fall through to fallback
    }
    setCopyState('fallback');
  };

  const handleClose = () => {
    setMounted(false);
    // 让退出动画先跑一下再卸载
    window.setTimeout(onClose, 180);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="分享今天的天空"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: mounted ? 'rgba(74, 58, 51, 0.35)' : 'rgba(74, 58, 51, 0)',
        backdropFilter: mounted ? 'blur(6px)' : 'blur(0px)',
        WebkitBackdropFilter: mounted ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 200ms var(--ease-out-quart), backdrop-filter 200ms var(--ease-out-quart)',
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: CARD_W,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 14,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 280ms var(--ease-back), opacity 200ms var(--ease-out-quart)',
        }}
      >
        {/* ============= 卡片本体 ============= */}
        <div
          className="clay-noise"
          style={{
            position: 'relative',
            width: CARD_W,
            maxWidth: '100%',
            height: CARD_H,
            borderRadius: 28,
            background:
              'linear-gradient(135deg, var(--sky-dawn-1) 0%, var(--sky-dawn-2) 50%, var(--warm-coral) 100%)',
            boxShadow:
              '0 18px 48px rgba(248, 140, 130, 0.30), 0 4px 12px rgba(248, 140, 130, 0.16), inset 0 3px 4px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(248, 140, 130, 0.18)',
            padding: 30,
            boxSizing: 'border-box',
            overflow: 'hidden',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
            userSelect: 'none',
          }}
        >
          {/* 4 角装饰小云朵 */}
          <div style={{ position: 'absolute', top: 12, left: 10,  pointerEvents: 'none' }}>
            <MiniCloud size={26} opacity={0.7} variant={0} />
          </div>
          <div style={{ position: 'absolute', top: 18, right: 14, pointerEvents: 'none' }}>
            <MiniCloud size={30} opacity={0.65} variant={1} />
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: 14, pointerEvents: 'none' }}>
            <MiniCloud size={32} opacity={0.6} variant={1} />
          </div>
          <div style={{ position: 'absolute', bottom: 12, right: 10, pointerEvents: 'none' }}>
            <MiniCloud size={24} opacity={0.7} variant={0} />
          </div>

          {/* 内部内容：标题 + 任务列表 + 徽章 */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 标题区 */}
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: 1.1,
                  color: 'var(--ink)',
                  letterSpacing: '-0.01em',
                  textShadow: '0 2px 10px rgba(255, 240, 225, 0.7)',
                }}
              >
                今天的天空
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: 'var(--ink-light)',
                  lineHeight: 1.5,
                  textShadow: '0 1px 6px rgba(255, 240, 225, 0.6)',
                }}
              >
                {copy.completed(streak)}
              </div>
            </div>

            {/* 任务列表（最多 5 行） */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                background: 'rgba(255, 250, 243, 0.78)',
                borderRadius: 18,
                padding: '12px 14px',
                boxShadow:
                  'inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(248, 140, 130, 0.10)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--ink-light)',
                  letterSpacing: '0.04em',
                }}
              >
                今天完成了 {completedTasks.length} 个任务
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  overflow: 'hidden',
                }}
              >
                {visibleTasks.length === 0 && (
                  <li
                    style={{
                      fontSize: 14,
                      color: 'var(--ink-light)',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    今天还没有完成的任务
                  </li>
                )}
                {visibleTasks.map((t, i) => (
                  <li
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: 'var(--ink)',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'var(--mint-cloud)',
                        color: 'var(--mint-cloud-text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.title}
                    </span>
                  </li>
                ))}
                {overflowCount > 0 && (
                  <li
                    style={{
                      fontSize: 12,
                      color: 'var(--ink-light)',
                      fontStyle: 'italic',
                    }}
                  >
                    还有 {overflowCount} 个 …
                  </li>
                )}
              </ul>
            </div>

            {/* 连续天数徽章 + 文案 */}
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <StreakBadge streak={streak} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'var(--ink)',
                    lineHeight: 1.2,
                  }}
                >
                  连续 {streak} 天
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>
                  {copy.celebrate()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============= 提示行（长按保存） ============= */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--ink-light)',
            background: 'rgba(255, 250, 243, 0.85)',
            borderRadius: 14,
            padding: '8px 12px',
            lineHeight: 1.5,
            boxShadow: '0 2px 6px rgba(248, 140, 130, 0.10)',
          }}
        >
          长按或右键卡片 · 可保存为图片分享
        </div>

        {/* ============= Fallback 文本框 ============= */}
        {copyState === 'fallback' && (
          <div
            style={{
              background: 'var(--warm-card)',
              borderRadius: 16,
              padding: 12,
              boxShadow: 'var(--shadow-clay-soft, 0 4px 12px rgba(248, 140, 130, 0.12))',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: 'var(--ink-light)',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              请长按下方文本框全选并复制
            </div>
            <textarea
              ref={textareaRef}
              readOnly
              value={shareText}
              rows={5}
              onFocus={(e) => e.currentTarget.select()}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 10,
                border: '1px solid var(--warm-border, #F5DCC8)',
                background: 'var(--warm-canvas, #FFF5EC)',
                color: 'var(--ink)',
                fontSize: 12,
                fontFamily: 'var(--font-mono, monospace)',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* ============= 三个动作按钮 ============= */}
        <div
          style={{
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              flex: 2,
              padding: '12px 16px',
              borderRadius: 18,
              background:
                copyState === 'copied'
                  ? 'var(--mint-cloud-deep, #5FCB86)'
                  : 'var(--mint-cloud-cta, #4AB574)',
              color: '#FFFFFF',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 14,
              minHeight: 44,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-clay-cta, 0 4px 0 #3A9A60)',
              transition: 'transform 150ms var(--ease-out-quart), background 200ms var(--ease-out-quart)',
              transform: copyState === 'copied' ? 'translateY(1px)' : 'translateY(0)',
            }}
            aria-live="polite"
          >
            {copyState === 'copied'
              ? '已复制 ✓'
              : copyState === 'fallback'
              ? '查看分享文本'
              : '复制分享文本'}
          </button>

          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 18,
              background: 'var(--warm-card, #FFFAF3)',
              color: 'var(--ink-light)',
              border: '1px solid var(--warm-border, #F5DCC8)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              minHeight: 44,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(248, 140, 130, 0.10)',
              transition: 'transform 150ms var(--ease-out-quart), background 150ms var(--ease-out-quart)',
            }}
          >
            关闭
          </button>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .clay-noise, [role="dialog"] * {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
