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

describe('Navegação do Catálogo - Abas', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');
  });

  it('deve alternar corretamente entre as quatro abas do catálogo', () => {
    // =========================================================
    // 1. Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('have.class', 'border-primary');

    cy.get('[data-cy="glass-table"]')
      .should('exist');

    // =========================================================
    // 2. Perfis de Alumínio
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('have.class', 'border-primary');

    cy.get('[data-cy="profile-table"]')
      .should('exist');

    // =========================================================
    // 3. Películas
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="catalog-tab-films"]')
      .should('have.class', 'border-primary');

    cy.get('[data-cy="film-table"]')
      .should('exist');

    // =========================================================
    // 4. Ferragens
    // =========================================================
    cy.get('[data-cy="catalog-tab-hardwares"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="catalog-tab-hardwares"]')
      .should('have.class', 'border-primary');

    cy.get('[data-cy="hardware-table"]')
      .should('exist');
  });
});