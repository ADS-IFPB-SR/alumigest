describe('Cadastro de Película - Validações', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    cy.get('[data-cy="catalog-tab-films"]')
      .click();

    cy.get('[data-cy="new-material-button"]')
      .click();

    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-film"]')
      .click();

    cy.get('[data-cy="film-form-save-button"]')
      .should('be.visible');
  });

  it('deve exibir mensagens de erro ao salvar o formulário com campos obrigatórios vazios', () => {
    cy.get('[data-cy="film-form-name"]')
      .clear();

    cy.get('[data-cy="film-form-type"]')
      .clear();

    cy.get('[data-cy="film-form-thickness"]')
      .clear();

    cy.get('[data-cy="film-form-standard-length"]')
      .clear();

    cy.get('[data-cy="film-form-max-width"]')
      .clear();

    cy.get('[data-cy="film-form-cost-price"]')
      .clear();

    cy.get('[data-cy="film-form-sale-price"]')
      .clear();

    cy.get('[data-cy="film-form-save-button"]')
      .click();

    cy.get('[data-cy="film-form-name-field"]')
      .should(
        'contain.text',
        'A descrição é obrigatória.'
      );

    cy.get('[data-cy="film-form-type-field"]')
      .should(
        'contain.text',
        'O tipo é obrigatório.'
      );

    cy.get('[data-cy="film-form-thickness-field"]')
      .should(
        'contain.text',
        'A espessura é obrigatória.'
      );

    cy.get('[data-cy="film-form-standard-length-field"]')
      .should(
        'contain.text',
        'O comprimento da bobina é obrigatório.'
      );

    cy.get('[data-cy="film-form-max-width-field"]')
      .should(
        'contain.text',
        'A largura da bobina é obrigatória.'
      );

    cy.get('[data-cy="film-form-cost-price-field"]')
      .should(
        'contain.text',
        'O preço de custo é obrigatório'
      );

    cy.get('[data-cy="film-form-sale-price-field"]')
      .should(
        'contain.text',
        'O preço de venda é obrigatório'
      );
  });
});