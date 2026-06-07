import type { Preset } from '../types';
import PresetManager from '../components/shared/PresetManager';
import { exportState } from '../utils/storage';
import { copy } from '../utils/copy';
import type { AppState } from '../types';
import type { FontPref } from '../hooks/useFont';

interface SettingsPageProps {
  state: AppState;
  presets: Preset[];
  onUpdatePresets: (presets: Preset[]) => void;
  onImport: () => void;
  font: FontPref;
  onFontChange: (next: FontPref) => void;
}

interface FontOption {
  id: FontPref;
  label: string;
  desc: string;
  preview: string;
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: 'rounded',
    label: '圆润',
    desc: '默认 · 暖圆体',
    preview: 'Aa 养一朵云',
  },
  {
    id: 'serif',
    label: '书卷',
    desc: '宋体 / Noto Serif',
    preview: 'Aa 养一朵云',
  },
  {
    id: 'sans',
    label: '现代',
    desc: '系统无衬线',
    preview: 'Aa 养一朵云',
  },
  {
    id: 'mono',
    label: '极客',
    desc: '等宽字体',
    preview: 'Aa 养一朵云',
  },
];

export default function SettingsPage({
  state,
  presets,
  onUpdatePresets,
  onImport,
  font,
  onFontChange,
}: SettingsPageProps) {
  return (
    <div
      className="clay-content clay-scroll-area"
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        paddingBottom: '80px',
      }}
    >
      <div className="w-full max-w-md mx-auto px-5">
        <div
          style={{
            textAlign: 'center',
            paddingTop: '40px',
            paddingBottom: '24px',
          }}
        >
          <h1
            className="clay-text-h1 clay-balance tracking-heading"
            style={{ fontSize: 40 }}
          >
            设置
          </h1>
        </div>

        {/* Preset Manager */}
        <PresetManager
          presets={presets}
          onUpdate={onUpdatePresets}
        />

        {/* Font preference */}
        <div
          className="shadow-tinted"
          style={{
            borderRadius: 'var(--radius-chunk, 20px)',
            padding: '20px',
            marginBottom: '16px',
            background: 'var(--surface-1)',
            border: 'var(--hairline-subtle)',
          }}
        >
          <h2
            className="clay-text-h2"
            style={{ fontSize: 18, marginBottom: 4 }}
          >
            字体偏好
          </h2>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 13,
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 14,
            }}
          >
            切换页面使用的字体系列，使用系统自带字体无需联网。
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {FONT_OPTIONS.map((opt) => {
              const isActive = font === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFontChange(opt.id)}
                  aria-pressed={isActive}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: isActive
                      ? '2px solid var(--mint-cloud-deep)'
                      : 'var(--hairline)',
                    background: isActive
                      ? 'var(--mint-cloud-light)'
                      : 'var(--surface-0)',
                    cursor: 'pointer',
                    transition: 'all var(--dur-fast) var(--ease-out-quart)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      color: 'var(--ink)',
                      fontWeight: 700,
                      fontFamily: `var(--stack-${opt.id === 'rounded' ? 'rounded' : opt.id})`,
                    }}
                  >
                    {opt.preview}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-light)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {opt.label} · {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data export/import */}
        <div
          className="shadow-tinted"
          style={{
            borderRadius: 'var(--radius-chunk, 20px)',
            padding: '28px 24px',
            marginBottom: '16px',
            background: 'var(--surface-1)',
            border: 'var(--hairline-subtle)',
          }}
        >
          <h2
            className="clay-text-h2"
            style={{ fontSize: 20, marginBottom: 8 }}
          >
            数据管理
          </h2>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 14,
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 20,
            }}
          >
            导出或导入你的数据，云朵不会丢。
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => exportState(state)}
              className="clay-focusable"
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '14px',
                background: 'var(--surface-2)',
                color: 'var(--ink)',
                border: 'var(--hairline)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 14,
                minHeight: 44,
                cursor: 'pointer',
                transition: 'all var(--dur-fast) var(--ease-out-expo)',
              }}
            >
              📤 导出
            </button>
            <button
              onClick={onImport}
              className="clay-focusable"
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '14px',
                background: 'var(--surface-2)',
                color: 'var(--ink)',
                border: 'var(--hairline)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 14,
                minHeight: 44,
                cursor: 'pointer',
                transition: 'all var(--dur-fast) var(--ease-out-expo)',
              }}
            >
              📥 导入
            </button>
          </div>
        </div>

        {/* Reset card */}
        <div
          className="shadow-tinted"
          style={{
            borderRadius: 'var(--radius-chunk, 20px)',
            padding: '28px 24px',
            marginBottom: '16px',
            background: 'var(--surface-1)',
            border: 'var(--hairline-subtle)',
          }}
        >
          <h2
            className="clay-text-h2"
            style={{ fontSize: 20, marginBottom: 8 }}
          >
            重置数据
          </h2>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 14,
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 20,
            }}
          >
            清空所有任务记录和连续天数，天空会回到最初的样子。
          </p>
          <button
            onClick={() => {
              if (window.confirm(copy.resetConfirm())) {
                localStorage.removeItem('daily-zero-decision');
                window.location.reload();
              }
            }}
            className="clay-focusable"
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '14px',
              background: 'var(--surface-2)',
              color: 'var(--warm-coral)',
              border: 'var(--hairline)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              minHeight: 44,
              cursor: 'pointer',
              transition: 'all var(--dur-fast) var(--ease-out-expo)',
            }}
          >
            {copy.reset()}
          </button>
        </div>

        {/* About card */}
        <div
          className="shadow-tinted"
          style={{
            borderRadius: 'var(--radius-chunk, 20px)',
            padding: '28px 24px',
            marginBottom: '16px',
            background: 'var(--surface-1)',
            border: 'var(--hairline-subtle)',
          }}
        >
          <h2
            className="clay-text-h2"
            style={{ fontSize: 20, marginBottom: 8 }}
          >
            关于
          </h2>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 14,
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            每日零决策卡 · 养一朵云
          </p>
          <p
            style={{
              color: 'var(--ink-light)',
              fontSize: 13,
              lineHeight: 'var(--leading-relaxed)',
              marginTop: 4,
              opacity: 0.7,
            }}
          >
            每天说一句话，天空里就多一朵云。
            漏签了也没关系，云会飘回来。
          </p>
        </div>

        {/* Footer */}
        <div
          className="text-center"
          style={{ marginTop: '24px', opacity: 0.5 }}
        >
          <p
            style={{
              color: 'var(--ink-muted)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
            }}
          >
            v0.2.0 · 用 ☁️ 做的
          </p>
        </div>
      </div>
    </div>
  );
}
