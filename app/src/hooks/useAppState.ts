import { useState, useEffect, useCallback } from 'react';
import { AppState } from '../types';
import { loadState, saveState, importState } from '../utils/storage';

/**
 * Core app state hook with localStorage persistence.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  // Persist state to localStorage
  useEffect(() => {
    saveState(state);
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

  return { state, setState, handleImportData };
}
