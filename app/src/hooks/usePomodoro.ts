import { useState } from 'react';

/**
 * Pomodoro state hook.
 */
export function usePomodoro() {
  const [pomodoroExpanded, setPomodoroExpanded] = useState(false);

  return {
    pomodoroExpanded,
    setPomodoroExpanded,
  };
}
