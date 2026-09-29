import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FamilyAutocompleteInput } from '../../../features/catalog/components/FamilyAutocompleteInput';
import * as catalogHooks from '../../../features/catalog/hooks/useCatalog';

vi.mock('../../../features/catalog/hooks/useCatalog', () => ({
  useMaterialFamilies: vi.fn(),
}));

describe('FamilyAutocompleteInput Component [Joseph Nichollas]', () => {
  const defaultProps = {
    label: 'Família do Material',
    value: '',
    onChange: vi.fn(),
    groupCode: 'ALUMINIO' as const,
    placeholder: 'Ex: FAM-ALUM-LINHA25',
    'data-cy': 'input-family',
  };

  const mockFamilies = ['FAM-ALUM-LINHA25', 'FAM-ALUM-SUPREMA', 'FAM-ALUM-GOLD'];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogHooks.useMaterialFamilies).mockReturnValue({
      data: mockFamilies,
      isLoading: false,
    } as any);
  });

  it('deve renderizar o label, placeholder e a contagem de famílias existentes', () => {
    render(<FamilyAutocompleteInput {...defaultProps} />);

    expect(screen.getByText('Família do Material')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25')).toBeInTheDocument();
    expect(screen.getByText('3 famílias existentes')).toBeInTheDocument();
  });

  it('deve renderizar singular quando houver apenas 1 família', () => {
    vi.mocked(catalogHooks.useMaterialFamilies).mockReturnValue({
      data: ['FAM-UNICA'],
      isLoading: false,
    } as any);

    render(<FamilyAutocompleteInput {...defaultProps} />);
    expect(screen.getByText('1 família existente')).toBeInTheDocument();
  });

  it('deve abrir o dropdown ao focar no input e exibir as famílias', () => {
    render(<FamilyAutocompleteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.focus(input);

    expect(screen.getByText('Famílias cadastradas (clique para selecionar)')).toBeInTheDocument();
    expect(screen.getByText('FAM-ALUM-LINHA25')).toBeInTheDocument();
    expect(screen.getByText('FAM-ALUM-SUPREMA')).toBeInTheDocument();
  });

  it('deve filtrar famílias conforme a digitação e chamar onChange com maiúsculas', () => {
    render(<FamilyAutocompleteInput {...defaultProps} value="SUP" />);

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.change(input, { target: { value: 'sup' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('SUP');
  });

  it('deve selecionar família ao clicar em um item da lista', () => {
    render(<FamilyAutocompleteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.focus(input);

    const option = screen.getByText('FAM-ALUM-SUPREMA');
    fireEvent.click(option);

    expect(defaultProps.onChange).toHaveBeenCalledWith('FAM-ALUM-SUPREMA');
  });

  it('deve exibir opção de nova família e selecionar ao clicar', () => {
    render(<FamilyAutocompleteInput {...defaultProps} value="FAM-NOVA" />);

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.focus(input);

    expect(screen.getByText('Nova família a ser criada:')).toBeInTheDocument();
    const newOption = screen.getByRole('button', { name: /FAM-NOVA/i });
    fireEvent.click(newOption);

    expect(defaultProps.onChange).toHaveBeenCalledWith('FAM-NOVA');
  });

  it('deve selecionar a primeira opção com a tecla Enter', () => {
    render(<FamilyAutocompleteInput {...defaultProps} value="LINHA" />);

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(defaultProps.onChange).toHaveBeenCalledWith('FAM-ALUM-LINHA25');
  });

  it('deve fechar dropdown com a tecla Escape', () => {
    render(<FamilyAutocompleteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.focus(input);
    expect(screen.getByText('Famílias cadastradas (clique para selecionar)')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(
      screen.queryByText('Famílias cadastradas (clique para selecionar)')
    ).not.toBeInTheDocument();
  });

  it('deve limpar o campo ao clicar no botão ✕', () => {
    render(<FamilyAutocompleteInput {...defaultProps} value="TEXTO" />);

    const clearBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(clearBtn);

    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('deve fechar dropdown ao clicar fora do componente', () => {
    render(
      <div>
        <div data-testid="outside">Fora</div>
        <FamilyAutocompleteInput {...defaultProps} />
      </div>
    );

    const input = screen.getByPlaceholderText('Ex: FAM-ALUM-LINHA25');
    fireEvent.focus(input);
    expect(screen.getByText('Famílias cadastradas (clique para selecionar)')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(
      screen.queryByText('Famílias cadastradas (clique para selecionar)')
    ).not.toBeInTheDocument();
  });
});
