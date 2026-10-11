import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RealCloud from '../RealCloud';

describe('RealCloud — 摸云互动', () => {
  it('lg 尺寸渲染为可点击按钮,带 aria-label', () => {
    render(<RealCloud size="lg" />);
    const btn = screen.getByRole('button', { name: '摸一摸这朵云' });
    expect(btn).toBeTruthy();
  });

  it('md 尺寸可交互,sm/xs 不可交互(避免背景小云抢焦点)', () => {
    const { unmount } = render(<RealCloud size="md" />);
    expect(screen.getByRole('button', { name: '摸一摸这朵云' })).toBeTruthy();
    unmount();

    render(<RealCloud size="sm" />);
    expect(screen.queryByRole('button', { name: '摸一摸这朵云' })).toBeNull();
  });

  it('点击后冒出萌语气泡(role=status),约 1s 后消失', () => {
    vi.useFakeTimers();
    const { unmount } = render(<RealCloud size="lg" />);
    const btn = screen.getByRole('button', { name: '摸一摸这朵云' });

    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(btn);
    const bubble = screen.getByRole('status');
    expect(bubble.textContent!.length).toBeGreaterThan(0);

    // 900ms 后气泡回收(advance 需在 act 内以触发 React 重渲染)
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByRole('status')).toBeNull();
    unmount();
    vi.useRealTimers();
  });

  it('连点不会堆积多个气泡,计时器被重置', () => {
    vi.useFakeTimers();
    const { unmount } = render(<RealCloud size="lg" />);
    const btn = screen.getByRole('button', { name: '摸一摸这朵云' });

    fireEvent.click(btn);
    vi.advanceTimersByTime(500);
    fireEvent.click(btn);
    // 第一次的 500ms 已过期,但第二次点击重置了计时器 → 气泡仍在
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByRole('status')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('status')).toBeNull();
    unmount();
    vi.useRealTimers();
  });

  it('onPoke 回调被透传调用', () => {
    const onPoke = vi.fn();
    const { unmount } = render(<RealCloud size="lg" onPoke={onPoke} />);
    fireEvent.click(screen.getByRole('button', { name: '摸一摸这朵云' }));
    expect(onPoke).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('键盘 Enter/Space 也能触发萌互动', () => {
    const { unmount } = render(<RealCloud size="lg" />);
    const btn = screen.getByRole('button', { name: '摸一摸这朵云' });
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(screen.getByRole('status')).toBeTruthy();
    unmount();
  });
});
