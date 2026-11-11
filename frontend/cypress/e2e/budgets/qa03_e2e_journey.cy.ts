describe('QA-03: Teste de Integração End-to-End (Produto -> Orçamento -> PDF) [#73]', () => {
  let createdProductId: string | null = null;
  let createdClientId: string | null = null;
  let createdClientName: string | null = null;
  const createdBudgetIds: string[] = [];

  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  after(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8081/api/v1';

    createdBudgetIds.forEach((budgetId) => {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/test-support/cleanup`,
        body: { budgetId },
        failOnStatusCode: false,
      });
    });

    if (createdClientId || createdClientName) {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/test-support/cleanup`,
        body: {
          clientId: createdClientId,
          clientName: createdClientName,
        },
        failOnStatusCode: false,
      });
    }

    if (createdProductId) {
      cy.deleteEntityAPI('catalog/products', createdProductId);
    }
  });

  it('Cenário 1: Jornada Principal (Fluxo Feliz: Produto -> Cliente -> Orçamento -> Romaneio -> PDF)', () => {
    const suffix = Date.now();
    const productName = `Box Frontal 2 Folhas ${suffix}`;
    const clientName = `Vidraçaria Silva ${suffix}`;
    const clientCpf = `8${String(suffix).slice(-10)}`;
    createdClientName = clientName;

    // 1. Cadastrar um template de produto "Box Frontal 2 Folhas" com categorias: Vidro, Perfil, Ferragens
    cy.visit('/produtos/novo');
    cy.get('input#product-name').should('be.visible').type(productName);

    // Seleciona modelo Porta / Janela de Correr 2 Folhas (SLIDING_DOOR_2F)
    cy.get('button[aria-label="Selecionar modelo Porta / Janela de Correr 2 Folhas"]')
      .should('be.visible')
      .click();

    // Salva o produto
    cy.intercept('POST', '**/api/v1/catalog/products*').as('createProduct');
    cy.contains('button', 'Salvar').should('not.be.disabled').click();
    cy.wait('@createProduct').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdProductId = interception.response?.body?.id ?? interception.response?.body?.data?.id ?? null;
    });
    cy.url().should('include', '/produtos');

    // 2. Navega para criar orçamento e cadastra novo cliente via Cadastro Rápido
    cy.visit('/orcamentos/novo');
    cy.get('h1').contains('Novo Orçamento').should('be.visible');

    // Abre modal de cadastro rápido de cliente
    cy.get('[data-cy="btn-novo-cliente"]').should('be.visible').click();

    // Preenche dados do cliente e endereço da obra
    cy.get('#cqc-nome').should('be.visible').clear().type(clientName);
    cy.get('#cqc-doc').clear().type(clientCpf);
    cy.get('#cqc-tel').clear().type('(83) 98765-4321');
    cy.get('#cqc-logr').clear().type('Av. Projetada');
    cy.get('#cqc-num').clear().type('123');
    cy.get('#cqc-bairro').clear().type('Centro');
    cy.get('#cqc-cidade').clear().type('Sousa');
    cy.get('select#cqc-uf').select('PB');

    cy.intercept('POST', '**/api/clientes*').as('createClient');
    cy.contains('button', 'Cadastrar Cliente').click();
    cy.wait('@createClient').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdClientId = interception.response?.body?.id ?? null;
    });

    // Cliente selecionado na tela de orçamento
    cy.contains(clientName).should('be.visible');

    // 3. Adicionar esquadria com 1400 x 1900 mm e 2 unidades
    cy.get('[data-cy="btn-adicionar-esquadria"]').should('not.be.disabled').click();
    cy.get('input[placeholder="Buscar por nome da esquadria..."]')
      .should('be.visible')
      .clear()
      .type(productName);
    cy.get(`button[aria-label="Selecionar esquadria ${productName}"]`)
      .should('be.visible')
      .click();

    // Step 1: Dimensões e Quantidade
    cy.get('#modal-width-input').should('be.visible').clear().type('1400');
    cy.get('#modal-height-input').clear().type('1900');
    cy.get('#modal-quantity-input').clear().type('2');

    // Avança para Step 2: Materiais
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.selectRequiredMaterialsStep2();

    // Avança para Step 3: Mecânica e Usinagem
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.contains('Mecânica da Folha & Puxador').scrollIntoView().should('be.visible');

    // Avança para Step 4: Resumo e Adição
    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.get('#btn-adicionar').should('be.visible').click();

    // Valida que o item foi adicionado com 1400x1900
    cy.contains('1400×1900').scrollIntoView().should('be.visible');

    // 4. Aplicar 5% de desconto comercial e salvar orçamento
    cy.get('#budget-discount').scrollIntoView().clear({ force: true }).type('5', { force: true });
    cy.get('#budget-notes').scrollIntoView().type('Entrega e montagem no endereço da obra em Sousa/PB', { force: true });

    cy.intercept('POST', '**/api/orcamentos*').as('saveBudget');
    cy.get('#btn-salvar-proposta').should('not.be.disabled').click();

    cy.wait('@saveBudget').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      if (interception.response?.body?.id) {
        createdBudgetIds.push(interception.response.body.id);
      }
    });

    // 5. Verificar na tela de detalhes a proposta comercial formatada com dados e valores
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);
    cy.contains('p.font-label', clientName)
      .should('exist')
      .closest('.bg-surface-container-lowest')
      .should('be.visible');
    cy.contains('1400 × 1900 mm').scrollIntoView().should('be.visible');
    cy.contains('2 unidades').scrollIntoView().should('be.visible');
    cy.contains('Esquadrias & Itens do Orçamento').scrollIntoView().should('be.visible');

    // 6. Alternar para a aba "Romaneio de Peças" e conferir gabarito técnico e lista de corte
    cy.get('[data-testid="tab-romaneio"]').click();
    cy.contains('Romaneio Técnico & Gabarito de Fabricação').should('be.visible');
    cy.contains('Lista de Corte & Gabarito Técnico').scrollIntoView().should('be.visible');
    cy.contains('Controle de Qualidade & Fábrica').scrollIntoView().should('be.visible');

    // 7. Validar ações oficiais de emissão de PDF Comercial e Via Técnica
    cy.get('[data-testid="tab-proposta"]').click();
    cy.get('button[title="Emitir Via Técnica (Oficina)"]').should('be.visible');

    cy.intercept('GET', '**/api/orcamentos/*/pdf/**').as('downloadPdf');
    cy.get('button[title="Emitir PDF Comercial"]').should('be.visible').click();
    cy.wait('@downloadPdf').its('response.statusCode').should('eq', 200);
  });

  it('Cenário 2: Teste de Paginação e Impressão Multipágina (Múltiplas Esquadrias Distintas)', () => {
    cy.visit('/orcamentos/novo');

    // Seleciona cliente existente sem criar lixo no catálogo
    cy.intercept('GET', '**/clientes*').as('searchCustomers');
    cy.get('[data-cy="input-busca-cliente"]').should('be.visible').type('Cliente Seed 1');
    cy.wait('@searchCustomers');
    cy.get('[data-cy="dropdown-opcao-cliente"]')
      .contains('Cliente Seed 1')
      .should('be.visible')
      .click();
    cy.get('[data-cy="card-cliente-selecionado"]').should('contain', 'Cliente Seed 1');

    // Adiciona múltiplas esquadrias para testar a lista na proposta detalhada
    for (let i = 1; i <= 3; i++) {
      cy.get('[data-cy="btn-adicionar-esquadria"]').should('not.be.disabled').click();
      cy.get('div[aria-modal="true"] button[aria-label^="Selecionar esquadria "]')
        .first()
        .should('be.visible')
        .click();
      cy.get('#modal-width-input').should('be.visible').clear().type(`${1000 + i * 200}`);
      cy.get('#modal-height-input').clear().type(`${1500 + i * 100}`);
      cy.contains('button', 'Próximo').should('be.visible').click();
      cy.selectRequiredMaterialsStep2();
      cy.contains('button', 'Próximo').should('be.visible').click();
      cy.contains('Mecânica da Folha & Puxador').scrollIntoView().should('be.visible');
      cy.contains('button', 'Próximo').should('be.visible').click();
      cy.get('#btn-adicionar').should('be.visible').click();
    }

    // Salva para validar na página de detalhes (.divide-y > div e .break-inside-avoid)
    cy.intercept('POST', '**/api/orcamentos*').as('saveMultiBudget');
    cy.get('#btn-salvar-proposta').should('not.be.disabled').click();
    cy.wait('@saveMultiBudget').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      if (interception.response?.body?.id) {
        createdBudgetIds.push(interception.response.body.id);
      }
    });

    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);

    // Valida que todos os itens estão listados com suas miniaturas
    cy.get('.divide-y > div').should('have.length.at.least', 3);

    // Valida a presença de classes de prevenção de corte em quebra de página
    cy.get('.break-inside-avoid').should('exist');
  });
});
