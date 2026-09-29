import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { GlassFormModal } from '@/features/catalog/components/GlassFormModal';
import { buildMockGlass } from '@/test/fixtures/catalogFixtures';

const mockCreateGlass = vi.fn();
const mockUpdateGlass = vi.fn();

vi.mock('@/features/catalog/hooks/useCatalog', () => ({
  useCreateGlass: () => ({
    mutate: mockCreateGlass,
    isPending: false,
  }),
  useUpdateGlass: () => ({
    mutate: mockUpdateGlass,
    isPending: false,
  }),
  useMaterialFamilies: () => ({
    data: ['TEMPERADO', 'LAMINADO'],
    isLoading: false,
  }),
}));

describe('GlassFormModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(<GlassFormModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar formulário de novo vidro no modo criação', () => {
    render(<GlassFormModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Cadastro de Vidro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('deve renderizar no modo edição quando initialData for fornecido via fixture', () => {
    const initialData = buildMockGlass({
      id: '1' as any,
      name: 'VIDRO TEMPERADO 8MM',
      costPrice: 150.0,
      salePrice: 280.0,
    });

    render(<GlassFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    expect(screen.getByText('Edição de Vidro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('deve disparar onClose ao clicar em Cancelar', () => {
    const onClose = vi.fn();
    render(<GlassFormModal isOpen={true} onClose={onClose} />);

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('Técnica: Transição e Submissão - deve validar e disparar createGlass ao salvar cadastro de vidro', async () => {
    render(<GlassFormModal isOpen={true} onClose={vi.fn()} />);

    const nameInput = document.querySelector('[data-cy="glass-form-name"]') as HTMLInputElement;
    const colorInput = document.querySelector('[data-cy="glass-form-color-finish"]') as HTMLInputElement;
    const costInput = document.querySelector('[data-cy="glass-form-cost-price"]') as HTMLInputElement;
    const saleInput = document.querySelector('[data-cy="glass-form-sale-price"]') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Vidro Float Incolor 10mm' } });
    fireEvent.change(colorInput, { target: { value: 'Incolor' } });
    fireEvent.change(costInput, { target: { value: '90,00' } });
    fireEvent.change(saleInput, { target: { value: '180,00' } });

    const saveBtn = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateGlass).toHaveBeenCalledTimes(1);
      expect(mockCreateGlass).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'VIDRO FLOAT INCOLOR 10MM',
          colorFinish: 'INCOLOR',
          costPrice: 90.0,
          salePrice: 180.0,
        }),
        expect.any(Object)
      );
    });
  });

  it('Técnica: Transição e Submissão - deve disparar updateGlass ao atualizar dados na edição', async () => {
    const initialData = buildMockGlass({ id: 10 as any, costPrice: 100.0, salePrice: 200.0 });
    render(<GlassFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    const saleInput = document.querySelector('[data-cy="glass-form-sale-price"]') as HTMLInputElement;
    fireEvent.change(saleInput, { target: { value: '250,00' } });

    const updateBtn = screen.getByRole('button', { name: 'Atualizar' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockUpdateGlass).toHaveBeenCalledTimes(1);
      expect(mockUpdateGlass).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          data: expect.objectContaining({
            salePrice: 250.0,
          }),
        }),
        expect.any(Object)
      );
    });
  });
});
