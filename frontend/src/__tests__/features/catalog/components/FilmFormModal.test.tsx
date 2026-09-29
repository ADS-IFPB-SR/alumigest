import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FilmFormModal } from '@/features/catalog/components/FilmFormModal';
import { buildMockFilm } from '@/test/fixtures/catalogFixtures';

const mockCreateFilm = vi.fn();
const mockUpdateFilm = vi.fn();

vi.mock('@/features/catalog/hooks/useCatalog', () => ({
  useCreateFilm: () => ({
    mutate: mockCreateFilm,
    isPending: false,
  }),
  useUpdateFilm: () => ({
    mutate: mockUpdateFilm,
    isPending: false,
  }),
  useMaterialFamilies: () => ({
    data: ['SOLAR', 'FUMÊ'],
    isLoading: false,
  }),
}));

describe('FilmFormModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(<FilmFormModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar modal de criação com título Cadastro de Película', () => {
    render(<FilmFormModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Cadastro de Película')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('deve renderizar modal de edição quando initialData for fornecido via fixture', () => {
    const initialData = buildMockFilm({ id: '7' as any, name: 'PELÍCULA SOLAR G5' });

    render(<FilmFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    expect(screen.getByText('Edição de Película')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('deve fechar o modal ao clicar em Cancelar', () => {
    const onClose = vi.fn();
    render(<FilmFormModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Técnica: Transição e Submissão - deve validar e disparar createFilm ao salvar formulário de cadastro', async () => {
    render(<FilmFormModal isOpen={true} onClose={vi.fn()} />);

    // Preenche campos obrigatórios
    const nameInput = document.querySelector('[data-cy="film-form-name"]') as HTMLInputElement;
    const typeInput = document.querySelector('[data-cy="film-form-type"]') as HTMLInputElement;
    const costInput = document.querySelector('[data-cy="film-form-cost-price"]') as HTMLInputElement;
    const saleInput = document.querySelector('[data-cy="film-form-sale-price"]') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Película Blackout 100%' } });
    fireEvent.change(typeInput, { target: { value: 'Privacidade' } });
    fireEvent.change(costInput, { target: { value: '40,00' } });
    fireEvent.change(saleInput, { target: { value: '95,00' } });

    const saveBtn = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateFilm).toHaveBeenCalledTimes(1);
      expect(mockCreateFilm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PELÍCULA BLACKOUT 100%',
          costPrice: 40.0,
          salePrice: 95.0,
        }),
        expect.any(Object)
      );
    });
  });

  it('Técnica: Transição e Submissão - deve disparar updateFilm ao atualizar dados na edição', async () => {
    const initialData = buildMockFilm({ id: 12 as any, costPrice: 30.0, salePrice: 70.0 });
    render(<FilmFormModal isOpen={true} onClose={vi.fn()} initialData={initialData} />);

    const saleInput = document.querySelector('[data-cy="film-form-sale-price"]') as HTMLInputElement;
    fireEvent.change(saleInput, { target: { value: '85,00' } });

    const updateBtn = screen.getByRole('button', { name: 'Atualizar' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockUpdateFilm).toHaveBeenCalledTimes(1);
      expect(mockUpdateFilm).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 12,
          data: expect.objectContaining({
            salePrice: 85.0,
          }),
        }),
        expect.any(Object)
      );
    });
  });
});
