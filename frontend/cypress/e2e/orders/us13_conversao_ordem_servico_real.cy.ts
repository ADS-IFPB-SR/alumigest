describe('US-13: Jornada E2E Integrada — Criação de Orçamento e Conversão em Ordem de Serviço Real', () => {
  const clienteNome = `Vidraçaria Esperança ${Date.now()}`;
  let createdClientId: string | null = null;
  let createdBudgetId: string | null = null;
  let createdOrderId: string | null = null;

  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  after(() => {
    // Exclusão Física (Hard Delete) das entidades geradas no teste
    cy.request({
      method: 'DELETE',
      url: '/api/v1/test-support/cleanup',
      body: {
        clientId: createdClientId,
        budgetId: createdBudgetId,
        orderId: createdOrderId,
        clientName: clienteNome,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.log(`Limpeza de dados do teste (Hard Delete) concluída com status: ${res.status}`);
    });
  });

  it('deve realizar o fluxo completo 100% visual via UI: Cadastrar Cliente -> Montar Esquadria -> Salvar Orçamento -> Aprovar e Gerar Ordem de Serviço', () => {
    // 1. Inicia criação de um novo orçamento
    cy.visit('/orcamentos/novo');
    cy.get('h2').contains('Novo Orçamento').should('be.visible');

    // 2. Cadastra novo cliente diretamente pela interface
    cy.get('#customer-search').type(clienteNome);
    cy.contains('button', `Cadastrar "${clienteNome}"`).click({ force: true });

    cy.get('input[name="telefone"]').type('(83) 99123-4567');
    cy.get('input[name="logradouro"]').type('Rua da Produção');
    cy.get('input[name="numero"]').type('500');
    cy.get('input[name="bairro"]').type('Distrito Industrial');
    cy.get('input[name="cidade"]').type('Sousa');
    cy.get('input[name="uf"]').type('PB');

    cy.intercept('POST', '**/api/v1/clients*').as('createClient');
    cy.contains('button', 'Salvar e Selecionar').click({ force: true });

    cy.wait('@createClient').then((interception) => {
      createdClientId = interception.response?.body?.id ?? null;
    });

    // Cliente selecionado no cabeçalho do orçamento
    cy.contains(clienteNome).should('be.visible');

    // 3. Adiciona uma esquadria no Wizard
    cy.contains('Adicionar Esquadria').click({ force: true });

    // Step 1: Dimensões (1200 x 1400 mm)
    cy.get('#modal-width-input').clear().type('1200');
    cy.get('#modal-height-input').clear().type('1400');
    cy.get('#modal-quantity-input').clear().type('1');

    // Step 2: Materiais
    cy.contains('button', 'Próximo: Materiais').click({ force: true });
    cy.wait(400);

    // Step 3: Mecânica e Usinagem
    cy.contains('button', 'Próximo: Mecânica').click({ force: true });
    cy.wait(400);

    // Step 4: Resumo e Adição
    cy.contains('button', 'Revisar Esquadria').click({ force: true });
    cy.wait(400);
    cy.contains('button', 'Adicionar ao Orçamento').click({ force: true });

    // Valida item na lista da proposta
    cy.contains('1200×1400').should('be.visible');

    // 4. Salva o Orçamento
    cy.get('#budget-notes').scrollIntoView().type('Pedido comercial com entrega agendada', { force: true });
    cy.intercept('POST', '**/api/orcamentos*').as('saveBudget');
    cy.contains('Salvar e Gerar Proposta').click();

    cy.wait('@saveBudget').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdBudgetId = interception.response?.body?.id ?? null;
    });

    // 5. Verifica detalhes do orçamento e aciona Aprovação (US-13)
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);
    cy.contains(clienteNome).should('be.visible');

    // Clica no botão de aprovação
    cy.get('[data-testid="btn-approve-budget"]').should('be.visible').click();

    // 6. Preenche o Modal de Aprovação (US-13.3)
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');
    cy.contains('Sugerido: +15 dias corridos').should('be.visible');

    cy.get('[data-testid="input-observacoes"]').type('Aprovado via WhatsApp pelo cliente. Liberar para corte.');

    cy.intercept('POST', '**/orders/convert/*').as('convertBudgetToOrder');
    cy.get('[data-testid="btn-confirm-approval"]').click();

    cy.wait('@convertBudgetToOrder').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      const order = interception.response?.body;
      createdOrderId = order?.id ?? null;
      expect(order).to.have.property('codigo');
      expect(order.codigo).to.match(/^(OS|PED)-\d{4}-\d{4}$/);
    });

    // 7. Valida redirecionamento para a tela de detalhes da Ordem de Serviço
    cy.url().should('match', /\/(ordens-servico|pedidos)\/[a-f0-9-]+$/i);
    cy.contains(clienteNome).should('be.visible');
    cy.contains('Criado').should('be.visible');
    cy.contains('Origem & Aprovação Comercial').should('be.visible');
    cy.contains('Resumo Financeiro Congelado').should('be.visible');
  });
});
