import type { BudgetDetail } from '../../../src/features/budgets/types';
import type { Order } from '../../../src/features/orders/types';

describe('US-13: Aprovar Orçamento e Converter em Ordem de Serviço (Suíte de Critérios de Aceitação)', () => {
  const mockBudgetDraft: BudgetDetail = {
    id: 'orc-1301',
    code: 'ORC-2026-0042',
    customerId: 'cli-001',
    customerName: 'Vidraçaria Alvorada',
    customerPhone: '(83) 98877-6655',
    customerEmail: 'contato@vidracariaalvorada.com.br',
    customerAddress: 'Rua das Esquadrias, 150 - Centro, Sousa - PB',
    status: 'SENT',
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
    isExpired: false,
    itemCount: 2,
    subtotal: 3850.0,
    discountPercent: 0,
    discountValue: 0,
    total: 3850.0,
    paymentCondition: 'A_VISTA',
    paymentConditionLabel: 'À Vista',
    paymentMethod: 'À Vista',
    paymentNotes: '50% de entrada e 50% na instalação.',
    commercialConditions: '50% de entrada e 50% na instalação.',
    notes: 'Atenção ao acabamento anodizado fosco na instalação.',
    items: [
      {
        id: 'item-01',
        productId: 'prod-01',
        productName: 'Janela de Correr 2 Folhas Linha Suprema',
        templateType: 'SLIDING_WINDOW_2F',
        width: 1500,
        height: 1200,
        quantity: 1,
        laborCost: 250,
        subtotal: 1850.0,
        options: [],
      },
      {
        id: 'item-02',
        productId: 'prod-02',
        productName: 'Porta Balcão 4 Folhas',
        templateType: 'SLIDING_DOOR_4F',
        width: 2400,
        height: 2100,
        quantity: 1,
        laborCost: 400,
        subtotal: 2000.0,
        options: [],
      },
    ],
  };

  const mockCreatedOrder: Order = {
    id: 'ord-1301',
    codigo: 'OS-2026-0001',
    orcamentoId: 'orc-1301',
    orcamentoCodigo: 'ORC-2026-0042',
    clienteId: 'cli-001',
    clienteNome: 'Vidraçaria Alvorada',
    clienteTelefone: '(83) 98877-6655',
    clienteEndereco: 'Rua das Esquadrias, 150 - Centro, Sousa - PB',
    canalAprovacao: 'WHATSAPP',
    status: 'CREATED',
    dataAprovacao: new Date().toISOString(),
    dataPrevisaoEntrega: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    valorBruto: 3850.0,
    valorDesconto: 0.0,
    valorLiquido: 3850.0,
    condicaoPagamento: 'À Vista',
    observacoesPagamento: '50% de entrada e 50% na instalação.',
    observacoes: 'Cliente confirmou via WhatsApp. Instalação prioritária pela manhã.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'ord-item-01',
        posicao: 1,
        nomeModelo: 'Janela de Correr 2 Folhas Linha Suprema',
        larguraMm: 1500,
        alturaMm: 1200,
        quantidade: 1,
        valorUnitario: 1850.0,
        valorTotal: 1850.0,
        options: [],
      },
      {
        id: 'ord-item-02',
        posicao: 2,
        nomeModelo: 'Porta Balcão 4 Folhas',
        larguraMm: 2400,
        alturaMm: 2100,
        quantidade: 1,
        valorUnitario: 2000.0,
        valorTotal: 2000.0,
        options: [],
      },
    ],
  };

  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  it('Cenário 1: Conversão Bem-Sucedida de Orçamento em Ordem de Serviço', () => {
    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetDraft,
    }).as('getBudget');

    cy.intercept('GET', '**/api/v1/orders*', {
      statusCode: 200,
      body: { content: [], totalElements: 0, page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } },
    }).as('getOrdersEmpty');

    cy.intercept('POST', '**/orders/convert/orc-1301', {
      statusCode: 201,
      body: mockCreatedOrder,
    }).as('convertBudget');

    cy.intercept('GET', '**/orders/ord-1301', {
      statusCode: 200,
      body: mockCreatedOrder,
    }).as('getCreatedOrder');

    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudget');

    // Valida que o orçamento elegível exibe o botão de aprovação
    cy.contains('ORC-2026-0042').should('be.visible');
    cy.get('[data-testid="btn-approve-budget"]').should('be.visible').click();

    // Modal de aprovação aberto
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');
    cy.get('[data-testid="input-observacoes"]').type(
      'Cliente confirmou via WhatsApp. Instalação prioritária pela manhã.'
    );

    // Submete a conversão
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.wait('@convertBudget');

    // Redirecionamento e asserções na tela de detalhes da nova Ordem de Serviço
    cy.url().should('include', '/ordens-servico/ord-1301');
    cy.contains('OS-2026-0001').should('be.visible');
    cy.contains('Criado').should('be.visible');
    cy.contains('Vidraçaria Alvorada').should('be.visible');
    cy.contains('R$ 3.850,00').should('be.visible');
  });

  it('Cenário 2: Sugestão Automática de Data de Entrega (+15 Dias Corridos)', () => {
    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetDraft,
    }).as('getBudget');

    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudget');

    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');

    // 1. Valida sugestão automática calculada (+15 dias) e o selo de recomendação
    cy.contains('Sugerido: +15 dias corridos').should('be.visible');
    cy.get('[data-testid="input-data-entrega"]')
      .invoke('val')
      .should('not.be.empty')
      .and('have.length', 10);

    // 2. Valida que o vendedor pode editar manualmente a data
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const customDateStr = futureDate.toISOString().split('T')[0];

    cy.get('[data-testid="input-data-entrega"]').clear().type(customDateStr);
    cy.get('[data-testid="input-data-entrega"]').should('have.value', customDateStr);
  });

  it('Cenário 3: Bloqueio de Conversão Duplicada (Invariante 1-para-1)', () => {
    const mockBudgetApproved: BudgetDetail = {
      ...mockBudgetDraft,
      status: 'APPROVED',
    };

    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetApproved,
    }).as('getBudgetApproved');

    cy.intercept('GET', '**/api/v1/orders*search=ORC-2026-0042*', {
      statusCode: 200,
      body: {
        content: [
          {
            id: 'ord-1301',
            codigo: 'OS-2026-0001',
            clienteNome: 'Vidraçaria Alvorada',
            status: 'CREATED',
            dataPrevisaoEntrega: '2026-10-24',
            valorLiquido: 3850.0,
            orcamentoCodigo: 'ORC-2026-0042',
            createdAt: new Date().toISOString(),
          },
        ],
        totalElements: 1,
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
    }).as('getLinkedOrder');

    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudgetApproved');

    // O botão de aprovação é substituído pelo de visualização da O.S. já existente
    cy.get('[data-testid="btn-approve-budget"]').should('not.exist');
    cy.get('[data-testid="btn-view-work-order"]')
      .should('be.visible')
      .and('contain.text', 'Ver Ordem de Serviço');

    // Simula resposta HTTP 409 Conflict da API caso haja tentativa forçada
    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetDraft,
    });
    cy.intercept('POST', '**/orders/convert/orc-1301', {
      statusCode: 409,
      body: {
        message: 'Já existe um pedido de venda gerado para o orçamento informado.',
        status: 409,
      },
    }).as('convertDuplicate');

    cy.visit('/orcamentos/orc-1301');
    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.wait('@convertDuplicate');

    // Toast de conflito do backend exibido
    cy.contains(/Já existe um pedido de venda gerado/i, { timeout: 4000 }).should('be.visible');
  });

  it('Cenário 4: Bloqueio de Conversão para Orçamentos em Status Inválido', () => {
    // 4.1 Orçamento Cancelado
    const mockBudgetCancelled: BudgetDetail = {
      ...mockBudgetDraft,
      status: 'CANCELLED',
    };

    cy.intercept('GET', '**/api/orcamentos/orc-cancelled', {
      statusCode: 200,
      body: mockBudgetCancelled,
    }).as('getBudgetCancelled');

    cy.visit('/orcamentos/orc-cancelled');
    cy.wait('@getBudgetCancelled');

    cy.get('[data-testid="btn-approve-budget"]')
      .should('be.visible')
      .and('be.disabled')
      .and('have.attr', 'title', 'Orçamentos cancelados ou rejeitados não podem ser aprovados.');

    // 4.2 Orçamento Expirado
    const mockBudgetExpired: BudgetDetail = {
      ...mockBudgetDraft,
      status: 'SENT',
      validUntil: new Date(Date.now() - 5 * 86400000).toISOString(),
      isExpired: true,
    };

    cy.intercept('GET', '**/api/orcamentos/orc-expired', {
      statusCode: 200,
      body: mockBudgetExpired,
    }).as('getBudgetExpired');

    cy.visit('/orcamentos/orc-expired');
    cy.wait('@getBudgetExpired');

    cy.get('[data-testid="btn-approve-budget"]')
      .should('be.visible')
      .and('be.disabled')
      .and('have.attr', 'title', 'Orçamentos com validade expirada não podem ser aprovados.');
  });

  it('Cenário 5: Validação de Dados Obrigatórios na Aprovação', () => {
    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetDraft,
    }).as('getBudget');

    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudget');

    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');

    // 5.1 Submissão com campo de data vazio
    cy.get('[data-testid="input-data-entrega"]').clear();
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.contains('Informe a data prevista de entrega.').should('be.visible');

    // 5.2 Submissão com data retroativa no passado
    cy.get('[data-testid="input-data-entrega"]').type('2020-01-01');
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.contains('A data de previsão de entrega não pode ser retroativa.').should('be.visible');
  });
});
