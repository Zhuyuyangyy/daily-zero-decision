import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = '搜索任务名 / 备注 / 日期…',
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--surface-0)',
        border: 'var(--hairline-subtle)',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-clay-soft)',
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
          color: 'var(--ink-light)',
        }}
      >
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="搜索任务"
        className="clay-focusable"
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: 1.3,
          color: 'var(--ink)',
          padding: 0,
        }}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="清除搜索"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--neutral-100)',
            color: 'var(--ink-light)',
            fontSize: '14px',
            lineHeight: 1,
            cursor: 'pointer',
            transition: 'background 150ms var(--ease-out-quart)',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
