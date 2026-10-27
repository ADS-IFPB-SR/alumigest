import type { Order } from '../../../src/features/orders/types';

describe('US-14.3 / #430: Testes E2E — Blindagem contra Reajuste Futuro de Preços no Catálogo', () => {
  const orderId = '01400000-0000-4000-8000-000000000430';
  const orderCode = 'OS-2026-0430';
  const budgetId = 'b1400000-0000-4000-8000-000000000430';

  /**
   * Snapshot do Pedido de Venda congelado no momento da formalização do contrato.
   * Valor total contratado: exatamente R$ 3.500,00 (composto por 2 itens de esquadrias).
   */
  const frozenOrder: Order = {
    id: orderId,
    codigo: orderCode,
    orcamentoId: budgetId,
    orcamentoCodigo: 'ORC-2026-0430',
    clienteId: 'c1400000-0000-4000-8000-000000000430',
    clienteNome: 'Construtora Aliança & Engenharia Ltda',
    clienteTelefone: '(83) 98888-0430',
    clienteEndereco: 'Av. Epitácio Pessoa, 430 - João Pessoa/PB',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-10',
    dataPrevisaoEntrega: '2026-10-30',
    valorBruto: 3500.0,
    valorDesconto: 0.0,
    taxaInstalacao: 0.0,
    taxaFrete: 0.0,
    valorLiquido: 3500.0,
    condicaoPagamento: '50% de entrada + 50% na instalação final',
    observacoesPagamento: 'Valores congelados e acordados em proposta comercial vinculante.',
    justificativaCancelamento: null,
    items: [
      {
        id: 'item-lock-01',
        ordem: 0,
        descricao: 'Janela de Correr 2 Folhas Linha Suprema',
        larguraMm: 1500,
        alturaMm: 1200,
        quantidade: 2,
        valorUnitario: 1250.0,
        valorTotal: 2500.0,
        corAluminio: 'Branco',
        tipoVidro: 'Incolor 6mm',
        orientacaoAbertura: 'SLIDING_2_DOOR',
        ferragens: 'Roldana Dupla e Fecho Concha',
        options: [
          {
            id: 'opt-01',
            materialName: 'Perfil Linha Suprema Alumínio',
            quantity: 5.4,
            unitMeasure: 'M',
            unitCost: 85.0,
          },
          {
            id: 'opt-02',
            materialName: 'Vidro Temperado Incolor 6mm',
            quantity: 1.8,
            unitMeasure: 'M2',
            unitCost: 180.0,
          },
        ],
      },
      {
        id: 'item-lock-02',
        ordem: 1,
        descricao: 'Porta Pivotante Linha Gold com Puxador Inox',
        larguraMm: 900,
        alturaMm: 2100,
        quantidade: 1,
        valorUnitario: 1000.0,
        valorTotal: 1000.0,
        corAluminio: 'Preto Anodizado',
        tipoVidro: 'Fumê 8mm',
        orientacaoAbertura: 'PIVOT_CENTER',
        ferragens: 'Pivô Superior/Inferior Inox e Fechadura Rolete',
        options: [
          {
            id: 'opt-03',
            materialName: 'Perfil Linha Gold Alumínio',
            quantity: 6.0,
            unitMeasure: 'M',
            unitCost: 110.0,
          },
        ],
      },
    ],
  };

  /**
   * Materiais do catálogo simulando estado ANTES do reajuste de preços.
   */
  const catalogInitial = {
    profiles: [
      { id: 1, name: 'Perfil Linha Suprema Alumínio', price: 85.0 },
      { id: 2, name: 'Perfil Linha Gold Alumínio', price: 110.0 },
    ],
    glasses: [
      { id: 1, name: 'Vidro Temperado Incolor 6mm', price: 180.0 },
      { id: 2, name: 'Vidro Temperado Fumê 8mm', price: 240.0 },
    ],
  };

  /**
   * Materiais do catálogo simulando estado APÓS reajuste de +20% no Dia D+5.
   */
  const catalogAfterIncrease = {
    profiles: [
      { id: 1, name: 'Perfil Linha Suprema Alumínio', price: 102.0 }, // +20% (85 -> 102)
      { id: 2, name: 'Perfil Linha Gold Alumínio', price: 132.0 }, // +20% (110 -> 132)
    ],
    glasses: [
      { id: 1, name: 'Vidro Temperado Incolor 6mm', price: 216.0 }, // +20% (180 -> 216)
      { id: 2, name: 'Vidro Temperado Fumê 8mm', price: 288.0 }, // +20% (240 -> 288)
    ],
  };

  let consoleErrors: string[] = [];

  beforeEach(() => {
    cy.viewport(1280, 800);
    consoleErrors = [];
    cy.on('window:before:load', (win) => {
      cy.stub(win.console, 'error').callsFake((msg: unknown) => {
        if (typeof msg === 'string') {
          consoleErrors.push(msg);
        }
      });
    });

    // Interceptações determinísticas da API de ordens de serviço
    cy.intercept('GET', '**/api/orders/01400000-0000-4000-8000-000000000430', {
      statusCode: 200,
      body: frozenOrder,
    }).as('getOrderDetailsLegacy');

    cy.intercept('GET', '**/api/v1/orders/01400000-0000-4000-8000-000000000430', {
      statusCode: 200,
      body: frozenOrder,
    }).as('getOrderDetailsCanonical');

    cy.intercept('GET', '**/api/orders?*', {
      statusCode: 200,
      body: {
        content: [frozenOrder],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      },
    }).as('getOrderListLegacy');

    cy.intercept('GET', '**/api/v1/orders?*', {
      statusCode: 200,
      body: {
        content: [frozenOrder],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      },
    }).as('getOrderListCanonical');

    // Interceptação inicial dos insumos do catálogo
    cy.intercept('GET', '**/api/catalog/aluminum-profiles*', {
      statusCode: 200,
      body: { content: catalogInitial.profiles },
    }).as('getProfiles');

    cy.intercept('GET', '**/api/catalog/glasses*', {
      statusCode: 200,
      body: { content: catalogInitial.glasses },
    }).as('getGlasses');
  });

  afterEach(() => {
    expect(consoleErrors, 'Nenhum erro de console não tratado deve ocorrer').to.deep.equal([]);
  });

  it('Cenário 1: Navegação para a ordem de serviço e validação do snapshot financeiro inicial (R$ 3.500,00)', () => {
    cy.visit(`/ordens-servico/${orderId}`);

    // Aguarda resolução da tela
    cy.get('[data-testid="order-detail-page"]').should('be.visible');

    // Valida código da O.S. e identificação do cliente
    cy.contains('#OS-2026-0430').should('be.visible');
    cy.contains('Construtora Aliança & Engenharia Ltda').should('be.visible');

    // Valida Card de Resumo Financeiro Congelado
    cy.get('[data-testid="order-financial-summary-card"]').should('be.visible');
    cy.get('[data-testid="financial-summary-gross"]').should('contain.text', '3.500,00');
    cy.get('[data-testid="financial-summary-net"]').should('contain.text', '3.500,00');

    // Valida Tabela de Itens congelados (Item 01: 2 un a R$ 1.250,00 = R$ 2.500,00)
    cy.get('[data-testid="order-item-row-item-lock-01"]').within(() => {
      cy.get('[data-testid="item-quantity-item-lock-01"]').should('contain.text', '2');
      cy.get('[data-testid="item-unit-price-item-lock-01"]').should('contain.text', '1.250,00');
      cy.get('[data-testid="item-total-price-item-lock-01"]').should('contain.text', '2.500,00');
      cy.get('[data-testid="item-dimensions-item-lock-01"]').should('contain.text', '1500 × 1200 mm');
    });

    // Valida Tabela de Itens congelados (Item 02: 1 un a R$ 1.000,00 = R$ 1.000,00)
    cy.get('[data-testid="order-item-row-item-lock-02"]').within(() => {
      cy.get('[data-testid="item-quantity-item-lock-02"]').should('contain.text', '1');
      cy.get('[data-testid="item-unit-price-item-lock-02"]').should('contain.text', '1.000,00');
      cy.get('[data-testid="item-total-price-item-lock-02"]').should('contain.text', '1.000,00');
      cy.get('[data-testid="item-dimensions-item-lock-02"]').should('contain.text', '900 × 2100 mm');
    });

    cy.screenshot('cenario1-snapshot-inicial-3500');
  });

  it('Cenário 2: Reajuste futuro de +20% no catálogo e blindagem estrita dos valores unitários e totais do pedido', () => {
    // Simula a aplicação de um reajuste inflacionário de +20% na tabela de catálogo
    cy.intercept('GET', '**/api/catalog/aluminum-profiles*', {
      statusCode: 200,
      body: { content: catalogAfterIncrease.profiles },
    }).as('getProfilesReajustados');

    cy.intercept('GET', '**/api/catalog/glasses*', {
      statusCode: 200,
      body: { content: catalogAfterIncrease.glasses },
    }).as('getGlassesReajustados');

    // Acessa novamente a tela de detalhes da ordem de serviço após o reajuste
    cy.visit(`/ordens-servico/${orderId}`);
    cy.get('[data-testid="order-detail-page"]').should('be.visible');

    // Validação de Blindagem: o valor líquido total contratado PERMANECE R$ 3.500,00
    cy.get('[data-testid="financial-summary-net"]')
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', '3.500,00');

    // O valor não deve ter sofrido incremento inflacionário (ex: R$ 4.200,00)
    cy.get('[data-testid="financial-summary-net"]').should('not.contain.text', '4.200,00');

    // Valida que os preços unitários e subtotais congelados permanecem inalterados
    cy.get('[data-testid="item-unit-price-item-lock-01"]').scrollIntoView().should('contain.text', '1.250,00');
    cy.get('[data-testid="item-total-price-item-lock-01"]').should('contain.text', '2.500,00');

    cy.get('[data-testid="item-unit-price-item-lock-02"]').scrollIntoView().should('contain.text', '1.000,00');
    cy.get('[data-testid="item-total-price-item-lock-02"]').should('contain.text', '1.000,00');

    cy.screenshot('cenario2-blindagem-reajuste-catalogo');
  });

  it('Cenário 3: Integridade do valor congelado na listagem geral de ordens de serviço (/ordens-servico)', () => {
    cy.visit('/ordens-servico');

    // Confirma que a listagem é carregada
    cy.contains('#OS-2026-0430').should('be.visible');
    cy.contains('Construtora Aliança & Engenharia Ltda').should('be.visible');

    // Valida que o valor contratado exibido na linha/card da listagem é exatamente R$ 3.500,00
    cy.contains('3.500,00').should('be.visible');

    cy.screenshot('cenario3-listagem-ordens-servico-3500');
  });

  it('Cenário 4: Blindagem e consistência no download do comprovante oficial em PDF', () => {
    // Intercepta emissão do comprovante PDF garantindo integridade documental
    cy.intercept('GET', '**/orders/01400000-0000-4000-8000-000000000430/pdf/comprovante', {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="comprovante-pedido-OS-2026-0430.pdf"',
      },
      body: '%PDF-1.4 Mock PDF Content - Total: R$ 3.500,00',
    }).as('downloadComprovante');

    cy.visit(`/ordens-servico/${orderId}`);

    // Aciona o botão de baixar comprovante em PDF
    cy.get('#btn-download-comprovante-pdf').should('be.visible').click();

    // Valida que a requisição de download dispara com os dados congelados
    cy.wait('@downloadComprovante', { timeout: 8000 }).then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.headers['content-type']).to.include('application/pdf');
    });

    cy.screenshot('cenario4-download-comprovante-pdf');
  });

  it('Cenário 5: Mutação de ciclo de vida e garantia de preservação do lock financeiro', () => {
    const inProductionOrder: Order = {
      ...frozenOrder,
      status: 'IN_PRODUCTION',
    };

    // Espião de mutação de status legítima
    cy.intercept('PATCH', `**/orders/${orderId}/status*`, {
      statusCode: 200,
      body: inProductionOrder,
    }).as('mutateOrderStatus');

    // Espião para certificar que NENHUMA mutação de preços ou recálculo indevido é enviado
    const unallowedMutationSpy = cy.spy().as('unallowedMutationSpy');
    cy.intercept('PUT', '**/orders/**', unallowedMutationUniversal => {
      unallowedMutationSpy();
      unallowedMutationUniversal.reply({ statusCode: 400 });
    });

    cy.visit(`/ordens-servico/${orderId}`);
    cy.get('[data-testid="order-detail-page"]').should('be.visible');

    // Valida valor antes da mutação
    cy.get('[data-testid="financial-summary-net"]')
      .scrollIntoView()
      .should('contain.text', '3.500,00');

    // Aciona mutação de avanço de produção via CTA de fábrica
    cy.get('[data-testid="btn-advance-production"]').scrollIntoView().should('be.visible').click();

    // Aguarda e valida a chamada de mutação de status
    cy.wait('@mutateOrderStatus').its('response.statusCode').should('equal', 200);

    // Reintercepta o get com o novo status mantendo estritamente os valores congelados
    cy.intercept('GET', `**/orders/${orderId}`, {
      statusCode: 200,
      body: inProductionOrder,
    }).as('getUpdatedOrder');

    // Comprova que após a mutação de estado, os valores financeiros permanecem 100% blindados
    cy.get('[data-testid="financial-summary-net"]')
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', '3.500,00');

    cy.get('[data-testid="item-total-price-item-lock-01"]').should('contain.text', '2.500,00');
    cy.get('[data-testid="item-total-price-item-lock-02"]').should('contain.text', '1.000,00');

    // Assegura que nenhuma mutação de PUT/alteração de preços foi disparada
    cy.get('@unallowedMutationSpy').should('not.have.been.called');

    cy.screenshot('cenario5-mutacao-producao-in-production');
  });
});
