import filmForm from '../../fixtures/film-form.json';

describe('Cadastro de Película - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const film = {
    ...filmForm[0],
    skuCode: `${filmForm[0].skuCode}-${uniqueSuffix}`,
    name: `${filmForm[0].name} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(
      value.replace(',', '.')
    );

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

  it('deve cadastrar uma película e validar sua exibição no catálogo', () => {
    // =========================================================
    // 1. Acessa o catálogo
    // =========================================================
    cy.visit('/');

    // =========================================================
    // 2. Valida tela inicial
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 3. Seleciona Películas
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 4. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Seleciona o tipo Película
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-film"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 6. Valida formulário
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 7. Preenche formulário
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

    // Valores possuem defaults, portanto limpamos antes.
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
    // 8. Salva
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 9. Valida Toast
    // =========================================================
    cy.contains('Película cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 10. Valida retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 11. Seleciona novamente Películas
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 12. Valida tabela
    // =========================================================
    cy.get('[data-cy="film-table"]')
      .should('be.visible');

    // =========================================================
    // 13. Localiza a película criada
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      film.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="film-reference"]')
          .should('have.text', film.skuCode);

        cy.get('[data-cy="film-name"]')
          .should('have.text', film.name);

        cy.get('[data-cy="film-sale-price"]')
          .should('have.text', 'R$ 59,90');

        cy.get('[data-cy="film-status"]')
          .should('have.text', 'Ativo');
      });
  });
});