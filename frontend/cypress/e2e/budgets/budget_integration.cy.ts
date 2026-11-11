describe('Budget Integration E2E', () => {
  let createdBudgetId: string | null = null;

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/orcamentos');
  });

  after(() => {
    if (createdBudgetId) {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8081/api/v1';
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/test-support/cleanup`,
        body: { budgetId: createdBudgetId },
        failOnStatusCode: false,
      });
    }
  });

  it('deve realizar o ciclo completo de orçamentos: listar, criar, detalhar, atualizar, alterar status e cancelar', () => {
    // A. Listagem e Criação
    cy.get('h2').contains('Orçamentos').should('be.visible');
    cy.contains('Novo Orçamento').click();
    cy.url().should('include', '/orcamentos/novo');

    // Seleciona o cliente existente
    cy.intercept('GET', '**/clientes*').as('searchCustomers');
    cy.get('[data-cy="input-busca-cliente"]').should('be.visible').type('Cliente Seed 1');
    cy.wait('@searchCustomers');
    cy.get('[data-cy="dropdown-opcao-cliente"]')
      .contains('Cliente Seed 1')
      .should('be.visible')
      .click();
    cy.get('[data-cy="card-cliente-selecionado"]').should('contain', 'Cliente Seed 1');

    // Adicionar item
    cy.get('[data-cy="btn-adicionar-esquadria"]').should('not.be.disabled').click();
    cy.get('div[aria-modal="true"] button[aria-label^="Selecionar esquadria "]')
      .first()
      .should('be.visible')
      .click();

    cy.get('#modal-width-input').should('be.visible').clear().type('1200');
    cy.get('#modal-height-input').clear().type('1500');
    cy.get('#modal-quantity-input').clear().type('2');

    // Step 2 -> Step 3 -> Step 4
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.selectRequiredMaterialsStep2();
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.contains('Mecânica da Folha & Puxador').scrollIntoView().should('be.visible');
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.get('#btn-adicionar').should('be.visible').click();

    // Assert that the item is on the list!
    cy.contains('1200×1500').scrollIntoView().should('be.visible');

    // Preenche o formulário principal do orçamento
    cy.get('#budget-discount').scrollIntoView().clear({ force: true }).type('10', { force: true });
    cy.get('#budget-notes').scrollIntoView().type('Nota E2E', { force: true });

    // Salva Orçamento
    cy.intercept('POST', '**/api/orcamentos*').as('createBudget');
    cy.get('#btn-salvar-proposta').should('not.be.disabled').click();

    cy.wait('@createBudget').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdBudgetId = interception.response?.body?.id ?? null;
    });

    // Verifica que fomos para a página de detalhes
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);
    cy.contains('p.font-label', 'Cliente Seed 1')
      .should('exist')
      .closest('.bg-surface-container-lowest')
      .should('be.visible');

    // Verifica listagem novamente e abre os detalhes pela tabela
    cy.visit('/orcamentos');
    cy.contains('tbody tr', 'Cliente Seed 1')
      .first()
      .should('be.visible')
      .find('button[title="Ver detalhes"]')
      .click();
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);

    // B. Atualizar (Editar Orçamento)
    cy.get('a[href$="/editar"]').should('be.visible').click();
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+\/editar$/i);
    cy.get('#budget-discount').scrollIntoView().clear({ force: true }).type('15', { force: true });
    cy.intercept('PUT', '**/api/orcamentos/*').as('updateBudget');
    cy.get('#btn-salvar-proposta').should('not.be.disabled').click();
    cy.wait('@updateBudget').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
    // Verifica que voltou para a página de detalhes
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);

    // C. Alterar Status via Pipeline da Página de Detalhes
    cy.intercept('PATCH', '**/api/orcamentos/*/status').as('patchStatus');
    cy.contains('button', 'Enviado').should('be.visible').click();
    cy.wait('@patchStatus').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
    // Toast de sucesso
    cy.contains('Status do orçamento atualizado com sucesso!').should('be.visible');

    // D. Excluir na Página de Detalhes
    cy.get('button[title="Excluir este orçamento"]').should('be.visible').click();

    // Confirma exclusão (modal)
    cy.intercept('DELETE', '**/api/orcamentos/*').as('deleteBudget');
    cy.contains('button', /^Excluir$/).should('be.visible').click();

    cy.wait('@deleteBudget').then((interception) => {
      expect(interception.response?.statusCode).to.eq(204);
    });

    // Verifica toast e redirecionamento para listagem
    cy.contains('Orçamento excluído com sucesso!').should('be.visible');
    cy.url().should('match', /\/orcamentos$/);
  });
});
