/// <reference types="cypress" />

import type { Order } from '../../../src/features/orders/types';

describe('US-14.2 / #431: Testes E2E — Imutabilidade Cadastral e Estrutural das Esquadrias do Pedido', () => {
  const orderId = 'a1400000-0000-4000-8000-000000000431';
  let consoleErrors: string[] = [];

  const baseOrder: Order = {
    id: orderId,
    codigo: 'OS-2026-0431',
    orcamentoId: 'b1400000-0000-4000-8000-000000000431',
    orcamentoCodigo: 'ORC-2026-0431',
    clienteId: 'c1400000-0000-4000-8000-000000000431',
    clienteNome: 'Construtora Horizonte & Edificações LTDA',
    clienteTelefone: '(83) 98888-4310',
    clienteEndereco: 'Av. Epitácio Pessoa, 431 - João Pessoa/PB',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-15',
    dataPrevisaoEntrega: '2026-10-30',
    valorBruto: 6800.0,
    valorDesconto: 300.0,
    taxaInstalacao: 0.0,
    taxaFrete: 0.0,
    valorLiquido: 6500.0,
    condicaoPagamento: 'À Vista (PIX / Dinheiro)',
    observacoes: 'Pedido formalizado com snapshot integral de esquadrias e lock financeiro.',
    justificativaCancelamento: null,
    createdAt: '2026-10-15T08:30:00-03:00',
    updatedAt: '2026-10-15T08:30:00-03:00',
    ativo: true,
    items: [
      {
        id: 'item-esquadria-01',
        orderId,
        productId: 'prod-janela-correr-2f',
        descricao: 'Janela de Correr 2 Folhas Linha Suprema',
        larguraMm: 1500,
        alturaMm: 1200,
        quantidade: 2,
        corAluminio: 'Preto Fosco',
        tipoVidro: 'Incolor 6mm',
        orientacaoAbertura: 'Esquerda/Direita',
        ferragens: 'Fecho Concha Alcoa',
        valorUnitario: 2200.0,
        valorTotal: 4400.0,
        ordem: 1,
        options: [
          {
            id: 'opt-perfil-01',
            orderItemId: 'item-esquadria-01',
            materialName: 'Perfil Guia Superior Linha Suprema',
            unitMeasure: 'M',
            categoryType: 'ALUMINIO',
            quantity: 3.0,
            unitPrice: 45.0,
            totalPrice: 135.0,
          },
          {
            id: 'opt-vidro-01',
            orderItemId: 'item-esquadria-01',
            materialName: 'Vidro Temperado Float Incolor 6mm',
            unitMeasure: 'M2',
            categoryType: 'VIDRO',
            quantity: 1.8,
            unitPrice: 180.0,
            totalPrice: 324.0,
          },
        ],
      },
      {
        id: 'item-esquadria-02',
        orderId,
        productId: 'prod-porta-giro-1f',
        descricao: 'Porta de Giro 1 Folha com Fechadura Rolete',
        larguraMm: 900,
        alturaMm: 2100,
        quantidade: 1,
        corAluminio: 'Branco Brilhante',
        tipoVidro: 'Fosco Jateado 8mm',
        orientacaoAbertura: 'Abertura para Direita',
        ferragens: 'Puxador Inox Tubular 600mm',
        valorUnitario: 2400.0,
        valorTotal: 2400.0,
        ordem: 2,
        options: [],
      },
    ],
  };

  beforeEach(() => {
    consoleErrors = [];
    cy.viewport(1366, 900);
    cy.on('window:before:load', (win) => {
      cy.stub(win.console, 'error').callsFake((...args) => {
        consoleErrors.push(args.join(' '));
      });
    });
  });

  afterEach(() => {
    expect(consoleErrors, 'Nenhum erro silencioso ou visível no console deve ser emitido').to.be.empty;
  });

  it('Cenário 1: Navegar para a tela de detalhes de pedido aprovado e validar ausência de ações mutáveis', () => {
    cy.intercept('GET', `**/orders/${orderId}`, {
      statusCode: 200,
      body: baseOrder,
    }).as('getOrderWaitingProduction');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderWaitingProduction');

    cy.get('[data-testid="order-detail-page"]').should('be.visible');
    cy.contains(baseOrder.codigo).should('be.visible');

    // Valida que a tabela de itens de produção é exibida
    cy.get('[data-testid="order-items-container"]').should('be.visible');

    // Garante que não existem botões para adicionar novos itens ou excluir esquadrias contratadas
    cy.contains('button', /adicionar item/i).should('not.exist');
    cy.contains('button', /adicionar esquadria/i).should('not.exist');
    cy.contains('button', /novo item/i).should('not.exist');
    cy.contains('button', /excluir item/i).should('not.exist');
    cy.contains('button', /remover item/i).should('not.exist');
    cy.contains('button', /editar item/i).should('not.exist');

    // Garante ausência de botões genéricos de ação dentro do contêiner da listagem de itens
    cy.get('[data-testid="order-items-container"]').find('button').should('not.exist');
  });

  it('Cenário 2: Validar que todos os campos de medidas, materiais e preços estão em modo somente leitura', () => {
    cy.intercept('GET', `**/orders/${orderId}`, {
      statusCode: 200,
      body: baseOrder,
    }).as('getOrderReadOnly');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderReadOnly');

    // Verifica que nenhum campo editável (input, select, textarea ou contenteditable) existe na tabela de itens
    cy.get('[data-testid="order-items-container"]')
      .find('input, select, textarea, [contenteditable="true"]')
      .should('not.exist');

    // Valida as dimensões e especificações do item 1
    cy.get(`[data-testid="order-item-row-${baseOrder.items[0].id}"]`).within(() => {
      cy.contains('Janela de Correr 2 Folhas Linha Suprema').should('be.visible');

      cy.get('[data-testid="order-item-dimensions"]')
        .should('be.visible')
        .and('contain.text', '1500 × 1200 mm');

      cy.get('[data-testid="order-item-specs"]').within(() => {
        cy.contains('Alumínio:').should('be.visible');
        cy.contains('Preto Fosco').should('be.visible');
        cy.contains('Vidro:').should('be.visible');
        cy.contains('Incolor 6mm').should('be.visible');
        cy.contains('Abertura:').should('be.visible');
        cy.contains('Esquerda/Direita').should('be.visible');
        cy.contains('Ferragens:').should('be.visible');
        cy.contains('Fecho Concha Alcoa').should('be.visible');
      });

      cy.get('[data-testid="order-item-quantity"]')
        .should('be.visible')
        .and('contain.text', '2');

      cy.get('[data-testid="order-item-unit-price"]')
        .should('be.visible')
        .and('contain.text', '2.200,00');

      cy.get('[data-testid="order-item-total-price"]')
        .should('be.visible')
        .and('contain.text', '4.400,00');
    });

    // Valida as dimensões e especificações do item 2
    cy.get(`[data-testid="order-item-row-${baseOrder.items[1].id}"]`).within(() => {
      cy.contains('Porta de Giro 1 Folha com Fechadura Rolete').should('be.visible');

      cy.get('[data-testid="order-item-dimensions"]')
        .should('be.visible')
        .and('contain.text', '900 × 2100 mm');

      cy.get('[data-testid="order-item-specs"]').within(() => {
        cy.contains('Branco Brilhante').should('be.visible');
        cy.contains('Fosco Jateado 8mm').should('be.visible');
      });

      cy.get('[data-testid="order-item-quantity"]')
        .should('be.visible')
        .and('contain.text', '1');

      cy.get('[data-testid="order-item-unit-price"]')
        .should('be.visible')
        .and('contain.text', '2.400,00');

      cy.get('[data-testid="order-item-total-price"]')
        .should('be.visible')
        .and('contain.text', '2.400,00');
    });
  });

  it('Cenário 3: Validar que a única ação de alteração contratual disponível é o Cancelamento', () => {
    let currentOrder: Order = { ...baseOrder };

    cy.intercept('GET', `**/orders/${orderId}`, (req) => {
      req.reply({ statusCode: 200, body: currentOrder });
    }).as('getOrderCancelFlow');

    cy.intercept('PATCH', `**/orders/${orderId}/cancel`, (req) => {
      expect(req.body).to.have.property('justificativa');
      expect(req.body.justificativa.length).to.be.at.least(10);
      currentOrder = {
        ...currentOrder,
        status: 'CANCELLED',
        justificativaCancelamento: req.body.justificativa,
      };
      req.reply({ statusCode: 200, body: currentOrder });
    }).as('cancelOrder');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderCancelFlow');

    // Botão de cancelamento está presente e habilitado para o status WAITING_PRODUCTION
    cy.get('[data-testid="btn-cancel-order"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // Modal de cancelamento é exibido exigindo justificativa obrigatória
    cy.get('[data-testid="cancel-order-modal"]').should('be.visible');
    cy.contains('Cancelar Ordem de Serviço').should('be.visible');
    cy.contains(baseOrder.codigo).should('be.visible');

    // 3.1 Validação de fronteira: submeter com justificativa curta (menos de 10 caracteres)
    cy.get('#justificativa').type('Curta');
    cy.get('[data-testid="cancel-order-modal"]').find('button[type="submit"]').click();
    cy.contains(/mínimo 10 caracteres/i).should('be.visible');

    // 3.2 Fluxo positivo: preencher justificativa formal e confirmar cancelamento para renegociação
    const justificativaValida =
      'Cliente solicitou alteração no modelo da esquadria e nova negociação comercial.';
    cy.get('#justificativa').clear().type(justificativaValida);
    cy.get('[data-testid="cancel-order-modal"]').find('button[type="submit"]').click();

    // Aguarda a mutação do cancelamento e o refetch dos dados
    cy.wait('@cancelOrder');
    cy.wait('@getOrderCancelFlow');

    // Modal é fechado após sucesso
    cy.get('[data-testid="cancel-order-modal"]').should('not.exist');
    cy.contains('Ordem de serviço cancelada com sucesso.').should('be.visible');

    // Alerta de cancelamento com justificativa auditável é renderizado
    cy.get('[data-testid="order-cancelled-alert"]')
      .should('be.visible')
      .and('contain.text', justificativaValida);

    // O botão de cancelamento não deve mais estar disponível
    cy.get('[data-testid="btn-cancel-order"]').should('not.exist');

    // Mesmo com o cancelamento efetivado, as esquadrias contratadas mantêm total integridade documental
    cy.get('[data-testid="order-items-container"]').should('be.visible');
    cy.get('[data-testid="order-item-dimensions"]').first().should('contain.text', '1500 × 1200 mm');
  });

  it('Cenário 4: Validar blindagem progressiva e bloqueio de cancelamento em status IN_PRODUCTION', () => {
    const inProductionOrder: Order = {
      ...baseOrder,
      status: 'IN_PRODUCTION',
    };

    cy.intercept('GET', `**/orders/${orderId}`, {
      statusCode: 200,
      body: inProductionOrder,
    }).as('getOrderInProduction');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderInProduction');

    // Em produção, o cancelamento ativo é removido e o botão restrito desabilitado é exibido
    cy.get('[data-testid="btn-cancel-order"]').should('not.exist');
    cy.get('[data-testid="btn-cancel-order-restricted"]')
      .should('be.visible')
      .should('be.disabled')
      .and('have.attr', 'title')
      .and('include', 'processo de corte e usinagem na fábrica');

    // Itens continuam rigorosamente somente leitura
    cy.get('[data-testid="order-items-container"]')
      .find('input, select, textarea, button')
      .should('not.exist');
  });

  it('Cenário 5: Validar preservação da imutabilidade nos status terminais COMPLETED e CANCELLED', () => {
    // 5.1 Status COMPLETED
    const completedOrder: Order = {
      ...baseOrder,
      status: 'COMPLETED',
    };

    cy.intercept('GET', `**/orders/${orderId}`, {
      statusCode: 200,
      body: completedOrder,
    }).as('getOrderCompleted');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderCompleted');

    cy.get('[data-testid="btn-cancel-order"]').should('not.exist');
    cy.get('[data-testid="btn-cancel-order-restricted"]').should('not.exist');
    cy.get('[data-testid="order-items-container"]').should('be.visible');
    cy.contains('1500 × 1200 mm').should('be.visible');

    // 5.2 Status CANCELLED
    const cancelledOrder: Order = {
      ...baseOrder,
      status: 'CANCELLED',
      justificativaCancelamento:
        'Cliente solicitou alteração estrutural no projeto arquitetônico e renegociação.',
    };

    cy.intercept('GET', `**/orders/${orderId}`, {
      statusCode: 200,
      body: cancelledOrder,
    }).as('getOrderCancelled');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderCancelled');

    // Banner de cancelamento com justificativa auditável
    cy.get('[data-testid="order-cancelled-alert"]').should('be.visible');
    cy.contains(cancelledOrder.justificativaCancelamento!).should('be.visible');

    // Ações de cancelamento ou edição continuam completamente inexistentes
    cy.get('[data-testid="btn-cancel-order"]').should('not.exist');
    cy.get('[data-testid="order-items-container"]')
      .find('input, select, textarea, button')
      .should('not.exist');

    // Medidas e itens preservam fidelidade documental do contrato original
    cy.get(`[data-testid="order-item-row-${baseOrder.items[0].id}"]`).within(() => {
      cy.get('[data-testid="order-item-dimensions"]').should('contain.text', '1500 × 1200 mm');
      cy.get('[data-testid="order-item-total-price"]').should('contain.text', '4.400,00');
    });
  });
});
