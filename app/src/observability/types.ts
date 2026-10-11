/**
 * Observability adapter interface.
 *
 * Round 7+：业务代码通过 observability.event/captureException 调用，
 * 不绑死具体后端（console / Sentry / 自建 ingest）。
 * 默认 ConsoleAdapter；未来 import.meta.env.VITE_SENTRY_DSN 存在时切到 SentryAdapter。
 */
export interface ObservabilityAdapter {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  event(name: string, props?: Record<string, unknown>): void;
}
