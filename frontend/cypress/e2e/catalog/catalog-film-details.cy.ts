import filmForm from '../../fixtures/film-form.json';

describe('Detalhes de Película - Happy Path', () => {
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

  const formatThickness = (value: string) => {
    return Number(value).toString();
  };

  it('deve cadastrar uma película e validar seus detalhes', () => {
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
    // 5. Seleciona Película
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
      .click();

    // =========================================================
    // 9. Valida Toast
    // =========================================================
    cy.contains('Película cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 10. Aguarda catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 11. Seleciona Películas novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 12. Localiza a película criada
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      film.name
    )
      .should('exist')
      .within(() => {
        // Abre detalhes
        cy.get('[data-cy="table-details-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 13. Valida abertura do modal
    // =========================================================
    cy.get('[data-cy="material-details-modal"]')
      .should('be.visible');

    // =========================================================
    // 14. Valida nome
    // =========================================================
    cy.get('[data-cy="details-name"]')
      .should('have.text', film.name);

    // =========================================================
    // 15. Valida referência/código
    // =========================================================
    cy.get('[data-cy="details-internal-code"]')
      .should('be.visible')
      .and('contain.text', film.skuCode);

    // =========================================================
    // 16. Valida especificação técnica
    // =========================================================
    cy.get('[data-cy="details-technical-spec"]')
      .should(
        'have.text',
        `${formatThickness(film.thicknessMm)}mm ${film.filmType}`
      );

    // =========================================================
    // 17. Valida preço
    // =========================================================
    cy.get('[data-cy="details-price"]')
      .should(
        'have.text',
        formatBRL(film.salePrice)
      );

    // =========================================================
    // 18. Valida status
    // =========================================================
    cy.get('[data-cy="details-status"]')
      .should('be.visible')
      .and(
        'have.text',
        'Ativo no Catálogo'
      );

    // =========================================================
    // 19. Valida botão de fechar
    // =========================================================
    cy.get('[data-cy="details-close-button"]')
      .should('be.visible');
  });
});