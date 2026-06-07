import { useState } from 'react';

interface CompletionNoteProps {
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export default function CompletionNote({ onConfirm, onCancel }: CompletionNoteProps) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note.trim());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 200ms var(--ease-out-expo)',
      }}
      onClick={onCancel}
    >
      <div
        className="shadow-tinted-lg"
        style={{
          background: 'var(--surface-0)',
          borderRadius: 'var(--radius-chunk, 20px)',
          padding: '32px 28px',
          maxWidth: '360px',
          width: '100%',
          border: 'var(--hairline-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>☁️</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '6px',
            }}
          >
            任务完成！
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-light)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            想对今天的云说点什么？（可选）
          </p>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="比如：今天读得很投入..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '14px',
            border: 'var(--hairline)',
            background: 'var(--surface-1)',
            color: 'var(--ink)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(180, 140, 120, 0.06)',
          }}
          autoFocus
        />

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '14px',
              background: 'var(--surface-2)',
              color: 'var(--ink-light)',
              border: 'var(--hairline)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              minHeight: '44px',
              cursor: 'pointer',
              transition: 'all var(--dur-fast) var(--ease-out-expo)',
            }}
          >
            跳过
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '14px',
              background: 'var(--mint-cloud-cta)',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '14px',
              minHeight: '44px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(111, 207, 138, 0.35)',
              transition: 'all var(--dur-fast) var(--ease-out-expo)',
            }}
          >
            完成
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}