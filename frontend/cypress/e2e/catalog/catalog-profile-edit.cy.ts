import profileForm from '../../fixtures/profile-form.json';

describe('Edição de Perfil de Alumínio - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const originalProfile = {
    ...profileForm[0],
    skuCode: `${profileForm[0].skuCode}-${uniqueSuffix}`,
    description: `${profileForm[0].description} ${uniqueSuffix}`,
  };

  const updatedProfile = {
    ...profileForm[1],
    skuCode: `${profileForm[1].skuCode}-${uniqueSuffix}`,
    description: `${profileForm[1].description} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(value.replace(',', '.'));

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

  const formatWeight = (value: string) => {
    return value.replace('.', ',');
  };

  it('deve cadastrar, editar e validar um perfil de alumínio', () => {
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
    // 5. Valida modal de seleção
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
    // 7. Valida formulário
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 8. Preenche o perfil original
    // =========================================================
    cy.get('[data-cy="profile-form-sku"]')
      .clear()
      .type(originalProfile.skuCode);

    cy.get('[data-cy="profile-form-commercial-line"]')
      .clear()
      .type(originalProfile.commercialLine);

    cy.get('[data-cy="profile-form-description"]')
      .clear()
      .type(originalProfile.description);

    cy.get('[data-cy="profile-form-ncm"]')
      .clear()
      .type(originalProfile.ncmCode);

    cy.get('[data-cy="profile-form-color-finish"]')
      .clear()
      .type(originalProfile.colorFinish);

    cy.get('[data-cy="profile-form-weight"]')
      .clear()
      .type(originalProfile.weight);

    cy.get('[data-cy="profile-form-length"]')
      .clear()
      .type(originalProfile.length);

    cy.get('[data-cy="profile-form-cost-price"]')
      .clear()
      .type(originalProfile.costPrice);

    cy.get('[data-cy="profile-form-sale-price"]')
      .clear()
      .type(originalProfile.salePrice);

    // =========================================================
    // 9. Salva
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 10. Valida Toast
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
    // 12. Seleciona Perfis novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 13. Localiza o perfil criado
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      originalProfile.description
    )
      .should('exist')
      .within(() => {
        // Código
        cy.get('[data-cy="profile-reference"]')
          .should(
            'have.text',
            originalProfile.skuCode
          );

        // Descrição
        cy.get('[data-cy="profile-name"]')
          .should(
            'have.text',
            originalProfile.description
          );

        // Tamanho da barra
        cy.get('[data-cy="profile-length"]')
          .should(
            'have.text',
            Number(originalProfile.length)
              .toFixed(1)
              .replace('.', ',')
          );

        // Preço de venda
        cy.get('[data-cy="profile-sale-price"]')
          .should(
            'have.text',
            formatBRL(originalProfile.salePrice)
          );

        // Status
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 14. Valida abertura do formulário de edição
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 15. Valida os dados originais carregados
    // =========================================================

    cy.get('[data-cy="profile-form-sku"]')
      .should(
        'have.value',
        originalProfile.skuCode
      );

    cy.get('[data-cy="profile-form-commercial-line"]')
      .should(
        'have.value',
        originalProfile.commercialLine
      );

    cy.get('[data-cy="profile-form-description"]')
      .should(
        'have.value',
        originalProfile.description
      );

    cy.get('[data-cy="profile-form-ncm"]')
      .should(
        'have.value',
        originalProfile.ncmCode
      );

    cy.get('[data-cy="profile-form-color-finish"]')
      .should(
        'have.value',
        originalProfile.colorFinish
      );

    // IMPORTANTE:
    // O formulário exibe peso com vírgula.
    cy.get('[data-cy="profile-form-weight"]')
      .should(
        'have.value',
        formatWeight(originalProfile.weight)
      );

    cy.get('[data-cy="profile-form-length"]')
      .should(
        'have.value',
        originalProfile.length
      );

    cy.get('[data-cy="profile-form-cost-price"]')
      .should(
        'have.value',
        originalProfile.costPrice
      );

    cy.get('[data-cy="profile-form-sale-price"]')
      .should(
        'have.value',
        originalProfile.salePrice
      );

    // =========================================================
    // 16. Altera os dados
    // =========================================================

    cy.get('[data-cy="profile-form-sku"]')
      .clear()
      .type(updatedProfile.skuCode);

    cy.get('[data-cy="profile-form-commercial-line"]')
      .clear()
      .type(updatedProfile.commercialLine);

    cy.get('[data-cy="profile-form-description"]')
      .clear()
      .type(updatedProfile.description);

    cy.get('[data-cy="profile-form-ncm"]')
      .clear()
      .type(updatedProfile.ncmCode);

    cy.get('[data-cy="profile-form-color-finish"]')
      .clear()
      .type(updatedProfile.colorFinish);

    cy.get('[data-cy="profile-form-weight"]')
      .clear()
      .type(updatedProfile.weight);

    cy.get('[data-cy="profile-form-length"]')
      .clear()
      .type(updatedProfile.length);

    cy.get('[data-cy="profile-form-cost-price"]')
      .clear()
      .type(updatedProfile.costPrice);

    cy.get('[data-cy="profile-form-sale-price"]')
      .clear()
      .type(updatedProfile.salePrice);

    // =========================================================
    // 17. Atualiza
    // =========================================================
    cy.get('[data-cy="profile-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 18. Valida Toast
    // =========================================================
    cy.contains('Perfil atualizado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 19. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 20. Seleciona Perfis novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-profiles"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 21. Valida dados atualizados
    // =========================================================
    cy.contains(
      '[data-cy="profile-row"]',
      updatedProfile.description
    )
      .should('exist')
      .within(() => {
        // Código
        cy.get('[data-cy="profile-reference"]')
          .should(
            'have.text',
            updatedProfile.skuCode
          );

        // Descrição
        cy.get('[data-cy="profile-name"]')
          .should(
            'have.text',
            updatedProfile.description
          );

        // Tamanho da barra
        cy.get('[data-cy="profile-length"]')
          .should(
            'have.text',
            Number(updatedProfile.length)
              .toFixed(1)
              .replace('.', ',')
          );

        // Preço de venda
        cy.get('[data-cy="profile-sale-price"]')
          .should(
            'have.text',
            formatBRL(updatedProfile.salePrice)
          );

        // Status
        cy.get('[data-cy="profile-status"]')
          .should('have.text', 'Ativo');
      });
  });
});