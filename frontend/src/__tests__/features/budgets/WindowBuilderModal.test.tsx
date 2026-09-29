import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowBuilderModal } from '../../../features/budgets/components/builder/WindowBuilderModal';
import { renderWithProviders } from '../../../test/test-utils';
import type { BudgetItem, DoorTemplateType } from '../../../features/budgets/types';

// Hoisted mocks para Vitest
const { mockCatalogResults, mockToast } = vi.hoisted(() => {
  const products = [
    {
      id: 'prod-1',
      name: 'Porta de Correr Suprema 2F',
      templateType: 'SLIDING_DOOR_2F' as DoorTemplateType,
      isActive: true,
      laborCost: 150,
      categoryRequirements: ['GLASS', 'PROFILE'],
      templateConfig: {
        profileMm: 20,
        aluminumColor: 'Branco Brilhante',
        glassColor: 'Incolor',
        openingDirection: 'LEFT_TO_RIGHT',
      },
    },
    {
      id: 'prod-2',
      name: 'Janela Maxim-ar 1 Folha',
      templateType: 'AWNING_WINDOW_1F' as DoorTemplateType,
      isActive: true,
      laborCost: 80,
      templateConfig: {
        profileMm: 20,
        aluminumColor: 'Preto Fosco',
        glassColor: 'Fumê / Cinza',
        openingDirection: 'OUTSIDE',
      },
    },
  ];

  const glasses = [
    {
      id: 'glass-1',
      name: 'Vidro Temperado Incolor 8mm',
      salePrice: 150,
      pricePerSqm: 150,
      colorFinish: 'Incolor',
      unitMeasure: 'm²',
    },
    {
      id: 'glass-2',
      name: 'Vidro Temperado Fumê 8mm',
      salePrice: 180,
      pricePerSqm: 180,
      colorFinish: 'Fumê / Cinza',
      unitMeasure: 'm²',
    },
  ];

  const profiles = [
    {
      id: 'prof-1',
      name: 'Perfil Linha Suprema Branco',
      salePrice: 50,
      colorFinish: 'Branco Brilhante',
      unitMeasure: 'm',
      isHandle: false,
    },
    {
      id: 'prof-2',
      name: 'Perfil Linha Suprema Preto',
      salePrice: 55,
      colorFinish: 'Preto Fosco',
      unitMeasure: 'm',
      isHandle: false,
    },
  ];

  const hardwares = [
    {
      id: 'hard-1',
      name: 'Puxador Tubular Inox 40cm',
      salePrice: 120,
      unitMeasure: 'un',
      isHandle: true,
    },
  ];

  const films: any[] = [];

  return {
    mockToast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    mockCatalogResults: {
      products: { data: { content: products, totalElements: products.length }, isLoading: false },
      glasses: { data: { content: glasses, totalElements: glasses.length }, isLoading: false },
      profiles: { data: { content: profiles, totalElements: profiles.length }, isLoading: false },
      hardwares: { data: { content: hardwares, totalElements: hardwares.length }, isLoading: false },
      films: { data: { content: films, totalElements: 0 }, isLoading: false },
    },
  };
});

vi.mock('react-hot-toast', () => ({
  default: mockToast,
}));

vi.mock('../../../features/catalog/hooks/useCatalog', () => ({
  useProducts: () => mockCatalogResults.products,
  useGlasses: () => mockCatalogResults.glasses,
  useProfiles: () => mockCatalogResults.profiles,
  useHardwares: () => mockCatalogResults.hardwares,
  useFilms: () => mockCatalogResults.films,
}));

vi.mock('../../../features/budgets/services/budgetsApi', async () => {
  const actual = await vi.importActual('../../../features/budgets/services/budgetsApi');
  return {
    ...actual,
    budgetsApi: {
      ...(actual as any).budgetsApi,
      previewItemCalculation: vi.fn().mockResolvedValue({
        subtotal: 1200,
        materialsSubtotal: 1050,
        laborCost: 150,
        components: [],
      }),
    },
  };
});

