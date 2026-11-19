import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ScrapLossModal } from '@/features/stock/components/ScrapLossModal';
import { stockApi } from '@/features/stock/api/stockApi';

vi.mock('@/features/stock/api/stockApi', () => ({
  stockApi: {
    listBalances: vi.fn(),
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

      const modal = screen.getByTestId('modal-scrap-loss');
      expect(modal).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBe(modal);
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'scrap-loss-title');
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

  describe('[Seleção de Insumo quando materialId não é fornecido]', () => {
    it('deve exibir o seletor de insumo, exigir seleção e submeter o materialId escolhido', async () => {
      vi.mocked(stockApi.listBalances).mockResolvedValueOnce([
        {
          id: 'si-1',
          materialId: 'mat-select-01',
          materialSku: 'GL-TEMP-8MM',
          materialName: 'Vidro Temperado Incolor 8mm',
          category: 'GLASS',
          unitMeasure: 'M2',
          physicalQuantity: 12.0,
          reservedQuantity: 2.0,
          availableQuantity: 10.0,
          minimumStock: 5.0,
          alertStatus: 'IN_STOCK',
        },
      ]);

      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} />
        </Wrapper>
      );

      const select = await screen.findByTestId('select-scrap-material');
      expect(select).toBeInTheDocument();

      // Tenta enviar sem selecionar insumo
      fireEvent.change(screen.getByTestId('input-scrap-quantity'), { target: { value: '2' } });
      fireEvent.change(screen.getByTestId('textarea-scrap-reason'), {
        target: { value: 'Chapa trincada no cavalete' },
      });
      fireEvent.click(screen.getByTestId('btn-scrap-submit'));

      await waitFor(() => {
        expect(screen.getByText(/Selecione o insumo para registrar a perda/i)).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();

      // Seleciona o insumo e submete
      await waitFor(() => {
        expect(screen.getByText(/GL-TEMP-8MM — Vidro Temperado Incolor 8mm/i)).toBeInTheDocument();
      });
      fireEvent.change(select, { target: { value: 'mat-select-01' } });
      fireEvent.click(screen.getByTestId('btn-scrap-submit'));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            materialId: 'mat-select-01',
            type: 'SCRAP_LOSS',
            quantity: 2,
            reason: 'Chapa trincada no cavalete',
          })
        );
      });
    });

    it('NÃO deve exibir aviso falso de RN-03 ao digitar quantidade antes de selecionar um insumo', async () => {
      vi.mocked(stockApi.listBalances).mockResolvedValueOnce([
        {
          id: 'si-1',
          materialId: 'mat-select-01',
          materialSku: 'GL-TEMP-8MM',
          materialName: 'Vidro Temperado Incolor 8mm',
          category: 'GLASS',
          unitMeasure: 'M2',
          physicalQuantity: 12.0,
          reservedQuantity: 0,
          availableQuantity: 12.0,
          minimumStock: 5.0,
          alertStatus: 'IN_STOCK',
        },
      ]);

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal isOpen={true} onClose={vi.fn()} />
        </Wrapper>
      );

      await screen.findByTestId('select-scrap-material');
      const quantityInput = screen.getByTestId('input-scrap-quantity');
      fireEvent.change(quantityInput, { target: { value: '2' } });

      expect(
        screen.queryByText(/é maior que o saldo físico em estoque/i)
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Aguardando seleção de insumo/i)).toBeInTheDocument();
    });

    it('deve exibir feedback de loading no select enquanto busca os insumos em estoque', () => {
      vi.mocked(stockApi.listBalances).mockReturnValueOnce(new Promise(() => {}));

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal isOpen={true} onClose={vi.fn()} />
        </Wrapper>
      );

      const select = screen.getByTestId('select-scrap-material') as HTMLSelectElement;
      expect(select).toBeDisabled();
      expect(screen.getByText(/Carregando insumos em estoque/i)).toBeInTheDocument();
    });

    it('deve exibir erro e permitir tentar novamente quando a busca de insumos falhar', async () => {
      vi.mocked(stockApi.listBalances)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          {
            id: 'si-2',
            materialId: 'mat-retry-01',
            materialSku: 'AL-RETRY',
            materialName: 'Perfil Recuperado',
            category: 'PROFILE',
            unitMeasure: 'UN',
            physicalQuantity: 8,
            reservedQuantity: 0,
            availableQuantity: 8,
            minimumStock: 2,
            alertStatus: 'IN_STOCK',
          },
        ]);

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal isOpen={true} onClose={vi.fn()} />
        </Wrapper>
      );

      expect(await screen.findByTestId('select-scrap-error')).toBeInTheDocument();
      expect(
        screen.getByText(/Não foi possível carregar os insumos em estoque/i)
      ).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('btn-retry-balances'));

      await waitFor(() => {
        expect(screen.getByText(/AL-RETRY — Perfil Recuperado/i)).toBeInTheDocument();
      });
    });

    it('deve bloquear botões e inputs durante execução de onConfirm assíncrono (formState.isSubmitting)', async () => {
      let resolveSubmit!: () => void;
      const onConfirm = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve;
          })
      );

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ScrapLossModal {...defaultProps} onConfirm={onConfirm} />
        </Wrapper>
      );

      fireEvent.change(screen.getByTestId('input-scrap-quantity'), { target: { value: '2' } });
      fireEvent.change(screen.getByTestId('textarea-scrap-reason'), {
        target: { value: 'Quebra na bancada de corte' },
      });
      fireEvent.click(screen.getByTestId('btn-scrap-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('btn-scrap-submit')).toBeDisabled();
        expect(screen.getByTestId('btn-scrap-cancel')).toBeDisabled();
        expect(screen.getByTestId('input-scrap-quantity')).toBeDisabled();
        expect(screen.getByText(/Registrando.../i)).toBeInTheDocument();
      });

      resolveSubmit();

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });
});
