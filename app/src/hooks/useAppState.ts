import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from '../types';
import { loadState, saveState, importState, StorageQuotaError } from '../utils/storage';

/**
 * Core app state hook with localStorage persistence.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [saveError, setSaveError] = useState<string | null>(null);
  const firstSaveRef = useRef(true);

  // Persist state to localStorage
  useEffect(() => {
    // 跳过首次渲染的保存：state 来自 loadState，写回是冗余 IO
    if (firstSaveRef.current) {
      firstSaveRef.current = false;
      return;
    }
    try {
      saveState(state);
      setSaveError(null);
    } catch (e) {
      const msg = e instanceof StorageQuotaError
        ? e.message
        : '保存失败：未知错误';
      setSaveError(msg);
      // eslint-disable-next-line no-console
      console.error('[useAppState] save failed', e);
    }
  }, [state]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const next = importState(reader.result as string);
        if (!next) {
          alert('文件格式不正确');
          return;
        }
        if (window.confirm('导入数据将覆盖当前数据，确定继续？')) {
          setState(next);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return { state, setState, handleImportData, saveError };
}
