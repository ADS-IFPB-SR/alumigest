import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ScrapLossModal } from '@/features/stock/components/ScrapLossModal';
import { stockApi } from '@/features/stock/api/stockApi';

vi.mock('@/features/stock/api/stockApi', () => ({
  stockApi: {
    registerMovement: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('ScrapLossModal — [US-21.7] Modal de Registro de Perdas/Sucata', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    materialId: 'mat-uuid-al-01',
    materialSku: 'AL-PER-001',
    materialName: 'Perfil de Alumínio Tubular 50x50',
    unitMeasure: 'M',
    currentPhysical: 25.5,
    currentReserved: 5.0,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[Partição de Equivalência] Renderização e Estrutura', () => {
    it('não deve renderizar no DOM quando isOpen for false', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} isOpen={false} />
        </Wrapper>
      );
      expect(screen.queryByTestId('modal-scrap-loss')).not.toBeInTheDocument();
    });

    it('deve renderizar o modal com os dados do material quando isOpen for true', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} />
        </Wrapper>
      );

      expect(screen.getByTestId('modal-scrap-loss')).toBeInTheDocument();
      expect(screen.getByText('Registrar Perda / Sucata')).toBeInTheDocument();
      expect(screen.getByText('Perfil de Alumínio Tubular 50x50')).toBeInTheDocument();
      expect(screen.getByText(/SKU: AL-PER-001/i)).toBeInTheDocument();
      expect(screen.getAllByText(/25.5 M/i).length).toBeGreaterThan(0);
      expect(screen.getByTestId('input-scrap-quantity')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-scrap-reason')).toBeInTheDocument();
      expect(screen.getByTestId('btn-scrap-submit')).toBeInTheDocument();
      expect(screen.getByTestId('btn-scrap-cancel')).toBeInTheDocument();
    });
  });

  describe('[Análise de Valor Limite] Validação de Quantidade', () => {
    it('deve rejeitar submissão com quantidade zero ou negativa e exibir mensagem de erro', async () => {
      const onConfirm = vi.fn();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} onConfirm={onConfirm} />
        </Wrapper>
      );

      const quantityInput = screen.getByTestId('input-scrap-quantity');
      const reasonTextarea = screen.getByTestId('textarea-scrap-reason');
      const submitBtn = screen.getByTestId('btn-scrap-submit');

      // Preenche com 0 e justificativa válida
      fireEvent.change(quantityInput, { target: { value: '0' } });
      fireEvent.change(reasonTextarea, { target: { value: 'Justificativa válida' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/A quantidade deve ser estritamente maior que zero/i)
        ).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('deve exibir aviso visual amarelo quando a quantidade informada ultrapassar o estoque físico (RN-03)', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} currentPhysical={10} />
        </Wrapper>
      );

      const quantityInput = screen.getByTestId('input-scrap-quantity');
      fireEvent.change(quantityInput, { target: { value: '15' } });

      await waitFor(() => {
        expect(
          screen.getByText(/Atenção: A quantidade informada \(15\) é maior que o saldo físico/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('[Análise de Valor Limite] Validação da Justificativa (Mínimo 5 caracteres)', () => {
    it('deve rejeitar justificativa com menos de 5 caracteres', async () => {
      const onConfirm = vi.fn();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} onConfirm={onConfirm} />
        </Wrapper>
      );

      const quantityInput = screen.getByTestId('input-scrap-quantity');
      const reasonTextarea = screen.getByTestId('textarea-scrap-reason');
      const submitBtn = screen.getByTestId('btn-scrap-submit');

      fireEvent.change(quantityInput, { target: { value: '3.5' } });
      fireEvent.change(reasonTextarea, { target: { value: 'Erro' } }); // 4 chars
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/A justificativa da perda deve conter pelo menos 5 caracteres/i)
        ).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('[Interação com Presets de Motivo]', () => {
    it('deve preencher a justificativa automaticamente ao clicar no chip de preset', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} />
        </Wrapper>
      );

      const firstPresetChip = screen.getByTestId('preset-chip-0');
      fireEvent.click(firstPresetChip);

      const reasonTextarea = screen.getByTestId('textarea-scrap-reason') as HTMLTextAreaElement;
      await waitFor(() => {
        expect(reasonTextarea.value).toBe('Erro de corte na bancada');
      });
    });
  });

  describe('[Submissão e Ciclo de Vida]', () => {
    it('deve submeter o payload correto via onConfirm quando os dados forem válidos', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ScrapLossModal
            {...defaultProps}
            onClose={onClose}
            onSuccess={onSuccess}
            onConfirm={onConfirm}
          />
        </Wrapper>
      );

      const quantityInput = screen.getByTestId('input-scrap-quantity');
      const reasonTextarea = screen.getByTestId('textarea-scrap-reason');
      const docInput = screen.getByTestId('input-scrap-doc');
      const submitBtn = screen.getByTestId('btn-scrap-submit');

      fireEvent.change(quantityInput, { target: { value: '2.5' } });
      fireEvent.change(reasonTextarea, { target: { value: 'Quebra durante o manuseio na montagem' } });
      fireEvent.change(docInput, { target: { value: 'OS-2026-0099' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith({
          materialId: 'mat-uuid-al-01',
          type: 'SCRAP_LOSS',
          quantity: 2.5,
          reason: 'Quebra durante o manuseio na montagem',
          referenceDocument: 'OS-2026-0099',
          registeredBy: 'Oficina / Fábrica',
        });
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('deve chamar o hook de mutação stockApi.registerMovement quando onConfirm não for fornecido', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      vi.mocked(stockApi.registerMovement).mockResolvedValueOnce({
        id: 'mov-1',
        stockItemId: 'si-1',
        materialId: 'mat-uuid-al-01',
        materialSku: 'AL-PER-001',
        materialName: 'Perfil de Alumínio',
        type: 'SCRAP_LOSS',
        quantity: 1.0,
        previousPhysicalQuantity: 10,
        newPhysicalQuantity: 9,
        reason: 'Perfil empenado de fábrica',
        createdAt: '2026-11-17T18:00:00Z',
      });

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal
            {...defaultProps}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </Wrapper>
      );

      const quantityInput = screen.getByTestId('input-scrap-quantity');
      const reasonTextarea = screen.getByTestId('textarea-scrap-reason');
      const submitBtn = screen.getByTestId('btn-scrap-submit');

      fireEvent.change(quantityInput, { target: { value: '1.0' } });
      fireEvent.change(reasonTextarea, { target: { value: 'Perfil empenado de fábrica' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(stockApi.registerMovement).toHaveBeenCalledWith({
          materialId: 'mat-uuid-al-01',
          type: 'SCRAP_LOSS',
          quantity: 1.0,
          reason: 'Perfil empenado de fábrica',
          referenceDocument: undefined,
          registeredBy: 'Oficina / Fábrica',
        });
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('[Atalhos e Acessibilidade]', () => {
    it('deve fechar o modal ao pressionar a tecla Escape', () => {
      const onClose = vi.fn();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} onClose={onClose} />
        </Wrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('deve fechar o modal ao clicar no botão de fechar (X) ou no botão Cancelar', () => {
      const onClose = vi.fn();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} onClose={onClose} />
        </Wrapper>
      );

      fireEvent.click(screen.getByTestId('btn-scrap-close'));
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('btn-scrap-cancel'));
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });
});
