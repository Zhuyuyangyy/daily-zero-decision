import { useState } from 'react';
import { Preset } from '../../types';
import { generateId } from '../../utils/storage';

interface PresetManagerProps {
  presets: Preset[];
  onUpdate: (presets: Preset[]) => void;
}

const EMOJI_OPTIONS = ['📖', '📝', '💻', '🏃', '🎵', '🎨', '🧘', '🍳', '📸', '✍️', '🌱', '🎯', '🧹', '💤', '📞'];

export default function PresetManager({ presets, onUpdate }: PresetManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('📖');
  const [newValue, setNewValue] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    const preset: Preset = {
      id: generateId(),
      label: newLabel.trim(),
      icon: newIcon,
      value: newValue.trim(),
    };
    onUpdate([...presets, preset]);
    setNewLabel('');
    setNewValue('');
    setNewIcon('📖');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    onUpdate(presets.filter((p) => p.id !== id));
  };

  const startEdit = (preset: Preset) => {
    setEditId(preset.id);
    setEditLabel(preset.label);
    setEditIcon(preset.icon);
    setEditValue(preset.value);
  };

  const saveEdit = () => {
    if (!editLabel.trim() || !editValue.trim() || !editId) return;
    onUpdate(
      presets.map((p) =>
        p.id === editId
          ? { ...p, label: editLabel.trim(), icon: editIcon, value: editValue.trim() }
          : p
      )
    );
    setEditId(null);
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  return (
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2
          className="clay-text-h2"
          style={{ fontSize: 20, margin: 0 }}
        >
          快捷操作
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--mint-cloud-light)',
            color: 'var(--mint-cloud-text)',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast)',
          }}
        >
          {showAdd ? '−' : '+'}
        </button>
      </div>

      <p
        style={{
          color: 'var(--ink-light)',
          fontSize: '13px',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: '16px',
        }}
      >
        自定义你的快捷操作，它们会出现在「今天」页面的快捷按钮中。
      </p>

      {/* Add form */}
      {showAdd && (
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'var(--surface-2)',
            marginBottom: '14px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-light)',
                marginBottom: '4px',
              }}
            >
              图标
            </label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewIcon(emoji)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: newIcon === emoji
                      ? '2px solid var(--mint-cloud)'
                      : '1px solid transparent',
                    background: newIcon === emoji
                      ? 'var(--mint-cloud-light)'
                      : 'transparent',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-light)',
                marginBottom: '4px',
              }}
            >
              标签
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="如：冥想"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'var(--hairline)',
                background: 'var(--surface-0)',
                color: 'var(--ink)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-light)',
                marginBottom: '4px',
              }}
            >
              输入值
            </label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="如：冥想 10 分钟"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'var(--hairline)',
                background: 'var(--surface-0)',
                color: 'var(--ink)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newValue.trim()}
            style={{
              width: '100%',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: newLabel.trim() && newValue.trim()
                ? 'var(--mint-cloud-cta)'
                : 'var(--neutral-200)',
              color: newLabel.trim() && newValue.trim() ? 'white' : 'var(--neutral-400)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: newLabel.trim() && newValue.trim() ? 'pointer' : 'default',
              transition: 'all var(--dur-fast)',
            }}
          >
            添加
          </button>
        </div>
      )}

      {/* Preset list */}
      {presets.length === 0 ? (
        <p
          style={{
            color: 'var(--ink-faint)',
            fontSize: '13px',
            textAlign: 'center',
            padding: '16px 0',
          }}
        >
          暂无自定义快捷操作
        </p>
      ) : (
        <div>
          {presets.map((preset) => (
            <div
              key={preset.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderBottom: '1px solid var(--neutral-100)',
              }}
            >
              {editId === preset.id ? (
                <>
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    style={{
                      width: '40px',
                      textAlign: 'center',
                      fontSize: '18px',
                      padding: '6px',
                      borderRadius: '8px',
                      border: 'var(--hairline)',
                      background: 'var(--surface-0)',
                    }}
                  />
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'var(--hairline)',
                      background: 'var(--surface-0)',
                      color: 'var(--ink)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'var(--hairline)',
                      background: 'var(--surface-0)',
                      color: 'var(--ink)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <button
                    onClick={saveEdit}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--mint-cloud-cta)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'var(--hairline)',
                      background: 'var(--surface-2)',
                      color: 'var(--ink-light)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '18px' }}>{preset.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--ink)',
                    }}
                  >
                    {preset.label}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--ink-light)',
                      marginRight: '8px',
                    }}
                  >
                    {preset.value}
                  </span>
                  <button
                    onClick={() => startEdit(preset)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: 'var(--hairline)',
                      background: 'var(--surface-2)',
                      color: 'var(--ink-light)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--warm-coral)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    删除
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}