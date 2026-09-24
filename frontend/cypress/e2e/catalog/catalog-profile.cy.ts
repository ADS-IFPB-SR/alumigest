import profileForm from '../../fixtures/profile-form.json';

describe('Cadastro de Perfil de Alumínio - Happy Path', () => {

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

  it('deve cadastrar um perfil e validar sua exibição no catálogo', () => {
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
    // 3. Seleciona a aba Perfis de Alumínio
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
    // 5. Valida o modal de seleção de tipo
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    // =========================================================
    // 6. Seleciona Perfil de Alumínio
    // =========================================================
    cy.get('[data-cy="material-type-profile"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 7. Valida abertura do formulário
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 8. Preenche o formulário
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

    // O campo possui valor padrão "3"
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
    // 9. Salva o cadastro
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 10. Valida Toast de sucesso
    // =========================================================
    cy.contains('Perfil cadastrado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 11. Valida retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 12. Seleciona novamente Perfis
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 13. Valida a tabela
    // =========================================================
    cy.get('[data-cy="profile-table"]')
      .should('be.visible');

    // =========================================================
    // 14. Localiza o perfil criado
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      profile.description
    )
      .should('exist')
      .within(() => {

        // =====================================================
        // Código
        // =====================================================
        cy.get('[data-cy="profile-reference"]')
          .should('have.text', profile.skuCode);

        // =====================================================
        // Descrição
        // =====================================================
        cy.get('[data-cy="profile-name"]')
          .should('have.text', profile.description);

        // =====================================================
        // Tamanho da barra
        // =====================================================
        cy.get('[data-cy="profile-length"]')
          .should(
            'have.text',
            Number(profile.length)
              .toFixed(1)
              .replace('.', ',')
          );

        // =====================================================
        // Preço de venda
        // =====================================================
        cy.get('[data-cy="profile-sale-price"]')
          .should(
            'have.text',
            formatBRL(profile.salePrice)
          );

        // =====================================================
        // Status
        // =====================================================
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Ativo');
      });
  });
});