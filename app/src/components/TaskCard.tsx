import { useState } from 'react';
import { Task } from '../types';
import { copy } from '../utils/copy';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onComplete, onReset, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const handlePrint = () => {
    const printContent = `
      <div style="font-family: system-ui; padding: 40px; max-width: 400px; margin: 0 auto; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">${task.title}</h1>
        <p style="color: #666; margin-bottom: 24px;">${task.bookName ? `《${task.bookName}》` : ''}</p>
        ${task.startPage && task.endPage ? `
          <div style="font-size: 48px; font-weight: bold; margin: 32px 0;">
            ${task.startPage} - ${task.endPage}
          </div>
          <p style="color: #666;">页</p>
        ` : ''}
        ${task.place || task.time ? `
          <div style="margin-top: 24px; color: #888;">
            ${task.place ? `📍 ${task.place}` : ''}
            ${task.time ? ` ⏱ ${task.time}` : ''}
          </div>
        ` : ''}
        <div style="margin-top: 48px; padding: 16px; border: 2px dashed #ccc; border-radius: 12px;">
          完成后来这里打卡 ✨
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div
      className="animate-fade-up clay-focus"
      style={{
        position: 'relative',
        background:
          'linear-gradient(180deg, var(--warm-card) 0%, var(--warm-card-deep) 100%)',
        borderRadius: 'var(--radius-chunk)',
        padding: '32px 30px',
        boxShadow: 'var(--shadow-clay-card)',
        lineHeight: 'var(--leading-relaxed)',
      }}
    >
      {/* Menu button — top right */}
      {(onDelete || onReset) && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              border: 'var(--hairline)',
              background: 'var(--surface-0)',
              color: 'var(--ink-light)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--dur-fast)',
            }}
          >
            ⋯
          </button>
          {showMenu && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9,
                }}
                onClick={() => setShowMenu(false)}
              />
              <div
                className="shadow-tinted"
                style={{
                  position: 'absolute',
                  top: '38px',
                  right: 0,
                  zIndex: 10,
                  minWidth: '120px',
                  background: 'var(--surface-0)',
                  borderRadius: '12px',
                  border: 'var(--hairline)',
                  overflow: 'hidden',
                }}
              >
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('确定删除这个任务吗？')) {
                        onDelete();
                        setShowMenu(false);
                      }
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--warm-coral)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--dur-fast)',
                    }}
                  >
                    🗑 删除
                  </button>
                )}
                {onReset && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReset();
                      setShowMenu(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink-light)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--dur-fast)',
                    }}
                  >
                    🔄 重置
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Top: tiny task-type chip (mint cloud) */}
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'var(--mint-cloud-light)',
            color: 'var(--mint-cloud-text)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: 'var(--shadow-clay-soft)',
          }}
        >
          {copy.typeLabel(task.type)}
        </span>
      </div>

      {/* Title — clay-text-h1 + balance */}
      <h2
        className="clay-text-h1 clay-balance"
        style={{
          marginBottom: 8,
        }}
      >
        {task.title}
      </h2>

      {/* Book name — only if present, kept very small */}
      {task.bookName && (
        <p
          style={{
            color: 'var(--ink-light)',
            marginBottom: 16,
            fontSize: 13,
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          《{task.bookName}》
        </p>
      )}

      {/* Page range — THE visual anchor: huge 56-80px numerals */}
      {task.startPage !== undefined && task.endPage !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            margin: '40px 0',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              className="clay-tnum"
              style={{
                fontFamily: 'var(--font-display, system-ui)',
                fontSize: 64,
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1,
              }}
            >
              {task.startPage}
            </div>
            <div
              style={{
                color: 'var(--ink-light)',
                fontSize: 12,
                marginTop: 10,
                letterSpacing: '0.08em',
              }}
            >
              起始页
            </div>
          </div>

          <div
            aria-hidden="true"
            style={{
              color: 'var(--warm-coral)',
              fontSize: 40,
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            →
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              className="clay-tnum"
              style={{
                fontFamily: 'var(--font-display, system-ui)',
                fontSize: 64,
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1,
              }}
            >
              {task.endPage}
            </div>
            <div
              style={{
                color: 'var(--ink-light)',
                fontSize: 12,
                marginTop: 10,
                letterSpacing: '0.08em',
              }}
            >
              结束页
            </div>
          </div>
        </div>
      )}

      {/* Actions — large clay CTA + soft secondary */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 36,
        }}
      >
        {/* Complete CTA — chunky clay, mint-cloud-cta */}
        <button
          type="button"
          onClick={onComplete}
          className="clay-focus"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 44,
            width: '100%',
            background: 'var(--mint-cloud-cta)',
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: 700,
            padding: '18px 24px',
            border: 'none',
            borderRadius: 'var(--radius-btn)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-clay-cta)',
            transition: 'all var(--dur-fast) var(--ease-out-quart)',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-clay-cta-pressed)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-clay-cta)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-clay-cta)';
          }}
        >
          {copy.completeCTA()}
        </button>

        {/* Secondary: print / screenshot — small clay soft button */}
        <button
          type="button"
          onClick={handlePrint}
          className="clay-focus"
          style={{
            alignSelf: 'center',
            minHeight: 44,
            padding: '10px 18px',
            borderRadius: 'var(--radius-btn)',
            background:
              'linear-gradient(180deg, var(--warm-card) 0%, var(--warm-card-deep) 100%)',
            border: 'none',
            color: 'var(--ink-light)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-clay-soft)',
            transition: 'all var(--dur-fast) var(--ease-out-quart)',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-clay-pressed)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-clay-soft)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-clay-soft)';
          }}
        >
          {copy.print()}
        </button>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="clay-focus"
            style={{
              alignSelf: 'center',
              minHeight: 44,
              padding: '6px 14px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-light)',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'color var(--dur-fast) var(--ease-out-quart)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ink-light)';
            }}
          >
            {copy.reset()}
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
