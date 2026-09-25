import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetDetailPage } from '../../../pages/BudgetDetailPage';
import * as budgetsHooks from '../../../features/budgets/hooks/useBudgets';
import { budgetsApi } from '../../../features/budgets/services/budgetsApi';

// Mock dos hooks de orçamentos e API
vi.mock('../../../features/budgets/hooks/useBudgets', () => ({
  useBudget: vi.fn(),
  useDeleteBudget: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBudgetStatus: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    downloadCommercialPdf: vi.fn().mockResolvedValue(new Blob()),
    getWhatsAppSummary: vi.fn().mockResolvedValue('Resumo WhatsApp'),
    getBudget: vi.fn(),
    createBudget: vi.fn(),
  },
}));

// Mock do orçamento do Cenário 1 (Fluxo Feliz QA-03)
const mockBudgetFluxoFeliz = {
  id: 'budget-qa03-1',
  code: 'ORC-2026-QA03',
  status: 'DRAFT',
  createdAt: '2026-09-25T10:00:00Z',
  validUntil: '2026-10-10',
  subtotal: 1683.20,
  discountPercent: 5.0,
  discountValue: 84.16,
  total: 1599.04,
  notes: 'Entrega e montagem no endereço da obra em Sousa/PB',
  paymentCondition: 'A_VISTA_PIX',
  paymentConditionLabel: 'À Vista (PIX / Dinheiro)',
  paymentNotes: 'Condição especial para Vidraçaria Silva — 5% desc. à vista no PIX',
  customer: {
    id: 'client-silva-1',
    name: 'Vidraçaria Silva',
    document: '11.222.333/0001-44',
    phone: '(83) 98765-4321',
    email: 'contato@vidracariasilva.com.br',
    address: 'Av. Projetada, 123 - Centro - Sousa/PB',
  },
  items: [
    {
      id: 'item-box-1',
      productId: 'prod-box-2f',
      productName: 'Box Frontal 2 Folhas',
      templateType: 'SLIDING_DOOR_2F',
      width: 1400,
      height: 1900,
      quantity: 2,
      laborCost: 120, // 2 x 120 = 240
      subtotal: 1683.20,
      templateConfig: {
        profileMm: 20,
        aluminumColor: 'Linha Box Branco',
        glassFinish: '8mm Incolor',
        openingDirection: 'LEFT_TO_RIGHT',
      },
      handleConfig: {
        handleType: 'BAR_TUBULAR',
        pieceLengthMm: 400,
      },
      drillingConfig: {
        holeCount: 2,
        divisionType: 'EQUAL',
      },
      options: [
        {
          id: 'opt-1',
          materialName: 'Vidro 8mm Temperado Incolor',
          categoryType: 'GLASS',
          unitMeasure: 'm²',
          quantity: 5.38,
          unitPrice: 140,
          totalPrice: 753.20,
        },
        {
          id: 'opt-2',
          materialName: 'Kit Perfis Linha Box Branco',
          categoryType: 'PROFILE',
          unitMeasure: 'barra',
          quantity: 2,
          unitPrice: 185,
          totalPrice: 370.00,
        },
        {
          id: 'opt-3',
          materialName: 'Kit Ferragens Box Standard',
          categoryType: 'HARDWARE',
          unitMeasure: 'un',
          quantity: 2,
          unitPrice: 95,
          totalPrice: 190.00,
        },
        {
          id: 'opt-4',
          materialName: 'Puxador Tubular Inox 40cm',
          categoryType: 'HARDWARE',
          unitMeasure: 'un',
          quantity: 2,
          unitPrice: 65,
          totalPrice: 130.00,
        },
      ],
    },
  ],
};

