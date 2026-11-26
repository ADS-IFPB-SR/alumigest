/// <reference types="cypress" />

describe('US-22: Suíte de Testes E2E (Cypress) - Posição de Estoque, Extrato Kardex e Entrada de Compras (#609)', () => {
  const glass1Id = 'vid-001';
  const glass2Id = 'vid-002';
  const profile1Id = 'prf-001';
  const hardware1Id = 'frr-001';
  const film1Id = 'pel-001';

  const mockGlasses = {
    content: [
      {
        id: glass1Id,
        name: 'Vidro Temperado Incolor 8mm',
        commercialReference: 'VID-INC-8MM',
        skuCode: 'VID-INC-8MM',
        thicknessMm: '8',
        colorFinish: 'Incolor',
        costPrice: 120.0,
        salePrice: 220.0,
        active: true,
      },
      {
        id: glass2Id,
        name: 'Vidro Laminado Fume 10mm',
        commercialReference: 'VID-FUM-10MM',
        skuCode: 'VID-FUM-10MM',
        thicknessMm: '10',
        colorFinish: 'Fumê',
        costPrice: 180.0,
        salePrice: 320.0,
        active: true,
      },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 100,
    number: 0,
  };

  const mockProfiles = {
    content: [
      {
        id: profile1Id,
        name: 'Perfil Tubo Retangular 50x25',
        commercialReference: 'ALUM-TUB-5025',
        skuCode: 'ALUM-TUB-5025',
        colorFinish: 'Branco',
        standardLengthMm: 6000,
        weightPerMeterKg: 0.85,
        costPrice: 45.0,
        salePrice: 85.0,
        active: true,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 100,
    number: 0,
  };

  const mockHardwares = {
    content: [
      {
        id: hardware1Id,
        name: 'Puxador Tubular Inox 40cm',
        commercialReference: 'PUX-INOX-40',
        skuCode: 'PUX-INOX-40',
        colorFinish: 'Inox Polido',
        unitMeasure: 'UN',
        costPrice: 35.0,
        salePrice: 70.0,
        active: true,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 100,
    number: 0,
  };

  const mockFilms = {
    content: [
      {
        id: film1Id,
        name: 'Película de Segurança PS4',
        commercialReference: 'PEL-SEG-PS4',
        skuCode: 'PEL-SEG-PS4',
        colorFinish: 'Transparente',
        costPrice: 25.0,
        salePrice: 50.0,
        active: true,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 100,
    number: 0,
  };

  const mockStockBalances = [
    {
      id: 'stk-001',
      materialId: glass1Id,
      materialType: 'GLASS',
      materialSku: 'VID-INC-8MM',
      materialName: 'Vidro Temperado Incolor 8mm',
      unitMeasure: 'M2',
      physicalQuantity: 15.0,
      reservedQuantity: 5.0,
      availableQuantity: 10.0,
      minimumStock: 4.0,
      orderPoint: 4.0,
      alertStatus: 'IN_STOCK',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-15T12:00:00Z',
    },
    {
      id: 'stk-002',
      materialId: glass2Id,
      materialType: 'GLASS',
      materialSku: 'VID-FUM-10MM',
      materialName: 'Vidro Laminado Fume 10mm',
      unitMeasure: 'M2',
      physicalQuantity: 2.0,
      reservedQuantity: 6.0,
      availableQuantity: -4.0,
      minimumStock: 5.0,
      orderPoint: 5.0,
      alertStatus: 'NEED_PURCHASE',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-15T12:00:00Z',
    },
    {
      id: 'stk-003',
      materialId: profile1Id,
      materialType: 'ALUMINUM_PROFILE',
      materialSku: 'ALUM-TUB-5025',
      materialName: 'Perfil Tubo Retangular 50x25',
      unitMeasure: 'M',
      physicalQuantity: 12.0,
      reservedQuantity: 10.0,
      availableQuantity: 2.0,
      minimumStock: 6.0,
      orderPoint: 6.0,
      alertStatus: 'ORDER_POINT',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-15T12:00:00Z',
    },
    {
      id: 'stk-004',
      materialId: hardware1Id,
      materialType: 'HARDWARE',
      materialSku: 'PUX-INOX-40',
      materialName: 'Puxador Tubular Inox 40cm',
      unitMeasure: 'UN',
      physicalQuantity: 20.0,
      reservedQuantity: 2.0,
      availableQuantity: 18.0,
      minimumStock: 5.0,
      orderPoint: 5.0,
      alertStatus: 'IN_STOCK',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-15T12:00:00Z',
    },
    {
      id: 'stk-005',
      materialId: film1Id,
      materialType: 'FILM',
      materialSku: 'PEL-SEG-PS4',
      materialName: 'Película de Segurança PS4',
      unitMeasure: 'M2',
      physicalQuantity: 30.0,
      reservedQuantity: 0.0,
      availableQuantity: 30.0,
      minimumStock: 10.0,
      orderPoint: 10.0,
      alertStatus: 'IN_STOCK',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-15T12:00:00Z',
    },
  ];

  const mockMovementsGlass1 = [
    {
      id: 'mov-001',
      stockItemId: 'stk-001',
      materialId: glass1Id,
      type: 'PURCHASE_ENTRY',
      quantity: 15.0,
      unitCost: 120.0,
      previousPhysicalQuantity: 0.0,
      newPhysicalQuantity: 15.0,
      previousReservedQuantity: 0.0,
      newReservedQuantity: 0.0,
      referenceDocument: 'NF-1088',
      supplier: 'Cebrace Vidros',
      reason: 'Compra inicial de lote padrão',
      registeredBy: 'Operador Almoxarifado',
      createdAt: '2026-11-10T10:30:00Z',
    },
    {
      id: 'mov-002',
      stockItemId: 'stk-001',
      materialId: glass1Id,
      type: 'PRODUCTION_RESERVATION',
      quantity: 5.0,
      unitCost: 120.0,
      previousPhysicalQuantity: 15.0,
      newPhysicalQuantity: 15.0,
      previousReservedQuantity: 0.0,
      newReservedQuantity: 5.0,
      referenceDocument: 'OS-2026-0042',
      supplier: undefined,
      reason: 'Reserva preventiva para O.S. de Janelas',
      registeredBy: 'Sistema Make-to-Order',
      createdAt: '2026-11-12T14:15:00Z',
    },
  ];

  beforeEach(() => {
    cy.viewport(1400, 900);

    // Intercepts gerais de catálogo
    cy.intercept('GET', '**/api/v1/catalog/glasses*', mockGlasses).as('getGlasses');
    cy.intercept('GET', '**/api/v1/catalog/aluminum-profiles*', mockProfiles).as('getProfiles');
    cy.intercept('GET', '**/api/v1/catalog/hardware*', mockHardwares).as('getHardwares');
    cy.intercept('GET', '**/api/v1/catalog/films*', mockFilms).as('getFilms');
    cy.intercept('GET', '**/api/v1/catalog/materials*', []).as('getMaterialsSummary');

    // Intercepts do módulo de Estoque / Almoxarifado
    // Nota: Cypress avalia intercepts em ordem reversa (último registrado tem prioridade)
    cy.intercept('GET', '**/api/v1/stock', mockStockBalances).as('getStockBalances');
    cy.intercept('GET', '**/api/v1/stock/movements*', []).as('getGenericMovements');
    cy.intercept('GET', `**/api/v1/stock/movements?materialId=${glass1Id}`, mockMovementsGlass1).as('getMovementsGlass1');
  });

  // =========================================================
  // 🟢 TC-22-E2E01: Navegação & Rota Unificada
  // =========================================================
  it('TC-22-E2E01: deve acessar a rota /catalogo pelo menu lateral e exibir banner com guia operacional', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // Valida título da página e selo de unificação
    cy.get('[data-cy="catalog-title"]')
      .should('be.visible')
      .and('contain', 'Catálogo de Materiais');

    cy.get('[data-testid="catalog-unified-badge"]')
      .should('be.visible')
      .and('contain', 'Almoxarifado & Kardex Integrados');

    // Valida banner com guia de operação (US-22.4)
    cy.contains('Central 360° do Cliente (Aba O.S.)').should('be.visible');
    cy.contains('Painel Kanban Fabril').should('be.visible');
    cy.contains('Ficha Técnica e Etiquetas').should('be.visible');

    // Valida link correspondente na barra lateral
    cy.get('aside a[href="/catalogo"]')
      .should('exist')
      .and('contain', 'Catálogo & Estoque');
  });

  // =========================================================
  // 🟢 TC-22-E2E02: Saldos e Badges nas 4 Abas do Catálogo
  // =========================================================
  it('TC-22-E2E02: deve exibir saldos consolidados e badges semânticas nas 4 abas do catálogo', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // --- 1. Aba Vidros ---
    cy.get('[data-cy="catalog-tab-glasses"]').should('be.visible');
    cy.get(`[data-testid="stock-physical-${glass1Id}"]`).should('contain', '15');
    cy.get(`[data-testid="stock-reserved-${glass1Id}"]`).should('contain', '5');
    cy.get(`[data-testid="stock-available-${glass1Id}"]`).should('contain', '10');

    // Vidro 2 em ruptura (disponível negativo)
    cy.get(`[data-testid="stock-available-${glass2Id}"]`)
      .should('contain', '-4')
      .and('have.class', 'text-rose-700');

    // --- 2. Aba Perfis de Alumínio ---
    cy.get('[data-cy="catalog-tab-profiles"]').click();
    cy.wait('@getProfiles');
    cy.get(`[data-testid="stock-physical-${profile1Id}"]`).should('contain', '12');
    cy.get(`[data-testid="stock-reserved-${profile1Id}"]`).should('contain', '10');
    cy.get(`[data-testid="stock-available-${profile1Id}"]`).should('contain', '2');

    // --- 3. Aba Ferragens ---
    cy.get('[data-cy="catalog-tab-hardwares"]').click();
    cy.wait('@getHardwares');
    cy.get(`[data-testid="stock-physical-${hardware1Id}"]`).should('contain', '20');
    cy.get(`[data-testid="stock-available-${hardware1Id}"]`).should('contain', '18');

    // --- 4. Aba Películas ---
    cy.get('[data-cy="catalog-tab-films"]').click();
    cy.wait('@getFilms');
    cy.get(`[data-testid="stock-physical-${film1Id}"]`).should('contain', '30');
    cy.get(`[data-testid="stock-available-${film1Id}"]`).should('contain', '30');
  });

  // =========================================================
  // 🟢 TC-22-E2E03: Filtros Rápidos de Compra
  // =========================================================
  it('TC-22-E2E03: deve filtrar reativamente materiais com necessidade de compra e atualizar contador', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // O contador de compras pendentes deve contabilizar vidro 2 (NEED_PURCHASE) e perfil 1 (ORDER_POINT) = 2
    cy.get('[data-testid="needs-purchase-count"]')
      .should('be.visible')
      .and('contain', '2');

    // Inicialmente ambos os vidros aparecem na tabela
    cy.contains('Vidro Temperado Incolor 8mm').should('be.visible');
    cy.contains('Vidro Laminado Fume 10mm').should('be.visible');

    // Ativa o filtro "Apenas com necessidade de compra"
    cy.get('[data-testid="filter-needs-purchase-label"]').click();

    // Apenas o vidro com necessidade de compra permanece visível
    cy.contains('Vidro Laminado Fume 10mm').should('be.visible');
    cy.contains('Vidro Temperado Incolor 8mm').should('not.exist');

    // Desativa o filtro
    cy.get('[data-testid="filter-needs-purchase-label"]').click();
    cy.contains('Vidro Temperado Incolor 8mm').should('be.visible');
  });

  // =========================================================
  // 🟢 TC-22-E2E04: Gaveta Lateral Kardex (KardexDrawer)
  // =========================================================
  it('TC-22-E2E04: deve abrir a gaveta lateral Kardex, exibir os 3 saldos consolidados e a linha do tempo', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // Clica no botão de extrato Kardex do Vidro 1
    cy.get(`[data-testid="kardex-button-${glass1Id}"]`).click();
    cy.wait('@getMovementsGlass1');

    // Valida abertura da gaveta
    cy.get('[data-cy="kardex-drawer"]').should('be.visible');
    cy.contains('#VID-INC-8MM').should('be.visible');
    cy.contains('Vidro Temperado Incolor 8mm').should('be.visible');

    // Valida os 3 saldos consolidados no topo
    cy.get('[data-testid="kardex-physical"]').should('contain', '15');
    cy.get('[data-testid="kardex-reserved"]').should('contain', '5');
    cy.get('[data-testid="kardex-available"]').should('contain', '10');

    // Valida os registros na linha do tempo
    cy.get('[data-testid="kardex-timeline"]').should('be.visible');
    cy.get('[data-testid="kardex-timeline-item"]').should('have.length', 2);
    cy.contains('Entrada de Compras').should('be.visible');
    cy.contains('NF-1088').should('be.visible');
    cy.contains('Reserva para Produção').should('be.visible');
    cy.contains('OS-2026-0042').should('be.visible');

    // Fecha via botão fechar
    cy.get('[data-cy="kardex-close-button"]').click();
    cy.get('[data-cy="kardex-drawer"]').should('not.exist');
  });

  // =========================================================
  // 🟢 TC-22-E2E05: Entrada de Compras (PurchaseEntryModal)
  // =========================================================
  it('TC-22-E2E05: deve registrar entrada manual de compra com documento livre (RN-05) e atualizar estoque', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // Clica no botão do header "Registrar Entrada / Compra"
    cy.get('[data-cy="register-purchase-button"]').click();
    cy.get('[data-cy="purchase-entry-modal"]').should('be.visible');

    // Intercepta a requisição de movimentação
    cy.intercept('POST', '**/api/v1/stock/movements', (req) => {
      expect(req.body.type).to.eq('PURCHASE_ENTRY');
      expect(req.body.quantity).to.eq(25);
      expect(req.body.unitCost).to.eq(115.5);
      expect(req.body.referenceDocument).to.eq('Pedido Balcão #9040');
      expect(req.body.supplier).to.eq('Distribuidora Asa Sul');
      expect(req.body.reason).to.eq('Reposição emergencial');

      req.reply({
        statusCode: 201,
        body: {
          id: 'mov-099',
          stockItemId: 'stk-001',
          materialId: glass1Id,
          type: 'PURCHASE_ENTRY',
          quantity: 25.0,
          unitCost: 115.5,
          previousPhysicalQuantity: 15.0,
          newPhysicalQuantity: 40.0,
          referenceDocument: 'Pedido Balcão #9040',
          supplier: 'Distribuidora Asa Sul',
          reason: 'Reposição emergencial',
          registeredBy: 'Operador Almoxarifado',
          createdAt: new Date().toISOString(),
        },
      });
    }).as('registerPurchase');

    // Preenche o formulário
    cy.get('[data-cy="purchase-material-select"]').select(glass1Id);
    cy.get('[data-cy="purchase-quantity-input"]').clear().type('25');
    cy.get('[data-cy="purchase-unit-cost-input"]').clear().type('115.50');
    cy.get('[data-cy="purchase-document-input"]').clear().type('Pedido Balcão #9040');
    cy.get('[data-cy="purchase-supplier-input"]').clear().type('Distribuidora Asa Sul');
    cy.get('[data-cy="purchase-reason-input"]').clear().type('Reposição emergencial');

    // Submete o formulário
    cy.get('[data-cy="btn-submit-purchase-entry"]').click();

    cy.wait('@registerPurchase');
    cy.get('[data-cy="purchase-entry-modal"]').should('not.exist');
  });

  // =========================================================
  // 🟢 TC-22-E2E06: Fluxo 2 em 1 no Cadastro de Materiais
  // =========================================================
  it('TC-22-E2E06: deve cadastrar novo material com entrada inicial de estoque simultânea (Fluxo 2 em 1)', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // Abre modal de seleção de tipo e escolhe Vidro
    cy.get('[data-cy="new-material-button"]').click();
    cy.get('[data-cy="material-type-glass"]').click();
    cy.get('[data-cy="glass-form-save-button"]').should('be.visible');

    // Preenche campos do vidro
    cy.get('[data-cy="glass-form-name"]').clear().type('Vidro Fantasia Pontilhado 4mm');
    cy.get('[data-cy="glass-form-ncm"]').clear().type('70031900');
    cy.get('[data-cy="glass-form-thickness"]').select('4');
    cy.get('[data-cy="glass-form-color-finish"]').clear().type('Pontilhado');
    cy.get('[data-cy="glass-form-cost-price"]').clear().type('85,00');
    cy.get('[data-cy="glass-form-sale-price"]').clear().type('160,00');

    // Ativa a seção 2 em 1 de entrada inicial
    cy.get('[data-cy="initial-stock-toggle"]').check();
    cy.get('[data-cy="initial-stock-quantity"]').should('be.visible');

    // Preenche os campos do lote inicial
    cy.get('[data-cy="initial-stock-quantity"]').clear().type('30');
    cy.get('[data-cy="initial-stock-unit-cost"]').clear().type('85.00');
    cy.get('[data-cy="initial-stock-minimum"]').clear().type('8');
    cy.get('[data-cy="initial-stock-supplier"]').clear().type('Vidros Brasil Ltda');
    cy.get('[data-cy="initial-stock-document"]').clear().type('Lote Inicial #501');
    cy.get('[data-cy="initial-stock-reason"]').clear().type('Cadastro de novo material com saldo inicial');

    // Intercepta criação com estoque simultâneo (POST /stock/materials)
    cy.intercept('POST', '**/api/v1/stock/materials', (req) => {
      expect(req.body.categoryType).to.eq('GLASS');
      expect(Boolean(req.body.initialStock)).to.equal(true);
      expect(req.body.initialStock.quantity).to.eq(30);
      expect(req.body.initialStock.unitCost).to.eq(85.0);
      expect(req.body.initialStock.minimumStock).to.eq(8);
      expect(req.body.initialStock.referenceDocument).to.eq('Lote Inicial #501');

      req.reply({
        statusCode: 201,
        body: {
          materialId: 'vid-new-001',
          categoryType: 'GLASS',
          material: { id: 'vid-new-001', name: 'Vidro Fantasia Pontilhado 4mm' },
          stockItem: {
            id: 'stk-new-001',
            materialId: 'vid-new-001',
            materialSku: 'VID-PON-4MM',
            materialName: 'Vidro Fantasia Pontilhado 4mm',
            category: 'GLASS',
            unitMeasure: 'M2',
            physicalQuantity: 30.0,
            reservedQuantity: 0.0,
            availableQuantity: 30.0,
            minimumStock: 8.0,
            alertStatus: 'IN_STOCK',
          },
          initialMovement: {
            id: 'mov-new-001',
            stockItemId: 'stk-new-001',
            materialId: 'vid-new-001',
            materialSku: 'VID-PON-4MM',
            materialName: 'Vidro Fantasia Pontilhado 4mm',
            type: 'PURCHASE_ENTRY',
            quantity: 30.0,
            unitCost: 85.0,
            previousPhysicalQuantity: 0.0,
            newPhysicalQuantity: 30.0,
            referenceDocument: 'Lote Inicial #501',
            createdAt: '2026-11-26T12:00:00Z',
          },
        },
      });
    }).as('createMaterialWithStock');

    // Salva o formulário
    cy.get('[data-cy="glass-form-save-button"]').click();

    cy.wait('@createMaterialWithStock');
    cy.contains('Vidro cadastrado com sucesso!').should('be.visible');
    cy.contains('Lote inicial registrado no estoque').should('be.visible');
  });

  // =========================================================
  // 🔴 TC-22-E2E07: Validação de Formulário no Modal de Compras
  // =========================================================
  it('TC-22-E2E07: deve exibir mensagens de erro Zod ao tentar submeter modal de compras com campos inválidos', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // Abre o modal de compras
    cy.get('[data-cy="register-purchase-button"]').click();
    cy.get('[data-cy="purchase-entry-modal"]').should('be.visible');

    // Tenta submeter sem preencher nada
    cy.get('[data-cy="btn-submit-purchase-entry"]').click();

    // Valida mensagens Zod nos campos obrigatórios
    cy.get('[data-cy="purchase-error-material"]')
      .should('be.visible')
      .and('contain', 'Selecione o insumo que chegou');

    cy.get('[data-cy="purchase-error-quantity"]')
      .should('be.visible')
      .and('contain', 'A quantidade recebida é obrigatória');

    cy.get('[data-cy="purchase-error-cost"]')
      .should('be.visible')
      .and('contain', 'O preço de compra unitário é obrigatório (RN-06)');

    // Testa quantidade negativa / zerada
    cy.get('[data-cy="purchase-quantity-input"]').clear().type('0');
    cy.get('[data-cy="btn-submit-purchase-entry"]').click();
    cy.get('[data-cy="purchase-error-quantity"]')
      .should('be.visible')
      .and('contain', 'A quantidade recebida deve ser maior que zero');
  });

  // =========================================================
  // 🔴 TC-22-E2E08: Acessibilidade & Escape
  // =========================================================
  it('TC-22-E2E08: deve permitir fechar o modal de compras e a gaveta Kardex via tecla Escape e backdrop', () => {
    cy.visit('/catalogo');
    cy.wait(['@getGlasses', '@getStockBalances']);

    // --- 1. Fechamento do Modal de Compras via Escape ---
    cy.get('[data-cy="register-purchase-button"]').click();
    cy.get('[data-cy="purchase-entry-modal"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-cy="purchase-entry-modal"]').should('not.exist');

    // --- 2. Fechamento do Modal de Compras via Backdrop ---
    cy.get('[data-cy="register-purchase-button"]').click();
    cy.get('[data-cy="purchase-entry-modal"]').should('be.visible');
    cy.get('[data-cy="purchase-backdrop"]').click({ force: true });
    cy.get('[data-cy="purchase-entry-modal"]').should('not.exist');

    // --- 3. Fechamento da Gaveta Kardex via Backdrop ---
    cy.get(`[data-testid="kardex-button-${glass1Id}"]`).click();
    cy.get('[data-cy="kardex-drawer"]').should('be.visible');
    cy.get('[data-cy="kardex-drawer-backdrop"]').click({ force: true });
    cy.get('[data-cy="kardex-drawer"]').should('not.exist');

    // --- 4. Fechamento da Gaveta Kardex via Escape ---
    cy.get(`[data-testid="kardex-button-${glass1Id}"]`).click();
    cy.get('[data-cy="kardex-drawer"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-cy="kardex-drawer"]').should('not.exist');
  });
});
