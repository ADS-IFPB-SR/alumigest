describe('QA-04: Teste End-to-End da Via Técnica de Oficina (Ficha de Usinagem e Corte) [US-11]', () => {
  const mockBudgetId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const mockBudgetCode = 'ORC-2026-0042';

  const mockActiveBudget = {
    id: mockBudgetId,
    code: mockBudgetCode,
    status: 'APPROVED',
    customer: {
      id: 'cust-1',
      fullName: 'Serralheria Esquadrias do Sertão',
      phone: '(83) 98765-4321',
      email: 'contato@esquadriasdosertao.com.br',
      address: {
        street: 'Rua da Produção',
        number: '100',
        neighborhood: 'Distrito Fabril',
        city: 'Sousa',
        state: 'PB',
      },
    },
    items: [
      {
        id: 'item-1',
        name: 'Porta de Giro 1 Folha',
        templateType: 'SWING_DOOR_1F',
        widthMm: 900,
        heightMm: 2100,
        quantity: 2,
        notes: 'Usinagem de dobradiças nas distâncias 250, 1050, 1850 mm',
        templateConfig: JSON.stringify({
          width: 900,
          height: 2100,
          openingDirection: 'LEFT',
        }),
        drillingConfig: JSON.stringify({
          mode: 'CUSTOM_DISTANCES',
          customDistancesMm: [250, 1050, 1850],
        }),
        handleConfig: JSON.stringify({
          type: 'TUBULAR',
          position: 'RIGHT',
          lengthMm: 400,
          distanceFromFloorMm: 1000,
        }),
        options: [
          {
            materialName: 'Perfil Linha 25 Preto Fosco',
            categoryType: 'PROFILE',
            quantity: 1,
          },
          {
            materialName: 'Vidro Temperado 8mm Incolor',
            categoryType: 'GLASS',
            quantity: 1,
          },
        ],
      },
    ],
    totalAmount: 1850.0,
    discountAmount: 0.0,
    finalAmount: 1850.0,
    createdAt: new Date().toISOString(),
  };

  const mockCancelledBudget = {
    ...mockActiveBudget,
    id: 'cancelled-budget-id-999',
    code: 'ORC-2026-0099',
    status: 'CANCELLED',
  };

  beforeEach(() => {
    // Intercepta rota de busca de orçamento por padrão
    cy.intercept('GET', '**/api/orcamentos/' + mockBudgetId, {
      statusCode: 200,
      body: mockActiveBudget,
    }).as('getBudgetDetails');

    cy.intercept('GET', '**/api/v1/budgets/' + mockBudgetId, {
      statusCode: 200,
      body: mockActiveBudget,
    }).as('getBudgetDetailsV1');

    cy.intercept('GET', '**/api/budgets/' + mockBudgetId, {
      statusCode: 200,
      body: mockActiveBudget,
    }).as('getBudgetDetailsBudgets');
  });

  it('Cenário 1: Fluxo Feliz — Emissão e Download da Via Técnica com Feedback de Loading (CT-01 & CT-02)', () => {
    // Simula resposta do endpoint de PDF técnico com delay para validar o estado isPending
    cy.intercept('GET', '**/api/**/pdf/tecnico', (req) => {
      req.reply({
        delay: 600,
        statusCode: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': `attachment; filename="${mockBudgetCode}-tecnico.pdf"`,
        },
        body: '%PDF-1.4 mock binary technical pdf content for workshop',
      });
    }).as('downloadTechnicalPdf');

    // Visita a página de detalhes do orçamento
    cy.visit(`/orcamentos/${mockBudgetId}`);

    // Garante que o orçamento carregou
    cy.contains(mockBudgetCode).should('be.visible');
    cy.contains('Serralheria Esquadrias do Sertão').should('be.visible');

    // Botão de Via Técnica deve estar visível e habilitado
    const btnViaTecnica = cy.get('[data-testid="btn-download-pdf-tecnico"]');
    btnViaTecnica.should('be.visible').and('not.be.disabled');
    btnViaTecnica.should('contain.text', 'Via Técnica');

    // Clica para emitir a via técnica
    btnViaTecnica.click();

    // 1. Valida feedback de carregamento em andamento
    cy.get('[data-testid="btn-download-pdf-tecnico"]').within(() => {
      cy.get('.animate-spin').should('exist');
      cy.contains('Gerando...').should('be.visible');
    });
    cy.get('[data-testid="btn-download-pdf-tecnico"]').should('be.disabled');

    // 2. Aguarda resolução do download
    cy.wait('@downloadTechnicalPdf').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.headers['content-type']).to.include('application/pdf');
    });

    // 3. Valida notificação Toast de sucesso
    cy.contains('PDF da Ficha Técnica baixado com sucesso!').should('be.visible');

    // 4. Botão volta ao estado normal
    cy.get('[data-testid="btn-download-pdf-tecnico"]')
      .should('not.be.disabled')
      .and('contain.text', 'Via Técnica');
  });

  it('Cenário 2: Guarda de Negócio — Bloqueio de Emissão para Orçamento Cancelado (CT-03)', () => {
    // Mock de orçamento cancelado
    cy.intercept('GET', '**/api/**/cancelled-budget-id-999', {
      statusCode: 200,
      body: mockCancelledBudget,
    }).as('getCancelledBudget');

    // Prepara spy na chamada de PDF técnico para garantir que ela NUNCA seja disparada
    cy.intercept('GET', '**/api/**/pdf/tecnico', cy.spy().as('pdfCallSpy'));

    cy.visit('/orcamentos/cancelled-budget-id-999');

    // Verifica que o orçamento está com badge/status de Cancelado
    cy.contains('ORC-2026-0099').should('be.visible');

    // O botão deve estar desabilitado com cursor impeditivo e tooltip de cancelamento
    cy.get('[data-testid="btn-download-pdf-tecnico"]')
      .should('be.visible')
      .and('be.disabled')
      .and('have.attr', 'title', 'Não é possível emitir ficha técnica de orçamento cancelado')
      .and('have.class', 'disabled:cursor-not-allowed');

    // Tentar clicar com force não deve disparar request para o backend
    cy.get('[data-testid="btn-download-pdf-tecnico"]').click({ force: true });
    cy.get('@pdfCallSpy').should('not.have.been.called');
  });

  it('Cenário 3: Resiliência — Tratamento Elegante de Falha na API ao Gerar PDF Técnico (CT-04)', () => {
    // Simula erro 422 retornado pelo backend (ex: inconsistência interna de cálculo)
    cy.intercept('GET', '**/api/**/pdf/tecnico', {
      statusCode: 422,
      body: {
        status: 422,
        message: 'Inconsistência técnica nos perfis para usinagem.',
      },
    }).as('downloadTechnicalPdfError');

    cy.visit(`/orcamentos/${mockBudgetId}`);
    cy.contains(mockBudgetCode).should('be.visible');

    // Dispara a tentativa de download
    cy.get('[data-testid="btn-download-pdf-tecnico"]').click();

    cy.wait('@downloadTechnicalPdfError');

    // Verifica que o toast de erro é exibido com a mensagem retornada pelo backend
    cy.contains('Inconsistência técnica nos perfis para usinagem.').should('be.visible');

    // O botão deve ser restaurado e reabilitado para nova tentativa
    cy.get('[data-testid="btn-download-pdf-tecnico"]')
      .should('not.be.disabled')
      .and('contain.text', 'Via Técnica');
  });

  it('Cenário 4: Alternância para Aba de Romaneio Técnico e Ações de Chão de Fábrica', () => {
    cy.visit(`/orcamentos/${mockBudgetId}`);
    cy.contains(mockBudgetCode).should('be.visible');

    // Alterna para a aba Romaneio de Peças
    cy.get('[data-testid="tab-romaneio"]').click();

    // Valida painéis de fábrica
    cy.contains('Romaneio Técnico & Gabarito de Fabricação').should('be.visible');
    cy.contains('Lista de Corte & Gabarito Técnico').should('be.visible');
    cy.contains('Controle de Qualidade & Fábrica').should('be.visible');

    // O botão de Via Técnica continua presente na barra de ações superior
    cy.get('[data-testid="btn-download-pdf-tecnico"]').should('be.visible');
  });
});