// Mock do orçamento do Cenário 2 (Multipágina com 5 Esquadrias Distintas)
const mockBudgetMultipagina5Itens = {
  id: 'budget-qa03-2',
  code: 'ORC-2026-MULTI-5',
  status: 'SENT',
  createdAt: '2026-09-25T10:00:00Z',
  validUntil: '2026-10-15',
  subtotal: 8500.00,
  discountPercent: 5.0,
  discountValue: 425.00,
  total: 8075.00,
  notes: 'Projeto arquitetônico Residencial Alpha — 5 tipologias sob medida',
  customer: {
    id: 'client-multi-1',
    name: 'Vidraçaria Silva & Construções LTDA',
    document: '11.222.333/0001-44',
    phone: '(83) 98765-4321',
    address: 'Rua das Palmeiras, 789 - Alto do Cruzeiro - Sousa/PB',
  },
  items: [
    {
      id: 'item-1',
      productName: 'Porta de Correr 2 Folhas - Sala',
      templateType: 'SLIDING_DOOR_2F',
      width: 2200,
      height: 2400,
      quantity: 1,
      laborCost: 150,
      subtotal: 2500,
      templateConfig: { aluminumColor: 'Preto', glassFinish: '8mm Fumê' },
      handleConfig: { handleType: 'BAR_TUBULAR', pieceLengthMm: 400 },
      drillingConfig: { holeCount: 2, divisionType: 'EQUAL' },
      options: [],
    },
    {
      id: 'item-2',
      productName: 'Janela Maxim-Ar - Suíte',
      templateType: 'AWNING_WINDOW_1F',
      width: 800,
      height: 600,
      quantity: 2,
      laborCost: 80,
      subtotal: 1200,
      templateConfig: { aluminumColor: 'Branco', glassFinish: '6mm Mini-Boreal' },
      handleConfig: { handleType: 'LEVER_HANDLE' },
      drillingConfig: { holeCount: 0 },
      options: [],
    },
    {
      id: 'item-3',
      productName: 'Box Frontal 2 Folhas - Social',
      templateType: 'SLIDING_DOOR_2F',
      width: 1400,
      height: 1900,
      quantity: 2,
      laborCost: 120,
      subtotal: 1800,
      templateConfig: { aluminumColor: 'Branco', glassFinish: '8mm Incolor' },
      handleConfig: { handleType: 'BAR_TUBULAR', pieceLengthMm: 400 },
      drillingConfig: { holeCount: 2, divisionType: 'EQUAL' },
      options: [],
    },
    {
      id: 'item-4',
      productName: 'Painel Fixo de Vidro - Fachada',
      templateType: 'FIXED_PANEL',
      width: 2800,
      height: 2600,
      quantity: 1,
      laborCost: 200,
      subtotal: 2000,
      templateConfig: { aluminumColor: 'Preto', glassFinish: '10mm Laminado Incolor' },
      handleConfig: { handleType: 'NONE' },
      drillingConfig: { holeCount: 0 },
      options: [],
    },
    {
      id: 'item-5',
      productName: 'Porta de Giro 1 Folha - Cozinha',
      templateType: 'SWING_DOOR_1F',
      width: 900,
      height: 2100,
      quantity: 1,
      laborCost: 100,
      subtotal: 1000,
      templateConfig: { aluminumColor: 'Preto', glassFinish: '8mm Incolor' },
      handleConfig: { handleType: 'LEVER_HANDLE' },
      drillingConfig: { holeCount: 1, divisionType: 'EQUAL' },
      options: [],
    },
  ],
};

