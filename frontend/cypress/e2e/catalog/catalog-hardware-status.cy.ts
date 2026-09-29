import hardwareForm from '../../fixtures/hardware-form.json';

describe('Status da Ferragem - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const hardware = {
    ...hardwareForm[0],
    skuCode: `${hardwareForm[0].skuCode}-${uniqueSuffix}`,
    name: `${hardwareForm[0].name} ${uniqueSuffix}`,
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
    // 2. Seleciona Ferragens
    // =========================================================
    cy.get('[data-cy="catalog-tab-hardwares"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 3. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 4. Seleciona Ferragem
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-hardware"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Valida formulário
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 6. Preenche formulário
    // =========================================================
    cy.get('[data-cy="hardware-form-sku"]')
      .clear()
      .type(hardware.skuCode);

    cy.get('[data-cy="hardware-form-name"]')
      .clear()
      .type(hardware.name);

    cy.get('[data-cy="hardware-form-ncm"]')
      .clear()
      .type(hardware.ncmCode);

    cy.get('[data-cy="hardware-form-unit"]')
      .select(hardware.unitMeasure);

    cy.get('[data-cy="hardware-form-cost-price"]')
      .clear()
      .type(hardware.costPrice);

    cy.get('[data-cy="hardware-form-sale-price"]')
      .clear()
      .type(hardware.salePrice);

    // =========================================================
    // 7. Salva cadastro
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .click();

    // =========================================================
    // 8. Valida Toast de cadastro
    // =========================================================
    cy.contains('Ferragem cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 9. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    // =========================================================
    // 10. Seleciona Ferragens novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-hardwares"]')
      .click();

    // =========================================================
    // 11. Localiza a ferragem criada
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      hardware.name
    )
      .should('exist')
      .within(() => {
        // Estado inicial
        cy.get('[data-cy="hardware-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 12. Valida toggle inicialmente Ativo
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
    cy.get('[data-cy="hardware-form-save-button"]')
      .click();

    // =========================================================
    // 15. Valida Toast de atualização
    // =========================================================
    cy.contains('Ferragem atualizada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 16. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-hardwares"]')
      .click();

    // =========================================================
    // 17. Valida Inativo na tabela
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      hardware.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="hardware-status"]')
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
    // 19. Volta para Ativo
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
    cy.get('[data-cy="hardware-form-save-button"]')
      .click();

    // =========================================================
    // 21. Valida Toast
    // =========================================================
    cy.contains('Ferragem atualizada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 22. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-hardwares"]')
      .click();

    // =========================================================
    // 23. Valida Ativo novamente
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      hardware.name
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="hardware-status"]')
          .should('have.text', 'Ativo');
      });
  });
});