describe('WindowBuilderModal — [US-09.34] Alinhamento e Adição de Esquadrias ao Orçamento', () => {
  const onAddItem = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar quando isOpen for false', () => {
    renderWithProviders(
      <WindowBuilderModal
        isOpen={false}
        selectedProductId="prod-1"
        onClose={onClose}
        onAddItem={onAddItem}
      />,
    );

    expect(screen.queryByText(/Porta de Correr Suprema 2F/i)).not.toBeInTheDocument();
  });

  it('deve abrir o modal no Step 1 (Dimensões) exibindo o template e medidas iniciais', () => {
    renderWithProviders(
      <WindowBuilderModal
        isOpen={true}
        selectedProductId="prod-1"
        onClose={onClose}
        onAddItem={onAddItem}
      />,
    );

    expect(screen.getAllByText('Porta de Correr Suprema 2F')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/1600 × 2150 mm/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Próximo/i })).toBeInTheDocument();
  });

  it('deve permitir alterar largura, altura e quantidade no Step 1 e refletir no cabeçalho e cálculo', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <WindowBuilderModal
        isOpen={true}
        selectedProductId="prod-1"
        onClose={onClose}
        onAddItem={onAddItem}
      />,
    );

    // Localiza inputs de largura, altura e quantidade
    const widthInput = screen.getByLabelText(/Largura \(mm\)/i);
    const heightInput = screen.getByLabelText(/Altura \(mm\)/i);
    const qtyInput = screen.getByLabelText(/^Quantidade/i);

    await user.clear(widthInput);
    await user.type(widthInput, '2000');

    await user.clear(heightInput);
    await user.type(heightInput, '2200');

    await user.clear(qtyInput);
    await user.type(qtyInput, '3');

    // Cabeçalho deve refletir dimensões e quantidade multiplicada
    expect(screen.getByText(/2000 × 2200 mm · 4\.40 m² · 3 unidades/i)).toBeInTheDocument();
  });

  it('deve navegar pelas etapas do wizard e salvar o item com template, medidas, cor e vidro corretos', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <WindowBuilderModal
        isOpen={true}
        selectedProductId="prod-1"
        onClose={onClose}
        onAddItem={onAddItem}
      />,
    );

    // Step 1: Configurar 1800 x 2100 mm, 2 unidades
    const widthInput = screen.getByLabelText(/Largura \(mm\)/i);
    const heightInput = screen.getByLabelText(/Altura \(mm\)/i);
    const qtyInput = screen.getByLabelText(/^Quantidade/i);

    await user.clear(widthInput);
    await user.type(widthInput, '1800');
    await user.clear(heightInput);
    await user.type(heightInput, '2100');
    await user.clear(qtyInput);
    await user.type(qtyInput, '2');

    // Avança para Step 2: Insumos
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    expect(screen.getByText(/Composição de Insumos/i)).toBeInTheDocument();

    // Seleciona materiais obrigatórios (Vidros e Perfis de Alumínio)
    const glassSelect = screen.getByLabelText(/Selecionar material para Vidros/i);
    await user.selectOptions(glassSelect, 'glass-1');

    const profileSelect = screen.getByLabelText(/Selecionar material para Perfis de Alumínio/i);
    await user.selectOptions(profileSelect, 'prof-1');

    // Avança para Step 3: Mecânica & Furação
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    expect(screen.getByText(/Sentido de Abertura/i)).toBeInTheDocument();

    // Preenche observações no Step 3
    const notesInput = screen.getByLabelText(/Observações do Item/i);
    await user.type(notesInput, 'Instalação no quarto principal');

    // Avança para Step 4: Resumo Técnico
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    expect(screen.getByText(/Ficha Técnica & Resumo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1800 × 2100 mm/i)[0]).toBeInTheDocument();

    // Clica no botão final "Adicionar"
    const addBtn = screen.getByRole('button', { name: /Adicionar/i });
    await user.click(addBtn);

    // onAddItem deve ter sido chamado com payload completo e consistente
    await waitFor(() => {
      expect(onAddItem).toHaveBeenCalledTimes(1);
    });

    const addedItem: BudgetItem = onAddItem.mock.calls[0][0];
    expect(addedItem.productId).toBe('prod-1');
    expect(addedItem.productName).toBe('Porta de Correr Suprema 2F');
    expect(addedItem.templateType).toBe('SLIDING_DOOR_2F');
    expect(addedItem.widthMm).toBe(1800);
    expect(addedItem.heightMm).toBe(2100);
    expect(addedItem.quantity).toBe(2);
    expect(addedItem.notes).toBe('Instalação no quarto principal');

    // Verifica que cores e configurações de gabarito foram passadas corretamente
    expect(addedItem.templateConfig).toBeDefined();
    expect(addedItem.templateConfig.templateType).toBe('SLIDING_DOOR_2F');
    expect(addedItem.templateConfig.aluminumColor).toBe('Branco Brilhante');
    expect(addedItem.templateConfig.glassFinish).toBe('Incolor');
    expect(addedItem.templateConfig.openingDirection).toBe('LEFT_TO_RIGHT');

    // Verifica que o subtotal e valor unitário foram gerados
    expect(addedItem.subtotal).toBeGreaterThanOrEqual(0);
    expect(addedItem.unitPrice).toBeGreaterThanOrEqual(0);

    // O modal deve ser fechado
    expect(onClose).toHaveBeenCalledTimes(1);
  }, 30000);

  it('deve carregar dados de um item existente em modo de edição e atualizar mantendo o tempId', async () => {
    const user = userEvent.setup();

    const existingItem: BudgetItem = {
      tempId: 'item-edit-777',
      productId: 'prod-1',
      productName: 'Porta de Correr Suprema 2F',
      templateType: 'SLIDING_DOOR_2F',
      widthMm: 1500,
      heightMm: 2050,
      quantity: 1,
      laborCost: 100,
      options: [],
      subtotal: 950,
      unitPrice: 950,
      notes: 'Nota anterior',
      templateConfig: {
        templateType: 'SLIDING_DOOR_2F',
        aluminumColor: 'Branco Brilhante',
        glassFinish: 'Incolor',
        openingDirection: 'LEFT_TO_RIGHT',
      },
      handleConfig: {
        handleType: 'BAR_TUBULAR',
      },
      drillingConfig: {
        holeCount: 2,
        divisionType: 'EQUAL',
      },
    };

    renderWithProviders(
      <WindowBuilderModal
        isOpen={true}
        selectedProductId="prod-1"
        editingItem={existingItem}
        onClose={onClose}
        onAddItem={onAddItem}
      />,
    );

    // Deve carregar as dimensões do item existente
    const widthInput = screen.getByLabelText(/Largura \(mm\)/i);
    expect(widthInput).toHaveValue(1500);

    // Altera a largura para 1650
    await user.clear(widthInput);
    await user.type(widthInput, '1650');

    // Navega até o Step 4 (passando por 2 e 3)
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));

    // Em modo de edição, o botão deve dizer "Salvar"
    const saveBtn = screen.getByRole('button', { name: /Salvar/i });
    expect(saveBtn).toBeInTheDocument();
    await user.click(saveBtn);

    expect(onAddItem).toHaveBeenCalledTimes(1);
    const updatedItem: BudgetItem = onAddItem.mock.calls[0][0];

    // Preserva o mesmo tempId
    expect(updatedItem.tempId).toBe('item-edit-777');
    expect(updatedItem.widthMm).toBe(1650);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
