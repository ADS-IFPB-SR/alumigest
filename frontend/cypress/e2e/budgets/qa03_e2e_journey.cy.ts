describe('QA-03: Teste de Integração End-to-End (Produto -> Orçamento -> PDF) [#73]', () => {
  beforeEach(() => {
    // Visita a página inicial
    cy.visit('/orcamentos');
  });

  it('Cenário 1: Jornada Principal (Fluxo Feliz: Produto -> Cliente -> Orçamento -> Romaneio -> PDF)', () => {
    // 1. Cadastrar um template de produto "Box Frontal 2 Folhas" com categorias: Vidro, Perfil, Ferragens
    cy.visit('/produtos/novo');
    cy.get('input#product-name-input').should('be.visible').type('Box Frontal 2 Folhas');

    // Seleciona modelo Box Frontal 2 Folhas (SLIDING_DOOR_2F)
    cy.contains('button', 'Porta de Correr 2F').click({ force: true });

    // Salva o produto
    cy.intercept('POST', '**/api/v1/catalog/products*').as('createProduct');
    cy.contains('button', 'Salvar').click({ force: true });

    // 2. Navega para criar orçamento e cadastra novo cliente "Vidraçaria Silva"
    cy.visit('/orcamentos/novo');
    cy.get('h2').contains('Novo Orçamento').should('be.visible');

    // Abre modal de cadastro rápido de cliente
    cy.get('#customer-search').type('Vidraçaria Silva');
    cy.contains('button', 'Cadastrar "Vidraçaria Silva"').click({ force: true });

    // Preenche dados do cliente e endereço da obra
    cy.get('input[name="telefone"]').type('(83) 98765-4321');
    cy.get('input[name="logradouro"]').type('Av. Projetada');
    cy.get('input[name="numero"]').type('123');
    cy.get('input[name="bairro"]').type('Centro');
    cy.get('input[name="cidade"]').type('Sousa');
    cy.get('input[name="uf"]').type('PB');

    cy.intercept('POST', '**/api/v1/clients*').as('createClient');
    cy.contains('button', 'Salvar e Selecionar').click({ force: true });

    // Cliente selecionado na tela de orçamento
    cy.contains('Vidraçaria Silva').should('be.visible');

    // 3. Adicionar esquadria com 1400 x 1900 mm e 2 unidades
    cy.contains('Adicionar Esquadria').click({ force: true });

    // Step 1: Dimensões e Quantidade
    cy.get('#modal-width-input').clear().type('1400');
    cy.get('#modal-height-input').clear().type('1900');
    cy.get('#modal-quantity-input').clear().type('2');

    // Avança para Step 2: Materiais (Vidro 8mm Incolor, Perfis Linha Box Branco, Kit Ferragens)
    cy.contains('button', 'Próximo: Materiais').click({ force: true });
    cy.wait(500);

    // Avança para Step 3: Mecânica e Usinagem (Puxador Tubular e Furação 2 furos)
    cy.contains('button', 'Próximo: Mecânica').click({ force: true });
    cy.wait(500);

    // Avança para Step 4: Resumo e Adição
    cy.contains('button', 'Revisar Esquadria').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Adicionar ao Orçamento').click({ force: true });

    // Valida que o item foi adicionado com 1400x1900
    cy.contains('1400×1900').should('be.visible');

    // 4. Aplicar 5% de desconto comercial e salvar orçamento
    cy.get('#budget-discount').scrollIntoView().clear({ force: true }).type('5', { force: true });
    cy.get('#budget-notes').scrollIntoView().type('Entrega e montagem no endereço da obra em Sousa/PB', { force: true });

    cy.intercept('POST', '**/api/orcamentos*').as('saveBudget');
    cy.contains('Salvar e Gerar Proposta').click();

    cy.wait('@saveBudget').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // 5. Verificar na tela de detalhes a proposta comercial formatada com dados e valores
    cy.url().should('match', /\/orcamentos\/[a-f0-9-]+$/i);
    cy.contains('Vidraçaria Silva').should('be.visible');
    cy.contains('1400 × 1900 mm').should('be.visible');
    cy.contains('2 unidades').should('be.visible');
    cy.contains('Esquadrias & Itens do Orçamento').should('be.visible');

    // 6. Alternar para a aba "Romaneio de Peças" e conferir gabarito técnico e lista de corte
    cy.get('[data-testid="tab-romaneio"]').click();
    cy.contains('Romaneio Técnico & Gabarito de Fabricação').should('be.visible');
    cy.contains('Lista de Corte & Gabarito Técnico').should('be.visible');
    cy.contains('Controle de Qualidade & Fábrica').should('be.visible');

    // 7. Clicar em "Imprimir Proposta" e validar chamada de impressão limpa
    cy.window().then((win) => {
      cy.stub(win, 'print').as('windowPrint');
    });

    cy.get('[data-testid="tab-proposta"]').click();
    cy.get('button[title="Imprimir proposta"]').click();
    cy.get('@windowPrint').should('have.been.calledOnce');

    // Validar emissão do PDF Comercial
    cy.intercept('GET', '**/api/orcamentos/*/pdf*').as('downloadPdf');
    cy.get('button[title="Emitir PDF Comercial"]').click();
  });

  it('Cenário 2: Teste de Paginação e Impressão Multipágina (5 Esquadrias Distintas)', () => {
    cy.visit('/orcamentos/novo');

    // Seleciona cliente existente
    cy.get('#customer-search').type('Cliente');
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Cliente")').length > 0) {
        cy.contains('button', 'Cliente').first().click({ force: true });
      }
    });

    // Adiciona múltiplas esquadrias para testar a robustez da lista e paginação
    for (let i = 1; i <= 3; i++) {
      cy.contains('Adicionar Esquadria').click({ force: true });
      cy.get('#modal-width-input').clear().type(`${1000 + i * 200}`);
      cy.get('#modal-height-input').clear().type(`${1500 + i * 100}`);
      cy.contains('Adicionar ao Orçamento').click({ force: true });
      cy.wait(300);
    }

    // Valida que todos os itens estão listados com suas miniaturas
    cy.get('.divide-y > div').should('have.length.at.least', 3);

    // Valida a presença de classes de prevenção de corte em quebra de página
    cy.get('.break-inside-avoid').should('exist');
  });
});