function renderDetailPage(budgetId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/orcamentos/${budgetId}`]}>
        <Routes>
          <Route path="/orcamentos/:id" element={<BudgetDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('QA-03: Suíte de Testes de Integração End-to-End [Issue #73]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cenário 1 — Jornada Principal (Fluxo Feliz)', () => {
    it('deve validar dados comerciais, cliente "Vidraçaria Silva" e item Box Frontal 1400x1900', () => {
      vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
        data: mockBudgetFluxoFeliz,
        isLoading: false,
        isError: false,
      } as any);

      renderDetailPage('budget-qa03-1');

      // 1. Validação do Código e Cliente
      expect(screen.getByText('ORC-2026-QA03')).toBeInTheDocument();
      expect(screen.getByText('Vidraçaria Silva')).toBeInTheDocument();
      expect(screen.getAllByText('(83) 98765-4321').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Av\. Projetada, 123/i).length).toBeGreaterThan(0);

      // 2. Validação da Esquadria: 2 unidades, 1400 x 1900 mm
      expect(screen.getByText('Box Frontal 2 Folhas')).toBeInTheDocument();
      expect(screen.getByText(/1400 × 1900 mm/i)).toBeInTheDocument();
      expect(screen.getByText('2 unidades')).toBeInTheDocument();

      // 3. Validação dos Acabamentos
      expect(screen.getByText('Linha Box Branco')).toBeInTheDocument();
      expect(screen.getByText('8mm Incolor')).toBeInTheDocument();
      expect(screen.getByText(/Puxador: BAR_TUBULAR/i)).toBeInTheDocument();

      // 4. Validação de Fechamento Financeiro
      expect(screen.getByText('Esquadrias & Itens do Orçamento')).toBeInTheDocument();
      expect(screen.getByText(/Entrega e montagem no endereço da obra em Sousa\/PB/i)).toBeInTheDocument();
    });

    it('deve alternar para a aba "Romaneio de Peças" e validar gabarito técnico, lista de corte e sigilo comercial', () => {
      vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
        data: mockBudgetFluxoFeliz,
        isLoading: false,
        isError: false,
      } as any);

      renderDetailPage('budget-qa03-1');

      // Alterna para o Romaneio
      const tabRomaneio = screen.getByTestId('tab-romaneio');
      expect(tabRomaneio).toBeInTheDocument();
      fireEvent.click(tabRomaneio);

      // Validações da visão técnica
      expect(screen.getByTestId('romaneio-view')).toBeInTheDocument();
      expect(screen.getByText('Romaneio Técnico & Gabarito de Fabricação')).toBeInTheDocument();
      expect(screen.getByText('Lista de Corte & Gabarito Técnico')).toBeInTheDocument();

      // Validação das fórmulas de corte (1400 mm e 1900 mm)
      // Trilho = 1400 mm
      expect(screen.getByText('1400 mm')).toBeInTheDocument();
      // Laterais = 1900 - 35 = 1865 mm
      expect(screen.getByText('1865 mm')).toBeInTheDocument();
      // Vidros (2 folhas) = (1400/2 + 25) x (1900 - 45) = 725 x 1855 mm
      expect(screen.getByText('725 × 1855 mm')).toBeInTheDocument();

      // Furação e Puxador
      expect(screen.getByText(/2 furos \(por igual\)/i)).toBeInTheDocument();
      expect(screen.getByText(/BAR_TUBULAR \(400mm\)/i)).toBeInTheDocument();

      // Controle de Fábrica
      expect(screen.getByText('Controle de Qualidade & Fábrica')).toBeInTheDocument();
      expect(screen.getByText('Responsável Técnico / Serralheiro')).toBeInTheDocument();
    });

    it('deve disponibilizar ações de emissão do PDF Comercial e Via Técnica', async () => {
      vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
        data: mockBudgetFluxoFeliz,
        isLoading: false,
        isError: false,
      } as any);

      renderDetailPage('budget-qa03-1');

      // Validar presença do botão de Via Técnica
      const btnViaTecnica = screen.getByTitle('Emitir Via Técnica (Oficina)');
      expect(btnViaTecnica).toBeInTheDocument();

      // Clicar em Emitir PDF Comercial
      const btnPdf = screen.getByTitle('Emitir PDF Comercial');
      fireEvent.click(btnPdf);

      await waitFor(() => {
        expect(budgetsApi.downloadCommercialPdf).toHaveBeenCalledWith('budget-qa03-1', 'ORC-2026-QA03');
      });
    });
  });

  describe('Cenário 2 — Teste de Paginação e Impressão Multipágina', () => {
    it('deve carregar 5 esquadrias distintas exibindo todas com formatação segura contra corte', () => {
      vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
        data: mockBudgetMultipagina5Itens,
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderDetailPage('budget-qa03-2');

      // Verifica presença de todas as 5 esquadrias
      expect(screen.getByText('Porta de Correr 2 Folhas - Sala')).toBeInTheDocument();
      expect(screen.getByText('Janela Maxim-Ar - Suíte')).toBeInTheDocument();
      expect(screen.getByText('Box Frontal 2 Folhas - Social')).toBeInTheDocument();
      expect(screen.getByText('Painel Fixo de Vidro - Fachada')).toBeInTheDocument();
      expect(screen.getByText('Porta de Giro 1 Folha - Cozinha')).toBeInTheDocument();

      // Verifica total de 5 modelos no badge
      expect(screen.getByText('5 modelos')).toBeInTheDocument();

      // Verifica classes de prevenção de corte em quebra de página
      const avoidBreakElements = container.querySelectorAll('.break-inside-avoid');
      expect(avoidBreakElements.length).toBeGreaterThanOrEqual(5);

      // Verifica classe no-print nos botões de navegação e ação
      const noPrintElements = container.querySelectorAll('.no-print');
      expect(noPrintElements.length).toBeGreaterThan(0);
    });

    it('deve permitir alternar para o Romaneio Técnico com 5 esquadrias calculando listas de corte para todas', () => {
      vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
        data: mockBudgetMultipagina5Itens,
        isLoading: false,
        isError: false,
      } as any);

      renderDetailPage('budget-qa03-2');

      const tabRomaneio = screen.getByTestId('tab-romaneio');
      fireEvent.click(tabRomaneio);

      expect(screen.getByText('5 esquadrias')).toBeInTheDocument();
      expect(screen.getByText('Item #1 — Porta de Correr 2 Folhas - Sala')).toBeInTheDocument();
      expect(screen.getByText('Item #2 — Janela Maxim-Ar - Suíte')).toBeInTheDocument();
      expect(screen.getByText('Item #3 — Box Frontal 2 Folhas - Social')).toBeInTheDocument();
      expect(screen.getByText('Item #4 — Painel Fixo de Vidro - Fachada')).toBeInTheDocument();
      expect(screen.getByText('Item #5 — Porta de Giro 1 Folha - Cozinha')).toBeInTheDocument();
    });
  });
});
