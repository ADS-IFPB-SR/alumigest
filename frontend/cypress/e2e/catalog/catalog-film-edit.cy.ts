import filmForm from '../../fixtures/film-form.json';

describe('Edição de Película - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const originalFilm = {
    ...filmForm[0],
    skuCode: `${filmForm[0].skuCode}-${uniqueSuffix}`,
    name: `${filmForm[0].name} ${uniqueSuffix}`,
  };

const formatDecimal = (value: string) => {
  return Number(value).toString();
};

  const updatedFilm = {
    ...filmForm[1],
    skuCode: `${filmForm[1].skuCode}-${uniqueSuffix}`,
    name: `${filmForm[1].name} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(value.replace(',', '.'));

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

  it('deve cadastrar, editar e validar uma película', () => {
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
    // 7. Preenche película original
    // =========================================================
    cy.get('[data-cy="film-form-sku"]')
      .clear()
      .type(originalFilm.skuCode);

    cy.get('[data-cy="film-form-name"]')
      .clear()
      .type(originalFilm.name);

    cy.get('[data-cy="film-form-ncm"]')
      .clear()
      .type(originalFilm.ncmCode);

    cy.get('[data-cy="film-form-type"]')
      .clear()
      .type(originalFilm.filmType);

    cy.get('[data-cy="film-form-thickness"]')
      .clear()
      .type(originalFilm.thicknessMm);

    cy.get('[data-cy="film-form-standard-length"]')
      .clear()
      .type(originalFilm.standardLengthM);

    cy.get('[data-cy="film-form-max-width"]')
      .clear()
      .type(originalFilm.maxWidthMm);

    cy.get('[data-cy="film-form-cost-price"]')
      .clear()
      .type(originalFilm.costPrice);

    cy.get('[data-cy="film-form-sale-price"]')
      .clear()
      .type(originalFilm.salePrice);

    // =========================================================
    // 8. Salva
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .click();

    // =========================================================
    // 9. Toast de cadastro
    // =========================================================
    cy.contains('Película cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 10. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 11. Seleciona Películas novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .click();

    // =========================================================
    // 12. Localiza a película criada
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      originalFilm.name
    )
      .should('exist')
      .within(() => {
        // Valida dados originais
        cy.get('[data-cy="film-reference"]')
          .should('have.text', originalFilm.skuCode);

        cy.get('[data-cy="film-name"]')
          .should('have.text', originalFilm.name);

        cy.get('[data-cy="film-sale-price"]')
          .should(
            'have.text',
            formatBRL(originalFilm.salePrice)
          );

        cy.get('[data-cy="film-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 13. Valida abertura do formulário de edição
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 14. Valida dados carregados no formulário
    // =========================================================
    cy.get('[data-cy="film-form-sku"]')
      .should('have.value', originalFilm.skuCode);

    cy.get('[data-cy="film-form-name"]')
      .should('have.value', originalFilm.name);

    cy.get('[data-cy="film-form-ncm"]')
      .should('have.value', originalFilm.ncmCode);

    cy.get('[data-cy="film-form-type"]')
      .should('have.value', originalFilm.filmType);

    cy.get('[data-cy="film-form-thickness"]')
      .should(
        'have.value',
        formatDecimal(originalFilm.thicknessMm)
      );

    cy.get('[data-cy="film-form-standard-length"]')
      .should(
        'have.value',
        originalFilm.standardLengthM
      );

    cy.get('[data-cy="film-form-max-width"]')
      .should(
        'have.value',
        originalFilm.maxWidthMm
      );

    cy.get('[data-cy="film-form-cost-price"]')
      .should(
        'have.value',
        originalFilm.costPrice
      );

    cy.get('[data-cy="film-form-sale-price"]')
      .should(
        'have.value',
        originalFilm.salePrice
      );

    // =========================================================
    // 15. Altera os dados
    // =========================================================
    cy.get('[data-cy="film-form-sku"]')
      .clear()
      .type(updatedFilm.skuCode);

    cy.get('[data-cy="film-form-name"]')
      .clear()
      .type(updatedFilm.name);

    cy.get('[data-cy="film-form-ncm"]')
      .clear()
      .type(updatedFilm.ncmCode);

    cy.get('[data-cy="film-form-type"]')
      .clear()
      .type(updatedFilm.filmType);

    cy.get('[data-cy="film-form-thickness"]')
      .should(
        'have.value',
        Number(originalFilm.thicknessMm).toString()
      );

    cy.get('[data-cy="film-form-standard-length"]')
      .clear()
      .type(updatedFilm.standardLengthM);

    cy.get('[data-cy="film-form-max-width"]')
      .clear()
      .type(updatedFilm.maxWidthMm);

    cy.get('[data-cy="film-form-cost-price"]')
      .clear()
      .type(updatedFilm.costPrice);

    cy.get('[data-cy="film-form-sale-price"]')
      .clear()
      .type(updatedFilm.salePrice);

    // =========================================================
    // 16. Atualiza
    // =========================================================
    cy.get('[data-cy="film-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 17. Toast de atualização
    // =========================================================
    cy.contains('Película atualizada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 18. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 19. Seleciona Películas novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-films"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 20. Valida dados atualizados
    // =========================================================
    cy.contains(
      '[data-cy="film-row"]',
      updatedFilm.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="film-reference"]')
          .should('have.text', updatedFilm.skuCode);

        cy.get('[data-cy="film-name"]')
          .should('have.text', updatedFilm.name);

        cy.get('[data-cy="film-sale-price"]')
          .should(
            'have.text',
            formatBRL(updatedFilm.salePrice)
          );

        cy.get('[data-cy="film-status"]')
          .should('have.text', 'Ativo');
      });
  });
});