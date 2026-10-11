import type { KeyboardEvent } from 'react';

interface FloatingInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** 设为 true 时使用暗色背景（FAB 正在显示时） */
  darkBackdrop?: boolean;
}

/**
 * FloatingInput — 主页输入条 + 发送 + 取消
 * 从原来内联在 App.tsx 的浮动输入条抽出来
 */
export default function FloatingInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
  disabled = false,
  darkBackdrop = false,
}: FloatingInputProps) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="clay-floating-input" data-dark={darkBackdrop}>
      <input
        type="text"
        autoFocus
        className="clay-floating-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="任务输入"
      />
      <button
        type="button"
        className="clay-floating-input__send"
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        aria-label="提交"
      >
        →
      </button>
      <button
        type="button"
        className="clay-floating-input__cancel"
        onClick={onCancel}
        aria-label="取消"
      >
        ✕
      </button>
    </div>
  );
}
