import hardwareForm from '../../fixtures/hardware-form.json';

describe('Cadastro de Ferragem - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const hardware = {
    ...hardwareForm[0],
    skuCode: `${hardwareForm[0].skuCode}-${uniqueSuffix}`,
    name: `${hardwareForm[0].name} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(
      value.replace(',', '.')
    );

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

  it('deve cadastrar uma ferragem e validar sua exibição no catálogo', () => {
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
    // 3. Seleciona Ferragens
    // =========================================================
    cy.get('[data-cy="catalog-tab-hardwares"]')
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
    // 6. Seleciona Ferragem
    // =========================================================
    cy.get('[data-cy="material-type-hardware"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 7. Valida abertura do formulário
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 8. Preenche o formulário
    // =========================================================
    cy.get('[data-cy="hardware-form-sku"]')
      .clear()
      .type(hardware.skuCode);

    cy.get('[data-cy="hardware-form-name"]')
      .clear()
      .type(hardware.name);

    cy.get('[data-cy="hardware-form-ncm"]')
      .clear()
      .type(hardware.ncmCode);

    // Unidade
    cy.get('[data-cy="hardware-form-unit"]')
      .should('be.visible')
      .select(hardware.unitMeasure);

    // Preços
    cy.get('[data-cy="hardware-form-cost-price"]')
      .clear()
      .type(hardware.costPrice);

    cy.get('[data-cy="hardware-form-sale-price"]')
      .clear()
      .type(hardware.salePrice);

    // =========================================================
    // 9. Salva o cadastro
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 10. Valida Toast de sucesso
    // =========================================================
    cy.contains('Ferragem cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 11. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 12. Seleciona Ferragens novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-hardwares"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 13. Valida tabela
    // =========================================================
    cy.get('[data-cy="hardware-table"]')
      .should('be.visible');

    // =========================================================
    // 14. Localiza a ferragem criada
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      hardware.name
    )
      .should('exist')
      .within(() => {
        // =====================================================
        // Código
        // =====================================================
        cy.get('[data-cy="hardware-reference"]')
          .should(
            'have.text',
            hardware.skuCode
          );

        // =====================================================
        // Descrição
        // =====================================================
        cy.get('[data-cy="hardware-name"]')
          .should(
            'have.text',
            hardware.name
          );

        // =====================================================
        // Unidade
        // =====================================================
        cy.get('[data-cy="hardware-unit"]')
          .should('have.text', 'Unidade');

        // =====================================================
        // Preço de venda
        // =====================================================
        cy.get('[data-cy="hardware-sale-price"]')
          .should(
            'have.text',
            formatBRL(hardware.salePrice)
          );

        // =====================================================
        // Status
        // =====================================================
        cy.get('[data-cy="hardware-status"]')
          .should('have.text', 'Ativo');
      });
  });
});