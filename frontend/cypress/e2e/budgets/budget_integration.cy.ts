describe('Budget Integration E2E', () => {
  beforeEach(() => {
    // Removemos o mock de /catalog/products pois a API lida com a inferência,
    // e precisamos de um ID de produto real do banco para o POST /api/orcamentos funcionar.

    cy.visit('/orcamentos');
  });

  it('deve realizar o ciclo completo de orçamentos: listar, criar, detalhar, atualizar, alterar status e cancelar', () => {
    // A. Listagem e Criação
    cy.get('h2').contains('Orçamentos').should('be.visible');
    cy.contains('Novo Orçamento').click({ force: true });
    cy.url().should('include', '/orcamentos/novo');

    // Seleciona o cliente existente
    cy.get('#customer-search').type('Cliente Seed 1');
    cy.contains('button', 'Cliente Seed 1').click({ force: true });

    // Preenche o formulário principal do orçamento
    cy.get('#budget-discount').scrollIntoView().clear({ force: true }).type('10', { force: true });
    cy.get('#budget-notes').scrollIntoView().type('Nota E2E', { force: true });

    // Adicionar item
    cy.contains('Adicionar Esquadria').click({ force: true });

    // Avança no Builder (espera carregamento dos catálogos)
    cy.wait(1000);
    cy.get('select[aria-label="Selecionar Template de Esquadria"]').should('be.visible').find('option').eq(1).then($option => {
      cy.get('select[aria-label="Selecionar Template de Esquadria"]').select($option.val() as string);
    });

    cy.get('#modal-width-input').clear().type('1200');
    cy.get('#modal-height-input').clear().type('1500');
    cy.get('#modal-quantity-input').clear().type('2');

    cy.contains('Adicionar ao Orçamento').click({ force: true });

    // Assert that the item is on the list!
    cy.contains('1200×1500').scrollIntoView().should('be.visible');

    // Salva Orçamento
    cy.intercept('POST', '**/api/orcamentos*').as('createBudget');
    cy.contains('Salvar e Gerar Proposta').click();

    cy.wait('@createBudget').then((interception) => {
      cy.writeFile('cypress-request-payload.json', interception.request.body);
      cy.writeFile('cypress-response-payload.json', interception.response?.body || {});
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);

      // Armazena o ID retornado
      const budgetId = interception.response?.body?.id;
      if (budgetId) {
        cy.request('GET', `/api/orcamentos/${budgetId}`).then((response) => {
          cy.log('GET /api/orcamentos/{id} PAYLOAD:', JSON.stringify(response.body));
        });
      }
    });

    // Verifica que fomos para a página de detalhes
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);
    cy.contains('Cliente Seed 1').should('be.visible');

    // Verifica listagem novamente
    cy.visit('/orcamentos');
    cy.contains('Cliente Seed 1').should('be.visible');

    // Clica para detalhar
    cy.contains('Cliente Seed 1').parents('.group').find('a').contains('Ver').click();
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);

    // B. Atualizar (Editar Orçamento)
    cy.contains('Editar Orçamento').click({ force: true });
    cy.get('#budget-discount').scrollIntoView().clear({ force: true }).type('15', { force: true });
    cy.intercept('PUT', '**/api/orcamentos/*').as('updateBudget');
    cy.contains('Salvar e Gerar Proposta').click();
    cy.wait('@updateBudget').then((interception) => {
      cy.log('PUT REQUEST PAYLOAD:', JSON.stringify(interception.request.body));
      cy.log('PUT RESPONSE PAYLOAD:', JSON.stringify(interception.response?.body));
      expect(interception.response?.statusCode).to.eq(200);
    });
    // Verifica que voltou para a página de detalhes
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);

    // C. Alterar Status
    cy.intercept('PATCH', '**/api/orcamentos/*/status').as('patchStatus');
    cy.get('select#budget-status-select').select('SENT');
    cy.wait('@patchStatus').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
    // Toast de sucesso
    cy.contains('Status do orçamento atualizado com sucesso!').should('be.visible');

    // Voltar para listagem
    cy.visit('/orcamentos');

    // D. Cancelar
    cy.contains('Cliente Seed 1')
      .closest('.group')
      .find('button[title="Excluir orçamento"]')
      .first()
      .click({ force: true });

    // Confirma exclusão (modal)
    cy.intercept('DELETE', '**/api/orcamentos/*').as('deleteBudget');
    cy.contains('button', 'Excluir').click({ force: true });

    cy.wait('@deleteBudget').then((interception) => {
      expect(interception.response?.statusCode).to.eq(204);
    });

    // Verifica toast e remoção
    cy.contains('Orçamento excluído').should('be.visible');
  });
});
