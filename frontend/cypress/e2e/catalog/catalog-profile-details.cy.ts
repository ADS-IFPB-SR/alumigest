import profileForm from '../../fixtures/profile-form.json';

describe('Detalhes de Perfil de Alumínio - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const profile = {
    ...profileForm[0],
    skuCode: `${profileForm[0].skuCode}-${uniqueSuffix}`,
    description: `${profileForm[0].description} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(
      value.replace(',', '.')
    );

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

 const formatWeight = (value: string) => {
   return Number(value).toFixed(3);
 };

  it('deve cadastrar um perfil e validar seus detalhes', () => {
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
    // 3. Seleciona Perfis de Alumínio
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 4. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Seleciona Perfil
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-profile"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 6. Valida formulário
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 7. Preenche formulário
    // =========================================================
    cy.get('[data-cy="profile-form-sku"]')
      .clear()
      .type(profile.skuCode);

    cy.get('[data-cy="profile-form-commercial-line"]')
      .clear()
      .type(profile.commercialLine);

    cy.get('[data-cy="profile-form-description"]')
      .clear()
      .type(profile.description);

    cy.get('[data-cy="profile-form-ncm"]')
      .clear()
      .type(profile.ncmCode);

    cy.get('[data-cy="profile-form-color-finish"]')
      .clear()
      .type(profile.colorFinish);

    cy.get('[data-cy="profile-form-weight"]')
      .clear()
      .type(profile.weight);

    cy.get('[data-cy="profile-form-length"]')
      .clear()
      .type(profile.length);

    cy.get('[data-cy="profile-form-cost-price"]')
      .clear()
      .type(profile.costPrice);

    cy.get('[data-cy="profile-form-sale-price"]')
      .clear()
      .type(profile.salePrice);

    // =========================================================
    // 8. Salva
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    // =========================================================
    // 9. Valida Toast
    // =========================================================
    cy.contains('Perfil cadastrado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 10. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 11. Seleciona Perfis novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 12. Localiza o perfil criado
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      profile.description
    )
      .should('exist')
      .within(() => {

        // =====================================================
        // 13. Abre detalhes
        // =====================================================
        cy.get('[data-cy="table-details-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 14. Valida abertura do modal
    // =========================================================
    cy.get('[data-cy="material-details-modal"]')
      .should('be.visible');

    // =========================================================
    // 15. Valida nome
    // =========================================================
    cy.get('[data-cy="details-name"]')
      .should('have.text', profile.description);

    // =========================================================
    // 16. Valida linha comercial
    // =========================================================
    cy.get('[data-cy="details-commercial-line"]')
      .should(
        'have.text',
        profile.commercialLine
      );

    // =========================================================
    // 17. Valida peso
    // =========================================================
    cy.get('[data-cy="details-weight"]')
      .should(
        'contain.text',
        formatWeight(profile.weight)
      );

    // =========================================================
    // 18. Valida comprimento
    // =========================================================
    cy.get('[data-cy="details-length"]')
      .should(
        'contain.text',
        profile.length
      );

    // =========================================================
    // 19. Valida preço de venda
    // =========================================================
    cy.get('[data-cy="details-price"]')
      .should(
        'have.text',
        formatBRL(profile.salePrice)
      );

    // =========================================================
    // 20. Valida status
    // =========================================================
    cy.get('[data-cy="details-status"]')
      .should('be.visible')
      .and('have.text', 'Ativo no Catálogo');

    // =========================================================
    // 21. Valida botão de fechar
    // =========================================================
    cy.get('[data-cy="details-close-button"]')
      .should('be.visible');
  });
});