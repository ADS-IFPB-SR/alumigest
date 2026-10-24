import type { ProductionOrderSummary } from '../../../src/features/production/services/productionApi';

describe('US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda (Suíte E2E)', () => {
  const ontemIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const amanhaIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const futuroIso = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const mockProductionOrders: ProductionOrderSummary[] = [
    {
      id: 'ord-101',
      codigo: 'OS-2026-0001',
      orcamentoId: 'orc-01',
      orcamentoCodigo: 'ORC-2026-0001',
      clienteNome: 'Construtora Vale do Sol',
      clienteTelefone: '(83) 98888-1111',
      status: 'WAITING_PRODUCTION',
      canalAprovacao: 'WHATSAPP',
      dataAprovacao: '2026-10-10',
      dataPrevisaoEntrega: ontemIso, // Atrasado (LATE)
      valorLiquido: 4500.0,
      quantidadeItens: 3,
      createdAt: '2026-10-10T08:00:00Z',
      items: [
        { id: 'item-1', descricao: 'Janela 2F Suprema', quantidade: 2 },
        { id: 'item-2', descricao: 'Porta Giro Gold', quantidade: 1 },
      ],
    },
    {
      id: 'ord-102',
      codigo: 'OS-2026-0002',
      orcamentoId: 'orc-02',
      orcamentoCodigo: 'ORC-2026-0002',
      clienteNome: 'Residencial Alvorada',
      clienteTelefone: '(83) 98888-2222',
      status: 'IN_PRODUCTION',
      canalAprovacao: 'PRESENCIAL',
      dataAprovacao: '2026-10-12',
      dataPrevisaoEntrega: amanhaIso, // Crítico (CRITICAL)
      valorLiquido: 6200.0,
      quantidadeItens: 4,
      createdAt: '2026-10-12T09:30:00Z',
      items: [
        { id: 'item-3', descricao: 'Janela 4F Integrada', quantidade: 4 },
      ],
    },
    {
      id: 'ord-103',
      codigo: 'OS-2026-0003',
      orcamentoId: 'orc-03',
      orcamentoCodigo: 'ORC-2026-0003',
      clienteNome: 'Edifício Jardins',
      clienteTelefone: '(83) 98888-3333',
      status: 'COMPLETED',
      canalAprovacao: 'WHATSAPP',
      dataAprovacao: '2026-10-01',
      dataPrevisaoEntrega: futuroIso, // NORMAL
      valorLiquido: 9800.0,
      quantidadeItens: 8,
      createdAt: '2026-10-01T10:00:00Z',
      items: [
        { id: 'item-4', descricao: 'Fachada Pele de Vidro', quantidade: 8 },
      ],
    },
  ];

  beforeEach(() => {
    cy.viewport(1366, 768);

    // Mock global de listagem de ordens de produção
    cy.intercept('GET', '**/orders?size=100*', {
      statusCode: 200,
      body: mockProductionOrders,
    }).as('getProductionOrders');

    cy.intercept('GET', '**/api/orders?size=100*', {
      statusCode: 200,
      body: mockProductionOrders,
    }).as('getProductionOrdersApi');
  });

  it('Cenário 1 [US-18.6]: Navegação via menu lateral e acesso à rota /producao', () => {
    cy.visit('/dashboard');

    // Localiza e clica no atalho "Produção (Kanban)" no menu lateral
    cy.get('aside').contains('a', /produção \(kanban\)/i).as('linkProducao');
    cy.get('@linkProducao').should('have.attr', 'href', '/producao');
    cy.get('@linkProducao').click();

    // Valida transição de rota e estado ativo do menu
    cy.url().should('include', '/producao');
    cy.get('@linkProducao').should('have.class', 'bg-primary');
    cy.get('@linkProducao').should('have.class', 'text-on-primary');

    // Valida cabeçalho e breadcrumb da página
    cy.get('#kanban-page-title').should('contain.text', 'Ordens de Serviço (Kanban)');
    cy.get('nav[aria-label="Breadcrumb"]').should('contain.text', 'Kanban');
  });

  it('Cenário 2 [US-18.4 & US-18.5]: Renderização do Quadro Kanban, 3 Colunas e KPIs Executivos', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // Valida painel de métricas no topo
    cy.get('[data-testid="production-kanban-metrics"]').should('be.visible');
    cy.get('[data-testid="metric-in-production"]').should('contain.text', '1');
    cy.get('[data-testid="metric-total-pieces"]').should('contain.text', '15 peças'); // 3 + 4 + 8

    // Valida as 3 colunas obrigatórias
    cy.get('[data-testid="kanban-column-waiting_production"]').within(() => {
      cy.contains('Aguardando Produção').should('be.visible');
      cy.contains('OS-2026-0001').should('be.visible');
      cy.contains('Construtora Vale do Sol').should('be.visible');
    });

    cy.get('[data-testid="kanban-column-in_production"]').within(() => {
      cy.contains('Em Produção').should('be.visible');
      cy.contains('OS-2026-0002').should('be.visible');
      cy.contains('Residencial Alvorada').should('be.visible');
    });

    cy.get('[data-testid="kanban-column-completed"]').within(() => {
      cy.contains('Concluído').should('be.visible');
      cy.contains('OS-2026-0003').should('be.visible');
      cy.contains('Edifício Jardins').should('be.visible');
    });
  });

  it('Cenário 3 [US-18.3]: Exibição de Alertas de Prazo e Detalhes no Card', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // Card Atrasado com badge vermelho
    cy.contains('[data-testid="order-production-card"]', 'OS-2026-0001').within(() => {
      cy.contains('Atrasado').should('be.visible');
      cy.contains('ORC-2026-0001').should('be.visible');
      cy.contains('3 PEÇAS').should('be.visible');
      cy.contains('p', 'Janela 2F Suprema').should('contain.text', '2x').and('be.visible');
      cy.get('button[title*="Ver Ficha Técnica"]').should('be.visible');
    });

    // Card Prazo Crítico com badge amarelo
    cy.contains('[data-testid="order-production-card"]', 'OS-2026-0002').within(() => {
      cy.contains('Prazo Crítico').should('be.visible');
    });

    // Clique no botão de detalhes navega para a página da O.S.
    cy.contains('[data-testid="order-production-card"]', 'OS-2026-0001')
      .find('button[title*="Ver Ficha Técnica"]')
      .click();

    cy.url().should('include', '/ordens-servico/ord-101');
  });

  it('Cenário 4 [US-18.5]: Filtros em Tempo Real (Busca, Prazo e Reset)', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // 1. Busca por código de OS
    cy.get('[data-testid="input-search-kanban"]').type('OS-2026-0002');
    cy.contains('OS-2026-0002').should('be.visible');
    cy.contains('OS-2026-0001').should('not.exist');
    cy.contains('OS-2026-0003').should('not.exist');
    cy.get('[data-testid="filter-counter-badge"]').should('contain.text', '1 de 3');

    // Limpar busca pelo botão 'X'
    cy.get('[data-testid="btn-clear-search-text"]').click();
    cy.contains('OS-2026-0001').should('be.visible');
    cy.contains('OS-2026-0003').should('be.visible');

    // 2. Busca por nome do cliente
    cy.get('[data-testid="input-search-kanban"]').type('Jardins');
    cy.contains('OS-2026-0003').should('be.visible');
    cy.contains('OS-2026-0001').should('not.exist');

    // 3. Reset total de filtros
    cy.get('[data-testid="btn-clear-all-filters"]').click();
    cy.get('[data-testid="input-search-kanban"]').should('have.value', '');
    cy.contains('OS-2026-0001').should('be.visible');
    cy.contains('OS-2026-0002').should('be.visible');
    cy.contains('OS-2026-0003').should('be.visible');

    // 4. Filtro por Prazo (Apenas Atrasados)
    cy.get('[data-testid="select-filter-deadline"]').select('LATE');
    cy.contains('OS-2026-0001').should('be.visible');
    cy.contains('OS-2026-0002').should('not.exist');
    cy.contains('OS-2026-0003').should('not.exist');
  });

  it('Cenário 5 [US-18.1 & US-18.2]: Transição de Etapa via Drag-and-Drop com Otimismo e Chamada de API', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // Intercepta a transição de status para IN_PRODUCTION com sucesso
    cy.intercept('PATCH', '**/orders/ord-101/production-status', {
      statusCode: 200,
      body: {
        ...mockProductionOrders[0],
        status: 'IN_PRODUCTION',
      },
    }).as('updateStatusSuccess');

    // Simula evento de arrastar e soltar de Aguardando para Em Produção
    const dataTransfer = new DataTransfer();

    cy.contains('[data-testid="order-production-card"]', 'OS-2026-0001')
      .trigger('dragstart', { dataTransfer });

    cy.get('[data-testid="kanban-column-in_production"]')
      .trigger('dragover', { dataTransfer })
      .trigger('drop', { dataTransfer });

    cy.wait('@updateStatusSuccess').then((interception) => {
      expect(interception.request.body).to.deep.equal({ status: 'IN_PRODUCTION' });
    });

    // O card agora deve constar na coluna Em Produção
    cy.get('[data-testid="kanban-column-in_production"]').within(() => {
      cy.contains('OS-2026-0001').should('be.visible');
    });
  });

  it('Cenário 6 [US-18.2]: Resiliência e Rollback Otimista em Caso de Falha de Rede', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // Intercepta a chamada com erro 500 do servidor
    cy.intercept('PATCH', '**/orders/ord-101/production-status', {
      statusCode: 500,
      body: { message: 'Erro interno ao atualizar status no chão de fábrica' },
    }).as('updateStatusError');

    const dataTransfer = new DataTransfer();

    cy.contains('[data-testid="order-production-card"]', 'OS-2026-0001')
      .trigger('dragstart', { dataTransfer });

    cy.get('[data-testid="kanban-column-in_production"]')
      .trigger('dragover', { dataTransfer })
      .trigger('drop', { dataTransfer });

    cy.wait('@updateStatusError');

    // Rollback: o card deve retornar automaticamente para a coluna de origem (Aguardando Produção)
    cy.get('[data-testid="kanban-column-waiting_production"]').within(() => {
      cy.contains('OS-2026-0001').should('be.visible');
    });

    // Notificação toast de erro visível
    cy.contains(/erro interno ao atualizar status no chão de fábrica/i).should('be.visible');
  });

  it('Cenário 7 [US-18.5]: Ações da Página (Impressão PCP e Nova Ordem de Serviço)', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // Stub do window.print para validar o botão de impressão
    cy.window().then((win) => {
      cy.stub(win, 'print').as('windowPrint');
    });

    cy.get('[data-testid="btn-print-kanban"]').click();
    cy.get('@windowPrint').should('have.been.calledOnce');

    // Botão Nova Ordem de Serviço redireciona para /orcamentos
    cy.get('[data-testid="btn-new-order"]').click();
    cy.url().should('include', '/orcamentos');
  });

  it('Cenário 8 [Bug #498]: Drag-and-drop de pedido na mesma coluna é no-op e não dispara requisição nem erro', () => {
    cy.visit('/producao');
    cy.wait('@getProductionOrders');

    // Espiona se haverá alguma requisição de alteração de status
    cy.intercept('PATCH', '**/orders/*/production-status', cy.spy().as('statusRequest'));

    const dataTransfer = new DataTransfer();

    cy.contains('[data-testid="order-production-card"]', 'OS-2026-0001')
      .trigger('dragstart', { dataTransfer });

    cy.get('[data-testid="kanban-column-waiting_production"]')
      .trigger('dragover', { dataTransfer })
      .trigger('drop', { dataTransfer });

    // Garante que nenhuma requisição de rede foi enviada
    cy.get('@statusRequest').should('not.have.been.called');

    // Permanece na mesma coluna
    cy.get('[data-testid="kanban-column-waiting_production"]').within(() => {
      cy.contains('OS-2026-0001').should('be.visible');
    });

    // Nenhum toast de erro é exibido
    cy.get('[role="status"]').should('not.exist');
  });
});
