import { useState, useEffect } from 'react';
import './PetNameModal.css';

interface PetNameModalProps {
  isOpen: boolean;
  currentName: string;
  isFirstMeet: boolean;        // 第一次见面 vs 设置页改名
  onConfirm: (name: string) => boolean;
  onClose: () => void;
}

/**
 * PetNameModal — 给云猫改名字
 *
 * - 最多 8 字（trim + slice）
 * - 空字符串不保存
 * - 第一次见面时显示欢迎文案
 */
export function PetNameModal({ isOpen, currentName, isFirstMeet, onConfirm, onClose }: PetNameModalProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  // Escape 关闭
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (onConfirm(name)) onClose();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="pet-name-modal__backdrop" onClick={onClose} role="presentation">
      <div
        className="pet-name-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-name-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pet-name-modal__title" id="pet-name-modal-title">
          {isFirstMeet ? '它今天陪你完成了第一步' : '给宠物改个名字'}
        </h2>
        <p className="pet-name-modal__desc">
          {isFirstMeet
            ? '要给它取个名字吗？也可以以后再说。'
            : '新名字会代替现在的称呼。'}
        </p>
        <label htmlFor="pet-name-modal-input" className="pet-name-modal__label" style={{ position: 'absolute', left: -9999 }}>
          宠物名字
        </label>
        <input
          id="pet-name-modal-input"
          className="pet-name-modal__input"
          type="text"
          maxLength={8}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="比如：豆豆 / 小云 / 阿白"
          autoFocus
          aria-label="宠物名字（最多 8 字）"
        />
        <p className="pet-name-modal__hint">最多 8 个字</p>
        <div className="pet-name-modal__actions">
          <button
            className="pet-name-modal__btn pet-name-modal__btn--ghost"
            onClick={onClose}
          >
            {isFirstMeet ? '以后再说' : '取消'}
          </button>
          <button
            className="pet-name-modal__btn pet-name-modal__btn--primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
