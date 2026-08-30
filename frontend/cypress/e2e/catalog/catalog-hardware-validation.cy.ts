describe('Cadastro de Ferragem - Validações', () => {
  beforeEach(() => {
    cy.visit('/');

    // =========================================================
    // 1. Valida tela inicial
    // =========================================================
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
    // 4. Valida modal de seleção
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    // =========================================================
    // 5. Seleciona Ferragem
    // =========================================================
    cy.get('[data-cy="material-type-hardware"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 6. Valida formulário
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible');
  });

  it('deve exibir mensagens de erro ao salvar o formulário com campos obrigatórios vazios', () => {
    // =========================================================
    // 7. Limpa os campos obrigatórios
    // =========================================================

    cy.get('[data-cy="hardware-form-sku"]')
      .clear();

    cy.get('[data-cy="hardware-form-name"]')
      .clear();

    cy.get('[data-cy="hardware-form-unit"]')
      .select('');

    cy.get('[data-cy="hardware-form-cost-price"]')
      .clear();

    cy.get('[data-cy="hardware-form-sale-price"]')
      .clear();

    cy.get('[data-cy="hardware-form-save-button"]')
      .click();

    cy.get('[data-cy="hardware-form-sku-field"]')
      .should(
        'contain.text',
        'Código obrigatório'
      );

    cy.get('[data-cy="hardware-form-name-field"]')
      .should(
        'contain.text',
        'A descrição é obrigatória.'
      );

    cy.get('[data-cy="hardware-form-unit-error"]')
      .should(
        'contain.text',
        'A unidade de medida é obrigatória.'
      );

    cy.get('[data-cy="hardware-form-cost-price-field"]')
      .should(
        'contain.text',
        'O preço de custo é obrigatório'
      );

    cy.get('[data-cy="hardware-form-sale-price-field"]')
      .should(
        'contain.text',
        'O preço de venda é obrigatório'
      );
  })
});