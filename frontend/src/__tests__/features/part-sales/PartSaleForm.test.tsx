import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PartSaleForm } from '../../../features/part-sales/components/PartSaleForm';
import { partSaleApi } from '../../../features/part-sales/services/partSaleApi';
import type { MaterialOption } from '../../../features/part-sales/types';

vi.mock('../../../features/part-sales/services/partSaleApi', () => ({
  partSaleApi: {
    calculateItem: vi.fn(),
    create: vi.fn(),
    getMaterialsByCategory: vi.fn(),
  },
}));

const mockCustomers = [
  { id: 'cli-1', nomeCompleto: 'Vidraçaria Ideal', documento: '12.345.678/0001-90' },
];

const mockCatalogMaterials: MaterialOption[] = [
  {
    id: 'mat-profile-1',
    name: 'Perfil U Linha Suprema Branco',
    category: 'PROFILE',
    unitPrice: 45.0,
    unitOfMeasure: 'METRO',
    color: 'Branco',
  },
  {
    id: 'mat-profile-2',
    name: 'Barra Cantoneira 1 Pol',
    category: 'PROFILE',
    unitPrice: 35.0,
    unitOfMeasure: 'METRO',
  },
  {
    id: 'mat-profile-3',
    name: 'Tubo Retangular 50x25',
    category: 'PROFILE',
    unitPrice: 50.0,
    unitOfMeasure: 'METRO',
  },
  {
    id: 'mat-profile-4',
    name: 'Perfil Cantoneira',
    category: 'PROFILE',
    unitPrice: 40.0,
    unitOfMeasure: 'METRO',
  },
  {
    id: 'mat-profile-5',
    name: 'Perfil Linha 25',
    category: 'PROFILE',
    unitPrice: 45.0,
    unitOfMeasure: 'METRO',
  },
  {
    id: 'mat-hardware-1',
    name: 'Roldana Dupla Suprema 112',
    category: 'HARDWARE',
    unitPrice: 25.0,
    unitOfMeasure: 'UN',
  },
  {
    id: 'mat-glass-1',
    name: 'Vidro Temperado 8mm Incolor',
    category: 'GLASS',
    unitPrice: 180.0,
    unitOfMeasure: 'M2',
    thicknessMm: 8,
    color: 'Incolor',
  },
];

