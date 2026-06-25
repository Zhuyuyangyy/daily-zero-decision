import type { ObservabilityAdapter } from '../types';

/**
 * 默认 adapter：dev / staging / 生产无 Sentry 时的兜底。
 * 输出到 console 便于本地调试。
 */
export class ConsoleAdapter implements ObservabilityAdapter {
  captureException(error: unknown, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.error('[observability:exception]', error, context ?? {});
  }
  event(name: string, props?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.info(`[observability:event] ${name}`, props ?? {});
  }
}
