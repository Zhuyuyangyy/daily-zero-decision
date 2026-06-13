import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SkyScene } from '../SkyScene';

describe('SkyScene', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('基本冒烟渲染', () => {
    const { container } = render(
      <SkyScene mood="dawn" density="comfortable" variant="today">
        <div data-testid="child">child</div>
      </SkyScene>
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('density=minimal 时不渲染 Birds / Balloon', () => {
    const { container } = render(
      <SkyScene mood="dawn" density="minimal" variant="today">
        <div>child</div>
      </SkyScene>
    );
    expect(container.querySelector('.sky-bird')).toBeNull();
    expect(container.querySelector('.sky-balloon')).toBeNull();
  });

  it('variant=garden 时不渲染 ForegroundFade', () => {
    const { container } = render(
      <SkyScene mood="dawn" density="comfortable" variant="garden">
        <div>child</div>
      </SkyScene>
    );
    expect(container.querySelector('[data-sky-layer="foreground-fade"]')).toBeNull();
  });

  it('variant=today 时渲染 ForegroundFade', () => {
    const { container } = render(
      <SkyScene mood="dawn" density="comfortable" variant="today">
        <div>child</div>
      </SkyScene>
    );
    expect(container.querySelector('[data-sky-layer="foreground-fade"]')).not.toBeNull();
  });

  it('装饰层都有 aria-hidden=true', () => {
    const { container } = render(
      <SkyScene mood="dawn" density="comfortable" variant="today">
        <div>child</div>
      </SkyScene>
    );
    const decorativeLayers = container.querySelectorAll('[data-sky-layer]');
    decorativeLayers.forEach((el) => {
      expect(el.getAttribute('aria-hidden')).toBe('true');
    });
  });
});