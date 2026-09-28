import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CategoryBadges } from '../../../../features/catalog/components/CategoryBadges';

describe('CategoryBadges Component [Joseph Nichollas]', () => {
  it('deve renderizar traço quando lista de categorias for vazia ou nula', () => {
    const { rerender } = render(<CategoryBadges categories={[]} />);
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(<CategoryBadges categories={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('deve renderizar badges para todas as categorias com seus respectivos rótulos e ícones', () => {
    render(<CategoryBadges categories={['GLASS', 'PROFILE', 'HARDWARE', 'FILM']} />);

    expect(screen.getByText('Vidro')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Ferragem')).toBeInTheDocument();
    expect(screen.getByText('Película')).toBeInTheDocument();
  });
});
