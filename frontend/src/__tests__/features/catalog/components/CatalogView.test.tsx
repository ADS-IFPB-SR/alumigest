import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CatalogView } from '@/features/catalog/components/CatalogView';

vi.mock('@/features/catalog/components/GlassTab', () => ({
  GlassTab: ({ searchQuery, filterStatus, onEdit, onViewDetails }: any) => (
    <div data-testid="glass-tab">
      <span>GlassTab (search: {searchQuery}, status: {filterStatus})</span>
      <button type="button" onClick={() => onEdit({ id: 1, name: 'Vidro Temperado' })}>
        Editar Vidro
      </button>
      <button type="button" onClick={() => onViewDetails({ id: 1, name: 'Vidro Temperado' })}>
        Detalhes Vidro
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/ProfileTab', () => ({
  ProfileTab: ({ onEdit, onViewDetails }: any) => (
    <div data-testid="profile-tab">
      <span>ProfileTab</span>
      <button type="button" onClick={() => onEdit({ id: 2, name: 'Perfil Tubo' })}>
        Editar Perfil
      </button>
      <button type="button" onClick={() => onViewDetails({ id: 2, name: 'Perfil Tubo' })}>
        Detalhes Perfil
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/FilmTab', () => ({
  FilmTab: ({ onEdit, onViewDetails }: any) => (
    <div data-testid="film-tab">
      <span>FilmTab</span>
      <button type="button" onClick={() => onEdit({ id: 3, name: 'Película Fumê' })}>
        Editar Película
      </button>
      <button type="button" onClick={() => onViewDetails({ id: 3, name: 'Película Fumê' })}>
        Detalhes Película
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/HardwareTab', () => ({
  HardwareTab: ({ onEdit, onViewDetails }: any) => (
    <div data-testid="hardware-tab">
      <span>HardwareTab</span>
      <button type="button" onClick={() => onEdit({ id: 4, name: 'Fecho Concha' })}>
        Editar Ferragem
      </button>
      <button type="button" onClick={() => onViewDetails({ id: 4, name: 'Fecho Concha' })}>
        Detalhes Ferragem
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/MaterialTypeSelectionModal', () => ({
  MaterialTypeSelectionModal: ({ isOpen, onClose, onSelect }: any) =>
    isOpen ? (
      <div data-testid="selection-modal">
        <button type="button" onClick={() => onSelect('Glass')}>
          Selecionar Vidro
        </button>
        <button type="button" onClick={() => onSelect('Profile')}>
          Selecionar Perfil
        </button>
        <button type="button" onClick={() => onSelect('Hardware')}>
          Selecionar Ferragem
        </button>
        <button type="button" onClick={() => onSelect('Film')}>
          Selecionar Película
        </button>
        <button type="button" onClick={onClose}>
          Fechar Seleção
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/GlassFormModal', () => ({
  GlassFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="glass-form-modal">
        <span>GlassModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar GlassModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/ProfileFormModal', () => ({
  ProfileFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="profile-form-modal">
        <span>ProfileModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar ProfileModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/HardwareFormModal', () => ({
  HardwareFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="hardware-form-modal">
        <span>HardwareModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar HardwareModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/FilmFormModal', () => ({
  FilmFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="film-form-modal">
        <span>FilmModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar FilmModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/MaterialDetailsModal', () => ({
  MaterialDetailsModal: ({ isOpen, onClose, onEdit, item }: any) =>
    isOpen ? (
      <div data-testid="details-modal">
        <span>DetailsModal {item?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar Detalhes
        </button>
        <button type="button" onClick={onEdit}>
          Editar nos Detalhes
        </button>
      </div>
    ) : null,
}));

describe('CatalogView Component [Joseph Nichollas]', () => {
  it('deve renderizar a tela com cabeçalho, campo de busca, filtro de status e botão Novo Material', () => {
    render(<CatalogView />);

    expect(screen.getByText('Catálogo de Materiais')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar código ou insumo...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Material/i })).toBeInTheDocument();
  });

  it('deve renderizar as abas do catálogo e permitir alternar entre elas', () => {
    render(<CatalogView />);

    expect(screen.getByText('Vidros')).toBeInTheDocument();
    expect(screen.getByTestId('glass-tab')).toBeInTheDocument();

    // Alternar para Perfis
    fireEvent.click(screen.getByText('Perfis de Alumínio'));
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();

    // Alternar para Películas
    fireEvent.click(screen.getByText('Películas'));
    expect(screen.getByTestId('film-tab')).toBeInTheDocument();

    // Alternar para Ferragens
    fireEvent.click(screen.getByText('Ferragens'));
    expect(screen.getByTestId('hardware-tab')).toBeInTheDocument();
  });

  it('deve abrir modal de tipo e fechar ao clicar em Fechar', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    expect(screen.getByTestId('selection-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar Seleção'));
    expect(screen.queryByTestId('selection-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de formulário de Perfil ao selecionar Perfil', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    fireEvent.click(screen.getByText('Selecionar Perfil'));

    expect(screen.getByTestId('profile-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar ProfileModal'));
    expect(screen.queryByTestId('profile-form-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de formulário de Ferragem ao selecionar Ferragem', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    fireEvent.click(screen.getByText('Selecionar Ferragem'));

    expect(screen.getByTestId('hardware-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar HardwareModal'));
    expect(screen.queryByTestId('hardware-form-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de formulário de Película ao selecionar Película', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    fireEvent.click(screen.getByText('Selecionar Película'));

    expect(screen.getByTestId('film-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar FilmModal'));
    expect(screen.queryByTestId('film-form-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de edição diretamente pela ação da aba', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Editar Vidro'));

    expect(screen.getByTestId('glass-form-modal')).toBeInTheDocument();
    expect(screen.getByText('GlassModal Vidro Temperado')).toBeInTheDocument();
  });

  it('deve abrir modal de detalhes e permitir fechar', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Detalhes Vidro'));

    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('DetailsModal Vidro Temperado')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar Detalhes'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
  });

  it('deve abrir modal de edição ao clicar em Editar dentro do modal de detalhes', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Detalhes Vidro'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Editar nos Detalhes'));

    // Modal de detalhes fecha e modal de formulário de Vidro abre com dados preenchidos
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
    expect(screen.getByTestId('glass-form-modal')).toBeInTheDocument();
    expect(screen.getByText('GlassModal Vidro Temperado')).toBeInTheDocument();
  });

  it('Técnica: Fluxograma de Filtros - deve propagar busca e filtro de status para a aba ativa', () => {
    render(<CatalogView />);

    const searchInput = screen.getByPlaceholderText('Buscar código ou insumo...');
    fireEvent.change(searchInput, { target: { value: 'Incolor' } });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'ACTIVE' } });

    expect(screen.getByTestId('glass-tab')).toHaveTextContent('search: Incolor, status: ACTIVE');
  });

  it('deve permitir editar e ver detalhes de Perfil na aba de Perfis', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Perfis de Alumínio'));
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();

    // Editar direto
    fireEvent.click(screen.getByText('Editar Perfil'));
    expect(screen.getByTestId('profile-form-modal')).toBeInTheDocument();
    expect(screen.getByText('ProfileModal Perfil Tubo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar ProfileModal'));

    // Detalhes -> Editar
    fireEvent.click(screen.getByText('Detalhes Perfil'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('DetailsModal Perfil Tubo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Editar nos Detalhes'));
    expect(screen.getByTestId('profile-form-modal')).toBeInTheDocument();
  });

  it('deve permitir editar e ver detalhes de Película na aba de Películas', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Películas'));
    expect(screen.getByTestId('film-tab')).toBeInTheDocument();

    // Editar direto
    fireEvent.click(screen.getByText('Editar Película'));
    expect(screen.getByTestId('film-form-modal')).toBeInTheDocument();
    expect(screen.getByText('FilmModal Película Fumê')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar FilmModal'));

    // Detalhes -> Editar
    fireEvent.click(screen.getByText('Detalhes Película'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('DetailsModal Película Fumê')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Editar nos Detalhes'));
    expect(screen.getByTestId('film-form-modal')).toBeInTheDocument();
  });

  it('deve permitir editar e ver detalhes de Ferragem na aba de Ferragens', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Ferragens'));
    expect(screen.getByTestId('hardware-tab')).toBeInTheDocument();

    // Editar direto
    fireEvent.click(screen.getByText('Editar Ferragem'));
    expect(screen.getByTestId('hardware-form-modal')).toBeInTheDocument();
    expect(screen.getByText('HardwareModal Fecho Concha')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar HardwareModal'));

    // Detalhes -> Editar
    fireEvent.click(screen.getByText('Detalhes Ferragem'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('DetailsModal Fecho Concha')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Editar nos Detalhes'));
    expect(screen.getByTestId('hardware-form-modal')).toBeInTheDocument();
  });
});
