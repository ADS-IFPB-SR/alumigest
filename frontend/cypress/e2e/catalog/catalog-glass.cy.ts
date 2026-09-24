import glassForm from '../../fixtures/glass-form.json';

describe('Cadastro de Vidro - Happy Path', () => {
  const glass = glassForm[0];

  it('deve cadastrar um vidro e validar sua exibição no catálogo', () => {
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
    // 3. Seleciona a aba Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 4. Abre Novo Material
    // =========================================================
    cy.get('[data-cy="new-material-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 5. Valida o modal de seleção
    // =========================================================
    cy.get('[data-cy="material-type-modal"]')
      .should('be.visible');

    // =========================================================
    // 6. Seleciona Vidro
    // =========================================================
    cy.get('[data-cy="material-type-glass"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 7. Valida abertura do formulário
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 8. Preenche o formulário
    // =========================================================
    cy.get('[data-cy="glass-form-name"]')
      .clear()
      .type(glass.name);

    cy.get('[data-cy="glass-form-ncm"]')
      .clear()
      .type(glass.ncmCode);

    cy.get('[data-cy="glass-form-thickness"]')
      .select(glass.thicknessMm);

    cy.get('[data-cy="glass-form-color-finish"]')
      .clear()
      .type(glass.colorFinish);

    // Esses campos possuem valores padrão no formulário.
    cy.get('[data-cy="glass-form-max-width"]')
      .clear()
      .type(glass.maxWidthMm);

    cy.get('[data-cy="glass-form-max-height"]')
      .clear()
      .type(glass.maxHeightMm);

    cy.get('[data-cy="glass-form-cost-price"]')
      .clear()
      .type(glass.costPrice);

    cy.get('[data-cy="glass-form-sale-price"]')
      .clear()
      .type(glass.salePrice);

    // =========================================================
    // 9. Salva
    // =========================================================
    cy.get('[data-cy="glass-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 10. Valida Toast de cadastro
    // =========================================================
    cy.contains('Vidro cadastrado com sucesso!')
      .should('be.visible');

    // =========================================================
    // 11. Valida retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 12. Seleciona novamente a aba Vidros
    // =========================================================
    cy.get('[data-cy="catalog-tab-glasses"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 13. Valida tabela
    // =========================================================
    cy.get('[data-cy="glass-table"]')
      .should('be.visible');

    // =========================================================
    // 14. Localiza o vidro criado
    // =========================================================
    cy.contains(
      '[data-cy="glass-row"]',
      glass.name
    )
      .should('exist')
      .within(() => {

        // =====================================================
        // Descrição
        // =====================================================
        cy.get('[data-cy="glass-name"]')
          .should('have.text', glass.name);

        // =====================================================
        // Cor / Acabamento
        // =====================================================
        cy.get('[data-cy="glass-color-finish"]')
          .should('have.text', glass.colorFinish);

        // =====================================================
        // Espessura
        // =====================================================
        cy.get('[data-cy="glass-thickness"]')
          .should(
            'have.text',
            `${glass.thicknessMm} mm`
          );

        // =====================================================
        // Preço de venda
        // =====================================================
        cy.get('[data-cy="glass-sale-price"]')
          .should('have.text', 'R$ 180,00');

        // =====================================================
        // Status
        // =====================================================
        cy.get('[data-cy="glass-status"]')
          .should('have.text', 'Ativo');
      });
  });
});