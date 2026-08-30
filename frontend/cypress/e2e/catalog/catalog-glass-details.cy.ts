import glassForm from '../../fixtures/glass-form.json';

describe('Detalhes de Vidro - Happy Path', () => {
  const glass = {
    ...glassForm[0],
    name: `${glassForm[0].name} ${Date.now()}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(
      value.replace(',', '.')
    );

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

  it('deve cadastrar um vidro e validar seus detalhes', () => {
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
    // 4. Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .click();

    // =========================================================
    // 5. Seleciona Vidro
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-glass"]')
      .click();

    // =========================================================
    // 6. Preenche o formulário
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
    // 7. Salva
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    // =========================================================
    // 8. Aguarda o retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 9. Seleciona Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 10. Localiza o vidro criado
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      glass.name
    )
      .should('exist')
      .within(() => {

        // =====================================================
        // 11. Abre detalhes
        // =====================================================
        cy.get('[data-cy="table-details-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 12. Valida abertura do modal
    // =========================================================
    cy.get('[data-cy="material-details-modal"]')
      .should('be.visible');

    // =========================================================
    // 13. Valida nome
    // =========================================================
    cy.get('[data-cy="details-name"]')
      .should('have.text', glass.name);

    // =========================================================
    // 14. Valida especificação técnica
    // =========================================================
    cy.get('[data-cy="details-technical-spec"]')
      .should(
        'have.text',
        `${glass.thicknessMm}mm ${glass.colorFinish}`
      );

    // =========================================================
    // 15. Valida dimensões
    // =========================================================
    cy.get('[data-cy="details-dimensions"]')
      .should(
        'have.text',
        `${glass.maxWidthMm} L x ${glass.maxHeightMm} A`
      );

    // =========================================================
    // 16. Valida preço
    // =========================================================
    cy.get('[data-cy="details-price"]')
      .should(
        'have.text',
        formatBRL(glass.salePrice)
      );

    // =========================================================
    // 17. Valida status
    // =========================================================
    cy.get('[data-cy="details-status"]')
      .should('be.visible')
      .and('have.text', 'Ativo no Catálogo');

    // =========================================================
    // 18. Valida código interno
    // =========================================================
    cy.get('[data-cy="details-internal-code"]')
      .should('be.visible');
  });
});