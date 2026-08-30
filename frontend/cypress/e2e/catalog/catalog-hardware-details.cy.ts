import hardwareForm from '../../fixtures/hardware-form.json';

describe('Detalhes de Ferragem - Happy Path', () => {
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

  const getUnitLabel = (unit: string) => {
    const map: Record<string, string> = {
      UN: 'Unidade',
      PAR: 'Par',
      METRO: 'Metro Linear',
    };

    return map[unit] || unit;
  };

  it('deve cadastrar uma ferragem e validar seus detalhes', () => {
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
    // 8. Preenche formulário
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

    cy.get('[data-cy="hardware-form-unit"]')
      .select(hardware.unitMeasure);

    cy.get('[data-cy="hardware-form-cost-price"]')
      .clear()
      .type(hardware.costPrice);

    cy.get('[data-cy="hardware-form-sale-price"]')
      .clear()
      .type(hardware.salePrice);

    // =========================================================
    // 9. Salva
    // =========================================================
    cy.get('[data-cy="hardware-form-save-button"]')
      .click();

    // =========================================================
    // 10. Valida Toast
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
      .click();

    // =========================================================
    // 13. Localiza a ferragem criada
    // =========================================================
    cy.contains(
      '[data-cy="hardware-row"]',
      hardware.name
    )
      .should('exist')
      .within(() => {
        // Abre detalhes
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
      .should('have.text', hardware.name);

    // =========================================================
    // 16. Valida código interno
    // =========================================================
    cy.get('[data-cy="details-internal-code"]')
      .should('be.visible')
      .and('contain.text', hardware.skuCode);

    // =========================================================
    // 17. Valida preço
    // =========================================================
    cy.get('[data-cy="details-price"]')
      .should(
        'have.text',
        formatBRL(hardware.salePrice)
      );

    // =========================================================
    // 18. Valida status
    // =========================================================
    cy.get('[data-cy="details-status"]')
      .should('be.visible')
      .and(
        'have.text',
        'Ativo no Catálogo'
      );

    // =========================================================
    // 19. Valida botão de fechar
    // =========================================================
    cy.get('[data-cy="details-close-button"]')
      .should('be.visible');

    // =========================================================
    // 20. Fecha o modal
    // =========================================================
    cy.get('[data-cy="details-close-button"]')
      .click();

    cy.get('[data-cy="material-details-modal"]')
      .should('not.exist');
  });
});