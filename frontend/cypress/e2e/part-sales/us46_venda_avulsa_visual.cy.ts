/// <reference types="cypress" />

describe('US-46: Demonstração Visual E2E - Módulo de Venda Avulsa (Part Sales)', () => {
  const createdSaleCodes: string[] = [];

  beforeEach(() => {
    cy.viewport(1366, 820);
  });

  after(() => {
    // Exclusão física (Hard Delete) determinística no banco de dados para evitar poluição da base
    if (createdSaleCodes.length > 0) {
      createdSaleCodes.forEach((code) => {
        cy.request({
          method: 'DELETE',
          url: 'http://localhost:8081/api/v1/test-support/cleanup',
          body: { partSaleCode: code },
          failOnStatusCode: false,
        }).then((res) => {
          cy.log(`Limpeza da venda ${code} concluída: status ${res.status}`);
        });
      });
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 1 & 2: Autocomplete sem preços, cálculo transparente do Alumínio
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 1 e 2: Seleção de perfil no catálogo (sem preço na lista) e cálculo transparente de 1 metro linear', () => {
    cy.log('👉 PASSO 1: Acessando a tela de Venda Avulsa');
    cy.visit('/vendas/avulsa');
    cy.contains('Venda Avulsa').should('be.visible').highlight(1200);
    cy.wait(800);

    cy.log('👉 PASSO 2: Validando o estado inicial do Resumo da Venda (sem m²/m)');
    cy.get('[data-testid="summary-total-measure"]').should('contain', '0.00').highlight(1000);
    cy.get('[data-testid="summary-total-pieces"]').should('contain', '0');
    cy.get('[data-testid="summary-total-amount"]').invoke('text').should('match', /0,00/);
    cy.wait(800);

    cy.log('👉 PASSO 3: Abrindo dropdown de materiais e verificando ausência de preços na lista');
    cy.get('[data-testid="input-part-description"]').should('be.visible').click();
    cy.wait(600);

    // Garante que os itens aparecem com o nome do perfil e código da família, mas SEM o badge de preço
    cy.contains(/Perfil Linha Suprema.*Branco/).should('be.visible').highlight(1200);
    cy.get('[data-testid="material-autocomplete-dropdown"]').should('not.contain', 'R$ 78,00 / m');
    cy.wait(1000);

    cy.log('👉 PASSO 4: Selecionando o perfil e conferindo auto-preenchimento do preço unitário');
    cy.get('[data-testid^="material-option-"]').first().click();
    cy.get('[data-testid="input-aluminum-price"]')
      .should('have.value', '78')
      .highlight(1200);
    cy.wait(800);

    cy.log('👉 PASSO 5: Conferindo Comprimento de 1 metro (1000 mm) e cálculo exato de R$ 78,00');
    cy.get('[data-testid="input-aluminum-quantity"]').should('have.value', '1');
    cy.get('[data-testid="input-aluminum-length"]').should('have.value', '1000');

    // Valida painel de metragem em tempo real: 1 metro linear = R$ 78,00 (transparente, sem perda adicional)
    cy.get('[data-testid="panel-calculated-meters"]')
      .should('be.visible')
      .and('contain', '1.0000 m')
      .and('contain', '78,00')
      .highlight(1500);
    cy.wait(1000);

    cy.log('👉 PASSO 6: Inserindo item na venda');
    cy.get('[data-testid="alert-pending-insertion"]').should('be.visible').highlight(1000);
    cy.get('[data-testid="btn-add-part-item"]').click();
    cy.wait(800);

    cy.get('[data-testid="table-part-items"]').invoke('text').should('match', /PERFIL LINHA SUPREMA/i);
    cy.get('[data-testid="table-part-items"]').highlight(1200);
    cy.get('[data-testid="summary-total-measure"]').should('contain', '1.00 m').highlight(1200);
    cy.get('[data-testid="summary-total-amount"]').invoke('text').should('match', /78,00/);
    cy.wait(1200);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 3: Seletor Inteligente de Cliente (sem duplicidade de Cliente Balcão)
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 3: Seleção e busca de cliente com proteção contra duplicidade de Cliente Balcão', () => {
    cy.log('👉 PASSO 1: Acessando a tela de Venda Avulsa');
    cy.visit('/vendas/avulsa');
    cy.wait(800);

    cy.log('👉 PASSO 2: Clicando no campo de busca de cliente');
    cy.get('[data-testid="input-search-client"]').click();
    cy.wait(600);

    // Valida que o botão padrão do topo é "Cliente Balcão (Consumidor Final)"
    cy.get('[data-testid="option-client-walk-in"]')
      .should('be.visible')
      .and('contain', 'Cliente Balcão (Consumidor Final)')
      .highlight(1200);

    // Garante que não existe duplicata de "Cliente Balcão (Não Identificado)"
    cy.get('body').should('not.contain', 'Cliente Balcão (Não Identificado)');
    cy.wait(1000);

    cy.log('👉 PASSO 3: Buscando e selecionando cliente real cadastrado na base');
    cy.get('[data-testid="input-search-client"]').type('italo');
    cy.wait(800);

    cy.contains('button', 'italo').should('be.visible').highlight(1200);
    cy.contains('button', 'italo').click();
    cy.wait(800);

    cy.contains('Doc: 10100011111').should('be.visible').highlight(1200);
    cy.get('[data-testid="btn-reset-walk-in"]').should('be.visible').highlight(1000);
    cy.wait(1000);

    cy.log('👉 PASSO 4: Restaurando para Cliente Balcão padrão com um clique');
    cy.get('[data-testid="btn-reset-walk-in"]').click();
    cy.get('[data-testid="input-search-client"]').should('be.visible').highlight(1000);
    cy.wait(1000);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 4 & 5: Vidro com piso mínimo de 0,25 m² e resumo consolidado dinâmico
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 4 e 5: Cálculo de vidro com piso mínimo de 0,25 m² e consolidação no resumo', () => {
    cy.visit('/vendas/avulsa');
    cy.wait(800);

    cy.log('👉 PASSO 1: Alternando para Categoria Vidro');
    cy.get('[data-testid="select-part-category"]').select('Vidro (Cálculo m²)');
    cy.wait(800);

    cy.log('👉 PASSO 2: Selecionando vidro do catálogo');
    cy.get('[data-testid="input-part-description"]').click();
    cy.wait(600);
    cy.get('[data-testid^="material-option-"]').first().click();
    cy.wait(800);

    cy.log('👉 PASSO 3: Garantindo preço unitário e inserindo dimensões pequenas (300 x 300 mm = 0,09 m²)');
    cy.get('[data-testid="input-glass-price"]').clear().type('180');
    cy.get('[data-testid="input-glass-width"]').clear().type('300');
    cy.get('[data-testid="input-glass-height"]').clear().type('300');
    cy.wait(1000);

    // O painel deve indicar aplicação do piso mínimo de 0,25 m²
    cy.get('[data-testid="panel-calculated-glass-area"]')
      .should('be.visible')
      .and('contain', '0.2500 m²')
      .highlight(1500);
    cy.get('[data-testid="warning-minimum-area"]').should('be.visible').highlight(1200);
    cy.wait(1000);

    cy.log('👉 PASSO 4: Inserindo vidro na venda e validando resumo com m²');
    cy.get('[data-testid="btn-add-part-item"]').click();
    cy.wait(800);

    cy.get('[data-testid="table-part-items"]').should('be.visible').highlight(1200);
    cy.get('[data-testid="summary-total-measure"]').should('contain', '0.25 m²').highlight(1200);
    cy.get('[data-testid="summary-total-pieces"]').should('contain', '1');
    cy.wait(1000);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 6 & 7: Fluxo Completo de Persistência, PDF e Etiquetas Térmicas
  // ───────────────────────────────────────────────────────────────────────────
  it('Cenário 6 e 7: Fluxo de ponta a ponta - Salvamento no banco de dados, visualização de PDF e etiquetas', () => {
    cy.visit('/vendas/avulsa');
    cy.wait(800);

    cy.log('👉 PASSO 1: Adicionando barra de alumínio de 1 metro');
    cy.get('[data-testid="input-part-description"]').click();
    cy.wait(500);
    cy.get('[data-testid^="material-option-"]').first().click();
    cy.wait(600);
    cy.get('[data-testid="btn-add-part-item"]').click();
    cy.wait(800);

    cy.log('👉 PASSO 2: Salvando e concluindo venda avulsa no PostgreSQL');
    cy.intercept('POST', '**/api/v1/part-sales').as('createPartSale');
    cy.get('[data-testid="btn-save-part-sale"]').should('be.enabled').highlight(1500);
    cy.wait(800);
    cy.get('[data-testid="btn-save-part-sale"]').click();
    
    // Captura o código da venda gerado pela API para exclusão automática no final (Hard Delete)
    cy.wait('@createPartSale').then((interception) => {
      const code = interception.response?.body?.code;
      if (code) {
        createdSaleCodes.push(code);
        cy.log(`Venda criada registrada para limpeza pós-teste: ${code}`);
      }
    });
    cy.wait(1500);

    // Valida persistência e código gerado
    cy.contains(/Código Gerado:\s*VP-2026-\d{4}/).scrollIntoView().should('be.visible').highlight(2000);
    cy.wait(1200);

    cy.log('👉 PASSO 3: Visualizando comprovante em PDF da Venda Avulsa');
    cy.get('[data-testid="btn-export-pdf"]').should('be.enabled').highlight(1200);
    cy.wait(600);
    cy.get('[data-testid="btn-export-pdf"]').click();
    cy.wait(800);

    cy.get('[data-testid="modal-pdf-part-sale"]').should('be.visible').highlight(1500);
    cy.wait(1200);
    cy.get('[data-testid="btn-close-pdf-modal"]').click();
    cy.wait(600);

    cy.log('👉 PASSO 4: Visualizando etiquetas térmicas para cortes');
    cy.get('[data-testid="btn-print-labels"]').should('be.enabled').highlight(1200);
    cy.wait(600);
    cy.get('[data-testid="btn-print-labels"]').click();
    cy.wait(800);

    cy.get('[data-testid="modal-thermal-labels"]').should('be.visible').highlight(1500);
    cy.wait(1200);
    cy.get('[data-testid="btn-close-labels-modal"]').click();
    cy.wait(800);

    cy.log('🎉 FLUXO VISUAL E2E CONCLUÍDO COM SUCESSO!');
  });
});
