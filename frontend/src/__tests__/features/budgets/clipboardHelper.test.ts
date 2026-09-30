import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from '../../../features/budgets/utils/clipboardHelper';

describe('clipboardHelper - Utilitário de Cópia com Fallback HTTP (BUG-028 / Issue #373)', () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('deve retornar false quando o texto for vazio, nulo ou indefinido', async () => {
    expect(await copyToClipboard('')).toBe(false);
    // @ts-expect-error testando fallback de parâmetro nulo
    expect(await copyToClipboard(null)).toBe(false);
    // @ts-expect-error testando fallback de parâmetro indefinido
    expect(await copyToClipboard(undefined)).toBe(false);
  });

  it('deve copiar com sucesso via navigator.clipboard.writeText em Secure Context (HTTPS/localhost)', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          writeText: writeTextMock,
        },
      },
      configurable: true,
      writable: true,
    });

    const result = await copyToClipboard('Orçamento ORC-2026-001 aprovado');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('Orçamento ORC-2026-001 aprovado');
  });

  it('[BUG-028] deve acionar fallback com textarea e document.execCommand quando navigator.clipboard for undefined (HTTP em rede local)', async () => {
    // Simula ambiente HTTP de oficina sem SSL onde navigator.clipboard é undefined
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: undefined,
      },
      configurable: true,
      writable: true,
    });

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    document.execCommand = vi.fn().mockReturnValue(true);

    const result = await copyToClipboard('Resumo em rede local HTTP');

    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('deve acionar fallback com document.execCommand quando navigator.clipboard.writeText for rejeitado', async () => {
    // Simula permissão negada pelo navegador
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      },
      configurable: true,
      writable: true,
    });

    document.execCommand = vi.fn().mockReturnValue(true);

    const result = await copyToClipboard('Texto após rejeição da API moderna');

    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('deve retornar false e limpar o DOM caso tanto a Clipboard API quanto execCommand falhem', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: undefined,
      },
      configurable: true,
      writable: true,
    });

    document.execCommand = vi.fn().mockReturnValue(false);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const result = await copyToClipboard('Texto com falha total');

    expect(result).toBe(false);
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
