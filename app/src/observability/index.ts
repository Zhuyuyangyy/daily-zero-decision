import type { ObservabilityAdapter } from './types';
import { ConsoleAdapter } from './adapters/ConsoleAdapter';
import { pushEntry } from './ringBuffer';

let adapter: ObservabilityAdapter = new ConsoleAdapter();

export function setAdapter(a: ObservabilityAdapter): void {
  adapter = a;
}
export function getAdapter(): ObservabilityAdapter {
  return adapter;
}

/**
 * 全局可观测单例。
 * 业务代码调用 observability.event('task.completed', { id })，
 * 不直接依赖具体后端（console / Sentry / ...）。
 */
export const observability = {
  captureException(error: unknown, context?: Record<string, unknown>): void {
    adapter.captureException(error, context);
    pushEntry({
      ts: new Date().toISOString(),
      name: 'exception',
      level: 'error',
      payload: { message: error instanceof Error ? error.message : String(error), ...(context ?? {}) },
    });
  },
  event(name: string, props?: Record<string, unknown>): void {
    adapter.event(name, props);
    pushEntry({
      ts: new Date().toISOString(),
      name,
      level: 'info',
      payload: props,
    });
  },
};
