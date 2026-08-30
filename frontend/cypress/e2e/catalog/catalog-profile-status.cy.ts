import profileForm from '../../fixtures/profile-form.json';

describe('Status do Perfil de Alumínio - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const profile = {
    ...profileForm[0],
    skuCode: `${profileForm[0].skuCode}-${uniqueSuffix}`,
    description: `${profileForm[0].description} ${uniqueSuffix}`,
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
    // 4. Seleciona Perfil
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-profile"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Preenche formulário
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
    // 6. Salva o perfil
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    // =========================================================
    // 7. Valida Toast de cadastro
    // =========================================================
    cy.contains('Perfil cadastrado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 8. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    // =========================================================
    // 9. Seleciona novamente Perfis
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .click();

    // =========================================================
    // 10. Localiza o perfil criado
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      profile.description
    )
      .should('exist')
      .within(() => {
        // Confirma estado inicial
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 11. Valida StatusToggle inicialmente Ativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('be.visible')
      .and('have.class', 'bg-green-600');

    // =========================================================
    // 12. Altera para Inativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('have.class', 'bg-surface-variant');

    // =========================================================
    // 13. Salva
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    // =========================================================
    // 14. Valida Toast de atualização
    // =========================================================
    cy.contains('Perfil atualizado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 15. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-profiles"]')
      .click();

    // =========================================================
    // 16. Valida perfil como Inativo
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      profile.description
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Inativo');

        // Abre edição novamente
        cy.get('[data-cy="table-edit-button"]')
          .click();
      });

    // =========================================================
    // 17. Valida StatusToggle como Inativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('be.visible')
      .and('have.class', 'bg-surface-variant');

    // =========================================================
    // 18. Altera novamente para Ativo
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('have.class', 'bg-green-600');

    // =========================================================
    // 19. Salva novamente
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    // =========================================================
    // 20. Valida Toast de atualização
    // =========================================================
    cy.contains('Perfil atualizado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 21. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-profiles"]')
      .click();

    // =========================================================
    // 22. Valida perfil como Ativo novamente
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      profile.description
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Ativo');
      });
  });
});