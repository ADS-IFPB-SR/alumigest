import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialTypeSelectionModal } from '../../../../features/catalog/components/MaterialTypeSelectionModal';

describe('MaterialTypeSelectionModal Component [Joseph Nichollas]', () => {
  it('deve renderizar os tipos disponíveis e permitir seleção', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <MaterialTypeSelectionModal isOpen={true} onClose={onClose} onSelect={onSelect} />
    );

    expect(screen.getByText('Selecione o Tipo de Material para Cadastrar')).toBeInTheDocument();
    expect(screen.getByText('Vidro')).toBeInTheDocument();
    expect(screen.getByText('Perfil de Alumínio')).toBeInTheDocument();
    expect(screen.getByText('Película de Proteção/Estética')).toBeInTheDocument();
    expect(screen.getByText('Ferragem / Acessório')).toBeInTheDocument();

    const glassBtn = screen.getByRole('button', { name: /Vidro/i });
    fireEvent.click(glassBtn);
    expect(onSelect).toHaveBeenCalledWith('Glass');

    const profileBtn = screen.getByRole('button', { name: /Perfil de Alumínio/i });
    fireEvent.click(profileBtn);
    expect(onSelect).toHaveBeenCalledWith('Profile');

    const filmBtn = screen.getByRole('button', { name: /Película de Proteção\/Estética/i });
    fireEvent.click(filmBtn);
    expect(onSelect).toHaveBeenCalledWith('Film');

    const hardwareBtn = screen.getByRole('button', { name: /Ferragem \/ Acessório/i });
    fireEvent.click(hardwareBtn);
    expect(onSelect).toHaveBeenCalledWith('Hardware');
  });
});
