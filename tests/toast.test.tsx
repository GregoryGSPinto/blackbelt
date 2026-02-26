// ============================================================
// ToastContext — Unit Test
// ============================================================
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { type ReactNode } from 'react';

// Mock createPortal since we're in jsdom
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...(actual as object),
    createPortal: (node: ReactNode) => node,
  };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useToast', () => {
  it('should provide success, error, info, warning methods', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.success).toBeTypeOf('function');
    expect(result.current.error).toBeTypeOf('function');
    expect(result.current.info).toBeTypeOf('function');
    expect(result.current.warning).toBeTypeOf('function');
    expect(result.current.dismiss).toBeTypeOf('function');
  });

  it('should not throw when calling toast methods', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    expect(() => {
      act(() => result.current.success('Test success'));
    }).not.toThrow();

    expect(() => {
      act(() => result.current.error('Test error'));
    }).not.toThrow();
  });
});
