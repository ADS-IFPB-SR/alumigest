import hardwareForm from '../../fixtures/hardware-form.json';

describe('Edição de Ferragem - Happy Path', () => {
  const uniqueSuffix = Date.now();

  const originalHardware = {
    ...hardwareForm[0],
    skuCode: `${hardwareForm[0].skuCode}-${uniqueSuffix}`,
    name: `${hardwareForm[0].name} ${uniqueSuffix}`,
  };

  const updatedHardware = {
    ...hardwareForm[1],
    skuCode: `${hardwareForm[1].skuCode}-${uniqueSuffix}`,
    name: `${hardwareForm[1].name} ${uniqueSuffix}`,
  };

  const formatBRL = (value: string) => {
    const numericValue = Number(value.replace(',', '.'));

    return `R$ ${numericValue
      .toFixed(2)
      .replace('.', ',')}`;
  };

  const getUnitLabel = (unit: string) => {
    const map: Record<string, string> = {
      UN: 'Unidade',
      PAR: 'Par',
      METRO: 'Metro Linear',
    };

    return map[unit] || unit;
  };

  it('deve cadastrar, editar e validar uma ferragem', () => {
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
    // 7. Valida formulário
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 8. Preenche ferragem original
    // =========================================================
    cy.get('[data-cy="hardware-form-sku"]')
      .clear()
      .type(originalHardware.skuCode);

    cy.get('[data-cy="hardware-form-name"]')
      .clear()
      .type(originalHardware.name);

    cy.get('[data-cy="hardware-form-ncm"]')
      .clear()
      .type(originalHardware.ncmCode);

    cy.get('[data-cy="hardware-form-unit"]')
      .select(originalHardware.unitMeasure);

    cy.get('[data-cy="hardware-form-cost-price"]')
      .clear()
      .type(originalHardware.costPrice);

    cy.get('[data-cy="hardware-form-sale-price"]')
      .clear()
      .type(originalHardware.salePrice);

    // =========================================================
    // 9. Salva cadastro
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .click();

    // =========================================================
    // 10. Valida Toast
    // =========================================================
    cy.contains('Ferragem cadastrada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 11. Aguarda retorno
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
    // 13. Localiza ferragem criada
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      originalHardware.name
    )
      .should('exist')
      .within(() => {
        // Código
        cy.get('[data-cy="hardware-reference"]')
          .should(
            'have.text',
            originalHardware.skuCode
          );

        // Nome
        cy.get('[data-cy="hardware-name"]')
          .should(
            'have.text',
            originalHardware.name
          );

        // Unidade
        cy.get('[data-cy="hardware-unit"]')
          .should(
            'have.text',
            getUnitLabel(
              originalHardware.unitMeasure
            )
          );

        // Preço
        cy.get('[data-cy="hardware-sale-price"]')
          .should(
            'have.text',
            formatBRL(
              originalHardware.salePrice
            )
          );

        // Status
        cy.get('[data-cy="hardware-status"]')
          .should('have.text', 'Ativo');

        // Abre edição
        cy.get('[data-cy="table-edit-button"]')
          .should('exist')
          .click();
      });

    // =========================================================
    // 14. Valida formulário de edição
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible');

    // =========================================================
    // 15. Valida dados originais carregados
    // =========================================================
    cy.get('[data-cy="hardware-form-sku"]')
      .should(
        'have.value',
        originalHardware.skuCode
      );

    cy.get('[data-cy="hardware-form-name"]')
      .should(
        'have.value',
        originalHardware.name
      );

    cy.get('[data-cy="hardware-form-ncm"]')
      .should(
        'have.value',
        originalHardware.ncmCode
      );

    cy.get('[data-cy="hardware-form-unit"]')
      .should(
        'have.value',
        originalHardware.unitMeasure
      );

    cy.get('[data-cy="hardware-form-cost-price"]')
      .should(
        'have.value',
        originalHardware.costPrice
      );

    cy.get('[data-cy="hardware-form-sale-price"]')
      .should(
        'have.value',
        originalHardware.salePrice
      );

    // =========================================================
    // 16. Altera os dados
    // =========================================================
    cy.get('[data-cy="hardware-form-sku"]')
      .clear()
      .type(updatedHardware.skuCode);

    cy.get('[data-cy="hardware-form-name"]')
      .clear()
      .type(updatedHardware.name);

    cy.get('[data-cy="hardware-form-ncm"]')
      .clear()
      .type(updatedHardware.ncmCode);

    cy.get('[data-cy="hardware-form-unit"]')
      .select(updatedHardware.unitMeasure);

    cy.get('[data-cy="hardware-form-cost-price"]')
      .clear()
      .type(updatedHardware.costPrice);

    cy.get('[data-cy="hardware-form-sale-price"]')
      .clear()
      .type(updatedHardware.salePrice);

    // =========================================================
    // 17. Atualiza
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 18. Valida Toast
    // =========================================================
    cy.contains('Ferragem atualizada com sucesso!')
      .should('be.visible');

    // =========================================================
    // 19. Aguarda retorno ao catálogo
    // =========================================================
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('have.text', 'Catálogo de Materiais');

    // =========================================================
    // 20. Seleciona Ferragens novamente
    // =========================================================
    cy.get('[data-cy="catalog-tab-hardwares"]')
      .should('be.visible')
      .click();

    // =========================================================
    // 21. Valida dados atualizados
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      updatedHardware.name
    )
      .should('exist')
      .within(() => {
        // Código
        cy.get('[data-cy="hardware-reference"]')
          .should(
            'have.text',
            updatedHardware.skuCode
          );

        // Nome
        cy.get('[data-cy="hardware-name"]')
          .should(
            'have.text',
            updatedHardware.name
          );

        // Unidade
        cy.get('[data-cy="hardware-unit"]')
          .should(
            'have.text',
            getUnitLabel(
              updatedHardware.unitMeasure
            )
          );

        // Preço
        cy.get('[data-cy="hardware-sale-price"]')
          .should(
            'have.text',
            formatBRL(
              updatedHardware.salePrice
            )
          );

        // Status
        cy.get('[data-cy="hardware-status"]')
          .should('have.text', 'Ativo');
      });
  });
});