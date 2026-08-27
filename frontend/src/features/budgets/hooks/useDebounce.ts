import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores com cleanup automático de timer.
 * @param value Valor a ser observado
 * @param delayMs Tempo de espera em milissegundos (padrão: 300ms)
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
