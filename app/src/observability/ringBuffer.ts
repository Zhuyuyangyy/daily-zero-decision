/**
 * 内存 ring buffer：最近 100 条事件 + 异常，供 Settings「导出诊断」读取。
 * 不依赖 Dexie（Round 6 阶段）—— Round 7 落地 Dexie 后可改为 _events 表落盘。
 */

export interface RingBufferEntry {
  ts: string;
  name: string;
  level: 'info' | 'warn' | 'error';
  payload?: Record<string, unknown>;
}

const RING_BUFFER_LIMIT = 100;
const buffer: RingBufferEntry[] = [];

export function pushEntry(entry: RingBufferEntry): void {
  buffer.push(entry);
  if (buffer.length > RING_BUFFER_LIMIT) buffer.shift();
}

export function readEntries(): RingBufferEntry[] {
  return [...buffer];
}

export function clearEntries(): void {
  buffer.length = 0;
}
