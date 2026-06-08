import { exportState } from '../utils/storage';
import { copy } from '../utils/copy';
import type { AppState, Preset } from '../types';
import type { FontPref } from '../hooks/useFont';
import { SoftButton } from '../components/ui';

interface SettingsPageProps {
  state: AppState;
  presets: Preset[]; // 保留字段，已不再使用，但避免破坏调用方
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
  { id: 'rounded', label: '圆润', desc: '默认 · 暖圆体', preview: 'Aa 养一朵云' },
  { id: 'serif',   label: '书卷', desc: '宋体 / Noto Serif', preview: 'Aa 养一朵云' },
  { id: 'sans',    label: '现代', desc: '系统无衬线', preview: 'Aa 养一朵云' },
  { id: 'mono',    label: '极客', desc: '等宽字体', preview: 'Aa 养一朵云' },
];

/**
 * 设置页 — Round 4 精简
 * 保留 4 块：字体 / 数据管理 / 重置 / 关于
 * 预设管理移到「添加任务」的二级入口（TodayPage 里）
 */
export default function SettingsPage({
  state,
  presets: _presets,
  onUpdatePresets: _onUpdatePresets,
  onImport,
  font,
  onFontChange,
}: SettingsPageProps) {
  void _presets; void _onUpdatePresets;

  return (
    <div
      className="clay-content clay-scroll-area"
      style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '100px' }}
    >
      <div className="w-full max-w-md mx-auto" style={{ padding: '24px 16px' }}>
        <h1
          className="clay-text-h1 clay-balance tracking-heading"
          style={{ fontSize: 32, textAlign: 'center', marginBottom: 20 }}
        >
          设置
        </h1>

        {/* 字体偏好 */}
        <section className="clay-settings-section">
          <h2 className="clay-settings-section__title">字体偏好</h2>
          <p className="clay-settings-section__desc">
            切换页面使用的字体系列，使用系统自带字体无需联网。
          </p>
          <div className="clay-settings-section__grid">
            {FONT_OPTIONS.map((opt) => {
              const isActive = font === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFontChange(opt.id)}
                  aria-pressed={isActive}
                  className="clay-font-card"
                  data-active={isActive}
                >
                  <span
                    className="clay-font-card__preview"
                    style={{
                      fontFamily: `var(--stack-${opt.id === 'rounded' ? 'rounded' : opt.id})`,
                    }}
                  >
                    {opt.preview}
                  </span>
                  <span className="clay-font-card__label">
                    {opt.label} · {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 数据管理 */}
        <section className="clay-settings-section">
          <h2 className="clay-settings-section__title">数据管理</h2>
          <p className="clay-settings-section__desc">
            导出或导入你的数据，云朵不会丢。
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <SoftButton variant="ghost" size="md" block onClick={() => exportState(state)}>
              📤 导出
            </SoftButton>
            <SoftButton variant="ghost" size="md" block onClick={onImport}>
              📥 导入
            </SoftButton>
          </div>
        </section>

        {/* 重置 */}
        <section className="clay-settings-section">
          <h2 className="clay-settings-section__title">重置数据</h2>
          <p className="clay-settings-section__desc">
            清空所有任务记录和连续天数，天空会回到最初的样子。
          </p>
          <SoftButton
            variant="ghost"
            size="md"
            block
            onClick={() => {
              if (window.confirm(copy.resetConfirm())) {
                localStorage.removeItem('daily-zero-decision');
                window.location.reload();
              }
            }}
            style={{ color: 'var(--warm-coral)' }}
          >
            {copy.reset()}
          </SoftButton>
        </section>

        {/* 关于 */}
        <section className="clay-settings-section">
          <h2 className="clay-settings-section__title">关于</h2>
          <p className="clay-settings-section__desc">每日零决策卡 · 养一朵云</p>
          <p
            className="clay-settings-section__desc"
            style={{ opacity: 0.7, marginTop: 4 }}
          >
            每天说一句话，天空里就多一朵云。
            漏签了也没关系，云会飘回来。
          </p>
        </section>

        <div className="text-center" style={{ marginTop: 24, opacity: 0.5 }}>
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
