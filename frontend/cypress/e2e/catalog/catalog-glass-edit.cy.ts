import glassForm from '../../fixtures/glass-form.json';

describe('Edição de Vidro - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const originalGlass = {
    ...glassForm[0],
    name: `${glassForm[0].name} ${uniqueSuffix}`,
  };

  const updatedGlass = {
    ...glassForm[1],
    name: `${glassForm[1].name} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(
      value.replace(',', '.')
    );

    return `R$ ${numericValue.toFixed(2).replace('.', ',')}`;
  };

  it('deve cadastrar, editar e validar um vidro', () => {
    // =========================================================
    // 1. Acessa o catálogo
    // =========================================================
    cy.visit('/');

    // =========================================================
    // 2. Valida a tela inicial
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 3. Seleciona Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 4. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Seleciona o tipo Vidro
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-glass"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 6. Valida formulário
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 7. Preenche vidro inicial
    // =========================================================
    cy.get('[data-cy="glass-form-name"]')
      .clear()
      .type(originalGlass.name);

    cy.get('[data-cy="glass-form-ncm"]')
      .clear()
      .type(originalGlass.ncmCode);

    cy.get('[data-cy="glass-form-thickness"]')
      .select(originalGlass.thicknessMm);

    cy.get('[data-cy="glass-form-color-finish"]')
      .clear()
      .type(originalGlass.colorFinish);

    cy.get('[data-cy="glass-form-max-width"]')
      .clear()
      .type(originalGlass.maxWidthMm);

    cy.get('[data-cy="glass-form-max-height"]')
      .clear()
      .type(originalGlass.maxHeightMm);

    cy.get('[data-cy="glass-form-cost-price"]')
      .clear()
      .type(originalGlass.costPrice);

    cy.get('[data-cy="glass-form-sale-price"]')
      .clear()
      .type(originalGlass.salePrice);

    // =========================================================
    // 8. Salva
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 9. Aguarda catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 10. Seleciona Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 11. Valida o vidro criado
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      originalGlass.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="glass-name"]')
          .should('have.text', originalGlass.name);

        cy.get('[data-cy="glass-color-finish"]')
          .should('have.text', originalGlass.colorFinish);

        cy.get('[data-cy="glass-thickness"]')
          .should(
            'have.text',
            `${originalGlass.thicknessMm} mm`
          );

        cy.get('[data-cy="glass-sale-price"]')
          .should(
            'have.text',
            formatBRL(originalGlass.salePrice)
          );

        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Ativo');

        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 13. Valida que o formulário de edição abriu
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 14. Valida dados carregados
    // =========================================================
    cy.get('[data-cy="glass-form-name"]')
      .should('have.value', originalGlass.name);

    cy.get('[data-cy="glass-form-ncm"]')
      .should('have.value', originalGlass.ncmCode);

    cy.get('[data-cy="glass-form-thickness"]')
      .should(
        'have.value',
        originalGlass.thicknessMm
      );

    cy.get('[data-cy="glass-form-color-finish"]')
      .should(
        'have.value',
        originalGlass.colorFinish
      );

    cy.get('[data-cy="glass-form-max-width"]')
      .should(
        'have.value',
        originalGlass.maxWidthMm
      );

    cy.get('[data-cy="glass-form-max-height"]')
      .should(
        'have.value',
        originalGlass.maxHeightMm
      );

    cy.get('[data-cy="glass-form-cost-price"]')
      .should(
        'have.value',
        originalGlass.costPrice
      );

    cy.get('[data-cy="glass-form-sale-price"]')
      .should(
        'have.value',
        originalGlass.salePrice
      );

    // =========================================================
    // 15. Altera os dados
    // =========================================================
    cy.get('[data-cy="glass-form-name"]')
      .clear()
      .type(updatedGlass.name);

    cy.get('[data-cy="glass-form-ncm"]')
      .clear()
      .type(updatedGlass.ncmCode);

    cy.get('[data-cy="glass-form-thickness"]')
      .select(updatedGlass.thicknessMm);

    cy.get('[data-cy="glass-form-color-finish"]')
      .clear()
      .type(updatedGlass.colorFinish);

    cy.get('[data-cy="glass-form-max-width"]')
      .clear()
      .type(updatedGlass.maxWidthMm);

    cy.get('[data-cy="glass-form-max-height"]')
      .clear()
      .type(updatedGlass.maxHeightMm);

    cy.get('[data-cy="glass-form-cost-price"]')
      .clear()
      .type(updatedGlass.costPrice);

    cy.get('[data-cy="glass-form-sale-price"]')
      .clear()
      .type(updatedGlass.salePrice);

    // =========================================================
    // 16. Atualiza
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 17. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 18. Seleciona Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 19. Valida dados atualizados
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      updatedGlass.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="glass-name"]')
          .should('have.text', updatedGlass.name);

        cy.get('[data-cy="glass-color-finish"]')
          .should('have.text', updatedGlass.colorFinish);

        cy.get('[data-cy="glass-thickness"]')
          .should(
            'have.text',
            `${updatedGlass.thicknessMm} mm`
          );

        cy.get('[data-cy="glass-sale-price"]')
          .should(
            'have.text',
            formatBRL(updatedGlass.salePrice)
          );

        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Ativo');
      });
  });
});