import profileForm from '../../fixtures/profile-form.json';

describe('Filtro de Status - Perfis de Alumínio', () => {
  const uniqueSuffix = Date.now();

  const activeProfile = {
    ...profileForm[0],
    skuCode: `${profileForm[0].skuCode}-ATIVO-${uniqueSuffix}`,
    description: `${profileForm[0].description} ATIVO ${uniqueSuffix}`,
  };

  const inactiveProfile = {
    ...profileForm[1],
    skuCode: `${profileForm[1].skuCode}-INATIVO-${uniqueSuffix}`,
    description: `${profileForm[1].description} INATIVO ${uniqueSuffix}`,
  };

  const fillProfileForm = (profile: typeof activeProfile) => {
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
  };

  const createProfile = (
    profile: typeof activeProfile
  ) => {
    cy.get('[data-cy="new-material-button"]')
      .click();

    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    cy.get('[data-cy="material-type-profile"]')
      .click();

    fillProfileForm(profile);

    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    cy.contains('Perfil cadastrado com sucesso!')
      .should('be.visible');

    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-profiles"]')
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
    // 2. Seleciona Perfis
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .click();

    // =========================================================
    // 3. Cria perfil ativo
    // =========================================================
    createProfile(activeProfile);

    // =========================================================
    // 4. Cria perfil que será inativado
    // =========================================================
    createProfile(inactiveProfile);

    // =========================================================
    // 5. Localiza perfil e abre edição
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      inactiveProfile.description
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Ativo');

        cy.get('[data-cy="table-edit-button"]')
          .click();
      });

    // =========================================================
    // 6. Inativa
    // =========================================================
    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .and('have.class', 'bg-green-600')
      .click();

    cy.get('button[aria-label="Alternar status"]')
      .should('exist')
      .and('have.class', 'bg-surface-variant');

    cy.get('[data-cy="profile-form-save-button"]')
      .click();

    cy.contains('Perfil atualizado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 7. Retorna ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible');

    cy.get('[data-cy="catalog-tab-profiles"]')
      .click();

    // =========================================================
    // 8. Filtro Todos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('ALL');

    cy.contains(
      '[data-cy="profile-row"]',
      activeProfile.description
    )
      .should('exist');

    cy.contains(
      '[data-cy="profile-row"]',
      inactiveProfile.description
    )
      .should('exist');

    // =========================================================
    // 9. Filtro Ativos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('ACTIVE');

    cy.contains(
      '[data-cy="profile-row"]',
      activeProfile.description
    )
      .should('exist');

    cy.contains(
      '[data-cy="profile-row"]',
      inactiveProfile.description
    )
      .should('not.exist');

    // =========================================================
    // 10. Filtro Inativos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('INACTIVE');

    cy.contains(
      '[data-cy="profile-row"]',
      activeProfile.description
    )
      .should('not.exist');

    cy.contains(
      '[data-cy="profile-row"]',
      inactiveProfile.description
    )
      .should('exist')
      .within(() => {
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Inativo');
      });

    // =========================================================
    // 11. Volta para Todos
    // =========================================================
    cy.get('[data-cy="catalog-status-filter"]')
      .select('ALL');

    cy.contains(
      '[data-cy="profile-row"]',
      activeProfile.description
    )
      .should('exist');

    cy.contains(
      '[data-cy="profile-row"]',
      inactiveProfile.description
    )
      .should('exist');
  });
});