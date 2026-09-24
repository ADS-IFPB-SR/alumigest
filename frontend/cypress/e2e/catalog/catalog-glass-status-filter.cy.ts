import glassForm from '../../fixtures/glass-form.json';

describe('Filtro de Status do Catálogo - Vidro', () => {
  const uniqueSuffix = Date.now();

  const activeGlass = {
    ...glassForm[0],
    name: `${glassForm[0].name} ATIVO ${uniqueSuffix}`,
  };

  const inactiveGlass = {
    ...glassForm[1],
    name: `${glassForm[1].name} INATIVO ${uniqueSuffix}`,
  };

  const fillGlassForm = (
    glass: typeof activeGlass
  ) => {
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
  };

  const createGlass = (
    glass: typeof activeGlass
  ) => {
    cy.get('[data-cy="new-material-button"]')
      .click();

    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-glass"]')
      .click();

    fillGlassForm(glass);

    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    cy.contains('Vidro cadastrado com sucesso!')
      .should('be.visible');

    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();
  };

  it('deve filtrar corretamente entre Todos, Ativos e Inativos', () => {
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
    // 3. Cria vidro ativo
    // =========================================================
    createGlass(activeGlass);

    // =========================================================
    // 4. Cria vidro que depois será inativado
    // =========================================================
    createGlass(inactiveGlass);

    // =========================================================
    // 5. Localiza o segundo vidro e abre edição
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      inactiveGlass.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Ativo');

        cy.get('[data-cy="table-edit-button"]')
          .click();
      });

    // =========================================================
    // 6. Inativa o vidro
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .click();

    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    cy.contains('Vidro atualizado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 7. Volta para Vidros
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-glasses"]')
      .click();

    // =========================================================
    // 8. Filtro Todos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('ALL');

    cy.contains(
      '[data-cy="glass-row"]',
      activeGlass.name
    )
      .should('exist');

    cy.contains(
      '[data-cy="glass-row"]',
      inactiveGlass.name
    )
      .should('exist');

    // =========================================================
    // 9. Filtro Apenas Ativos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('ACTIVE');

    cy.contains(
      '[data-cy="glass-row"]',
      activeGlass.name
    )
      .should('exist');

    cy.contains(
      '[data-cy="glass-row"]',
      inactiveGlass.name
    )
      .should('not.exist');

    // =========================================================
    // 10. Filtro Apenas Inativos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('INACTIVE');

    cy.contains(
      '[data-cy="glass-row"]',
      activeGlass.name
    )
      .should('not.exist');

    cy.contains(
      '[data-cy="glass-row"]',
      inactiveGlass.name
    )
      .should('exist');

    // =========================================================
    // 11. Confirma status do registro inativo
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      inactiveGlass.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Inativo');
      });

    // =========================================================
    // 12. Volta para Todos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('ALL');

    cy.contains(
      '[data-cy="glass-row"]',
      activeGlass.name
    )
      .should('exist');

    cy.contains(
      '[data-cy="glass-row"]',
      inactiveGlass.name
    )
      .should('exist');
  });
});