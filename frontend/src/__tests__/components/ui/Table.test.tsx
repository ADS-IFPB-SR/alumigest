import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Table } from '@/components/ui/Table';

describe('Table Component [Joseph Nichollas]', () => {
  interface MockRow {
    id: number;
    name: string;
    code: string;
    price?: number | null;
  }

  const columns = [
    { header: 'Código', accessor: 'code' as const },
    { header: 'Nome', accessor: (row: MockRow) => <strong>{row.name}</strong> },
    {
      header: 'Preço',
      accessor: 'price' as const,
      exportValue: (row: MockRow) => (row.price ? `R$ ${row.price};00` : null),
    },
  ];

  const mockData: MockRow[] = [
    { id: 1, name: 'Vidro Incolor', code: 'VID-01', price: 150 },
    { id: 2, name: 'Perfil Alumínio', code: 'PRF-02', price: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-csv');
    window.URL.revokeObjectURL = vi.fn();
  });

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

  it('deve exportar CSV corretamente com exportValue e accessor padrão', () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    render(<Table columns={columns} data={mockData} />);

    const exportBtn = screen.getByRole('button', { name: /Exportar/i });
    fireEvent.click(exportBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendChildSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-csv');
  });

  it('não deve disparar exportação quando a lista de dados estiver vazia', () => {
    render(<Table columns={columns} data={[]} />);

    const exportBtn = screen.getByRole('button', { name: /Exportar/i });
    fireEvent.click(exportBtn);

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
  });

  it('deve aplicar rowTestId e rowTestAttributes nas linhas', () => {
    render(
      <Table
        columns={columns}
        data={mockData}
        rowTestId={(row) => `custom-row-${row.id}`}
        rowTestAttributes={(row) => ({ 'data-custom-type': row.code })}
      />
    );

    const firstRow = document.querySelector('[data-cy="custom-row-1"]');
    expect(firstRow).toBeInTheDocument();
    expect(firstRow).toHaveAttribute('data-custom-type', 'VID-01');
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
