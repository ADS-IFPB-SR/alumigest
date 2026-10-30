import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PartSaleForm } from '../../../features/part-sales/components/PartSaleForm';
import { partSaleApi } from '../../../features/part-sales/services/partSaleApi';

vi.mock('../../../features/part-sales/services/partSaleApi', () => ({
  partSaleApi: {
    calculateItem: vi.fn(),
    create: vi.fn(),
  },
}));

const mockCustomers = [
  { id: 'cli-1', nomeCompleto: 'Vidraçaria Ideal', documento: '12.345.678/0001-90' },
];

describe('PartSaleForm Component (US-46.2 & Protótipo Venda Avulsa)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o cabeçalho, campos de perfil de alumínio e resumo inicial', () => {
    render(<PartSaleForm initialCustomers={mockCustomers} />);

    expect(screen.getByText('Venda Avulsa')).toBeInTheDocument();
    expect(screen.getByText(/Lançamento rápido de itens/i)).toBeInTheDocument();
    expect(screen.getByTestId('badge-metro-linear')).toBeInTheDocument();
    expect(screen.getByTestId('summary-total-pieces')).toHaveTextContent('0');
    expect(screen.getByTestId('summary-total-amount')).toHaveTextContent('R$ 0,00');
  });

  it('deve adicionar um item de perfil de alumínio à tabela e atualizar o resumo financeiro', async () => {
    vi.mocked(partSaleApi.calculateItem).mockResolvedValueOnce({
      calculatedUnitMeasure: 10.5,
      unitPrice: 45.0,
      totalPrice: 472.5,
    });

    render(<PartSaleForm initialCustomers={mockCustomers} />);

    // Preenche a descrição do material
    const inputDesc = screen.getByTestId('input-part-description');
    fireEvent.change(inputDesc, { target: { value: 'Perfil U Linha Suprema Branco' } });

    // Ajusta o comprimento para 2500 mm e quantidade para 4 barras
    const inputLength = screen.getByTestId('input-aluminum-length');
    fireEvent.change(inputLength, { target: { value: '2500' } });

    const inputQty = screen.getByTestId('input-aluminum-quantity');
    fireEvent.change(inputQty, { target: { value: '4' } });

    // Clica em "Inserir na Venda"
    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    // Verifica que o item foi inserido na tabela
    expect(screen.getByText('PERFIL U LINHA SUPREMA BRANCO')).toBeInTheDocument();
    expect(screen.getByText('Alumínio')).toBeInTheDocument();
    expect(screen.getByText('2500 mm (Comp.)')).toBeInTheDocument();

    // Verifica atualização do resumo
    expect(screen.getByTestId('summary-total-pieces')).toHaveTextContent('4');
    expect(screen.getByTestId('badge-total-items-count')).toHaveTextContent('1 item(ns)');
  });

  it('deve impedir inserção caso a descrição não seja informada', () => {
    render(<PartSaleForm initialCustomers={mockCustomers} />);

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    expect(screen.getByText('Informe a descrição do material.')).toBeInTheDocument();
  });

  it('deve permitir remover um item inserido e recalcular o resumo', () => {
    render(<PartSaleForm initialCustomers={mockCustomers} />);

    const inputDesc = screen.getByTestId('input-part-description');
    fireEvent.change(inputDesc, { target: { value: 'Barra Cantoneira 1 Pol' } });

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    expect(screen.getByText('BARRA CANTONEIRA 1 POL')).toBeInTheDocument();
    expect(screen.getByTestId('badge-total-items-count')).toHaveTextContent('1 item(ns)');

    // Remove o item
    const btnRemove = screen.getByLabelText(/remover item/i);
    fireEvent.click(btnRemove);

    expect(screen.queryByText('BARRA CANTONEIRA 1 POL')).not.toBeInTheDocument();
    expect(screen.getByTestId('badge-total-items-count')).toHaveTextContent('0 item(ns)');
    expect(screen.getByTestId('summary-total-pieces')).toHaveTextContent('0');
  });

  it('deve abater o desconto informado do valor total da venda', () => {
    render(<PartSaleForm initialCustomers={mockCustomers} />);

    const inputDesc = screen.getByTestId('input-part-description');
    fireEvent.change(inputDesc, { target: { value: 'Tubo Retangular 50x25' } });

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    // Aplica desconto de R$ 20,00
    const inputDiscount = screen.getByTestId('input-discount-amount');
    fireEvent.change(inputDiscount, { target: { value: '20' } });

    expect(screen.getByTestId('summary-total-amount')).toBeInTheDocument();
  });

  it('deve permitir adicionar item de ferragem por unidade (US-46.1)', async () => {
    render(<PartSaleForm initialCustomers={mockCustomers} />);

    // Troca categoria para Ferragem
    const categorySelect = screen.getByTestId('select-part-category');
    fireEvent.change(categorySelect, { target: { value: 'HARDWARE' } });

    const inputDesc = screen.getByTestId('input-part-description');
    fireEvent.change(inputDesc, { target: { value: 'Roldana Dupla Suprema 112' } });

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    expect(screen.getByText('ROLDANA DUPLA SUPREMA 112')).toBeInTheDocument();
    expect(screen.getByText('Ferragem')).toBeInTheDocument();
    expect(screen.getByText('Unidade')).toBeInTheDocument();
    expect(screen.getByTestId('badge-total-items-count')).toHaveTextContent('1 item(ns)');
  });

  it('deve salvar a venda avulsa e exibir o código gerado', async () => {
    vi.mocked(partSaleApi.create).mockResolvedValueOnce({
      id: 'venda-uuid-1',
      code: 'VP-2026-0042',
      clientId: 'cli-1',
      clientName: 'Vidraçaria Ideal',
      status: 'APPROVED',
      subtotalAmount: 45,
      discountAmount: 0,
      totalAmount: 45,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<PartSaleForm initialCustomers={mockCustomers} />);

    const inputDesc = screen.getByTestId('input-part-description');
    fireEvent.change(inputDesc, { target: { value: 'Perfil Cantoneira' } });

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    const btnSave = screen.getByTestId('btn-save-part-sale');
    fireEvent.click(btnSave);

    await waitFor(() => {
      expect(partSaleApi.create).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/Código Gerado: VP-2026-0042/i)).toBeInTheDocument();
  });

  it('deve abrir e fechar os modais de exportação de PDF e etiquetas térmicas', () => {
    render(<PartSaleForm initialCustomers={mockCustomers} />);

    const inputDesc = screen.getByTestId('input-part-description');
    fireEvent.change(inputDesc, { target: { value: 'Perfil Linha 25' } });

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    // Modal PDF
    const btnPdf = screen.getByTestId('btn-export-pdf');
    fireEvent.click(btnPdf);
    expect(screen.getByText('Visualização para Exportação / PDF')).toBeInTheDocument();

    const btnClosePdf = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(btnClosePdf);
    expect(screen.queryByText('Visualização para Exportação / PDF')).not.toBeInTheDocument();

    // Modal Etiquetas
    const btnLabels = screen.getByTestId('btn-print-labels');
    fireEvent.click(btnLabels);
    expect(screen.getByText('Etiquetas Térmicas de Expedição')).toBeInTheDocument();

    const btnCloseLabels = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(btnCloseLabels);
    expect(screen.queryByText('Etiquetas Térmicas de Expedição')).not.toBeInTheDocument();
  });
});
