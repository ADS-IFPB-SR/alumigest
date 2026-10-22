import type { Order } from '../../../src/features/orders/types';

describe('US-17.5: Homologação E2E — Emissão de Etiquetas Térmicas de Identificação (100x60mm)', () => {
  const orderId = '01700000-0000-4000-8000-000000000017';
  const orderCodigo = 'OS-2026-0017';

  // Ordem de Serviço com múltiplos itens e quantidades:
  // Item 1: Janela de Correr (quantidade: 2)
  // Item 2: Porta de Giro (quantidade: 1)
  // Total físico: 3 peças físicas
  const multiItemOrder: Order = {
    id: orderId,
    codigo: orderCodigo,
    orcamentoId: 'b1700000-0000-4000-8000-000000000017',
    orcamentoCodigo: 'ORC-2026-0017',
    clienteId: 'c1700000-0000-4000-8000-000000000017',
    clienteNome: 'Construtora Alvorada Ltda',
    clienteTelefone: '(83) 98888-1717',
    clienteEndereco: 'Av. das Esquadrias, 1700 - João Pessoa/PB',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-15',
    dataPrevisaoEntrega: '2026-10-30',
    valorBruto: 6000,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 6000,
    condicaoPagamento: 'À Vista (PIX / Dinheiro)',
    observacoes: 'Entregar na portaria da obra (Bloco A)',
    justificativaCancelamento: null,
    createdAt: '2026-10-15T09:00:00-03:00',
    updatedAt: '2026-10-15T09:00:00-03:00',
    ativo: true,
    items: [
      {
        id: 'item-janela-01',
        orderId,
        productId: 'prod-janela-120x150',
        descricao: 'Janela de Correr 2 Folhas',
        larguraMm: 1200,
        alturaMm: 1500,
        quantidade: 2,
        corAluminio: 'Preto Anodizado',
        tipoVidro: 'Incolor 6mm Temperado',
        valorUnitario: 2000,
        valorTotal: 4000,
        ordem: 1,
        options: [],
      },
      {
        id: 'item-porta-02',
        orderId,
        productId: 'prod-porta-90x210',
        descricao: 'Porta de Giro 1 Folha',
        larguraMm: 900,
        alturaMm: 2100,
        quantidade: 1,
        corAluminio: 'Branco Eletrostático',
        tipoVidro: 'Fumê 8mm Temperado',
        valorUnitario: 2000,
        valorTotal: 2000,
        ordem: 2,
        options: [],
      },
    ],
  };

  beforeEach(() => {
    cy.viewport(1366, 900);
  });

  it('Cenário 1: Geração de Etiquetas Térmicas (100x60mm) com Paginação por Exemplar Físico de Peça', () => {
    // Dado que o operador visualiza uma Ordem de Serviço aprovada na página OrderDetailPage
    // contendo múltiplos itens e quantidades (Item 1 com 2 janelas e Item 2 com 1 porta = 3 peças físicas)
    cy.intercept('GET', `**/api/**/orders/${orderId}`, {
      statusCode: 200,
      body: multiItemOrder,
    }).as('getOrderDetails');

    cy.intercept('GET', `**/api/**/orders/${orderId}/labels-pdf*`, {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="etiquetas-${orderCodigo}.pdf"`,
      },
      body: '%PDF-1.4\n% AlumiGest ERP - Etiquetas Termicas 100x60mm (283.46pt x 170.08pt)\n%%EOF',
    }).as('downloadLabelsPdf');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderDetails');

    cy.contains(`#${orderCodigo}`).should('be.visible');
    cy.contains(multiItemOrder.clienteNome).should('be.visible');

    // Abre a visualização prévia contínua das etiquetas
    cy.get('[data-testid="btn-open-thermal-modal"]').should('be.visible').click();
    cy.get('[data-testid="thermal-label-modal"]').should('be.visible');

    // Então o sistema gera exatamente uma etiqueta física por exemplar (3 peças no total)
    cy.get('[data-testid="thermal-label-card"]').should('have.length', 3);

    // E exibe a numeração sequencial fracionada correta em cada uma
    cy.get('[data-testid="label-piece-fraction"]').eq(0).should('contain.text', 'Item 01 | Peça 01/03');
    cy.get('[data-testid="label-piece-fraction"]').eq(1).should('contain.text', 'Item 01 | Peça 02/03');
    cy.get('[data-testid="label-piece-fraction"]').eq(2).should('contain.text', 'Item 02 | Peça 03/03');
  });

  it('Cenário 2: Tipografia Técnica Limpa de Alto Contraste (Sem Código de Barras)', () => {
    // Dado que a etiqueta é renderizada para impressoras térmicas industriais
    cy.intercept('GET', `**/api/**/orders/${orderId}`, {
      statusCode: 200,
      body: multiItemOrder,
    }).as('getOrderDetails');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderDetails');

    cy.get('[data-testid="btn-open-thermal-modal"]').click();
    cy.get('[data-testid="thermal-label-modal"]').should('be.visible');

    // Então a etiqueta exibe cabeçalho institucional com marca da empresa (Alumiportas) e nome do cliente
    cy.get('[data-testid="thermal-label-card"]').first().within(() => {
      cy.contains('Alumiportas').should('be.visible');
      cy.contains(multiItemOrder.clienteNome).should('be.visible');

      // E exibe o código da O.S. (OS-YYYY-NNNN)
      cy.contains(`#${orderCodigo}`).should('be.visible');

      // E destaca em caixa central e fonte mono de alto contraste as medidas nominais (1200 x 1500 mm)
      cy.get('[data-testid="label-dimensions"]').should('contain.text', '1200 x 1500 mm');

      // E exibe especificações com testids dedicados (evitando falso positivo de regex com palavras como "Correr")
      cy.get('[data-testid="label-color"]').should('contain.text', 'Preto Anodizado');
      cy.get('[data-testid="label-glass"]').should('contain.text', 'Incolor 6mm Temperado');
      cy.contains(/LOCAL/i).parent().should('contain.text', 'Entregar na portaria da obra (Bloco A)');

      // E exibe no rodapé limpo com data, sem código de barras, sem código de item e sem badge GOLD
      cy.get('[data-testid="label-date"]').should('be.visible');
      cy.contains('GOLD').should('not.exist');
      cy.get('svg[data-barcode]').should('not.exist');
      cy.get('canvas[data-barcode]').should('not.exist');
    });

    // Valida também o segundo item (Porta 900 x 2100 mm)
    cy.get('[data-testid="thermal-label-card"]').last().within(() => {
      cy.get('[data-testid="label-dimensions"]').should('contain.text', '900 x 2100 mm');
      cy.get('[data-testid="label-color"]').should('contain.text', 'Branco Eletrostático');
      cy.get('[data-testid="label-glass"]').should('contain.text', 'Fumê 8mm Temperado');
    });
  });

  it('Cenário 3: Visualização Prévia Contínua no Modal Frontend com Filtro por Item', () => {
    // Dado que o modal de etiquetas térmicas é acionado no frontend
    cy.intercept('GET', `**/api/**/orders/${orderId}`, {
      statusCode: 200,
      body: multiItemOrder,
    }).as('getOrderDetails');

    cy.intercept('GET', `**/api/**/orders/${orderId}/labels-pdf*`, {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="etiquetas-${orderCodigo}.pdf"`,
      },
      body: '%PDF-1.4\n% AlumiGest Etiquetas Termicas 100x60mm\n%%EOF',
    }).as('downloadLabelsPdf');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderDetails');

    cy.get('[data-testid="btn-open-thermal-modal"]').click();
    cy.get('[data-testid="thermal-label-modal"]').should('be.visible');

    // Então todas as etiquetas físicas da O.S. são apresentadas em grade responsiva contínua em uma única tela
    cy.get('[data-testid="thermal-labels-grid"]').should('be.visible');
    cy.get('[data-testid="thermal-label-card"]').should('have.length', 3);
    cy.get('[data-testid="btn-modal-print-thermal"]').should('contain.text', 'Imprimir Todas na Térmica (3)');

    // E o operador pode alternar os filtros rápidos:
    // Filtro Item 1 (2 Peças)
    cy.get('[data-testid="filter-piece-item-1"]').should('be.visible').click();
    cy.get('[data-testid="thermal-label-card"]').should('have.length', 2);
    cy.get('[data-testid="btn-modal-print-thermal"]').should('contain.text', 'Imprimir Peças Filtradas (2)');
    cy.contains('Item 01 | Peça 01/03').should('be.visible');
    cy.contains('Item 01 | Peça 02/03').should('be.visible');
    cy.contains('Item 02 | Peça 03/03').should('not.exist');

    // Filtro Item 2 (1 Peça) com validação de rótulo adaptado e download com itemId (BUG #487)
    cy.get('[data-testid="filter-piece-item-2"]').should('be.visible').click();
    cy.get('[data-testid="thermal-label-card"]').should('have.length', 1);
    cy.get('[data-testid="btn-modal-print-thermal"]').should('contain.text', 'Imprimir Peças Filtradas (1)');
    cy.contains('Item 02 | Peça 03/03').should('be.visible');
    cy.contains('Item 01 | Peça 01/03').should('not.exist');

    // Clica em Baixar PDF com filtro ativo e valida passagem do itemId na URL da requisição
    cy.get('[data-testid="btn-modal-download-pdf"]').should('be.visible').click();
    cy.wait('@downloadLabelsPdf').its('request.url').should('include', 'itemId=item-porta-02');

    // Filtro Todas as Peças (3)
    cy.get('[data-testid="filter-piece-all"]').click();
    cy.get('[data-testid="thermal-label-card"]').should('have.length', 3);
    cy.get('[data-testid="btn-modal-print-thermal"]').should('contain.text', 'Imprimir Todas na Térmica (3)');

    // E a interface disponibiliza botões para "Baixar PDF" e "Imprimir Todas na Térmica"
    cy.get('[data-testid="btn-modal-download-pdf"]').should('be.visible');
    cy.get('[data-testid="btn-modal-print-thermal"]').should('be.visible');

    // E fecha o modal normalmente
    cy.get('[data-testid="btn-close-thermal-modal"]').click();
    cy.get('[data-testid="thermal-label-modal"]').should('not.exist');
  });

  it('Cenário 4: Download Direto de Arquivo PDF do Backend com Revogação de Blob URL', () => {
    // Dado que o usuário aciona a ação de baixar PDF das etiquetas
    cy.intercept('GET', `**/api/**/orders/${orderId}`, {
      statusCode: 200,
      body: multiItemOrder,
    }).as('getOrderDetails');

    cy.intercept('GET', `**/api/**/orders/${orderId}/labels-pdf*`, {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="etiquetas-${orderCodigo}.pdf"`,
      },
      body: '%PDF-1.4\n% AlumiGest Etiquetas Termicas 100x60mm\n%%EOF',
    }).as('downloadLabelsPdf');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderDetails');

    // Espiona as funções de gerenciamento de Blob URL da janela do navegador
    cy.window().then((win) => {
      cy.spy(win.URL, 'createObjectURL').as('createBlobUrl');
      cy.spy(win.URL, 'revokeObjectURL').as('revokeBlobUrl');
    });

    // Quando o botão Imprimir Etiquetas é clicado
    cy.get('[data-testid="btn-download-labels-pdf"]').should('be.visible').click();

    // Então o endpoint é consumido e responde com status HTTP 200 OK e Content-Type: application/pdf
    cy.wait('@downloadLabelsPdf').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      expect(response?.headers?.['content-type']).to.contain('application/pdf');
      expect(response?.headers?.['content-disposition']).to.contain(`etiquetas-${orderCodigo}.pdf`);
    });

    // E o frontend cria e revoga o Blob URL em memória determinística após o download
    cy.get('@createBlobUrl').should('have.been.called');
    cy.get('@revokeBlobUrl').should('have.been.called');

    // E uma notificação toast de sucesso é exibida
    cy.contains(/Etiquetas térmicas (baixadas|geradas) com sucesso!/i).should('be.visible');
  });

  it('Cenário 5: Tratamento de Exceção para O.S. Inexistente (HTTP 404) ou sem Itens (HTTP 422)', () => {
    const invalidOrderId = '00000000-0000-0000-0000-000000000404';

    // 5.1 O.S. Inexistente (HTTP 404)
    cy.intercept('GET', `**/api/**/orders/${invalidOrderId}`, {
      statusCode: 404,
      body: {
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: 'Ordem de serviço não encontrada com o ID informado.',
      },
    }).as('getOrder404');

    cy.visit(`/ordens-servico/${invalidOrderId}`);
    cy.wait('@getOrder404');

    // A tela de detalhe exibe o estado de erro amigável em pt-BR
    cy.get('[data-testid="order-detail-error"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Ordem de Serviço não encontrada').should('be.visible');

    // 5.2 O.S. sem itens válidos (HTTP 422) ao tentar gerar etiquetas
    cy.intercept('GET', `**/api/**/orders/${orderId}`, {
      statusCode: 200,
      body: multiItemOrder,
    }).as('getOrderDetails');

    cy.intercept('GET', `**/api/**/orders/${orderId}/labels-pdf*`, {
      statusCode: 422,
      body: {
        title: 'Regra de Negócio Violada',
        status: 422,
        detail: 'A ordem de serviço não possui itens válidos para emissão de etiquetas.',
      },
    }).as('getLabels422');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getOrderDetails');

    cy.get('[data-testid="btn-download-labels-pdf"]').click();
    cy.wait('@getLabels422');

    // O sistema captura o erro 422 e exibe toast de erro descritivo em pt-BR
    cy.contains(/erro ao gerar as etiquetas térmicas/i).should('be.visible');
    // E o botão é restaurado para o estado habilitado
    cy.get('[data-testid="btn-download-labels-pdf"]').should('not.be.disabled');
  });

  it('Cenário Bônus: Bloqueio e Ocultação das Ações de Etiquetas para Pedidos Cancelados', () => {
    const cancelledOrder: Order = {
      ...multiItemOrder,
      status: 'CANCELLED',
      justificativaCancelamento: 'Cliente cancelou por alteração no cronograma.',
    };

    cy.intercept('GET', `**/api/**/orders/${orderId}`, {
      statusCode: 200,
      body: cancelledOrder,
    }).as('getCancelledOrder');

    cy.visit(`/ordens-servico/${orderId}`);
    cy.wait('@getCancelledOrder');

    // Botões de etiquetas não devem existir para pedidos cancelados
    cy.get('[data-testid="btn-download-labels-pdf"]').should('not.exist');
    cy.get('[data-testid="btn-open-thermal-modal"]').should('not.exist');
  });
});
