describe('Cadastro de Vidro - Validações', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-glass"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible');
  });

  it('deve exibir mensagens de erro ao salvar o formulário com campos obrigatórios vazios', () => {
    // Limpa os campos que possuem valor inicial
    cy.get('[data-cy="glass-form-name"]')
      .clear();

    cy.get('[data-cy="glass-form-color-finish"]')
      .clear();

    cy.get('[data-cy="glass-form-max-width"]')
      .clear();

    cy.get('[data-cy="glass-form-max-height"]')
      .clear();

    cy.get('[data-cy="glass-form-cost-price"]')
      .clear();

    cy.get('[data-cy="glass-form-sale-price"]')
      .clear();

    // Tenta salvar o formulário
    cy.get('[data-cy="glass-form-save-button"]')
      .click();

    // Valida erro do nome
    cy.get('[data-cy="glass-form-name-field"]')
      .should(
        'contain.text',
        'O nome/descrição é obrigatório.'
      );

    // Valida erro da cor/acabamento
    cy.get('[data-cy="glass-form-color-finish-field"]')
      .should(
        'contain.text',
        'A cor/acabamento é obrigatória.'
      );

    // Valida erro da largura
    cy.get('[data-cy="glass-form-max-width-field"]')
      .should(
        'contain.text',
        'Largura obrigatória'
      );

    // Valida erro da altura
    cy.get('[data-cy="glass-form-max-height-field"]')
      .should(
        'contain.text',
        'Altura obrigatória'
      );

    // Valida erro do preço de custo
    cy.get('[data-cy="glass-form-cost-price-field"]')
      .should(
        'contain.text',
        'O preço de custo é obrigatório'
      );

    // Valida erro do preço de venda
    cy.get('[data-cy="glass-form-sale-price-field"]')
      .should(
        'contain.text',
        'O preço de venda é obrigatório'
      );
  });
});