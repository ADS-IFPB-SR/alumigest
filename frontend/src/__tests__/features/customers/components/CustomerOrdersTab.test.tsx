import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerOrdersTab } from '../../../../features/customers/components/CustomerOrdersTab';
import type { ClientOrderSummaryDTO } from '../../../../features/customers/services/customersApi';

describe('CustomerOrdersTab', () => {
  const mockOrders: ClientOrderSummaryDTO[] = [
    {
      id: 'order-1',
      codigo: 'OS-2026-0042',
      data: '2026-10-01',
      status: 'IN_PRODUCTION',
      statusDescricao: 'Em Produção',
      valorTotal: 1800.00,
      totalEsquadrias: 2,
      items: [
        {
          id: 'item-1',
          descricao: 'Janela de Correr 2 Folhas',
          larguraMm: 1200,
          alturaMm: 1400,
          quantidade: 1,
          corAluminio: 'Natural',
          tipoVidro: 'Mini Boreal',
          valorTotal: 1800.00,
        },
        {
          id: 'item-2',
          descricao: 'Porta de Correr 3 Folhas',
          larguraMm: 2100,
          alturaMm: 2100,
          quantidade: 1,
          corAluminio: 'Branco',
          tipoVidro: 'Liso Incolor',
          valorTotal: 2200.00,
        },
      ],
    },
    {
      id: 'order-2',
      codigo: 'OS-2026-0038',
      data: '2026-09-15',
      status: 'COMPLETED',
      statusDescricao: 'Concluído',
      valorTotal: 3200.00,
      totalEsquadrias: 1,
      items: [
        {
          id: 'item-3',
          descricao: 'Box de Banheiro',
          larguraMm: 900,
          alturaMm: 1900,
          quantidade: 1,
          corAluminio: 'Natural',
          tipoVidro: 'Temperado 8mm',
          valorTotal: 3200.00,
        },
      ],
    },
  ];

  it('deve renderizar a tabela com as colunas corretas sem sobreposição visual', () => {
    render(<CustomerOrdersTab orders={mockOrders} />);

    // Verifica cabeçalhos das colunas
    expect(screen.getByText('Código O.S.')).toBeInTheDocument();
    expect(screen.getByText('Situação Fabril')).toBeInTheDocument();
    expect(screen.getByText('Esquadrias')).toBeInTheDocument();

    // Verifica dados das ordens
    expect(screen.getByText('OS-2026-0042')).toBeInTheDocument();
    expect(screen.getByText('OS-2026-0038')).toBeInTheDocument();
    expect(screen.getByText('Em Produção')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('deve exibir o cartão de esquadrias ao clicar em uma ordem', () => {
    render(<CustomerOrdersTab orders={mockOrders} />);

    // Antes do clique, o drawer não deve existir
    expect(screen.queryByText('Esquadrias da O.S.')).not.toBeInTheDocument();

    // Clica na primeira linha da tabela
    const firstRow = screen.getByText('OS-2026-0042').closest('tr');
    expect(firstRow).not.toBeNull();
    fireEvent.click(firstRow!);

    // Após o clique, o drawer deve aparecer com as esquadrias
    expect(screen.getByText(/Esquadrias da O\.S\./)).toBeInTheDocument();
    expect(screen.getByText('Janela de Correr 2 Folhas')).toBeInTheDocument();
    expect(screen.getByText(/1200 x 1400 mm/)).toBeInTheDocument();
    expect(screen.getByText(/Natural/)).toBeInTheDocument();
    expect(screen.getByText(/Mini Boreal/)).toBeInTheDocument();
  });

  it('deve exibir medidas nominais em milímetros no cartão de esquadrias', () => {
    render(<CustomerOrdersTab orders={mockOrders} />);

    const firstRow = screen.getByText('OS-2026-0042').closest('tr');
    fireEvent.click(firstRow!);

    // Verifica badge de medidas em mm
    expect(screen.getByText(/1200 x 1400 mm/)).toBeInTheDocument();
    expect(screen.getByText(/2100 x 2100 mm/)).toBeInTheDocument();
  });

  it('deve fechar o drawer ao clicar novamente na mesma linha', () => {
    render(<CustomerOrdersTab orders={mockOrders} />);

    const firstRow = screen.getByText('OS-2026-0042').closest('tr');

    // Abre o drawer
    fireEvent.click(firstRow!);
    expect(screen.getByText(/Esquadrias da O\.S\./)).toBeInTheDocument();

    // Fecha o drawer
    fireEvent.click(firstRow!);
    expect(screen.queryByText(/Esquadrias da O\.S\./)).not.toBeInTheDocument();
  });

  it('deve chamar onOpenTechSheet ao clicar no botão Ficha Técnica', () => {
    const handleTechSheet = vi.fn();
    render(<CustomerOrdersTab orders={mockOrders} onOpenTechSheet={handleTechSheet} />);

    const techSheetButtons = screen.getAllByRole('button', { name: /ficha técnica/i });
    fireEvent.click(techSheetButtons[0]);

    expect(handleTechSheet).toHaveBeenCalledWith('order-1');
  });

  it('deve chamar onOpenLabels ao clicar no botão Etiquetas', () => {
    const handleLabels = vi.fn();
    render(<CustomerOrdersTab orders={mockOrders} onOpenLabels={handleLabels} />);

    const labelButtons = screen.getAllByRole('button', { name: /etiquetas da o\.s\./i });
    fireEvent.click(labelButtons[0]);

    expect(handleLabels).toHaveBeenCalledWith('order-1');
  });

  it('deve renderizar estado vazio quando não houver ordens de serviço', () => {
    render(<CustomerOrdersTab orders={[]} />);

    expect(
      screen.getByText('Nenhuma O.S. vinculada a este cliente')
    ).toBeInTheDocument();
  });
});
