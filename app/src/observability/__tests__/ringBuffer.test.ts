import { describe, it, expect, beforeEach } from 'vitest';
import { pushEntry, readEntries, clearEntries, type RingBufferEntry } from '../ringBuffer';

describe('observability ringBuffer', () => {
  beforeEach(() => {
    clearEntries();
  });

  it('pushEntry appends in order', () => {
    pushEntry({ ts: '2026-06-23T10:00:00Z', name: 'task.created', level: 'info' });
    pushEntry({ ts: '2026-06-23T10:00:01Z', name: 'task.completed', level: 'info' });
    const entries = readEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0].name).toBe('task.created');
    expect(entries[1].name).toBe('task.completed');
  });

  it('caps at 100 entries (FIFO)', () => {
    for (let i = 0; i < 110; i++) {
      pushEntry({ ts: new Date().toISOString(), name: `e${i}`, level: 'info' });
    }
    const entries = readEntries();
    expect(entries).toHaveLength(100);
    expect(entries[0].name).toBe('e10');
    expect(entries[99].name).toBe('e109');
  });

  it('clearEntries empties the buffer', () => {
    pushEntry({ ts: '2026-06-23T10:00:00Z', name: 'x', level: 'info' });
    expect(readEntries()).toHaveLength(1);
    clearEntries();
    expect(readEntries()).toHaveLength(0);
  });

  it('preserves payload and level', () => {
    const entry: RingBufferEntry = {
      ts: '2026-06-23T10:00:00Z',
      name: 'exception',
      level: 'error',
      payload: { message: 'QuotaExceeded' },
    };
    pushEntry(entry);
    const read = readEntries()[0];
    expect(read.level).toBe('error');
    expect(read.payload?.message).toBe('QuotaExceeded');
  });
});
