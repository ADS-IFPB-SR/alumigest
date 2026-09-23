import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ProfileFormModal } from '@/features/catalog/components/ProfileFormModal';
import { buildMockProfile } from '@/test/fixtures/catalogFixtures';

const mockCreateProfile = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock('@/features/catalog/hooks/useCatalog', () => ({
  useCreateProfile: () => ({
    mutate: mockCreateProfile,
    isPending: false,
  }),
  useUpdateProfile: () => ({
    mutate: mockUpdateProfile,
    isPending: false,
  }),
  useMaterialFamilies: () => ({
    data: ['SUPREMA', 'LINHA_25'],
    isLoading: false,
  }),
}));

describe('ProfileFormModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(<ProfileFormModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar modal de criação com título Cadastro de Perfil de Alumínio', () => {
    render(<ProfileFormModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Cadastro de Perfil de Alumínio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('deve renderizar modal de edição quando initialData for fornecido via fixture', () => {
    const initialData = buildMockProfile({
      id: 10 as any,
      skuCode: 'PRF-01',
      commercialLine: 'SUPREMA',
      description: 'PERFIL TRILHO SUPERIOR',
    });

    render(<ProfileFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    expect(screen.getByText('Edição de Perfil de Alumínio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('deve fechar o modal ao clicar em Cancelar', () => {
    const onClose = vi.fn();
    render(<ProfileFormModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Técnica: Transição e Submissão - deve validar e disparar createProfile ao salvar novo perfil', async () => {
    render(<ProfileFormModal isOpen={true} onClose={vi.fn()} />);

    const skuInput = document.querySelector('[data-cy="profile-form-sku"]') as HTMLInputElement;
    const lineInput = document.querySelector('[data-cy="profile-form-commercial-line"]') as HTMLInputElement;
    const descInput = document.querySelector('[data-cy="profile-form-description"]') as HTMLInputElement;
    const colorInput = document.querySelector('[data-cy="profile-form-color-finish"]') as HTMLInputElement;
    const weightInput = document.querySelector('[data-cy="profile-form-weight"]') as HTMLInputElement;
    const lengthInput = document.querySelector('[data-cy="profile-form-length"]') as HTMLInputElement;
    const costInput = document.querySelector('[data-cy="profile-form-cost-price"]') as HTMLInputElement;
    const saleInput = document.querySelector('[data-cy="profile-form-sale-price"]') as HTMLInputElement;

    fireEvent.change(skuInput, { target: { value: 'ALU-25-01' } });
    fireEvent.change(lineInput, { target: { value: 'Linha 25' } });
    fireEvent.change(descInput, { target: { value: 'Trilho Superior Alumínio' } });
    fireEvent.change(colorInput, { target: { value: 'Branco' } });
    fireEvent.change(weightInput, { target: { value: '1,250' } });
    fireEvent.change(lengthInput, { target: { value: '6' } });
    fireEvent.change(costInput, { target: { value: '60,00' } });
    fireEvent.change(saleInput, { target: { value: '120,00' } });

    const saveBtn = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalledTimes(1);
      expect(mockCreateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          commercialReference: 'ALU-25-01',
          commercialLine: 'LINHA 25',
          name: 'TRILHO SUPERIOR ALUMÍNIO',
          colorFinish: 'BRANCO',
          costPrice: 60.0,
          salePrice: 120.0,
        }),
        expect.any(Object)
      );
    });
  });

  it('Técnica: Transição e Submissão - deve disparar updateProfile ao atualizar dados na edição', async () => {
    const initialData = buildMockProfile({ id: 25 as any, costPrice: 40.0, salePrice: 90.0 });
    render(<ProfileFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    const saleInput = document.querySelector('[data-cy="profile-form-sale-price"]') as HTMLInputElement;
    fireEvent.change(saleInput, { target: { value: '115,00' } });

    const updateBtn = screen.getByRole('button', { name: 'Atualizar' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 25,
          data: expect.objectContaining({
            salePrice: 115.0,
          }),
        }),
        expect.any(Object)
      );
    });
  });
});
