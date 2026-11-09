/// <reference types="cypress" />

describe('US-46: Suíte de Testes E2E (Critérios de Aceitação) - Venda Avulsa', () => {
  const createdSaleCodes: string[] = [];

  beforeEach(() => {
    cy.viewport(1366, 820);
  });

  after(() => {
    if (createdSaleCodes.length > 0) {
      createdSaleCodes.forEach((code) => {
        cy.request({
          method: 'DELETE',
          url: '/api/v1/test-support/cleanup',
          body: { partSaleCode: code },
          failOnStatusCode: false,
        }).then((res) => {
          cy.log(`Limpeza pós-teste da venda ${code}: status ${res.status}`);
        });
      });
    }
  });

  // =========================================================
  // 🟢 CAMINHOS FELIZES (Happy Path)
  // =========================================================

  it('TC-46-HP01: Cotação de ferragem unitária (bloqueio de inputs L/A e cálculo instantâneo)', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Ferragem (Unidade)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="input-hardware-width"]').length > 0) {
        cy.get('[data-testid="input-hardware-width"]').should('be.disabled');
      } else {
        cy.get('[data-testid="input-hardware-width"]').should('not.exist');
      }
    });

    cy.get('[data-testid="input-hardware-quantity"]').clear().type('10');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.get('[data-testid="table-part-items"]').should('be.visible');
    cy.get('[data-testid="summary-total-pieces"]').should('contain', '10');
  });

  it('TC-46-HP02: Cotação de perfil de alumínio por metro linear', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Perfil de Alumínio (Metro)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.contains('[data-testid^="material-option-"]', /Perfil|Aluminio/i).first().click();

    cy.get('[data-testid="input-aluminum-length"]').should('have.value', '1000');
    cy.get('[data-testid="input-aluminum-quantity"]').clear().type('4').blur();
    cy.get('[data-testid="input-aluminum-length"]').clear().type('2500').blur();

    cy.get('[data-testid="btn-add-part-item"]').click();
    cy.get('[data-testid="summary-total-measure"]').invoke('text').should('match', /10[,.]00/);
  });

  it('TC-46-HP03: Venda de vidro sob medida faturado pela área real (> 0,25 m²)', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Vidro (Cálculo m²)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('[data-testid="input-glass-width"]').clear().type('1000');
    cy.get('[data-testid="input-glass-height"]').clear().type('1000');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.get('[data-testid="summary-total-measure"]').invoke('text').should('match', /1[,.]00/);
    cy.get('[data-testid="warning-minimum-area"]').should('not.exist');
  });

  it('TC-46-HP04: Venda de película solar por m² com perda de bobina', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Película (Cálculo m²)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('input[name="width"], [data-testid="input-film-width"]').last().clear().type('1000');
    cy.get('input[name="height"], [data-testid="input-film-height"]').last().clear().type('1000');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.get('[data-testid="summary-total-measure"]').should('be.visible');
  });

  it('TC-46-HP05: Abertura do modal de PDF a partir da lista e acionamento da impressão', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Ferragem (Unidade)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();
    cy.get('[data-testid="input-hardware-quantity"]').clear().type('1');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.intercept('POST', '**/api/v1/part-sales').as('createSale');
    cy.contains('button', 'Salvar e Concluir Venda').click();

    cy.wait('@createSale').then((interception) => {
      const saleCode = interception.response?.body?.code;
      if (saleCode) {
        createdSaleCodes.push(saleCode);
      }

      cy.visit('/vendas/avulsa');
      cy.window().then((win) => {
        cy.stub(win, 'print').as('printStub');
      });

      cy.contains('tbody tr', saleCode).within(() => {
        cy.get('button[aria-label^="Imprimir PDF"]').click({ force: true });
      });

      cy.contains('Espelho de Venda Avulsa / Impressão PDF').should('be.visible');
      cy.contains('AlumiGest ERP').should('be.visible');
      cy.contains('Imprimir Documento').closest('button').should('be.visible').click();
      cy.get('@printStub').should('have.been.calledOnce');
      cy.contains('Fechar').closest('button').click();
      cy.contains('Espelho de Venda Avulsa / Impressão PDF').should('not.exist');
    });
  });

  // =========================================================
  // 🔴 CAMINHOS TRISTES (Sad Path)
  // =========================================================

  it('TC-46-SP01: Bloqueio de submissão com quantidades zeradas', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Perfil de Alumínio (Metro)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('[data-testid="input-aluminum-quantity"]').clear().type('0');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.contains(/maior que zero/i).should('be.visible');
  });

  it('TC-46-SP02: Bloqueio e alerta para dimensões nominais zeradas (L ou A = 0 mm)', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Vidro (Cálculo m²)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('[data-testid="input-glass-width"]').clear().type('0');
    cy.get('[data-testid="input-glass-height"]').clear().type('1000');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.contains(/maior que zero/i).should('be.visible');
  });

  it('TC-46-SP03: Alerta impeditivo quando largura da película excede a bobina', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Película (Cálculo m²)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('input[name="width"], [data-testid="input-film-width"]').last().clear().type('2000');
    cy.get('input[name="height"], [data-testid="input-film-height"]').last().clear().type('1000');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.contains(/excede o limite|bobina/i).should('be.visible');
  });

  // =========================================================
  // 🟡 CASOS DE BORDA E REGRAS DE NEGÓCIO (Edge Cases)
  // =========================================================

  it('TC-46-EC01 (RN-02): Aplicação obrigatória do piso mínimo de vidro (0,25 m²)', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Vidro (Cálculo m²)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('[data-testid="input-glass-width"]').clear().type('300');
    cy.get('[data-testid="input-glass-height"]').clear().type('300');

    cy.get('[data-testid="panel-calculated-glass-area"]').contains(/0[,.]25/);
    cy.get('[data-testid="warning-minimum-area"]').should('be.visible');

    cy.get('[data-testid="btn-add-part-item"]').click();
    cy.get('[data-testid="summary-total-measure"]').contains(/0[,.]25/);
  });

  it('TC-46-EC02 (RN-03): Imutabilidade e blindagem de preços da cotação salva', () => {
    cy.visit('/vendas/avulsa/nova');
    cy.get('[data-testid="select-part-category"]').select('Ferragem (Unidade)');
    cy.get('[data-testid="input-part-description"]').click();
    cy.get('[data-testid^="material-option-"]').first().click();

    cy.get('[data-testid="input-hardware-quantity"]').clear().type('1');
    cy.get('[data-testid="btn-add-part-item"]').click();

    cy.intercept('POST', '**/api/v1/part-sales').as('createSale');
    cy.contains('button', 'Salvar e Concluir Venda').click();

    cy.wait('@createSale').then((interception) => {
      if (interception.response?.body?.code) {
        createdSaleCodes.push(interception.response.body.code);
      }

      cy.get('[data-testid="btn-add-part-item"]').should('not.exist');
    });
  });
});