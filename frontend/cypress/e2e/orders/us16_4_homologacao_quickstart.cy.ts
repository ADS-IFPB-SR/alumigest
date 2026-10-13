import type { BudgetDetail } from '../../../src/features/budgets/types';
import type { Order } from '../../../src/features/orders/types';

describe('US-16.4: homologação E2E do fluxo de orçamento, pedido e comprovante', () => {
  const budgetId = 'b1600000-0000-4000-8000-000000000004';
  const orderId = '01600000-0000-4000-8000-000000000004';

  const budget: BudgetDetail = {
    id: budgetId,
    code: 'ORC-2026-0016',
    customerId: 'c1600000-0000-4000-8000-000000000004',
    customerName: 'Cliente Homologação US-16',
    status: 'SENT',
    createdAt: '2026-10-13T09:00:00-03:00',
    validUntil: '2026-10-28',
    isExpired: false,
    itemCount: 1,
    subtotal: 4500,
    discountPercent: 0,
    discountValue: 0,
    total: 4500,
    paymentCondition: 'A_VISTA_PIX',
    paymentConditionLabel: 'À Vista (PIX / Dinheiro)',
    notes: 'Orçamento criado para homologação da US-16.4.',
    items: [
      {
        id: 'item-budget-16',
        productId: 'product-16',
        productName: 'Janela de Correr 2 Folhas',
        templateType: 'SLIDING_DOOR_2F',
        templateConfig: { templateType: 'SLIDING_DOOR_2F' },
        handleConfig: { handleType: 'NONE' },
        drillingConfig: { holeCount: 0 },
        width: 1500,
        height: 1200,
        quantity: 1,
        laborCost: 500,
        options: [],
        subtotal: 4500,
      },
    ],
  };

  const activeOrder: Order = {
    id: orderId,
    codigo: 'OS-2026-0016',
    orcamentoId: budgetId,
    orcamentoCodigo: budget.code,
    clienteId: budget.customerId,
    clienteNome: budget.customerName,
    clienteTelefone: '(83) 99999-1616',
    clienteEndereco: 'Rua da Homologação, 16 - Sousa/PB',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-13',
    dataPrevisaoEntrega: '2026-10-28',
    valorBruto: 4500,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 4500,
    condicaoPagamento: 'À Vista (PIX / Dinheiro)',
    observacoes: 'Pedido homologado pela suíte E2E da US-16.4.',
    justificativaCancelamento: null,
    createdAt: '2026-10-13T09:10:00-03:00',
    updatedAt: '2026-10-13T09:10:00-03:00',
    ativo: true,
    items: [
      {
        id: 'item-order-16',
        orderId,
        productId: 'product-16',
        descricao: 'Janela de Correr 2 Folhas',
        larguraMm: 1500,
        alturaMm: 1200,
        quantidade: 1,
        valorUnitario: 4500,
        valorTotal: 4500,
        ordem: 1,
        options: [],
      },
    ],
  };

  beforeEach(() => {
    cy.viewport(1366, 900);
  });

  it('Dado um orçamento criado e enviado, quando o vendedor aprova, então converte em pedido', () => {
    cy.intercept('GET', `**/api/orcamentos/${budgetId}`, {
      statusCode: 200,
      body: budget,
    }).as('getBudget');
    cy.intercept('POST', `**/api/v1/orders/convert/${budgetId}`, {
      statusCode: 201,
      body: activeOrder,
    }).as('convertBudget');
    cy.intercept('GET', `**/api/v1/orders/${orderId}`, {
      statusCode: 200,
      body: activeOrder,
    }).as('getCreatedOrder');

    cy.visit(`/orcamentos/${budgetId}`);
    cy.wait('@getBudget');
    cy.contains(budget.code).should('be.visible');
    cy.get('[data-testid="btn-approve-budget"]').click();
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');
    cy.get('[data-testid="btn-confirm-approval"]').click();

    cy.wait('@convertBudget').its('request.body').should('include.keys', [
      'canalAprovacao',
      'dataPrevisaoEntrega',
    ]);
    cy.wait('@getCreatedOrder');
    cy.url().should('include', `/ordens-servico/${orderId}`);
    cy.contains(activeOrder.codigo).should('be.visible');
    cy.contains('Origem & Aprovação Comercial').should('be.visible');
  });

  it('Dado um pedido ativo, quando solicita o comprovante, então baixa um PDF identificado', () => {
    cy.intercept('GET', `**/api/v1/orders/${orderId}`, {
      statusCode: 200,
      body: activeOrder,
    }).as('getOrder');
    cy.intercept('GET', `**/api/v1/orders/${orderId}/pdf/comprovante`, {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="comprovante-${activeOrder.codigo}.pdf"`,
      },
      body: '%PDF-1.4\n% Homologação US-16.4\n%%EOF',
    }).as('downloadReceipt');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrder');
    cy.get('#btn-download-comprovante-pdf').should('be.visible').click();
    cy.wait('@downloadReceipt').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      expect(response?.headers?.['content-type']).to.contain('application/pdf');
      expect(response?.headers?.['content-disposition']).to.contain(activeOrder.codigo);
    });
    cy.contains('Comprovante PDF baixado com sucesso!').should('be.visible');
  });

  it('Dado um pedido aguardando produção, quando cancela, então permite reabrir o orçamento', () => {
    const cancellationReason = 'Cliente adiou a obra e solicitou uma nova negociação comercial.';
    let currentOrder: Order = { ...activeOrder };
    const cancelledOrder: Order = {
      ...activeOrder,
      status: 'CANCELLED',
      justificativaCancelamento: cancellationReason,
      updatedAt: '2026-10-13T09:20:00-03:00',
    };

    cy.intercept('GET', `**/api/v1/orders/${orderId}`, (request) => {
      request.reply({ statusCode: 200, body: currentOrder });
    }).as('getOrder');
    cy.intercept('PATCH', `**/api/v1/orders/${orderId}/cancel`, (request) => {
      expect(request.body).to.deep.equal({ justificativa: cancellationReason });
      currentOrder = cancelledOrder;
      request.reply({ statusCode: 200, body: currentOrder });
    }).as('cancelOrder');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrder');
    cy.contains('button', 'Cancelar Ordem de Serviço').click();
    cy.get('[data-testid="cancel-order-modal"]').should('be.visible');
    cy.get('#justificativa').type(cancellationReason);
    cy.contains('button', 'Confirmar Cancelamento').click();
    cy.wait('@cancelOrder');
    cy.contains('Ordem de serviço cancelada com sucesso.').should('be.visible');
    cy.contains(cancellationReason).should('be.visible');

    const approvedBudget = { ...budget, status: 'APPROVED' as const };
    const reopenedBudget = { ...budget, status: 'DRAFT' as const };
    cy.intercept('GET', `**/api/orcamentos/${budgetId}`, {
      statusCode: 200,
      body: approvedBudget,
    }).as('getApprovedBudget');
    cy.intercept('GET', '**/api/v1/orders*', {
      statusCode: 200,
      body: {
        content: [],
        page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
      },
    }).as('getOrdersWithoutBudgetFilter');
    cy.intercept('GET', `**/api/v1/orders*search=${budget.code}*`, {
      statusCode: 200,
      body: {
        content: [cancelledOrder],
        page: { size: 1, number: 0, totalElements: 1, totalPages: 1 },
      },
    }).as('getLinkedOrder');
    cy.intercept('POST', `**/api/budgets/${budgetId}/reopen`, {
      statusCode: 200,
      body: reopenedBudget,
    }).as('reopenBudget');

    cy.get('[data-testid="order-origin-budget-card"] a').click();
    cy.wait('@getApprovedBudget');
    cy.wait('@getLinkedOrder')
      .its('response.body.content.0.status')
      .should('equal', 'CANCELLED');
    cy.get('[data-testid="banner-order-cancelled"]').should('be.visible');
    cy.get('[data-testid="btn-reopen-budget-banner"]').click();
    cy.wait('@reopenBudget');
    cy.contains(/orçamento reaberto com sucesso como rascunho/i).should('be.visible');
  });
});
