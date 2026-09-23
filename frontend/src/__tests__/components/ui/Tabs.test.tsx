import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Tabs, Tab } from '@/components/ui/Tabs';

describe('Tabs Component', () => {
  it('deve renderizar abas e exibir o conteúdo da primeira aba por padrão', () => {
    render(
      <Tabs>
        <Tab label="Aba 1">
          <p>Conteúdo da Aba 1</p>
        </Tab>
        <Tab label="Aba 2">
          <p>Conteúdo da Aba 2</p>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Aba 1')).toBeInTheDocument();
    expect(screen.getByText('Aba 2')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da Aba 1')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo da Aba 2')).not.toBeInTheDocument();
  });

  it('Técnica: Transição de Estados - deve alternar para a segunda aba ao clicar nela', () => {
    render(
      <Tabs defaultIndex={0}>
        <Tab label="Geral">
          <p>Painel Geral</p>
        </Tab>
        <Tab label="Avançado">
          <p>Painel Avançado</p>
        </Tab>
      </Tabs>
    );

    const tabAvancado = screen.getByRole('button', { name: 'Avançado' });
    fireEvent.click(tabAvancado);

    expect(screen.queryByText('Painel Geral')).not.toBeInTheDocument();
    expect(screen.getByText('Painel Avançado')).toBeInTheDocument();
  });

  it('deve inicializar com o defaultIndex customizado', () => {
    render(
      <Tabs defaultIndex={1}>
        <Tab label="Aba 0">
          <p>Conteúdo Zero</p>
        </Tab>
        <Tab label="Aba 1">
          <p>Conteúdo Um</p>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Conteúdo Um')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Zero')).not.toBeInTheDocument();
  });
});
