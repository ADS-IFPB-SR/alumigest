/// <reference types="cypress" />

import type { Order } from '../../../src/features/orders/types';
import {
  buildOrder,
  buildOrderItem,
  formatOrderItemDimensions,
  formatBRL,
} from '../../support/factories';

describe('US-14.2 / #431: Testes E2E — Imutabilidade Cadastral e Estrutural das Esquadrias do Pedido', () => {
  let consoleErrors: string[] = [];

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
    expect(consoleErrors, 'Nenhum erro silencioso ou visível no console deve ser emitido').to.deep.equal([]);
  });

  it('Cenário 1: Navegar para a tela de detalhes de pedido aprovado e validar ausência de ações mutáveis', () => {
    const order = buildOrder({ status: 'WAITING_PRODUCTION' });

    cy.intercept('GET', `**/orders/${order.id}`, {
      statusCode: 200,
      body: order,
    }).as('getOrderWaitingProduction');

    cy.visit(`/ordens-servico/${order.id}`);
    cy.wait('@getOrderWaitingProduction');

    cy.get('[data-testid="order-detail-page"]').should('be.visible');
    cy.contains(order.codigo).should('be.visible');

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

  it('Cenário 2: Validar que todos os campos de medidas, materiais e preços estão em modo somente leitura (Factory Dinâmica)', () => {
    // Pedido gerado sob demanda via Factory Pattern com itens dinâmicos
    const order = buildOrder({ itemsCount: 2 });

    cy.intercept('GET', `**/orders/${order.id}`, {
      statusCode: 200,
      body: order,
    }).as('getOrderReadOnly');

    cy.visit(`/ordens-servico/${order.id}`);
    cy.wait('@getOrderReadOnly');

    // Verifica que nenhum campo editável (input, select, textarea ou contenteditable) existe na tabela de itens
    cy.get('[data-testid="order-items-container"]')
      .find('input, select, textarea, [contenteditable="true"]')
      .should('not.exist');

    // Itera e valida dinamicamente cada esquadria gerada pela Factory
    order.items.forEach((item) => {
      cy.get(`[data-testid="order-item-row-${item.id}"]`).within(() => {
        // Descrição da tipologia
        cy.contains(item.descricao).should('be.visible');

        // Dimensões dinâmicas formatadas
        cy.get('[data-testid="order-item-dimensions"]')
          .should('be.visible')
          .and('contain.text', formatOrderItemDimensions(item));

        // Acabamentos e especificações
        cy.get('[data-testid="order-item-specs"]').within(() => {
          if (item.corAluminio) {
            cy.contains('Alumínio:').should('be.visible');
            cy.contains(item.corAluminio).should('be.visible');
          }
          if (item.tipoVidro) {
            cy.contains('Vidro:').should('be.visible');
            cy.contains(item.tipoVidro).should('be.visible');
          }
          if (item.orientacaoAbertura) {
            cy.contains('Abertura:').should('be.visible');
            cy.contains(item.orientacaoAbertura).should('be.visible');
          }
          if (item.ferragens) {
            cy.contains('Ferragens:').should('be.visible');
            cy.contains(item.ferragens).should('be.visible');
          }
        });

        // Opções de materiais/insumos vinculados (se houver)
        if (item.options && item.options.length > 0) {
          item.options.forEach((opt) => {
            cy.contains(`${opt.materialName} (${opt.quantity} ${opt.unitMeasure})`).should('be.visible');
          });
        }

        // Quantidade
        cy.get('[data-testid="order-item-quantity"]')
          .should('be.visible')
          .and('contain.text', String(item.quantidade));

        // Valor unitário formatado
        cy.get('[data-testid="order-item-unit-price"]')
          .should('be.visible')
          .and('contain.text', formatBRL(item.valorUnitario));

        // Valor total formatado
        cy.get('[data-testid="order-item-total-price"]')
          .should('be.visible')
          .and('contain.text', formatBRL(item.valorTotal));
      });
    });
  });

  it('Cenário 3: Validar que a única ação de alteração contratual disponível é o Cancelamento', () => {
    let currentOrder: Order = buildOrder({ status: 'WAITING_PRODUCTION' });
    const orderId = currentOrder.id;

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
    cy.contains(currentOrder.codigo).should('be.visible');

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
    cy.get(`[data-testid="order-item-row-${currentOrder.items[0].id}"]`).within(() => {
      cy.get('[data-testid="order-item-dimensions"]')
        .should('contain.text', formatOrderItemDimensions(currentOrder.items[0]));
      cy.get('[data-testid="order-item-total-price"]')
        .should('contain.text', formatBRL(currentOrder.items[0].valorTotal));
    });
  });

  it('Cenário 4: Validar blindagem progressiva e bloqueio de cancelamento em status IN_PRODUCTION', () => {
    const inProductionOrder = buildOrder({ status: 'IN_PRODUCTION' });
    const orderId = inProductionOrder.id;

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
    const completedOrder = buildOrder({ status: 'COMPLETED' });

    cy.intercept('GET', `**/orders/${completedOrder.id}`, {
      statusCode: 200,
      body: completedOrder,
    }).as('getOrderCompleted');

    cy.visit(`/ordens-servico/${completedOrder.id}`);
    cy.wait('@getOrderCompleted');

    cy.get('[data-testid="btn-cancel-order"]').should('not.exist');
    cy.get('[data-testid="btn-cancel-order-restricted"]').should('not.exist');
    cy.get('[data-testid="order-items-container"]').should('be.visible');
    cy.contains(formatOrderItemDimensions(completedOrder.items[0])).should('be.visible');

    // 5.2 Status CANCELLED
    const cancelledOrder = buildOrder({
      status: 'CANCELLED',
      justificativaCancelamento:
        'Cliente solicitou alteração estrutural no projeto arquitetônico e renegociação.',
    });

    cy.intercept('GET', `**/orders/${cancelledOrder.id}`, {
      statusCode: 200,
      body: cancelledOrder,
    }).as('getOrderCancelled');

    cy.visit(`/ordens-servico/${cancelledOrder.id}`);
    cy.wait('@getOrderCancelled');

    // Banner de cancelamento com justificativa auditável
    cy.get('[data-testid="order-cancelled-alert"]').should('be.visible');
    cy.contains(cancelledOrder.justificativaCancelamento!).should('be.visible');

    // Ações de cancelamento ou edição continuam completamente inexistentes
    cy.get('[data-testid="btn-cancel-order"]').should('not.exist');
    cy.get('[data-testid="order-items-container"]')
      .find('input, select, textarea, button')
      .should('not.exist');

    // Medidas e itens preservam fidelidade documental do contrato original gerado pela Factory
    cy.get(`[data-testid="order-item-row-${cancelledOrder.items[0].id}"]`).within(() => {
      cy.get('[data-testid="order-item-dimensions"]')
        .should('contain.text', formatOrderItemDimensions(cancelledOrder.items[0]));
      cy.get('[data-testid="order-item-total-price"]')
        .should('contain.text', formatBRL(cancelledOrder.items[0].valorTotal));
    });
  });

  it('Cenário 6: Validar resiliência e escalabilidade da tabela com múltiplos itens dinâmicos (com e sem options)', () => {
    // Demonstra a escalabilidade do padrão Factory solicitado pelo code review:
    // Montagem dinâmica de múltiplos itens com diferentes perfis estruturais
    const itemComOptions = buildOrderItem({
      descricao: 'Porta de Correr 4 Folhas Linha Suprema com Vidro Duplo',
      larguraMm: 3200,
      alturaMm: 2400,
      quantidade: 2,
      valorUnitario: 4500.0,
      valorTotal: 9000.0,
    });

    const itemSemOptions = buildOrderItem({
      descricao: 'Janela Basculante 1 Folha para Banheiro',
      larguraMm: 600,
      alturaMm: 600,
      quantidade: 3,
      valorUnitario: 350.0,
      valorTotal: 1050.0,
      options: [], // Sem options para validar renderização limpa
    });

    const multiItemOrder = buildOrder({
      status: 'WAITING_PRODUCTION',
      items: [itemComOptions, itemSemOptions],
    });

    cy.intercept('GET', `**/orders/${multiItemOrder.id}`, {
      statusCode: 200,
      body: multiItemOrder,
    }).as('getMultiItemOrder');

    cy.visit(`/ordens-servico/${multiItemOrder.id}`);
    cy.wait('@getMultiItemOrder');

    // Valida que o contêiner lista exatamente a quantidade total de itens gerados
    cy.contains(`Itens de Produção (${multiItemOrder.items.length})`).should('be.visible');

    // Valida item com options
    cy.get(`[data-testid="order-item-row-${itemComOptions.id}"]`).within(() => {
      cy.contains(itemComOptions.descricao).should('be.visible');
      cy.get('[data-testid="order-item-dimensions"]')
        .should('contain.text', formatOrderItemDimensions(itemComOptions));
      cy.get('[data-testid="order-item-total-price"]')
        .should('contain.text', formatBRL(itemComOptions.valorTotal));
    });

    // Valida item sem options
    cy.get(`[data-testid="order-item-row-${itemSemOptions.id}"]`).within(() => {
      cy.contains(itemSemOptions.descricao).should('be.visible');
      cy.get('[data-testid="order-item-dimensions"]')
        .should('contain.text', formatOrderItemDimensions(itemSemOptions));
      cy.get('[data-testid="order-item-total-price"]')
        .should('contain.text', formatBRL(itemSemOptions.valorTotal));
    });

    // Imutabilidade estrita mesmo em pedidos com múltiplos itens
    cy.get('[data-testid="order-items-container"]')
      .find('input, select, textarea, [contenteditable="true"]')
      .should('not.exist');
  });
});
