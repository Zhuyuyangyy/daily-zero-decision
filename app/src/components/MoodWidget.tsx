import { useState } from 'react';

export type Mood = 'down' | 'low' | 'okay' | 'gloomy' | 'hopeful';

interface MoodWidgetProps {
  onSelect: (mood: Mood) => void;
  selected?: Mood;
}

interface MoodOption {
  id: Mood;
  emoji: string;
  label: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'down', emoji: '☁️', label: '很丧' },
  { id: 'low', emoji: '🌤', label: '一般' },
  { id: 'okay', emoji: '⛅', label: '还行' },
  { id: 'gloomy', emoji: '🌧', label: '低落' },
  { id: 'hopeful', emoji: '🌈', label: '期待' },
];

export default function MoodWidget({ onSelect, selected }: MoodWidgetProps) {
  const [hoveredId, setHoveredId] = useState<Mood | null>(null);

  return (
    <div
      className="shadow-tinted"
      style={{
        margin: '0 20px 12px',
        borderRadius: '24px',
        padding: '20px',
        background: 'var(--surface-1)',
      }}
    >
      {/* 标题行 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
            letterSpacing: 'var(--tracking-heading)',
          }}
        >
          今天感觉如何？
        </h3>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--ink-light)',
            fontFamily: 'var(--font-body)',
          }}
        >
          选一个就好
        </span>
      </div>

      {/* 5 个表情按钮横排 */}
      <div
        role="radiogroup"
        aria-label="今天的心情"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          const isHovered = hoveredId === option.id;
          const showLift = isSelected || isHovered;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              title={option.label}
              onClick={() => onSelect(option.id)}
              onMouseEnter={() => setHoveredId(option.id)}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = showLift ? 'scale(1.05)' : 'scale(1)';
              }}
              style={{
                flex: 1,
                width: '56px',
                height: '56px',
                minWidth: '56px',
                borderRadius: '50%',
                border: isSelected
                  ? '2px solid var(--warm-coral)'
                  : '1px solid var(--hairline-subtle, var(--warm-border))',
                background: isSelected
                  ? 'linear-gradient(180deg, #FFF1E6 0%, #FFE2D0 100%)'
                  : 'var(--surface-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transform: showLift ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(255, 155, 133, 0.30), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(248,140,130,0.18)'
                  : 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(200,140,110,0.10)',
                transition: 'transform 200ms var(--ease-out-expo), box-shadow 200ms var(--ease-out-expo), border-color 200ms var(--ease-out-expo), background 200ms var(--ease-out-expo)',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            >
              <span
                aria-hidden
                style={{
                  fontSize: '26px',
                  lineHeight: 1,
                  display: 'inline-block',
                  filter: isSelected ? 'saturate(1.15)' : 'saturate(0.95)',
                  transition: 'filter 200ms var(--ease-out-expo)',
                }}
              >
                {option.emoji}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
