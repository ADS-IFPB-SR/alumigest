describe('US-13: Jornada E2E Integrada — Criação de Orçamento e Conversão em Ordem de Serviço Real', () => {
  const clienteNome = `Vidraçaria Esperança ${Date.now()}`;
  const clienteCpf = `9${String(Date.now()).slice(-10)}`;
  let createdClientId: string | null = null;
  let createdBudgetId: string | null = null;
  let createdOrderId: string | null = null;

  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  after(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8081/api/v1';
    // Exclusão Física (Hard Delete) das entidades geradas no teste
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/test-support/cleanup`,
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
    cy.get('h1').contains('Novo Orçamento').should('be.visible');

    // 2. Cadastra novo cliente diretamente pela interface
    cy.get('[data-cy="btn-novo-cliente"]').should('be.visible').click();
    cy.get('#cqc-nome').should('be.visible').clear().type(clienteNome);
    cy.get('#cqc-doc').clear().type(clienteCpf);
    cy.get('#cqc-tel').clear().type('(83) 99123-4567');
    cy.get('#cqc-logr').clear().type('Rua da Produção');
    cy.get('#cqc-num').clear().type('500');
    cy.get('#cqc-bairro').clear().type('Distrito Industrial');
    cy.get('#cqc-cidade').clear().type('Sousa');
    cy.get('select#cqc-uf').select('PB');

    cy.intercept('POST', '**/api/clientes*').as('createClient');
    cy.contains('button', 'Cadastrar Cliente').click();

    cy.wait('@createClient').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdClientId = interception.response?.body?.id ?? null;
    });

    // Cliente selecionado no cabeçalho do orçamento
    cy.contains(clienteNome).should('be.visible');

    // 3. Adiciona uma esquadria no Wizard
    cy.get('[data-cy="btn-adicionar-esquadria"]').should('not.be.disabled').click();
    cy.get('div[aria-modal="true"] button[aria-label^="Selecionar esquadria "]')
      .first()
      .should('be.visible')
      .click();

    // Step 1: Dimensões (1200 x 1400 mm)
    cy.get('#modal-width-input').should('be.visible').clear().type('1200');
    cy.get('#modal-height-input').clear().type('1400');
    cy.get('#modal-quantity-input').clear().type('1');

    // Step 2: Materiais
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.selectRequiredMaterialsStep2();

    // Step 3: Mecânica e Usinagem
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.contains('Mecânica da Folha & Puxador').scrollIntoView().should('be.visible');

    // Step 4: Resumo e Adição
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.get('#btn-adicionar').should('be.visible').click();

    // Valida item na lista da proposta
    cy.contains('1200×1400').scrollIntoView().should('be.visible');

    // 4. Salva o Orçamento
    cy.get('#budget-notes').scrollIntoView().type('Pedido comercial com entrega agendada', { force: true });
    cy.intercept('POST', '**/api/orcamentos*').as('saveBudget');
    cy.get('#btn-salvar-proposta').should('not.be.disabled').click();

    cy.wait('@saveBudget').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdBudgetId = interception.response?.body?.id ?? null;
    });

    // 5. Verifica detalhes do orçamento e aciona Aprovação (US-13)
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);
    cy.contains('p.font-label', clienteNome).should('be.visible');

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
