import { useState, useEffect, useCallback } from 'react';

export type FontPref = 'rounded' | 'serif' | 'sans' | 'mono';

const STORAGE_KEY = 'daily-zero-decision:font';
const DEFAULT_FONT: FontPref = 'rounded';

function loadFont(): FontPref {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'rounded' || stored === 'serif' || stored === 'sans' || stored === 'mono') {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_FONT;
}

export function useFont() {
  const [font, setFont] = useState<FontPref>(() => loadFont());

  useEffect(() => {
    document.documentElement.setAttribute('data-font', font);
    try {
      localStorage.setItem(STORAGE_KEY, font);
    } catch {
      // ignore
    }
  }, [font]);

  const setFontPref = useCallback((next: FontPref) => {
    setFont(next);
  }, []);

  return { font, setFont: setFontPref };
}
