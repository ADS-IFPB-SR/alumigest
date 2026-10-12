import type { BudgetDetail } from '../../../src/features/budgets/types';
import type { Order } from '../../../src/features/orders/types';

describe('US-13: Demonstração Visual e Interativa dos 5 Critérios de Aceitação', () => {
  const mockBudgetDraft: BudgetDetail = {
    id: 'orc-1301',
    code: 'ORC-2026-0042',
    customerId: 'cli-001',
    customerName: 'Vidraçaria Alvorada',
    clientId: 'cli-001',
    clientName: 'Vidraçaria Alvorada',
    clientPhone: '(83) 98877-6655',
    clientEmail: 'contato@vidracariaalvorada.com.br',
    clientAddress: 'Rua das Esquadrias, 150 - Centro, Sousa - PB',
    customerPhone: '(83) 98877-6655',
    customerEmail: 'contato@vidracariaalvorada.com.br',
    customerAddress: 'Rua das Esquadrias, 150 - Centro, Sousa - PB',
    customer: {
      id: 'cli-001',
      name: 'Vidraçaria Alvorada',
      phone: '(83) 98877-6655',
      email: 'contato@vidracariaalvorada.com.br',
      address: 'Rua das Esquadrias, 150 - Centro, Sousa - PB',
      document: '12.345.678/0001-90',
    },
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
        productName: 'Porta Balcão 4 Folhas Linha Suprema',
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
        ordem: 1,
        descricao: 'Janela de Correr 2 Folhas Linha Suprema',
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
        ordem: 2,
        descricao: 'Porta Balcão 4 Folhas Linha Suprema',
        nomeModelo: 'Porta Balcão 4 Folhas Linha Suprema',
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
    cy.viewport(1366, 768);
  });

  after(() => {
    // Limpeza física (Hard Delete)
    cy.request({
      method: 'DELETE',
      url: '/api/v1/test-support/cleanup',
      body: {
        orderId: 'ord-1301',
        budgetId: 'orc-1301',
        clientName: 'Vidraçaria Alvorada',
      },
      failOnStatusCode: false,
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 1
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 1: Conversão Bem-Sucedida de Orçamento em Ordem de Serviço (O.S.)', () => {
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

    cy.log(' PASSO 1.1: Acessando Orçamento Elegível');
    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudget');
    cy.wait(1200);

    cy.contains('ORC-2026-0042').highlight(1500);
    cy.get('[data-testid="btn-approve-budget"]').should('be.visible').highlight(1800);
    cy.wait(1500);

    cy.log(' PASSO 1.2: Abrindo Modal e Confirmando Aprovação via WhatsApp');
    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.wait(800);
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');

    cy.get('[data-testid="input-observacoes"]')
      .focus()
      .type('Cliente confirmou via WhatsApp. Instalação prioritária pela manhã.', { delay: 30 });
    cy.wait(1200);

    cy.get('[data-testid="btn-confirm-approval"]').highlight(1500);
    cy.wait(1000);
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.wait('@convertBudget');
    cy.wait(1200);

    cy.log(' PASSO 1.3: Verificando Redirecionamento e Detalhes da O.S.');
    cy.url().should('include', '/ordens-servico/ord-1301');
    cy.contains('OS-2026-0001').should('be.visible').highlight(2000);
    cy.contains('Criado').should('be.visible').highlight(1500);
    cy.contains('Vidraçaria Alvorada').scrollIntoView().highlight(1500);
    cy.contains('R$ 3.850,00').scrollIntoView().highlight(1500);
    cy.contains('Janela de Correr 2 Folhas Linha Suprema').highlight(1500);
    cy.wait(2000);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 2
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 2: Sugestão Automática de Previsão de Entrega (+15 Dias Corridos)', () => {
    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetDraft,
    }).as('getBudget');

    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudget');
    cy.wait(1000);

    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');

    cy.log(' PASSO 2.1: Validando Sugestão Automática de +15 Dias');
    cy.contains('Sugerido: +15 dias corridos').should('be.visible').highlight(2000);
    cy.get('[data-testid="input-data-entrega"]')
      .highlight(1500)
      .invoke('val')
      .should('not.be.empty')
      .and('have.length', 10);
    cy.wait(1500);

    cy.log(' PASSO 2.2: Vendedor Edita Manualmente a Data');
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 30);
    const dataCustomizada = dataFutura.toISOString().split('T')[0];

    cy.get('[data-testid="input-data-entrega"]')
      .clear()
      .type(dataCustomizada, { delay: 50 });
    cy.get('[data-testid="input-data-entrega"]').should('have.value', dataCustomizada).highlight(1500);
    cy.wait(2000);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 3
  // ───────────────────────────────────────────────────────────────────────────
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
        content: [mockCreatedOrder],
        totalElements: 1,
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
    }).as('getLinkedOrder');

    cy.log(' PASSO 3.1: Orçamento Aprovado exibe link "Ver Ordem de Serviço" e oculta botão de aprovação');
    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudgetApproved');
    cy.wait(1000);

    cy.get('[data-testid="btn-approve-budget"]').should('not.exist');
    cy.get('[data-testid="btn-view-work-order"]')
      .should('be.visible')
      .highlight(2000);
    cy.wait(1500);

    cy.log(' PASSO 3.2: Tentativa de Conversão Concorrente Rejeitada com HTTP 409 Conflict');
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
    }).as('convertConflict');

    cy.visit('/orcamentos/orc-1301');
    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.wait('@convertConflict');

    cy.contains(/Já existe um pedido de venda gerado/i, { timeout: 4000 })
      .should('be.visible')
      .highlight(2500);
    cy.wait(2000);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 4
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 4: Bloqueio de Conversão para Orçamentos em Status Inválido', () => {
    cy.log(' PASSO 4.1: Orçamento Cancelado (Botão Desabilitado com Tooltip)');
    cy.intercept('GET', '**/api/orcamentos/orc-cancelled', {
      statusCode: 200,
      body: { ...mockBudgetDraft, status: 'CANCELLED' },
    });
    cy.visit('/orcamentos/orc-cancelled');
    cy.wait(1000);
    cy.get('[data-testid="btn-approve-budget"]')
      .should('be.disabled')
      .highlight(1800)
      .and('have.attr', 'title', 'Orçamentos cancelados ou rejeitados não podem ser aprovados.');
    cy.wait(1500);

    cy.log(' PASSO 4.2: Orçamento Expirado (Botão Desabilitado com Tooltip)');
    cy.intercept('GET', '**/api/orcamentos/orc-expired', {
      statusCode: 200,
      body: {
        ...mockBudgetDraft,
        status: 'SENT',
        validUntil: new Date(Date.now() - 5 * 86400000).toISOString(),
        isExpired: true,
      },
    });
    cy.visit('/orcamentos/orc-expired');
    cy.wait(1000);
    cy.get('[data-testid="btn-approve-budget"]')
      .should('be.disabled')
      .highlight(1800)
      .and('have.attr', 'title', 'Orçamentos com validade expirada não podem ser aprovados.');
    cy.wait(2000);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 5
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 5: Validação de Dados Obrigatórios na Aprovação (Zod Schema)', () => {
    cy.intercept('GET', '**/api/orcamentos/orc-1301', {
      statusCode: 200,
      body: mockBudgetDraft,
    }).as('getBudget');

    cy.visit('/orcamentos/orc-1301');
    cy.wait('@getBudget');
    cy.wait(1000);

    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');

    cy.log(' PASSO 5.1: Submissão com Campo de Data Vazio');
    cy.get('[data-testid="input-data-entrega"]').clear();
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.contains('Informe a data prevista de entrega.').should('be.visible').highlight(2000);
    cy.wait(1800);

    cy.log(' PASSO 5.2: Submissão com Data Retroativa no Passado');
    cy.get('[data-testid="input-data-entrega"]').type('2020-01-01', { delay: 40 });
    cy.get('[data-testid="btn-confirm-approval"]').click();
    cy.contains('A data de previsão de entrega não pode ser retroativa.')
      .should('be.visible')
      .highlight(2000);
    cy.wait(2500);

    cy.log(' Validação do Zod executada com sucesso.');
  });
});
