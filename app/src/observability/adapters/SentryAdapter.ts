import type { ObservabilityAdapter } from '../types';

/**
 * Sentry adapter stub。
 * 实接留待 Round 10（届时引入 @sentry/browser 包，填 DSN + 采样 + user context）。
 * 当前仅占位 — 适配器接口存在以便业务代码不绑死 console。
 */
export class SentryAdapter implements ObservabilityAdapter {
  private dsn: string;
  constructor(dsn: string) {
    this.dsn = dsn;
  }
  captureException(error: unknown, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.warn('[sentry-stub]', this.dsn, error, context ?? {});
  }
  event(name: string, props?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.warn('[sentry-stub]', this.dsn, name, props ?? {});
  }
}
