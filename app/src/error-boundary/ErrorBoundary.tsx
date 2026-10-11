import { Component, type ErrorInfo, type ReactNode } from 'react';
import { observability } from '../observability';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** 用于 observability 区分不同边界 */
  name?: string;
}

interface State {
  error: Error | null;
}

/**
 * 通用 ErrorBoundary：
 * - role=alert + aria-live=assertive（屏幕阅读器自动播报）
 * - 失败 → observability.captureException（不进 console.log，进 ring buffer）
 * - 降级 UI：友好文案 + 重试按钮
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    observability.captureException(error, {
      boundary: this.props.name ?? 'unnamed',
      componentStack: info.componentStack ?? '',
    });
    observability.event('ui.error.boundary', {
      boundary: this.props.name ?? 'unnamed',
      message: error.message,
    });
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: 24,
            textAlign: 'center',
            color: 'var(--ink, #333)',
          }}
        >
          <h2 style={{ marginBottom: 8 }}>这里出了一点小问题</h2>
          <p style={{ marginBottom: 16, color: 'var(--ink-light, #666)' }}>
            {this.state.error.message || '未知错误'}
          </p>
          <button
            type="button"
            onClick={this.reset}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--mint-cloud-cta, #4AB574)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
