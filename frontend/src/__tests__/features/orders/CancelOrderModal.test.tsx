import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CancelOrderModal } from '../../../features/orders/components/CancelOrderModal';

describe('CancelOrderModal — [US-15.1 / BUG-044] Modal de Cancelamento de Pedido', () => {
  const defaultProps = {
    isOpen: true,
    orderCodigo: 'OS-2026-0001',
    isSubmitting: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[Partição de Equivalência] Renderização e Estrutura', () => {
    it('não deve renderizar no DOM quando isOpen for false', () => {
      render(<CancelOrderModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('cancel-order-modal')).not.toBeInTheDocument();
    });

    it('deve renderizar o modal com os dados da ordem de serviço quando isOpen for true', () => {
      render(<CancelOrderModal {...defaultProps} />);

      expect(screen.getByTestId('cancel-order-modal')).toBeInTheDocument();
      expect(screen.getByText('Cancelar Ordem de Serviço')).toBeInTheDocument();
      expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
      expect(screen.getByLabelText(/Justificativa Obrigatória/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Voltar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar Cancelamento/i })).toBeInTheDocument();
    });
  });

  describe('[Análise de Valor Limite] Validação da Justificativa (Mínimo 10 caracteres)', () => {
    it('deve rejeitar justificativa com 9 caracteres (fronteira inferior inválida) e não disparar onConfirm', async () => {
      const onConfirm = vi.fn();
      render(<CancelOrderModal {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByLabelText(/Justificativa Obrigatória/i);
      fireEvent.change(textarea, { target: { value: '123456789' } }); // 9 chars

      const submitButton = screen.getByRole('button', { name: /Confirmar Cancelamento/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/A justificativa de cancelamento deve ter pelo menos 10 caracteres/i)).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('deve aceitar justificativa com 10 caracteres (fronteira válida mínima) e chamar onConfirm', async () => {
      const onConfirm = vi.fn();
      render(<CancelOrderModal {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByLabelText(/Justificativa Obrigatória/i);
      fireEvent.change(textarea, { target: { value: '1234567890' } }); // 10 chars

      const submitButton = screen.getByRole('button', { name: /Confirmar Cancelamento/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith({ justificativa: '1234567890' });
      });
    });
  });

  describe('[Transição de Estados & BUG-044] Comportamento da tecla Escape e Fechamento', () => {
    it('deve fechar o modal e resetar o formulário via tecla Escape quando isSubmitting for false', () => {
      const onClose = vi.fn();
      render(<CancelOrderModal {...defaultProps} onClose={onClose} isSubmitting={false} />);

      const textarea = screen.getByLabelText(/Justificativa Obrigatória/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Cancelamento por desistência do cliente' } });
      expect(textarea.value).toBe('Cancelamento por desistência do cliente');

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(textarea.value).toBe('');
    });

    it('[BUG-044] NÃO deve fechar nem resetar o modal ao pressionar Escape quando isSubmitting for true', () => {
      const onClose = vi.fn();
      render(<CancelOrderModal {...defaultProps} onClose={onClose} isSubmitting={true} />);

      const textarea = screen.getByLabelText(/Justificativa Obrigatória/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Cancelamento em processamento no servidor' } });

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
      expect(textarea.value).toBe('Cancelamento em processamento no servidor');
    });

    it('deve ignorar clique no backdrop escurecido quando isSubmitting for true', () => {
      const onClose = vi.fn();
      render(<CancelOrderModal {...defaultProps} onClose={onClose} isSubmitting={true} />);

      const backdrop = screen.getByLabelText(/Fechar fundo do modal/i);
      expect(backdrop).toBeDisabled();

      fireEvent.click(backdrop);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('deve ignorar clique no botão "X" de fechar quando isSubmitting for true', () => {
      const onClose = vi.fn();
      render(<CancelOrderModal {...defaultProps} onClose={onClose} isSubmitting={true} />);

      const closeButton = screen.getByLabelText(/Fechar modal/i);
      expect(closeButton).toBeDisabled();

      fireEvent.click(closeButton);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('deve desabilitar textarea, botões de ação e exibir feedback visual durante submissão', () => {
      render(<CancelOrderModal {...defaultProps} isSubmitting={true} />);

      const textarea = screen.getByLabelText(/Justificativa Obrigatória/i);
      const submitButton = screen.getByRole('button', { name: /Cancelando\.\.\./i });
      const backButton = screen.getByRole('button', { name: /Voltar/i });

      expect(textarea).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(backButton).toBeDisabled();
    });

    it('deve fechar normalmente e resetar formulário ao clicar no botão "Voltar" quando isSubmitting for false', () => {
      const onClose = vi.fn();
      render(<CancelOrderModal {...defaultProps} onClose={onClose} isSubmitting={false} />);

      const textarea = screen.getByLabelText(/Justificativa Obrigatória/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Texto preenchido antes de voltar' } });

      const backButton = screen.getByRole('button', { name: /Voltar/i });
      fireEvent.click(backButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(textarea.value).toBe('');
    });

    it('deve ignorar outras teclas que não sejam Escape (ex: Enter)', () => {
      const onClose = vi.fn();
      render(<CancelOrderModal {...defaultProps} onClose={onClose} isSubmitting={false} />);

      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('deve bloquear o scroll do body quando aberto e restaurar ao desmontar', () => {
      const { unmount } = render(<CancelOrderModal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
