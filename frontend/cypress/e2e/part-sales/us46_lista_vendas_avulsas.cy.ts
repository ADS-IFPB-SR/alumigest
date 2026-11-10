/// <reference types="cypress" />

describe('US-46: Listagem e Gestão Canônica de Vendas Avulsas (Opção 1)', () => {
  const createdSaleCodes: string[] = [];

  beforeEach(() => {
    cy.viewport(1366, 820);
  });

  after(() => {
    // Limpeza determinística de vendas criadas durante o teste
    if (createdSaleCodes.length > 0) {
      createdSaleCodes.forEach((code) => {
        cy.request({
          method: 'DELETE',
          url: 'http://localhost:8081/api/v1/test-support/cleanup',
          body: { partSaleCode: code },
          failOnStatusCode: false,
        }).then((res) => {
          cy.log(`Limpeza pós-teste da venda ${code}: status ${res.status}`);
        });
      });
    }
  });

  it('1. Deve acessar /vendas/avulsa, renderizar a listagem e validar os seeds no banco de dados', () => {
    cy.visit('/vendas/avulsa');

    cy.contains('h2', 'Vendas Avulsas de Partes').should('be.visible');
    cy.contains('Histórico, emissão e controle comercial de cortes avulsos').should('be.visible');

    // Valida que o botão de nova venda está presente
    cy.get('[data-testid="btn-new-part-sale"]').should('be.visible');

    // Valida que a tabela possui os seeds cadastrados (ao menos 20 registros)
    cy.contains(/Total:\s*\d+\s*vendas avulsas/).should('be.visible');
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 5);

    // Valida cabeçalhos da tabela canônica (7 colunas otimizadas sem scroll horizontal)
    cy.contains('th', 'Nº Venda').should('be.visible');
    cy.contains('th', 'Data').should('be.visible');
    cy.contains('th', 'Cliente').should('be.visible');
    cy.contains('th', 'Insumos & Categorias').should('be.visible');
    cy.contains('th', 'Valor Total').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
    cy.contains('th', 'Ações').should('exist');
  });

  it('2. Deve testar controles de paginação (tamanho de página e navegação entre fatias)', () => {
    cy.visit('/vendas/avulsa');

    // Valida rodapé inicial (10 por página padrão)
    cy.contains(/Exibindo 1-10 de \d+ vendas avulsas/).should('be.visible');
    cy.get('[data-testid="btn-prev-page"]').should('be.disabled');

    // Altera para 20 por página
    cy.get('[data-testid="select-page-size"]').select('20');
    cy.contains(/Exibindo 1-20 de \d+ vendas avulsas/).should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 15);

    // Retorna para 10 por página e navega para a página 2
    cy.get('[data-testid="select-page-size"]').select('10');
    cy.contains(/Exibindo 1-10 de \d+ vendas avulsas/).should('be.visible');
    cy.get('[data-testid="btn-next-page"]').should('be.enabled').click();

    cy.contains(/Exibindo 11-20 de \d+ vendas avulsas/).should('be.visible');
    cy.get('[data-testid="btn-prev-page"]').should('be.enabled').click();
    cy.contains(/Exibindo 1-10 de \d+ vendas avulsas/).should('be.visible');
  });

  it('3. Deve filtrar por status comercial (Aprovadas, Rascunhos, Canceladas)', () => {
    cy.visit('/vendas/avulsa');

    // Filtrar por Aprovadas / Concluídas
    cy.get('[data-testid="select-status-filter"]').select('APPROVED');
    cy.wait(600);
    cy.get('tbody tr').first().contains('Concluída').should('be.visible');

    // Filtrar por Rascunhos / Orçamentos
    cy.get('[data-testid="select-status-filter"]').select('DRAFT');
    cy.wait(600);
    cy.get('tbody tr').first().contains('Rascunho / Orçamento').should('be.visible');

    // Restaurar Todos os Status
    cy.get('[data-testid="select-status-filter"]').select('');
    cy.wait(600);
    cy.contains(/Total:\s*\d+\s*vendas avulsas/).should('be.visible');
  });

  it('4. Deve filtrar por busca textual (código da venda ou cliente) com debounce', () => {
    cy.visit('/vendas/avulsa');

    // Digita código de venda conhecido do seed
    cy.get('[data-testid="input-search-part-sales"]').type('VP-2026-0002');
    cy.wait(800); // Aguarda debounce de 500ms

    cy.get('tbody tr').should('have.length', 1);
    cy.contains('tbody tr', 'VP-2026-0002').should('be.visible');

    // Limpa a busca e garante recuperação da lista completa
    cy.get('[data-testid="input-search-part-sales"]').clear();
    cy.wait(800);
    cy.get('tbody tr').should('have.length.at.least', 5);
  });

  it('5. Deve abrir e fechar os modais de ação rápida (Detalhes, PDF e Etiquetas Elgin L42)', () => {
    cy.visit('/vendas/avulsa');
    cy.wait(500);

    // 1. Modal de Detalhes
    cy.get('tbody tr').first().within(() => {
      cy.contains('button', 'Ver').click({ force: true });
    });
    cy.get('[data-testid="modal-details-part-sale"]').should('be.visible');
    cy.contains('Detalhes da Venda').should('be.visible');
    cy.contains('Itens da Venda').should('be.visible');
    cy.get('[data-testid="btn-close-details-modal"]').click();
    cy.get('[data-testid="modal-details-part-sale"]').should('not.exist');

    // 2. Modal de Espelho PDF
    cy.get('tbody tr').first().within(() => {
      cy.get('button[aria-label^="Imprimir PDF"]').click({ force: true });
    });
    cy.get('[data-testid="modal-pdf-part-sale"]').should('be.visible');
    cy.contains('Espelho de Venda Avulsa / Impressão PDF').should('be.visible');
    cy.contains('AlumiGest ERP').should('be.visible');
    cy.get('[data-testid="btn-close-pdf-modal"]').click();
    cy.get('[data-testid="modal-pdf-part-sale"]').should('not.exist');

    // 3. Modal de Etiquetas Térmicas Elgin L42 (100x60mm)
    cy.get('tbody tr').first().within(() => {
      cy.get('button[aria-label^="Emitir etiquetas"]').click({ force: true });
    });
    cy.get('[data-testid="modal-thermal-labels"]').should('be.visible');
    cy.contains('Etiquetas Térmicas Elgin L42 (100×60mm)').should('be.visible');
    cy.contains('100×60mm').should('be.visible');
    cy.get('[data-testid="btn-close-labels-modal"]').click();
    cy.get('[data-testid="modal-thermal-labels"]').should('not.exist');
  });

  it('6. Deve realizar fluxo de ponta a ponta: criar nova venda, voltar com highlight na lista e fechar aviso', () => {
    cy.visit('/vendas/avulsa');

    // Clica no botão para abrir o formulário
    cy.get('[data-testid="btn-new-part-sale"]').click();
    cy.url().should('include', '/vendas/avulsa/nova');

    // Adiciona um insumo de perfil
    cy.get('[data-testid="input-part-description"]').click();
    cy.wait(500);
    cy.contains('[data-testid^="material-option-"]', /Perfil Linha Suprema/).click();
    cy.wait(400);
    cy.get('[data-testid="btn-add-part-item"]').click();

    // Salva a venda e intercepta a requisição
    cy.intercept('POST', '**/api/v1/part-sales').as('createSale');
    cy.get('[data-testid="btn-save-part-sale"]').click();

    cy.wait('@createSale').then((interception) => {
      const sale = interception.response?.body;
      assert.isDefined(sale);
      if (sale?.code) {
        createdSaleCodes.push(sale.code);
      }

      // Redirecionamento automático para a listagem com recentId na URL
      cy.url().should('include', `/vendas/avulsa?recentId=${sale.id}`);
      cy.contains('Venda registrada com sucesso!').should('be.visible');
      cy.contains(`[data-testid="row-part-sale-${sale.code}"]`, 'Novo').should('be.visible');

      // Fecha o aviso de destaque
      cy.contains('button', 'Fechar aviso').click();
      cy.contains('Venda registrada com sucesso!').should('not.exist');
    });
  });
});
