import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CatalogView } from '@/features/catalog/components/CatalogView';

vi.mock('@/features/catalog/components/GlassTab', () => ({
  GlassTab: ({ searchQuery, filterStatus }: any) => (
    <div data-testid="glass-tab">GlassTab (search: {searchQuery}, status: {filterStatus})</div>
  ),
}));

vi.mock('@/features/catalog/components/ProfileTab', () => ({
  ProfileTab: () => <div data-testid="profile-tab">ProfileTab</div>,
}));

vi.mock('@/features/catalog/components/FilmTab', () => ({
  FilmTab: () => <div data-testid="film-tab">FilmTab</div>,
}));

vi.mock('@/features/catalog/components/HardwareTab', () => ({
  HardwareTab: () => <div data-testid="hardware-tab">HardwareTab</div>,
}));

vi.mock('@/features/catalog/components/MaterialTypeSelectionModal', () => ({
  MaterialTypeSelectionModal: ({ isOpen, onSelect }: any) =>
    isOpen ? (
      <div data-testid="selection-modal">
        <button type="button" onClick={() => onSelect('Glass')}>
          Selecionar Vidro
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/GlassFormModal', () => ({
  GlassFormModal: ({ isOpen }: any) => (isOpen ? <div data-testid="glass-form-modal">GlassModal</div> : null),
}));

vi.mock('@/features/catalog/components/ProfileFormModal', () => ({
  ProfileFormModal: ({ isOpen }: any) => (isOpen ? <div data-testid="profile-form-modal">ProfileModal</div> : null),
}));

vi.mock('@/features/catalog/components/HardwareFormModal', () => ({
  HardwareFormModal: ({ isOpen }: any) => (isOpen ? <div data-testid="hardware-form-modal">HardwareModal</div> : null),
}));

vi.mock('@/features/catalog/components/FilmFormModal', () => ({
  FilmFormModal: ({ isOpen }: any) => (isOpen ? <div data-testid="film-form-modal">FilmModal</div> : null),
}));

vi.mock('@/features/catalog/components/MaterialDetailsModal', () => ({
  MaterialDetailsModal: ({ isOpen }: any) => (isOpen ? <div data-testid="details-modal">DetailsModal</div> : null),
}));

describe('CatalogView Component', () => {
  it('deve renderizar a tela com cabeçalho, campo de busca, filtro de status e botão Novo Material', () => {
    render(<CatalogView />);

    expect(screen.getByText('Catálogo de Materiais')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar código ou insumo...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Material/i })).toBeInTheDocument();
  });

  it('deve renderizar as abas do catálogo', () => {
    render(<CatalogView />);

    expect(screen.getByText('Vidros')).toBeInTheDocument();
    expect(screen.getByText('Perfis de Alumínio')).toBeInTheDocument();
    expect(screen.getByText('Ferragens')).toBeInTheDocument();
    expect(screen.getByText('Películas')).toBeInTheDocument();
  });

  it('Técnica: Transição de Estados - deve abrir modal de tipo ao clicar em Novo Material e abrir formulário específico ao selecionar tipo', () => {
    render(<CatalogView />);

    expect(screen.queryByTestId('selection-modal')).not.toBeInTheDocument();

    // Clica em Novo Material
    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    expect(screen.getByTestId('selection-modal')).toBeInTheDocument();

    // Seleciona "Vidro"
    fireEvent.click(screen.getByText('Selecionar Vidro'));

    // Modal de seleção fecha e abre o modal de formulário de Vidro
    expect(screen.queryByTestId('selection-modal')).not.toBeInTheDocument();
    expect(screen.getByTestId('glass-form-modal')).toBeInTheDocument();
  });

  it('Técnica: Fluxograma de Filtros - deve propagar busca e filtro de status para a aba ativa', () => {
    render(<CatalogView />);

    const searchInput = screen.getByPlaceholderText('Buscar código ou insumo...');
    fireEvent.change(searchInput, { target: { value: 'Incolor' } });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'ACTIVE' } });

    expect(screen.getByTestId('glass-tab')).toHaveTextContent('search: Incolor, status: ACTIVE');
  });
});
