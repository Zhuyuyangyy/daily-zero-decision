import { useState, useCallback } from 'react';
import { copy } from '../utils/copy';

interface DailyQuoteProps {
  className?: string;
  date?: string;
}

/**
 * 每日金句。一行紧凑展示：左 ☁️ 16px emoji，右一句温柔的话。
 * - 默认显示今天的金句（24h 不变）；传 date 可显示指定日期
 * - 点击刷新：随机换一句，并显示短动画
 * - 字号 13px、颜色 var(--ink-light)
 * - 暖米半透明背景 rgba(255, 245, 232, 0.5)
 * - 圆角 12px，padding 10px 14px，行高 1.5
 */
export default function DailyQuote({ className, date }: DailyQuoteProps) {
  const [text, setText] = useState(() => copy.quoteOfDay(date));
  const [fresh, setFresh] = useState(false);

  const handleClick = useCallback(() => {
    let next = copy.randomQuote();
    // 避免两次连续相同
    let tries = 0;
    while (next === text && tries < 5) {
      next = copy.randomQuote();
      tries++;
    }
    setText(next);
    setFresh(true);
    setTimeout(() => setFresh(false), 400);
  }, [text]);

  return (
    <div
      className={`clay-daily-quote ${className ?? ''}`.trim()}
      role="button"
      tabIndex={0}
      aria-label="每日金句，点击换一句"
      title="点一下，换一句"
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: 280,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(255, 245, 232, 0.5)',
        color: 'var(--ink-light)',
        fontSize: 13,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxSizing: 'border-box',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s var(--ease-out-quart)',
        transform: fresh ? 'scale(1.03)' : 'scale(1)',
        opacity: fresh ? 0.75 : 1,
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {'☁️'}
      </span>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{
          fontSize: 10,
          opacity: 0.35,
          flexShrink: 0,
          marginLeft: 2,
        }}
      >
        ↻
      </span>
    </div>
  );
}