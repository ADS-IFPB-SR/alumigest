import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cleanPhoneNumber,
  openWhatsAppChat,
  buildCommercialPdfMessage,
  shareCommercialPdfLink,
  isMobileDevice,
} from '../../../features/budgets/utils/whatsappHelper';

describe('whatsappHelper - Suíte de Testes Formais (Mobile & Desktop)', () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock do window.open
    vi.stubGlobal('open', vi.fn().mockReturnValue({ focus: vi.fn() }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  describe('isMobileDevice', () => {
    it('deve identificar Android, iPhone e iPad como dispositivos móveis', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G981B)' },
        configurable: true,
      });
      expect(isMobileDevice()).toBe(true);

      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
        configurable: true,
      });
      expect(isMobileDevice()).toBe(true);
    });

    it('deve identificar navegadores desktop do Windows e Mac tradicional como não-móveis', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0' },
        configurable: true,
      });
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('cleanPhoneNumber', () => {
    it('deve extrair apenas dígitos de telefone com máscara brasileira', () => {
      expect(cleanPhoneNumber('(83) 98888-7766')).toBe('83988887766');
    });

    it('deve remover DDI 55 quando já fornecido para evitar duplicação', () => {
      expect(cleanPhoneNumber('+55 (83) 98888-7766')).toBe('83988887766');
      expect(cleanPhoneNumber('5583988887766')).toBe('83988887766');
    });

    it('deve retornar string vazia para telefone nulo ou indefinido', () => {
      expect(cleanPhoneNumber(null)).toBe('');
      expect(cleanPhoneNumber(undefined)).toBe('');
    });
  });

  describe('buildCommercialPdfMessage', () => {
    it('deve gerar mensagem estruturada contendo o link direto para o PDF e assinatura', () => {
      const message = buildCommercialPdfMessage('ORC-2026-001', 'b1');
      expect(message).toContain('*ORC-2026-001*');
      expect(message).toContain('/api/orcamentos/b1/pdf/comercial');
      expect(message).toContain('Alumiportas - Vidraçaria e Esquadrias');
    });

    it('em ambiente localhost deve usar wildcard nip.io para ativar link clicável no WhatsApp', () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        origin: 'http://localhost:5173',
        hostname: 'localhost',
        port: '5173',
      } as any;

      const message = buildCommercialPdfMessage('ORC-2026-001', 'b1');
      expect(message).toContain('http://127.0.0.1.nip.io:5173/api/orcamentos/b1/pdf/comercial');

      window.location = originalLocation;
    });
  });

  describe('openWhatsAppChat', () => {
    it('no Mobile: deve redirecionar para api.whatsapp.com com telefone e texto', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
        configurable: true,
      });

      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { href: '' } as any;

      openWhatsAppChat({
        phone: '83988887766',
        text: 'Olá Cliente!',
      });

      expect(window.location.href).toContain('https://api.whatsapp.com/send?phone=5583988887766&text=Ol%C3%A1%20Cliente!');

      window.location = originalLocation;
    });

    it('no Desktop: deve abrir diretamente o WhatsApp Web com foco na aba reutilizável whatsapp_web_window', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        configurable: true,
      });

      openWhatsAppChat({
        phone: '83988887766',
        text: 'Proposta Comercial',
      });

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://web.whatsapp.com/send?phone=5583988887766&text='),
        'whatsapp_web_window'
      );
    });
  });

  describe('shareCommercialPdfLink', () => {
    it('deve disparar abertura no WhatsApp com link direto do PDF e executar onSuccess sem forçar download local', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        configurable: true,
      });

      const onSuccess = vi.fn();
      shareCommercialPdfLink({
        budgetId: 'b1',
        budgetCode: 'ORC-2026-001',
        customerPhone: '83988887766',
        onSuccess,
      });

      // Executa callback de transição de status
      expect(onSuccess).toHaveBeenCalledTimes(1);

      // Abre o WhatsApp Web com o link do PDF direto na mensagem
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://web.whatsapp.com/send?phone=5583988887766&text='),
        'whatsapp_web_window'
      );

      const calledUrl = (window.open as any).mock.calls[0][0];
      expect(decodeURIComponent(calledUrl)).toContain('/api/orcamentos/b1/pdf/comercial');
    });

    it('deve funcionar mesmo para cliente sem telefone, abrindo seleção de contato com o link', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        configurable: true,
      });

      const onSuccess = vi.fn();
      shareCommercialPdfLink({
        budgetId: 'b1',
        budgetCode: 'ORC-2026-001',
        customerPhone: null,
        onSuccess,
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://web.whatsapp.com/send?text='),
        'whatsapp_web_window'
      );
    });
  });
});
