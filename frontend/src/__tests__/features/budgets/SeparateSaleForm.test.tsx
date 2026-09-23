import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeparateSaleForm } from '../../../features/budgets/components/SeparateSaleForm';
import { useCreateSeparateSale } from '../../../features/budgets/hooks/useSeparateSale';
import { useGlasses, useProfiles, useFilms, useHardwares } from '../../../features/catalog/hooks/useCatalog';

vi.mock('../../../features/budgets/hooks/useSeparateSale', () => ({
  useCreateSeparateSale: vi.fn(),
}));

vi.mock('../../../features/catalog/hooks/useCatalog', () => ({
  useGlasses: vi.fn(),
  useProfiles: vi.fn(),
  useFilms: vi.fn(),
  useHardwares: vi.fn(),
}));

describe('SeparateSaleForm Component [Joseph Nichollas]', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateSeparateSale).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    vi.mocked(useGlasses).mockReturnValue({
      data: {
        content: [
          { id: 'glass-1', name: 'Vidro Incolor 8mm', skuCode: 'VID-01', active: true },
        ],
      },
    } as any);

    vi.mocked(useProfiles).mockReturnValue({
      data: {
        content: [
          { id: 'prof-1', name: 'Perfil Linha 25', commercialReference: 'ALU-25', active: true },
        ],
      },
    } as any);

    vi.mocked(useFilms).mockReturnValue({
      data: {
        content: [
          { id: 'film-1', name: 'Película Fumê', active: true },
        ],
      },
    } as any);

    vi.mocked(useHardwares).mockReturnValue({
      data: {
        content: [
          { id: 'hard-1', name: 'Esquadreta 90', skuCode: 'ESQ-90', active: true },
        ],
      },
    } as any);
  });

  it('deve renderizar o formulário no modo Venda de Vidro por padrão', () => {
    render(<SeparateSaleForm />);

    expect(screen.getByText('Venda das Partes')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Vidro *')).toBeInTheDocument();
    expect(screen.getByText('Película (Opcional)')).toBeInTheDocument();
    expect(screen.queryByText('Tipo de Alumínio *')).not.toBeInTheDocument();
  });

  it('deve alternar para o modo Venda de Alumínio ao clicar no segmented control', async () => {
    const user = userEvent.setup();
    render(<SeparateSaleForm />);

    const btnAluminio = screen.getByRole('button', { name: /venda de alumínio/i });
    await user.click(btnAluminio);

    expect(screen.getByText('Tipo de Alumínio *')).toBeInTheDocument();
    expect(screen.getByText('Esquadreta *')).toBeInTheDocument();
    expect(screen.queryByText('Tipo de Vidro *')).not.toBeInTheDocument();
  });

  it('deve preencher e submeter o formulário de venda de vidro com sucesso', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({});

    const { container } = render(<SeparateSaleForm />);

    const widthInput = container.querySelector('input[name="width"]') as HTMLInputElement;
    const heightInput = container.querySelector('input[name="height"]') as HTMLInputElement;
    const glassSelect = container.querySelector('select[name="glassId"]') as HTMLSelectElement;

    await user.type(widthInput, '1200');
    await user.type(heightInput, '2100');
    await user.selectOptions(glassSelect, 'glass-1');

    const submitBtn = screen.getByRole('button', { name: /adicionar ao orçamento/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          saleType: 'GLASS',
          width: 1200,
          height: 2100,
          glassId: 'glass-1',
          quantity: 1,
        })
      );
    });
  });

  it('deve desabilitar o botão de submissão e exibir texto de carregamento quando isPending for true', () => {
    vi.mocked(useCreateSeparateSale).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    render(<SeparateSaleForm />);

    const submitBtn = screen.getByRole('button', { name: /processando\.\.\./i });
    expect(submitBtn).toBeDisabled();
  });

  it('deve limpar os campos ao clicar no botão Limpar', async () => {
    const user = userEvent.setup();
    const { container } = render(<SeparateSaleForm />);

    const widthInput = container.querySelector('input[name="width"]') as HTMLInputElement;
    await user.type(widthInput, '1500');
    expect(widthInput.value).toBe('1500');

    const clearBtn = screen.getByRole('button', { name: /limpar/i });
    await user.click(clearBtn);

    expect(widthInput.value).toBe('');
  });
});
