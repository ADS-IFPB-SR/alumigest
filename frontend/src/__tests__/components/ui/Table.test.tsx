import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Table } from '@/components/ui/Table';

describe('Table Component', () => {
  interface MockRow {
    id: number;
    name: string;
    code: string;
  }

  const columns = [
    { header: 'Código', accessor: 'code' as const },
    { header: 'Nome', accessor: (row: MockRow) => <strong>{row.name}</strong> },
  ];

  const mockData: MockRow[] = [
    { id: 1, name: 'Vidro Incolor', code: 'VID-01' },
    { id: 2, name: 'Perfil Alumínio', code: 'PRF-02' },
  ];

  it('deve renderizar cabeçalhos e linhas com os dados fornecidos', () => {
    render(<Table columns={columns} data={mockData} />);

    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('VID-01')).toBeInTheDocument();
    expect(screen.getByText('Vidro Incolor')).toBeInTheDocument();
    expect(screen.getByText('PRF-02')).toBeInTheDocument();
    expect(screen.getByText('Perfil Alumínio')).toBeInTheDocument();
    expect(screen.getByText('Total: 2')).toBeInTheDocument();
  });

  it('deve disparar onEdit ao clicar no botão de edição', () => {
    const onEdit = vi.fn();
    render(<Table columns={columns} data={mockData} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: 'edit' });
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockData[0]);
  });

  it('deve disparar onViewDetails ao clicar no botão de detalhes', () => {
    const onViewDetails = vi.fn();
    render(<Table columns={columns} data={mockData} onViewDetails={onViewDetails} />);

    const detailButtons = screen.getAllByRole('button', { name: 'open_in_new' });
    fireEvent.click(detailButtons[1]);

    expect(onViewDetails).toHaveBeenCalledWith(mockData[1]);
  });

  it('deve disparar onDelete ao clicar no botão de excluir', () => {
    const onDelete = vi.fn();
    render(<Table columns={columns} data={mockData} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockData[0]);
  });
});
