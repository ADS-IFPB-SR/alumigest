import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { Select } from '@/components/ui/Select';

describe('Select Component [Joseph Nichollas]', () => {
  const options = [
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2' },
  ];

  it('deve renderizar o label e as opções', () => {
    render(<Select label="Status" options={options} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Selecione...')).toBeInTheDocument();
    expect(screen.getByText('Opção 1')).toBeInTheDocument();
    expect(screen.getByText('Opção 2')).toBeInTheDocument();
  });

  it('deve renderizar asterisco quando for required', () => {
    render(<Select label="Campo Obrigatório" options={options} required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de erro quando fornecida', () => {
    render(<Select label="Status" options={options} error="Campo obrigatório" />);

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('deve repassar ref para o elemento select', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<Select ref={ref} label="Status" options={options} />);

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});
