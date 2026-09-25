import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppSummaryModal } from '../../../features/budgets/components/WhatsAppSummaryModal';
import { sanitizeWhatsAppText } from '../../../features/budgets/utils/whatsappHelper';
import * as budgetsHooks from '../../../features/budgets/hooks/useBudgets';

// Mocks dos hooks e dependências
vi.mock('../../../features/budgets/hooks/useBudgets', () => ({
  useWhatsAppSummary: vi.fn(),
  useUpdateBudgetStatus: vi.fn(),
}));

const mockOpenWhatsAppChat = vi.fn();
vi.mock('../../../features/budgets/utils/whatsappHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../features/budgets/utils/whatsappHelper')>();
  return {
    ...actual,
    openWhatsAppChat: (...args: any[]) => mockOpenWhatsAppChat(...args),
  };
});

vi.mock('react-hot-toast', () => {
  const toastMock: any = vi.fn();
  toastMock.success = vi.fn();
  toastMock.error = vi.fn();
  toastMock.custom = vi.fn();
  return {
    default: toastMock,
  };
});

describe('WhatsAppSummaryModal - Suíte de Testes Formais', () => {
  const mockMutate = vi.fn();
  const mockRefetch = vi.fn();
  const mockOnClose = vi.fn();
  const defaultSummary = 'Olá João! Segue o resumo do orçamento ORC-2026-001 no valor de R$ 1.500,00.';

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenWhatsAppChat.mockClear();

    // Mock padrão do useUpdateBudgetStatus
    vi.spyOn(budgetsHooks, 'useUpdateBudgetStatus').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    // Mock padrão do useWhatsAppSummary
    vi.spyOn(budgetsHooks, 'useWhatsAppSummary').mockReturnValue({
      data: defaultSummary,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    // Mock do window.open
    vi.stubGlobal('open', vi.fn());

    // Mock padrão do navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    if (typeof HTMLTextAreaElement.prototype.select !== 'function') {
      HTMLTextAreaElement.prototype.select = vi.fn();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /* ─────────────────────────────────────────────────────────────────────────────
   * 0. SANITIZAÇÃO DE TEXTO PARA WHATSAPP (Eliminação de corrupção ANSI/Windows)
   * ──────────────────────────────────────────────────────────────────────────── */
  describe('Sanitização de texto (sanitizeWhatsAppText)', () => {
    it('deve remover emojis de 4 bytes suscetíveis a corrupção e substituí-los por marcadores universais', () => {
      const rawBackendText = `📋 *Orçamento ORC-2026-003*
📅 Emissão: 16/09/2026 | Validade: 01/10/2026
👤 Cliente: Cliente Seed 1

📦 Itens:
• 2x Porta Correr 2F (1200x1500mm) - R$ 3.361,60

💰 Subtotal: R$ 3.361,60
🏷️ Desconto (10%): -R$ 336,16
💰 TOTAL: R$ 3.025,44
💳 Pagamento: A Combinar`;

      const sanitized = sanitizeWhatsAppText(rawBackendText);

      // Não deve conter nenhum dos emojis problemáticos
      expect(sanitized).not.toContain('📋');
      expect(sanitized).not.toContain('📅');
      expect(sanitized).not.toContain('👤');
      expect(sanitized).not.toContain('📦');
      expect(sanitized).not.toContain('💰');
      expect(sanitized).not.toContain('🏷️');
      expect(sanitized).not.toContain('💳');

      // Deve preservar as informações essenciais e formatadas
      expect(sanitized).toContain('*Orçamento ORC-2026-003*');
      expect(sanitized).toContain('• Emissão: 16/09/2026');
      expect(sanitized).toContain('• Cliente: Cliente Seed 1');
      expect(sanitized).toContain('• TOTAL: R$ 3.025,44');
    });

    it('deve retornar string vazia caso receba valor falsy', () => {
      expect(sanitizeWhatsAppText('')).toBe('');
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────────
   * 1. TABELA DE DECISÃO (Decision Table Testing)
   * ──────────────────────────────────────────────────────────────────────────── */
  describe('Técnica 1: Tabela de Decisão (Decision Table Testing)', () => {
    it('R01: [DRAFT + Fone Presente + Checkbox Marcado + WhatsApp] -> aciona openWhatsAppChat, altera para SENT e fecha modal', async () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      // Checkbox deve estar visível e marcado por padrão para DRAFT
      const checkbox = screen.getByRole('checkbox', { name: /Marcar orçamento como Enviado/i }) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.checked).toBe(true);

      const sendButton = screen.getByRole('button', { name: /abrir no whatsapp/i });
      fireEvent.click(sendButton);

      // Dispara abertura com openWhatsAppChat
      expect(mockOpenWhatsAppChat).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '83988887766',
          text: expect.any(String),
        })
      );
      // Dispara mutação para SENT
      expect(mockMutate).toHaveBeenCalledWith({ id: 'b1', status: 'SENT' });
      // Fecha o modal
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('R02: [DRAFT + Sem Fone + Checkbox Marcado + WhatsApp] -> aciona openWhatsAppChat geral, altera para SENT e fecha modal', async () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone={null}
          status="DRAFT"
        />
      );

      const sendButton = screen.getByRole('button', { name: /abrir no whatsapp/i });
      fireEvent.click(sendButton);

      expect(mockOpenWhatsAppChat).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: null,
          text: expect.any(String),
        })
      );
      expect(mockMutate).toHaveBeenCalledWith({ id: 'b1', status: 'SENT' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('R03: [DRAFT + Checkbox Desmarcado + WhatsApp] -> abre WhatsApp mas NÃO altera status', async () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /Marcar orçamento como Enviado/i });
      fireEvent.click(checkbox); // Desmarca o checkbox

      const sendButton = screen.getByRole('button', { name: /abrir no whatsapp/i });
      fireEvent.click(sendButton);

      expect(mockOpenWhatsAppChat).toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('R04: [Status SENT] -> Checkbox NÃO é exibido, exibe badge informativo e envio não dispara mutação duplicada', async () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="SENT"
        />
      );

      // Checkbox deve estar ausente para propostas que já estejam SENT
      expect(screen.queryByRole('checkbox', { name: /Marcar orçamento como Enviado/i })).not.toBeInTheDocument();
      // Badge informativo de SENT deve estar visível
      expect(screen.getByText('Status atual: Enviado (SENT)')).toBeInTheDocument();

      const sendButton = screen.getByRole('button', { name: /abrir no whatsapp/i });
      fireEvent.click(sendButton);

      expect(mockOpenWhatsAppChat).toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('R05: [DRAFT + Checkbox Marcado + Ação Copiar] -> copia para clipboard, altera para SENT e mantém modal aberto', async () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const copyButton = screen.getByRole('button', { name: /copiar texto/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultSummary);
        expect(mockMutate).toHaveBeenCalledWith({ id: 'b1', status: 'SENT' });
      });

      // Ao copiar, o modal NÃO deve ser fechado para dar controle ao usuário
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────────
   * 2. PARTICIONAMENTO DE EQUIVALÊNCIA E ANÁLISE DE VALOR LIMITE (EP / BVA)
   * ──────────────────────────────────────────────────────────────────────────── */
  describe('Técnica 2: Particionamento de Equivalência e Análise de Valor Limite', () => {
    it('CE-01 (Válido c/ máscara): deve repassar telefone para openWhatsAppChat', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="(83) 98888-7766"
          status="SENT"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /abrir no whatsapp/i }));
      expect(mockOpenWhatsAppChat).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '(83) 98888-7766',
        })
      );
    });

    it('CE-02 (Válido puro 11 dígitos): deve repassar telefone puro para openWhatsAppChat', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="SENT"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /abrir no whatsapp/i }));
      expect(mockOpenWhatsAppChat).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '83988887766',
        })
      );
    });

    it('CE-03 (Válido já com DDI 55): deve repassar para openWhatsAppChat', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="+55 (83) 98888-7766"
          status="SENT"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /abrir no whatsapp/i }));
      expect(mockOpenWhatsAppChat).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+55 (83) 98888-7766',
        })
      );
    });

    it('CE-04 (Inválido / Nulo / Curto): deve renderizar banner informativo para telefone ausente ou curto', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="123" // < 8 dígitos
          status="DRAFT"
        />
      );

      expect(screen.getByText('Cliente sem telefone cadastrado')).toBeInTheDocument();
      expect(screen.getByText(/O WhatsApp será aberto permitindo escolher o contato manualmente/i)).toBeInTheDocument();
    });

    it('BVA-01 (Valor Limite 0 - Texto Vazio): deve desabilitar botões de ação se o texto for completamente apagado', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '' } });

      const copyBtn = screen.getByRole('button', { name: /copiar texto/i });
      const sendBtn = screen.getByRole('button', { name: /abrir no whatsapp/i });

      expect(copyBtn).toBeDisabled();
      expect(sendBtn).toBeDisabled();
      expect(screen.getByText('0 caracteres')).toBeInTheDocument();
    });

    it('BVA-02 (Valor Limite 1 - Texto de 1 char): deve habilitar botões com pelo menos 1 caractere', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'A' } });

      const copyBtn = screen.getByRole('button', { name: /copiar texto/i });
      const sendBtn = screen.getByRole('button', { name: /abrir no whatsapp/i });

      expect(copyBtn).not.toBeDisabled();
      expect(sendBtn).not.toBeDisabled();
      expect(screen.getByText('1 caracteres')).toBeInTheDocument();
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────────
   * 3. TRANSIÇÃO DE ESTADOS (State Transition Testing)
   * ──────────────────────────────────────────────────────────────────────────── */
  describe('Técnica 3: Transição de Estados (State Transition Testing)', () => {
    it('deve transicionar de [Inicial] -> [Modificado] -> [Restaurado] com botão Restaurar Original', () => {
      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      // Estado Inicial: Texto original -> Botão Restaurar Original NÃO deve existir
      expect(screen.queryByRole('button', { name: /restaurar original/i })).not.toBeInTheDocument();

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(defaultSummary);

      // Transição para Estado Modificado
      fireEvent.change(textarea, { target: { value: 'Texto alterado pelo vendedor.' } });
      const restoreBtn = screen.getByRole('button', { name: /restaurar original/i });
      expect(restoreBtn).toBeInTheDocument();

      // Transição de volta para Estado Restaurado
      fireEvent.click(restoreBtn);
      expect(textarea.value).toBe(defaultSummary);
      expect(screen.queryByRole('button', { name: /restaurar original/i })).not.toBeInTheDocument();
    });

    it('deve transicionar o estado do botão de cópia: Copiar Texto -> Copiado! -> Copiar Texto após timeout', async () => {
      const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const copyBtn = screen.getByRole('button', { name: /copiar texto/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copiado!/i })).toBeInTheDocument();
      });

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

      // Dispara o callback registrado no setTimeout para simular o fim dos 2 segundos
      const timerCallback = setTimeoutSpy.mock.calls.find((call) => call[1] === 2000)?.[0] as () => void;
      act(() => {
        timerCallback();
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copiar texto/i })).toBeInTheDocument();
      });
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────────
   * 4. ROBUSTEZ, CONTINGÊNCIA E TRATAMENTO DE ERROS (Error Guessing / Fallback)
   * ──────────────────────────────────────────────────────────────────────────── */
  describe('Técnica 4: Robustez e Contingência (Error Guessing / Fallback)', () => {
    it('deve acionar fallback com select() no textarea e instrução de Ctrl+C quando clipboard.writeText rejeitar', async () => {
      // Simula navegador bloqueando permissão de escrita no clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
        writable: true,
        configurable: true,
      });

      const selectSpy = vi.spyOn(HTMLTextAreaElement.prototype, 'select');

      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const copyBtn = screen.getByRole('button', { name: /copiar texto/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(screen.getByText('Texto selecionado para cópia manual')).toBeInTheDocument();
      });
      expect(selectSpy).toHaveBeenCalled();
      expect(screen.getByText('Ctrl + C')).toBeInTheDocument();
    });

    it('deve lidar graciosamente com ausência total de navigator.clipboard (browsers antigos ou contextos inseguros)', async () => {
      // Remove o clipboard do navigator
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const selectSpy = vi.spyOn(HTMLTextAreaElement.prototype, 'select');

      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      const copyBtn = screen.getByRole('button', { name: /copiar texto/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(selectSpy).toHaveBeenCalled();
        expect(screen.getByText('Texto selecionado para cópia manual')).toBeInTheDocument();
      });
    });

    it('deve exibir mensagem de erro amigável e permitir tentar novamente se a API falhar', () => {
      vi.spyOn(budgetsHooks, 'useWhatsAppSummary').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as any);

      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      expect(screen.getByText('Falha ao carregar o resumo')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('deve exibir spinner durante o carregamento inicial', () => {
      vi.spyOn(budgetsHooks, 'useWhatsAppSummary').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: mockRefetch,
      } as any);

      render(
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={mockOnClose}
          budgetId="b1"
          budgetCode="ORC-2026-001"
          customerPhone="83988887766"
          status="DRAFT"
        />
      );

      expect(screen.getByText('Carregando resumo oficial do orçamento...')).toBeInTheDocument();
    });
  });
});
