import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '@/features/budgets/hooks/useDebounce';

describe('useDebounce (Hook de Temporização)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[Técnica: Análise do Valor Limite - Valor Inicial] deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('texto inicial', 300));
    expect(result.current).toBe('texto inicial');
  });

  it('[Técnica: Temporização / Fake Timers] deve atualizar o valor somente após o tempo de delay expirar', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'primeiro', delay: 300 } }
    );

    expect(result.current).toBe('primeiro');

    // Altera a prop do hook
    rerender({ val: 'segundo', delay: 300 });

    // Antes do tempo expirar, mantém o valor anterior
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('primeiro');

    // Após completar os 300ms, atualiza para o novo valor
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('segundo');
  });

  it('[Técnica: Classes de Equivalência - Disparos Rápidos Sucessivos] deve descartar valores intermediários', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val, 200),
      { initialProps: { val: 'a' } }
    );

    rerender({ val: 'ab' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ val: 'abc' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ val: 'abcd' });

    // Espera o tempo completo de 200ms após o último disparo
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('abcd');
  });
});
