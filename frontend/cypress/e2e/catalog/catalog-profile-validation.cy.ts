describe('Cadastro de Perfil de Alumínio - Validações', () => {
  beforeEach(() => {
    cy.visit('/');

    // =========================================================
    // 1. Valida tela inicial
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 2. Seleciona Perfis de Alumínio
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
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
    // 5. Seleciona Perfil de Alumínio
    // =========================================================
    cy.get('[data-cy="material-type-profile"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 6. Valida abertura do formulário
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible');
  });

  it('deve exibir mensagens de erro ao salvar o formulário com campos obrigatórios vazios', () => {
    // =========================================================
    // 7. Limpa os campos obrigatórios
    // =========================================================

    cy.get('[data-cy="profile-form-sku"]')
      .clear();

    cy.get('[data-cy="profile-form-commercial-line"]')
      .clear();

    cy.get('[data-cy="profile-form-description"]')
      .clear();

    cy.get('[data-cy="profile-form-color-finish"]')
      .clear();

    cy.get('[data-cy="profile-form-weight"]')
      .clear();

    cy.get('[data-cy="profile-form-length"]')
      .clear();

    cy.get('[data-cy="profile-form-cost-price"]')
      .clear();

    cy.get('[data-cy="profile-form-sale-price"]')
      .clear();

    // =========================================================
    // 8. Tenta salvar
    // =========================================================

    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    // =========================================================
    // 9. Valida erro do Código
    // =========================================================

    cy.get('[data-cy="profile-form-sku-field"]')
      .should(
        'contain.text',
        'Código obrigatório'
      );

    // =========================================================
    // 10. Valida erro da Linha Comercial
    // =========================================================

    cy.get('[data-cy="profile-form-commercial-line-field"]')
      .should(
        'contain.text',
        'Linha comercial obrigatória'
      );

    // =========================================================
    // 11. Valida erro da Descrição
    // =========================================================

    cy.get('[data-cy="profile-form-description-field"]')
      .should(
        'contain.text',
        'A descrição é obrigatória.'
      );

    // =========================================================
    // 12. Valida erro da Cor
    // =========================================================

    cy.get('[data-cy="profile-form-color-finish-field"]')
      .should(
        'contain.text',
        'A cor é obrigatória.'
      );

    // =========================================================
    // 13. Valida erro do Peso
    // =========================================================

    cy.get('[data-cy="profile-form-weight-field"]')
      .should(
        'contain.text',
        'O peso é obrigatório.'
      );

    // =========================================================
    // 14. Valida erro do Comprimento
    // =========================================================

    cy.get('[data-cy="profile-form-length-field"]')
      .should(
        'contain.text',
        'O comprimento é obrigatório.'
      );

    // =========================================================
    // 15. Valida erro do Preço de Custo
    // =========================================================

    cy.get('[data-cy="profile-form-cost-price-field"]')
      .should(
        'contain.text',
        'O preço de custo é obrigatório'
      );

    // =========================================================
    // 16. Valida erro do Preço de Venda
    // =========================================================

    cy.get('[data-cy="profile-form-sale-price-field"]')
      .should(
        'contain.text',
        'O preço de venda é obrigatório'
      );
  });
});