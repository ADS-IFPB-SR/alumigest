/// <reference types="cypress" />

describe('US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas', () => {
  const customerId1 = '04200000-0000-4000-8000-000000000001';
  const customerId2 = '04200000-0000-4000-8000-000000000002';
  const customerIdEmpty = '04200000-0000-4000-8000-000000000003';
  const orderId1 = 'ord-470000-0001';
  const orderId2 = 'ord-470000-0002';

  const mockCustomersList = [
    {
      id: customerId1,
      nomeCompleto: 'Antônio Alfredo Figueiredo',
      personType: 'FISICA',
      documento: '04289144409',
      telefone: '83988452100',
      email: 'antonio.figueiredo@email.com',
      bairro: 'Torre',
      cidade: 'João Pessoa',
      uf: 'PB',
    },
    {
      id: customerId2,
      nomeCompleto: 'Vidraçaria Alvorada Ltda',
      personType: 'JURIDICA',
      documento: '12345678000199',
      telefone: '83999887766',
      email: 'contato@alvorada.com.br',
      bairro: 'Centro',
      cidade: 'Campina Grande',
      uf: 'PB',
    },
    {
      id: customerIdEmpty,
      nomeCompleto: 'Beatriz Vasconcelos Nova',
      personType: 'FISICA',
      documento: '98765432100',
      telefone: '83911223344',
      email: 'beatriz.nova@email.com',
      bairro: 'Manaíra',
      cidade: 'João Pessoa',
      uf: 'PB',
    },
  ];

  const mockDashboardC1 = {
    id: customerId1,
    nomeCompleto: 'Antônio Alfredo Figueiredo',
    personType: 'FISICA',
    documento: '04289144409',
    telefone: '83988452100',
    email: 'antonio.figueiredo@email.com',
    bairro: 'Torre',
    cidade: 'João Pessoa',
    uf: 'PB',
    totalContratado: 4500.0,
    quantidadeOrdensServico: 2,
    quantidadeOrcamentos: 2,
  };

  const mockBudgetsC1 = {
    content: [
      {
        id: 'orc-001',
        codigo: 'ORC-2026-1024',
        dataCriacao: '2026-10-24T14:30:00Z',
        status: 'APPROVED',
        statusDescricao: 'Aprovado',
        valorTotal: 2067.88,
      },
      {
        id: 'orc-002',
        codigo: 'ORC-2026-1030',
        dataCriacao: '2026-10-30T10:15:00Z',
        status: 'DRAFT',
        statusDescricao: 'Em Elaboração',
        valorTotal: 3450.0,
      },
    ],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
    isFirst: true,
    isLast: true,
  };

  const mockOrdersC1 = [
    {
      id: orderId1,
      codigo: 'OS-2026-0001',
      data: '2026-10-25',
      status: 'WAITING_PRODUCTION',
      statusDescricao: 'Aguardando Produção',
      valorTotal: 3000.0,
      totalEsquadrias: 2,
      items: [
        {
          id: 'item-01',
          descricao: 'Janela de Correr 2 Folhas Linha Suprema',
          larguraMm: 1200,
          alturaMm: 2100,
          quantidade: 1,
          corAluminio: 'Branco Eletrostático',
          tipoVidro: 'Incolor 6mm',
          valorTotal: 1500.0,
        },
        {
          id: 'item-02',
          descricao: 'Janela Maxim-ar Linha Suprema',
          larguraMm: 600,
          alturaMm: 600,
          quantidade: 1,
          corAluminio: 'Branco Eletrostático',
          tipoVidro: 'Mini Boreal 4mm',
          valorTotal: 1500.0,
        },
      ],
    },
    {
      id: orderId2,
      codigo: 'OS-2026-0002',
      data: '2026-10-26',
      status: 'IN_PRODUCTION',
      statusDescricao: 'Em Produção',
      valorTotal: 1500.0,
      totalEsquadrias: 1,
      items: [
        {
          id: 'item-03',
          descricao: 'Porta Giro Linha Gold',
          larguraMm: 800,
          alturaMm: 2100,
          quantidade: 1,
          corAluminio: 'Preto Anodizado',
          tipoVidro: 'Laminado 6mm',
          valorTotal: 1500.0,
        },
      ],
    },
  ];

  const mockFullOrder1 = {
    id: orderId1,
    codigo: 'OS-2026-0001',
    orcamentoId: 'orc-001',
    orcamentoCodigo: 'ORC-2026-1024',
    clienteId: customerId1,
    clienteNome: 'Antônio Alfredo Figueiredo',
    clienteTelefone: '83988452100',
    clienteEndereco: 'Rua Principal, 100 - Torre, João Pessoa - PB',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-25',
    dataPrevisaoEntrega: '2026-11-10',
    valorBruto: 3000.0,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 3000.0,
    condicaoPagamento: 'À Vista',
    observacoes: 'Instalação preferencial pela manhã.',
    justificativaCancelamento: null,
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'item-01',
        orderId: orderId1,
        productId: 'prod-01',
        descricao: 'Janela de Correr 2 Folhas Linha Suprema',
        larguraMm: 1200,
        alturaMm: 2100,
        quantidade: 1,
        corAluminio: 'Branco Eletrostático',
        tipoVidro: 'Incolor 6mm',
        valorUnitario: 1500.0,
        valorTotal: 1500.0,
        ordem: 1,
        options: [],
      },
      {
        id: 'item-02',
        orderId: orderId1,
        productId: 'prod-02',
        descricao: 'Janela Maxim-ar Linha Suprema',
        larguraMm: 600,
        alturaMm: 600,
        quantidade: 1,
        corAluminio: 'Branco Eletrostático',
        tipoVidro: 'Mini Boreal 4mm',
        valorUnitario: 1500.0,
        valorTotal: 1500.0,
        ordem: 2,
        options: [],
      },
    ],
  };

  const setupDefaultIntercepts = () => {
    // Intercepta listagem de clientes para a Master Sidebar
    cy.intercept('GET', '**/api/**/clientes?*', {
      statusCode: 200,
      body: {
        content: mockCustomersList,
        page: 0,
        size: 50,
        totalElements: mockCustomersList.length,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      },
    }).as('getCustomersList');

    // Intercepta dashboard do cliente 1
    cy.intercept('GET', `**/api/**/clientes/${customerId1}/dashboard`, {
      statusCode: 200,
      body: mockDashboardC1,
    }).as('getCustomerDashboard');

    // Intercepta orçamentos do cliente 1
    cy.intercept('GET', `**/api/**/clientes/${customerId1}/budgets*`, {
      statusCode: 200,
      body: mockBudgetsC1,
    }).as('getCustomerBudgets');

    // Intercepta ordens do cliente 1
    cy.intercept('GET', `**/api/**/clientes/${customerId1}/orders*`, {
      statusCode: 200,
      body: mockOrdersC1,
    }).as('getCustomerOrders');

    // Intercepta consulta da O.S. completa (para o modal de etiquetas térmicas)
    cy.intercept('GET', `**/api/**/orders/${orderId1}`, {
      statusCode: 200,
      body: mockFullOrder1,
    }).as('getOrderById');

    // Intercepta download de Ficha Técnica em PDF
    cy.intercept('GET', `**/api/**/orders/${orderId1}/production-sheet/pdf`, {
      statusCode: 200,
      headers: { 'content-type': 'application/pdf' },
      body: '%PDF-1.4 Mock PDF Content',
    }).as('downloadTechSheetPdf');

    // Intercepta download de Etiquetas Térmicas em PDF
    cy.intercept('POST', `**/api/**/orders/${orderId1}/labels/pdf*`, {
      statusCode: 200,
      headers: { 'content-type': 'application/pdf' },
      body: '%PDF-1.4 Mock Thermal Labels PDF',
    }).as('downloadLabelsPdf');
  };

  beforeEach(() => {
    cy.viewport(1366, 900);
    setupDefaultIntercepts();
  });

  // ==========================================
  // 🟢 CAMINHOS FELIZES (HAPPY PATHS)
  // ==========================================

  it('TC-47-HP01: Busca dinâmica, seleção na sidebar e carregamento do Hero Card com 3 KPIs consolidados', () => {
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomersList', '@getCustomerDashboard', '@getCustomerBudgets', '@getCustomerOrders']);

    // 1. Sidebar Master
    cy.contains('aside[aria-label="Lista de Clientes"] h2', 'Clientes').should('be.visible');
    cy.contains('aside[aria-label="Lista de Clientes"]', 'Antônio Alfredo Figueiredo').should('be.visible');
    cy.contains('aside[aria-label="Lista de Clientes"]', 'Vidraçaria Alvorada Ltda').should('be.visible');

    // 2. Hero Card com dados cadastrais e avatar
    cy.get('h1').contains('Antônio Alfredo Figueiredo').should('be.visible');
    cy.contains('span', 'PF').should('be.visible');
    cy.contains('Torre, João Pessoa - PB').should('be.visible');
    cy.contains('83988452100').should('be.visible');
    cy.contains('04289144409').should('be.visible');

    // 3. Grid de 3 KPIs Consolidados
    cy.contains('Total Contratado').should('be.visible');
    cy.contains('R$ 4.500,00').should('be.visible');

    cy.contains('Ordens de Serviço').should('be.visible');
    cy.contains('2 O.S.').should('be.visible');

    cy.contains('Orçamentos Vinculados').should('be.visible');
    cy.contains('2 Propostas').should('be.visible');
  });

  it('TC-47-HP02: Gestão e listagem de propostas na aba "Orçamentos" com ações rápidas (PDF e WhatsApp)', () => {
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getCustomerBudgets']);

    // Aba Orçamentos ativa por padrão
    cy.get('table').should('be.visible');
    cy.contains('th', 'Nº Orçamento').should('be.visible');
    cy.contains('th', 'Data').should('be.visible');
    cy.contains('th', 'Situação').should('be.visible');
    cy.contains('th', 'Valor da Proposta').should('be.visible');
    cy.contains('th', 'Ações Rápidas').should('be.visible');

    // Linhas da tabela
    cy.contains('td', 'ORC-2026-1024').should('be.visible');
    cy.contains('td', 'Aprovado').should('be.visible');
    cy.contains('td', 'R$ 2.067,88').should('be.visible');

    cy.contains('td', 'ORC-2026-1030').should('be.visible');
    cy.contains('td', 'Em Elaboração').should('be.visible');
    cy.contains('td', 'R$ 3.450,00').should('be.visible');

    // Ações Rápidas: Botão Proposta PDF e Link WhatsApp
    cy.get('button[aria-label="Visualizar proposta em PDF do orçamento ORC-2026-1024"]').should('be.visible');
    cy.get('a[aria-label="Enviar proposta do orçamento ORC-2026-1024 via WhatsApp"]')
      .should('be.visible')
      .should('have.attr', 'href')
      .and('include', 'wa.me')
      .and('include', 'ORC-2026-1024');
  });

  it('TC-47-HP03: Tabela de Ordens de Serviço (O.S.) sem compressão visual nas resoluções 1366x768 e 1920x1080', () => {
    // Teste na resolução padrão 1366x768
    cy.viewport(1366, 768);
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getCustomerOrders']);

    // Alterna para aba de O.S.
    cy.contains('button', 'Ordens de Serviço (O.S.)').click();

    cy.contains('th', 'Código O.S.').should('be.visible');
    cy.contains('th', 'Data').should('be.visible');
    cy.contains('th', 'Situação Fabril').should('be.visible');
    cy.contains('th', 'Valor Total').should('be.visible');
    cy.contains('th', 'Esquadrias').should('be.visible');
    cy.contains('th', 'Ações').should('be.visible');

    cy.contains('td', 'OS-2026-0001').should('be.visible');
    cy.contains('td', 'Aguardando Produção').should('be.visible');
    cy.contains('td', 'R$ 3.000,00').should('be.visible');
    cy.contains('td', '2 peças').should('be.visible');

    // Teste na resolução Full HD 1920x1080
    cy.viewport(1920, 1080);
    cy.contains('td', 'OS-2026-0001').should('be.visible');
    cy.contains('td', 'OS-2026-0002').should('be.visible');
    cy.contains('td', 'Em Produção').should('be.visible');
    cy.contains('td', 'R$ 1.500,00').should('be.visible');
  });

  it('TC-47-HP04: Detalhamento de esquadrias físicas com medidas nominais em milímetros (📐 L x A mm) ao clicar na O.S.', () => {
    cy.viewport(1366, 950);
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getCustomerOrders']);

    cy.contains('button', 'Ordens de Serviço (O.S.)').click();

    // Clica na linha da OS-2026-0001 para abrir o drawer de esquadrias
    cy.contains('tr', 'OS-2026-0001').click();

    // Valida abertura do Drawer com cabeçalho e contagem
    cy.contains('Esquadrias da O.S.').scrollIntoView().should('be.visible');
    cy.contains('OS-2026-0001').should('be.visible');
    cy.contains('(2 peças)').should('be.visible');

    // Valida peças físicas e medidas nominais em mm com formatação canônica
    cy.contains('Janela de Correr 2 Folhas Linha Suprema').scrollIntoView().should('be.visible');
    cy.contains('📐 1200 x 2100 mm').scrollIntoView().should('be.visible');
    cy.contains('Alumínio: Branco Eletrostático').scrollIntoView().should('be.visible');
    cy.contains('Vidro: Incolor 6mm').scrollIntoView().should('be.visible');

    cy.contains('Janela Maxim-ar Linha Suprema').scrollIntoView().should('be.visible');
    cy.contains('📐 600 x 600 mm').scrollIntoView().should('be.visible');
    cy.contains('Vidro: Mini Boreal 4mm').scrollIntoView().should('be.visible');
  });

  it('TC-47-HP05: Abertura e renderização do fluxo de Ficha Técnica A4 de corte com ângulos e folgas', () => {
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getCustomerOrders']);

    cy.contains('button', 'Ordens de Serviço (O.S.)').click();

    // Dispara o botão Ficha Técnica na tabela
    cy.get(`button[aria-label="Ficha técnica da O.S. OS-2026-0001"]`).click();
    cy.wait('@downloadTechSheetPdf');

    // Valida notificação de sucesso
    cy.contains('Ficha Técnica baixada com sucesso!').should('be.visible');
  });

  it('TC-47-HP06: Abertura e renderização do modal de Etiquetas Térmicas (100x60mm) para impressora Elgin L42', () => {
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getCustomerOrders']);

    cy.contains('button', 'Ordens de Serviço (O.S.)').click();

    // Dispara o botão Etiquetas na tabela
    cy.get(`button[aria-label="Etiquetas da O.S. OS-2026-0001"]`).click();
    cy.wait('@getOrderById');

    // Modal de Etiquetas Térmicas aberto
    cy.get('[data-testid="thermal-label-modal"]').should('be.visible');
    cy.contains('Conferência e Impressão de Etiquetas Térmicas (100x60mm)').should('be.visible');
    cy.contains('OS-2026-0001').should('be.visible');

    // Fecha o modal pelo botão fechar
    cy.get('[data-testid="btn-close-thermal-modal"]').click();
    cy.get('[data-testid="thermal-label-modal"]').should('not.exist');
  });

  it('TC-47-HP07: Navegação para novo orçamento a partir do botão "+ Novo Orçamento" com cliente pré-selecionado', () => {
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard']);

    // Clica no botão "Novo Orçamento" no Hero Card
    cy.contains('button', 'Novo Orçamento').click();

    // Deve redirecionar para a rota de novo orçamento com o cliente pré-selecionado
    cy.url().should('include', `/orcamentos/novo?clienteId=${customerId1}`);
  });

  // ==========================================
  // 🔴 CAMINHOS TRISTES E VALIDAÇÕES (SAD PATHS)
  // ==========================================

  it('TC-47-SP01: Exibição elegante de Empty States para clientes recém-cadastrados sem movimentação comercial', () => {
    // Intercepta cliente sem movimentações
    cy.intercept('GET', `**/api/**/clientes/${customerIdEmpty}/dashboard`, {
      statusCode: 200,
      body: {
        id: customerIdEmpty,
        nomeCompleto: 'Beatriz Vasconcelos Nova',
        personType: 'FISICA',
        documento: '98765432100',
        telefone: '83911223344',
        email: 'beatriz.nova@email.com',
        bairro: 'Manaíra',
        cidade: 'João Pessoa',
        uf: 'PB',
        totalContratado: 0,
        quantidadeOrdensServico: 0,
        quantidadeOrcamentos: 0,
      },
    }).as('getEmptyDashboard');

    cy.intercept('GET', `**/api/**/clientes/${customerIdEmpty}/budgets*`, {
      statusCode: 200,
      body: {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        isFirst: true,
        isLast: true,
      },
    }).as('getEmptyBudgets');

    cy.intercept('GET', `**/api/**/clientes/${customerIdEmpty}/orders*`, {
      statusCode: 200,
      body: [],
    }).as('getEmptyOrders');

    cy.visit(`/clientes?id=${customerIdEmpty}`);
    cy.wait(['@getEmptyDashboard', '@getEmptyBudgets', '@getEmptyOrders']);

    // Valida KPIs zerados
    cy.contains('R$ 0,00').should('be.visible');
    cy.contains('0 O.S.').should('be.visible');
    cy.contains('0 Propostas').should('be.visible');

    // Valida Empty State na aba Orçamentos
    cy.contains('Nenhum orçamento vinculado a este cliente').should('be.visible');
    cy.contains('Clique no botão "Novo Orçamento" no topo para criar a primeira proposta comercial.').should('be.visible');

    // Valida Empty State na aba Ordens de Serviço
    cy.contains('button', 'Ordens de Serviço (O.S.)').click();
    cy.contains('Nenhuma O.S. vinculada a este cliente').should('be.visible');
    cy.contains('As ordens de serviço aparecerão aqui após a conversão de um orçamento aprovado.').should('be.visible');
  });

  it('TC-47-SP02: Tratamento de falha de conexão na API (erro 500/rede) sem quebrar a sidebar mestre', () => {
    // Simula falha 500 no carregamento do dashboard com resposta imediata
    cy.intercept('GET', `**/api/**/clientes/${customerId1}/dashboard`, {
      statusCode: 500,
      body: { message: 'Erro interno no servidor' },
    }).as('getDashboard500');

    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait('@getDashboard500');

    // A sidebar mestre continua visível e funcional
    cy.contains('aside[aria-label="Lista de Clientes"] h2', 'Clientes').should('be.visible');
    cy.contains('aside[aria-label="Lista de Clientes"]', 'Antônio Alfredo Figueiredo').should('be.visible');

    // Painel de detalhe exibe estado de fallback elegante após retentativas
    cy.contains('Nenhum cliente selecionado', { timeout: 12000 }).should('be.visible');
    cy.contains('Selecione um cliente na barra lateral para visualizar seu Hub 360°.').should('be.visible');
  });

  it('TC-47-SP03: Busca sem resultados na barra lateral exibindo mensagem amigável', () => {
    // Configura o intercept da busca antes de digitar
    cy.intercept('GET', '**/api/**/clientes?*busca=*', {
      statusCode: 200,
      body: {
        content: [],
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0,
        isFirst: true,
        isLast: true,
      },
    }).as('searchEmpty');

    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomersList']);

    // Digita termo inexistente no searchbox
    cy.get('input[role="searchbox"]').clear().type('InexistenteXYZ');
    cy.wait('@searchEmpty');
    cy.contains('Nenhum cliente encontrado.').should('be.visible');
  });

  // ==========================================
  // 🟡 CASOS DE BORDA E GOVERNANÇA (EDGE CASES)
  // ==========================================

  it('TC-47-EC01: O.S. volumosa com múltiplas esquadrias (rolagem e grid fluido sem quebrar o layout mestre)', () => {
    cy.viewport(1366, 950);

    const voluminousItems = Array.from({ length: 9 }, (_, index) => ({
      id: `item-vol-${index + 1}`,
      descricao: `Janela de Alumínio Linha Suprema Tipo ${index + 1}`,
      larguraMm: 1000 + index * 50,
      alturaMm: 1200 + index * 50,
      quantidade: 1,
      corAluminio: 'Branco Eletrostático',
      tipoVidro: 'Incolor 6mm',
      valorTotal: 850.0,
    }));

    cy.intercept('GET', `**/api/**/clientes/${customerId1}/orders*`, {
      statusCode: 200,
      body: [
        {
          id: 'ord-vol-01',
          codigo: 'OS-2026-VOL9',
          data: '2026-10-28',
          status: 'IN_PRODUCTION',
          statusDescricao: 'Em Produção',
          valorTotal: 7650.0,
          totalEsquadrias: 9,
          items: voluminousItems,
        },
      ],
    }).as('getVoluminousOrders');

    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getVoluminousOrders']);

    cy.contains('button', 'Ordens de Serviço (O.S.)').click();
    cy.contains('tr', 'OS-2026-VOL9').click();

    // Valida abertura do Drawer com 9 peças
    cy.contains('Esquadrias da O.S.').scrollIntoView().should('be.visible');
    cy.contains('(9 peças)').should('be.visible');

    // Valida que o primeiro e o último item estão presentes e visíveis
    cy.contains('Janela de Alumínio Linha Suprema Tipo 1').scrollIntoView().should('be.visible');
    cy.contains('📐 1000 x 1200 mm').scrollIntoView().should('be.visible');
    cy.contains('Janela de Alumínio Linha Suprema Tipo 9').scrollIntoView().should('be.visible');
    cy.contains('📐 1400 x 1600 mm').scrollIntoView().should('be.visible');
  });

  it('TC-47-EC02: Consistência visual e contraste em Modo Escuro utilizando tokens semânticos M3', () => {
    cy.visit(`/clientes?id=${customerId1}`);
    cy.wait(['@getCustomerDashboard', '@getCustomerBudgets']);

    // Simula a ativação da classe dark no elemento html raiz
    cy.get('html').invoke('addClass', 'dark');

    // Valida que os contêineres principais possuem classes dark ativas
    cy.get('aside[aria-label="Lista de Clientes"]').should('have.class', 'dark:bg-slate-900');
    cy.get('h1').contains('Antônio Alfredo Figueiredo').should('be.visible');
    cy.contains('Total Contratado').should('be.visible');

    // Remove classe dark para restabelecer modo claro
    cy.get('html').invoke('removeClass', 'dark');
  });
});
