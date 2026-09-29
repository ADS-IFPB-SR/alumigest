import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HardwareFormModal } from '@/features/catalog/components/HardwareFormModal';
import { buildMockHardware } from '@/test/fixtures/catalogFixtures';

const mockCreateHardware = vi.fn();
const mockUpdateHardware = vi.fn();

vi.mock('@/features/catalog/hooks/useCatalog', () => ({
  useCreateHardware: () => ({
    mutate: mockCreateHardware,
    isPending: false,
  }),
  useUpdateHardware: () => ({
    mutate: mockUpdateHardware,
    isPending: false,
  }),
  useMaterialFamilies: () => ({
    data: ['FECHOS', 'ROLDANAS'],
    isLoading: false,
  }),
}));

describe('HardwareFormModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(<HardwareFormModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar modal de criação com título Cadastro de Ferragem / Acessório', () => {
    render(<HardwareFormModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Cadastro de Ferragem / Acessório')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('deve renderizar modal de edição quando initialData for fornecido via fixture', () => {
    const initialData = buildMockHardware({
      id: 5 as any,
      skuCode: 'HW-01',
      name: 'FECHO CONCHA',
    });

    render(<HardwareFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    expect(screen.getByText('Edição de Ferragem / Acessório')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('deve fechar o modal ao clicar em Cancelar', () => {
    const onClose = vi.fn();
    render(<HardwareFormModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Técnica: Transição e Submissão - deve validar e disparar createHardware ao salvar nova ferragem', async () => {
    render(<HardwareFormModal isOpen={true} onClose={vi.fn()} />);

    const skuInput = document.querySelector('[data-cy="hardware-form-sku"]') as HTMLInputElement;
    const nameInput = document.querySelector('[data-cy="hardware-form-name"]') as HTMLInputElement;
    const unitSelect = document.querySelector('[data-cy="hardware-form-unit"]') as HTMLSelectElement;
    const costInput = document.querySelector('[data-cy="hardware-form-cost-price"]') as HTMLInputElement;
    const saleInput = document.querySelector('[data-cy="hardware-form-sale-price"]') as HTMLInputElement;

    fireEvent.change(skuInput, { target: { value: 'HW-ROL-01' } });
    fireEvent.change(nameInput, { target: { value: 'Roldana Dupla Suprema' } });
    fireEvent.change(unitSelect, { target: { value: 'UN' } });
    fireEvent.change(costInput, { target: { value: '18,00' } });
    fireEvent.change(saleInput, { target: { value: '42,00' } });

    const saveBtn = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateHardware).toHaveBeenCalledTimes(1);
      expect(mockCreateHardware).toHaveBeenCalledWith(
        expect.objectContaining({
          skuCode: 'HW-ROL-01',
          name: 'ROLDANA DUPLA SUPREMA',
          unitMeasure: 'UN',
          costPrice: 18.0,
          salePrice: 42.0,
        }),
        expect.any(Object)
      );
    });
  });

  it('Técnica: Transição e Submissão - deve disparar updateHardware ao atualizar dados na edição', async () => {
    const initialData = buildMockHardware({ id: 33 as any, costPrice: 20.0, salePrice: 50.0 });
    render(<HardwareFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    const saleInput = document.querySelector('[data-cy="hardware-form-sale-price"]') as HTMLInputElement;
    fireEvent.change(saleInput, { target: { value: '65,00' } });

    const updateBtn = screen.getByRole('button', { name: 'Atualizar' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockUpdateHardware).toHaveBeenCalledTimes(1);
      expect(mockUpdateHardware).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 33,
          data: expect.objectContaining({
            salePrice: 65.0,
          }),
        }),
        expect.any(Object)
      );
    });
  });
});
