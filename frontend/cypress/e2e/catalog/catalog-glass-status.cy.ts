import glassForm from '../../fixtures/glass-form.json';

describe('Status do Vidro - Happy Path', () => {
  const glass = {
    ...glassForm[0],
    name: `${glassForm[0].name} ${Date.now()}`,
  };

  it('deve alternar o status entre ativo e inativo', () => {
    // =========================================================
    // 1. Acessa o catálogo
    // =========================================================
    cy.visit('/');

    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 2. Seleciona Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 3. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .click();

    // =========================================================
    // 4. Seleciona Vidro
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-glass"]')
      .click();

    // =========================================================
    // 5. Preenche formulário
    // =========================================================
    cy.get('[data-cy="glass-form-name"]')
      .clear()
      .type(glass.name);

    cy.get('[data-cy="glass-form-ncm"]')
      .clear()
      .type(glass.ncmCode);

    cy.get('[data-cy="glass-form-thickness"]')
      .select(glass.thicknessMm);

    cy.get('[data-cy="glass-form-color-finish"]')
      .clear()
      .type(glass.colorFinish);

    cy.get('[data-cy="glass-form-max-width"]')
      .clear()
      .type(glass.maxWidthMm);

    cy.get('[data-cy="glass-form-max-height"]')
      .clear()
      .type(glass.maxHeightMm);

    cy.get('[data-cy="glass-form-cost-price"]')
      .clear()
      .type(glass.costPrice);

    cy.get('[data-cy="glass-form-sale-price"]')
      .clear()
      .type(glass.salePrice);

    // =========================================================
    // 6. Salva
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    // =========================================================
    // 7. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 8. Localiza o vidro criado
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      glass.name
    )
      .should('exist')
      .within(() => {
        // Valida que iniciou como Ativo
        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .click();
      });

    // =========================================================
    // 9. Valida StatusToggle inicialmente ativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('be.visible')
      .and('have.class', 'bg-green-600');

    // =========================================================
    // 10. Altera para Inativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('have.class', 'bg-surface-variant');

    // =========================================================
    // 11. Salva a alteração
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    // =========================================================
    // 12. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 13. Valida status Inativo na tabela
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      glass.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Inativo');

        cy.get('[data-cy="table-edit-button"]')
          .click();
      });

    // =========================================================
    // 14. Valida que o toggle continua Inativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('have.class', 'bg-surface-variant');

    // =========================================================
    // 15. Altera novamente para Ativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('have.class', 'bg-green-600');

    // =========================================================
    // 16. Salva novamente
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    // =========================================================
    // 17. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 18. Valida status Ativo novamente
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      glass.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Ativo');
      });
  });
});