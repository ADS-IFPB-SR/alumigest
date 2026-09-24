import filmForm from '../../fixtures/film-form.json';

describe('Status da Película - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const film = {
    ...filmForm[0],
    skuCode: `${filmForm[0].skuCode}-${uniqueSuffix}`,
    name: `${filmForm[0].name} ${uniqueSuffix}`,
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
    // 2. Seleciona Películas
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 3. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 4. Seleciona Película
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-film"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Valida formulário
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 6. Preenche formulário
    // =========================================================
    cy.get('[data-cy="film-form-sku"]')
      .clear()
      .type(film.skuCode);

    cy.get('[data-cy="film-form-name"]')
      .clear()
      .type(film.name);

    cy.get('[data-cy="film-form-ncm"]')
      .clear()
      .type(film.ncmCode);

    cy.get('[data-cy="film-form-type"]')
      .clear()
      .type(film.filmType);

    cy.get('[data-cy="film-form-thickness"]')
      .clear()
      .type(film.thicknessMm);

    cy.get('[data-cy="film-form-standard-length"]')
      .clear()
      .type(film.standardLengthM);

    cy.get('[data-cy="film-form-max-width"]')
      .clear()
      .type(film.maxWidthMm);

    cy.get('[data-cy="film-form-cost-price"]')
      .clear()
      .type(film.costPrice);

    cy.get('[data-cy="film-form-sale-price"]')
      .clear()
      .type(film.salePrice);

    // =========================================================
    // 7. Salva o cadastro
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .click();

    // =========================================================
    // 8. Valida Toast
    // =========================================================
    cy.contains('Película cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 9. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    // =========================================================
    // 10. Seleciona Películas novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 11. Localiza a película criada
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      film.name
    )
      .should('exist')
      .within(() => {
        // Confirma estado inicial
        cy.get('[data-cy="film-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 12. Valida StatusToggle inicialmente Ativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .and('have.class', 'bg-green-600');

    // =========================================================
    // 13. Altera para Inativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .and('have.class', 'bg-surface-variant');

    // =========================================================
    // 14. Salva
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .click();

    // =========================================================
    // 15. Valida Toast de atualização
    // =========================================================
    cy.contains('Película atualizada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 16. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-films"]')
      .click();

    // =========================================================
    // 17. Valida Inativo na tabela
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      film.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="film-status"]')
          .should('have.text', 'Inativo');

        // Abre edição novamente
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 18. Valida toggle como Inativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .and('have.class', 'bg-surface-variant');

    // =========================================================
    // 19. Altera novamente para Ativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .and('have.class', 'bg-green-600');

    // =========================================================
    // 20. Salva novamente
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .click();

    // =========================================================
    // 21. Valida Toast
    // =========================================================
    cy.contains('Película atualizada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 22. Aguarda catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-films"]')
      .click();

    // =========================================================
    // 23. Valida Ativo novamente
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      film.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="film-status"]')
          .should('have.text', 'Ativo');
      });
  });
});