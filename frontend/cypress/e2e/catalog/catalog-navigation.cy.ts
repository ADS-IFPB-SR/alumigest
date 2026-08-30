describe('Catálogo de Materiais', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve carregar a tela inicial corretamente', () => {
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');
  });

  it('deve selecionar Vidros e abrir o modal de Novo Material', () => {
    // Valida que estamos na tela inicial
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // Seleciona a aba Vidros
    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    // Clica em Novo Material
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // Valida que o modal foi aberto
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');
  });
});