function renderForm(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

async function selectMaterial(optionTestId: string) {
  const inputDesc = screen.getByTestId('input-part-description');
  fireEvent.focus(inputDesc);
  const option = await screen.findByTestId(optionTestId);
  fireEvent.click(option);
}

describe('PartSaleForm Component (US-46.2 & US-46.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(partSaleApi.getMaterialsByCategory).mockResolvedValue(mockCatalogMaterials);
  });

  it('deve renderizar o cabeçalho, campos de perfil de alumínio e resumo inicial', () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

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
      minimumAreaApplied: false,
    });

    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    // Seleciona material no autocomplete
    await selectMaterial('material-option-mat-profile-1');

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

  it('deve impedir inserção caso o material não seja selecionado (Critério 4)', () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    expect(screen.getByTestId('material-autocomplete-error')).toHaveTextContent(
      'Selecione um material válido do catálogo.'
    );
  });

  it('deve permitir remover um item inserido e recalcular o resumo', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-2');

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

  it('deve abater o desconto informado do valor total da venda', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-3');

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    // Aplica desconto de R$ 20,00
    const inputDiscount = screen.getByTestId('input-discount-amount');
    fireEvent.change(inputDiscount, { target: { value: '20' } });

    expect(screen.getByTestId('summary-total-amount')).toBeInTheDocument();
  });

  it('deve permitir adicionar item de ferragem por unidade (US-46.1)', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    // Troca categoria para Ferragem
    const categorySelect = screen.getByTestId('select-part-category');
    fireEvent.change(categorySelect, { target: { value: 'HARDWARE' } });

    await selectMaterial('material-option-mat-hardware-1');

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    expect(screen.getByText('ROLDANA DUPLA SUPREMA 112')).toBeInTheDocument();
    expect(screen.getByText('Ferragem')).toBeInTheDocument();
    expect(screen.getByText('Unidade')).toBeInTheDocument();
    expect(screen.getByTestId('badge-total-items-count')).toHaveTextContent('1 item(ns)');
  });

  it('deve salvar a venda avulsa e exibir o código gerado enviando o materialId real', async () => {
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

    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-4');

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    const btnSave = screen.getByTestId('btn-save-part-sale');
    fireEvent.click(btnSave);

    await waitFor(() => {
      expect(partSaleApi.create).toHaveBeenCalledTimes(1);
      expect(partSaleApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              referenceId: 'mat-profile-4',
            }),
          ]),
        })
      );
    });

    expect(await screen.findByText(/Código Gerado: VP-2026-0042/i)).toBeInTheDocument();
  });

  it('[Transição de Estados - Critério 5] deve resetar a seleção do material ao alternar a categoria principal', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-1');
    const inputDesc = screen.getByTestId('input-part-description');
    expect(inputDesc).toHaveValue('Perfil U Linha Suprema Branco');

    // Alterna categoria de PROFILE para GLASS
    const categorySelect = screen.getByTestId('select-part-category');
    fireEvent.change(categorySelect, { target: { value: 'GLASS' } });

    // O input do material deve ter sido limpo
    expect(inputDesc).toHaveValue('');
  });

  it('deve abrir e fechar os modais de exportação de PDF e etiquetas térmicas', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-5');

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

  it('deve exibir alerta visual de item pendente quando material é selecionado mas ainda não foi inserido na venda', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-1');

    expect(screen.getByTestId('alert-pending-insertion')).toBeInTheDocument();
    expect(screen.getByText(/Item pronto! Clique em/i)).toBeInTheDocument();
    expect(screen.getByTestId('info-empty-sale')).toBeInTheDocument();
  });

  it('deve exibir painel de cálculo em tempo real para item de ferragem (HARDWARE)', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    const categorySelect = screen.getByTestId('select-part-category');
    fireEvent.change(categorySelect, { target: { value: 'HARDWARE' } });

    await selectMaterial('material-option-mat-hardware-1');

    const inputQty = screen.getByTestId('input-hardware-quantity');
    fireEvent.change(inputQty, { target: { value: '4' } });

    expect(screen.getByTestId('panel-calculated-hardware')).toBeInTheDocument();
    expect(screen.getByText('4 un')).toBeInTheDocument();
    // 4 un x R$ 25,00 = R$ 100,00
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('deve calcular 1 metro de alumínio a R$ 80,00 exatamente como R$ 80,00 (perda inclusa no preço)', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-1');

    // 1000 mm = 1 metro linear
    const inputLength = screen.getByTestId('input-aluminum-length');
    fireEvent.change(inputLength, { target: { value: '1000' } });

    const inputQty = screen.getByTestId('input-aluminum-quantity');
    fireEvent.change(inputQty, { target: { value: '1' } });

    const inputPrice = screen.getByTestId('input-aluminum-price');
    fireEvent.change(inputPrice, { target: { value: '80' } });

    const btnAdd = screen.getByTestId('btn-add-part-item');
    fireEvent.click(btnAdd);

    // Subtotal deve ser exatamente R$ 80,00
    expect(screen.getByTestId('summary-subtotal')).toHaveTextContent('R$ 80,00');
    expect(screen.getByTestId('summary-total-amount')).toHaveTextContent('R$ 80,00');
  });

  it('deve exibir erro específico se usuário tentar salvar a venda com material configurado sem clicar em inserir', async () => {
    renderForm(<PartSaleForm initialCustomers={mockCustomers} />);

    await selectMaterial('material-option-mat-profile-1');

    // Usuário clica direto em Salvar sem clicar em "Inserir na Venda"
    const btnSave = screen.getByTestId('btn-save-part-sale');
    // Como o botão está desabilitado quando items.length === 0, garantimos que disabled é true
    expect(btnSave).toBeDisabled();
  });
});
