/// <reference types="cypress" />

// cypress/e2e/budgets/budget-to-order.cy.ts

declare namespace Cypress {
  interface Chainable {
    createClientAPI(body?: any): Chainable<Response<any>>;
    createProductAPI(body?: any): Chainable<Response<any>>;
    createGlassAPI(body?: any): Chainable<Response<any>>;
    createAluminumProfileAPI(body?: any): Chainable<Response<any>>;
    createHardwareAPI(body?: any): Chainable<Response<any>>;
  }
}

describe('Testes E2E - Ciclo de Orçamentos e Conversão para Pedido (Deep Copy)', () => {
  let clientData: any;
  let productData: any;
  let windowDimensionsData: any;
  
  // Variáveis para guardar os nomes gerados dos materiais
  let glassData: any;
  let profileData: any;
  let hardwareData: any;

  before(() => {
    // 1. Setup de Massa de Dados Dinâmica via API
    cy.createClientAPI().then((response) => {
      expect(response.status).to.eq(201);
      clientData = response.body; 
    });

    const nomeEsquadria = `Esquadria E2E ${Date.now()}`;
    cy.createProductAPI({ name: nomeEsquadria }).then((response) => {
      expect(response.status).to.eq(201);
      productData = { id: response.body.id || response.body.data?.id, name: nomeEsquadria }; 
    });

    // Criando os Materiais e guardando o ID + Nome
    const nomeVidro = `Vidro Temperado E2E ${Date.now()}`;
    cy.createGlassAPI({ name: nomeVidro }).then((response) => {
      expect(response.status).to.eq(201);
      glassData = { id: response.body.id || response.body.data?.id, name: nomeVidro };
    });

    const profileIsHandle = Math.random() > 0.5;
    const hardwareIsHandle = Math.random() > 0.5;

    const nomePerfil = `Perfil Aluminio E2E ${Date.now()}`;
    cy.createAluminumProfileAPI({ name: nomePerfil, isHandle: profileIsHandle }).then((response) => {
      expect(response.status).to.eq(201);
      profileData = { 
        id: response.body.id || response.body.data?.id, 
        name: nomePerfil,
        isHandle: profileIsHandle,
        categoryType: 'PROFILE'
      };
    });

    const nomeFerragem = `Fechadura E2E ${Date.now()}`;
    cy.createHardwareAPI({ name: nomeFerragem, isHandle: hardwareIsHandle }).then((response) => {
      expect(response.status).to.eq(201);
      hardwareData = { 
        id: response.body.id || response.body.data?.id, 
        name: nomeFerragem,
        isHandle: hardwareIsHandle,
        categoryType: 'HARDWARE'
      };
    });
  });

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/orcamentos');
  });

  after(() => {
    cy.log('Limpando massa de dados gerada no teste...');
    
    // Atenção à ordem: se houver dependência (Foreign Key), delete
    // as tabelas filhas primeiro.
    
    if (productData?.id) cy.deleteEntityAPI('catalog/products', productData.id);
    if (glassData?.id) cy.deleteEntityAPI('catalog/glasses', glassData.id);
    if (profileData?.id) cy.deleteEntityAPI('catalog/aluminum-profiles', profileData.id);
    if (hardwareData?.id) cy.deleteEntityAPI('catalog/hardware', hardwareData.id);
    
    // Opcional: deletar o cliente gerado 
    // (Pode falhar se o backend bloquear deleção de cliente que possui Ordem de Serviço vinculada)
    
  });

  it('deve realizar o ciclo completo de orçamentos: listar, criar e converter (Deep Copy)', () => {
    // ---------------------------------------------------------
    // A. LISTAGEM E NAVEGAÇÃO
    // ---------------------------------------------------------
    cy.get('h2').contains('Orçamentos').should('be.visible');
    
    // Botão de ação -> sem force
    cy.contains('Novo Orçamento').click(); 
    cy.url().should('include', '/orcamentos/novo');

    // ---------------------------------------------------------
    // B. SELEÇÃO DO CLIENTE
    // ---------------------------------------------------------
    cy.intercept('GET', '**/clientes*').as('searchCustomers');
    cy.get('[data-cy="input-busca-cliente"]')
      .should('be.visible')
      .clear({ force: true })
      .type(clientData.nomeCompleto, { force: true });
    
    cy.wait('@searchCustomers');
    
    // Ação de seleção em dropdown
    cy.get('[data-cy="dropdown-opcao-cliente"]')
      .contains(clientData.nomeCompleto)
      .should('be.visible')
      .click();

    cy.get('[data-cy="card-cliente-selecionado"]').should('be.visible');

    // ---------------------------------------------------------
    // C. INSERÇÃO E CONFIGURAÇÃO DA ESQUADRIA
    // ---------------------------------------------------------
    cy.get('[data-cy="btn-adicionar-esquadria"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.get('div[aria-modal="true"]').should('be.visible');
    cy.get('input[placeholder="Buscar por nome da esquadria..."]')
      .should('be.visible')
      .clear({ force: true })
      .type(productData.name, { force: true });

    cy.get(`button[aria-label="Selecionar esquadria ${productData.name}"]`)
      .should('be.visible')
      .click();

    // ---------------------------------------------------------
    // D. PREENCHIMENTO NO BUILDER DA ESQUADRIA (Step 1)
    // ---------------------------------------------------------
    cy.get('div[aria-modal="true"]').should('be.visible'); 
    cy.contains(productData.name).should('be.visible');

    const dynamicGlassQty = Math.floor(Math.random() * 4) + 1;
    const dynamicProfileQty = Math.floor(Math.random() * 8) + 2;
    const dynamicHardwareQty = Math.floor(Math.random() * 3) + 1;
    const dynamicWidth = Math.floor(Math.random() * 500) + 50;
    const dynamicHeight = Math.floor(Math.random() * 500) + 50;
    const dynamicQuantity = Math.floor(Math.random() * 10) + 1;

    windowDimensionsData = {
      width: dynamicWidth, 
      height: dynamicHeight, 
      quantity: dynamicQuantity,
      glassQty: dynamicGlassQty,
      profileQty: dynamicProfileQty,
      hardwareQty: dynamicHardwareQty
    };

    cy.get('#modal-width-input').should('be.visible').clear({ force: true }).type(String(windowDimensionsData.width), { force: true });
    cy.get('#modal-height-input').should('be.visible').clear({ force: true }).type(String(windowDimensionsData.height), { force: true });
    cy.get('#modal-quantity-input').should('be.visible').clear({ force: true }).type(String(windowDimensionsData.quantity), { force: true });

    cy.contains('button', 'Próximo').should('be.visible').click();

    // ---------------------------------------------------------
    // E. PREENCHIMENTO DE MATERIAIS (Step 2)
    // ---------------------------------------------------------
    cy.contains('button', '+ Vidro').should('exist').click();
    cy.get('div[aria-modal="true"]').find('select').eq(0).should('exist').select(glassData.id, { force: true }); 
    cy.get('div[aria-modal="true"]').find('input[type="number"]').eq(0).should('not.be.disabled').clear({ force: true }).type(String(dynamicGlassQty), { force: true });

    cy.contains('button', '+ Perfil').should('exist').click();
    cy.get('div[aria-modal="true"]').find('select').eq(1).should('exist').select(profileData.id, { force: true });
    cy.get('div[aria-modal="true"]').find('input[type="number"]').eq(1).should('not.be.disabled').clear({ force: true }).type(String(dynamicProfileQty), { force: true });

    cy.contains('button', '+ Ferragem').should('exist').click();
    cy.get('div[aria-modal="true"]').find('select').eq(2).should('exist').select(hardwareData.id, { force: true });
    cy.get('div[aria-modal="true"]').find('input[type="number"]').eq(2).should('not.be.disabled').clear({ force: true }).type(String(dynamicHardwareQty), { force: true });

    cy.contains('button', 'Próximo').should('be.visible').click();

    // ---------------------------------------------------------
    // F. CONFIGURAÇÃO DA MECÂNICA E PUXADOR (Step 3)
    // ---------------------------------------------------------
    cy.contains('Mecânica da Folha & Puxador').should('be.visible');

    const handleMaterial = [profileData, hardwareData].find(item => item.isHandle === true);

    if (handleMaterial) {
      cy.log(`Cenário Dinâmico: COM puxador (${handleMaterial.categoryType})`);
      cy.get('#select-handle-material').should('be.visible').select(handleMaterial.id, { force: true });

      if (handleMaterial.categoryType === 'PROFILE') {
        cy.contains('button', 'Perfil Puxador').should('not.be.disabled').click();
        cy.get('#handle-coverage-select').should('be.visible');
      } else if (handleMaterial.categoryType === 'HARDWARE') {
        cy.contains('button', 'Tubular / Barra').should('not.be.disabled').click();
      }
      cy.get('#handle-side-select').should('be.visible');
    } else {
      cy.log('Cenário Dinâmico: SEM puxador criado');
      cy.get('#select-handle-material').should('have.value', '');
      cy.contains('button', 'Sem Puxador').should('not.be.disabled').click();
      cy.get('#handle-side-select').should('not.exist');
      cy.get('#handle-coverage-select').should('not.exist');
    }

    // ---------------------------------------------------------
    // G. CONFIGURAÇÃO DA FURAÇÃO NO ALUMÍNIO (Step 3)
    // ---------------------------------------------------------
    
    // O Cypress busca o título da seção e desce o scroll da modal até ele ficar visível
    cy.contains('Furação no Alumínio')
      .scrollIntoView()
      .should('be.visible');

    const randomHoleCount = Math.floor(Math.random() * 7); 
    windowDimensionsData.holeCount = randomHoleCount; 

    if (randomHoleCount === 0) {
      cy.log('Cenário Dinâmico: SEM Furação (0 furos)');
      cy.contains('button', 'Sem furos').click();
      cy.get('#hole-count-input').should('have.value', ''); 
      cy.get('#hole-division-select').should('be.disabled');
    } else {
      cy.log(`Cenário Dinâmico: COM Furação (${randomHoleCount} furos)`);
      cy.get('#hole-count-input').clear({ force: true }).type(String(randomHoleCount), { force: true });
      
      const isCustomDistance = Math.random() > 0.5;
      
      if (isCustomDistance) {
        cy.log('Cenário Dinâmico: Furação com Distâncias Manuais (CUSTOM_DISTANCE)');
        cy.get('#hole-division-select').should('not.be.disabled').select('CUSTOM_DISTANCE', { force: true });
        
        for (let i = 1; i <= randomHoleCount; i++) {
          const distanceValue = i * 50; 
          cy.get(`#hole-distance-input-${i}`)
            .should('be.visible')
            .clear({ force: true })
            .type(String(distanceValue), { force: true });
        }
      } else {
        cy.log('Cenário Dinâmico: Furação Distribuída Automaticamente (EQUAL)');
        cy.get('#hole-division-select').should('not.be.disabled').select('EQUAL', { force: true });
        cy.contains('Espaçamento médio calculado:').should('be.visible');
        cy.get('input[id^="hole-distance-input-"]').should('not.exist');
      }
    }

    // ---------------------------------------------------------
    // H. OBSERVAÇÕES DA ESQUADRIA (Step 3)
    // ---------------------------------------------------------
    const hasNotes = Math.random() > 0.5;
    windowDimensionsData.notes = hasNotes ? `Obs E2E: Instalação urgente. Cliente exigente. Ref: ${Date.now()}` : '';

    if (hasNotes) {
      cy.log('Cenário Dinâmico: COM Observações');
      cy.get('#modal-notes-input')
        .should('be.visible')
        .clear({ force: true })
        .type(windowDimensionsData.notes, { force: true });
    } else {
      cy.log('Cenário Dinâmico: SEM Observações');
      cy.get('#modal-notes-input').should('have.value', '');
    }

    cy.contains('button', 'Próximo').should('be.visible').click();
    cy.get('#btn-adicionar').click();

   // ---------------------------------------------------------
    // I. CONDIÇÕES COMERCIAIS E FINANCEIRAS (Step 4)
    // ---------------------------------------------------------
    
    // O Cypress busca o título da seção e desce o scroll até ele ficar visível
    cy.contains('Condições Comerciais')
      .scrollIntoView()
      .should('be.visible');

    // 1. Mão de Obra
    const hasLaborCost = Math.random() > 0.5;
    windowDimensionsData.laborCost = hasLaborCost ? Math.floor(Math.random() * 400) + 100 : 0;
    
    if (hasLaborCost) {
      cy.log(`Cenário Dinâmico: COM Mão de Obra (R$ ${windowDimensionsData.laborCost})`);
      cy.get('#budget-labor-cost')
        .should('be.visible')
        .clear({ force: true })
        .type(String(windowDimensionsData.laborCost), { force: true });
    } else {
      cy.log('Cenário Dinâmico: SEM Mão de Obra');
      cy.get('#budget-labor-cost').should('have.value', ''); 
    }

    // NOVO: Taxa de Frete / Entrega (apenas para garantir que a variável exista para a validação)
    windowDimensionsData.freightCost = 0; // Exemplo: se você adicionar o input no step 4 depois, mude aqui.

    // 2. Desconto 
    const applyDiscount = Math.random() > 0.3; 
    windowDimensionsData.financial = {
      hasDiscount: applyDiscount,
      discountType: 'NONE',
      discountValue: 0
    };

    if (applyDiscount) {
      cy.log('Cenário Dinâmico: APLICANDO Desconto');
      const isPercentage = Math.random() > 0.5;
      
      windowDimensionsData.financial.discountType = isPercentage ? 'PERCENTUAL' : 'VALOR_FIXO';
      windowDimensionsData.financial.discountValue = isPercentage 
        ? Math.floor(Math.random() * 15) + 1 
        : Math.floor(Math.random() * 90) + 10; 
      
      cy.contains('button', isPercentage ? '%' : 'R$').should('be.visible').click();
      
      cy.get('#budget-discount')
        .should('be.visible')
        .clear({ force: true })
        .type(String(windowDimensionsData.financial.discountValue), { force: true });

      cy.get('#budget-discount').should('not.have.class', 'border-error');
    } else {
      cy.log('Cenário Dinâmico: SEM Desconto');
      cy.get('#budget-discount').clear({ force: true });
    }

    // 3. Condição de Pagamento
    const randomPaymentIndex = Math.floor(Math.random() * 3) + 1;
    cy.get('#budget-payment-condition')
      .should('be.visible')
      .select(randomPaymentIndex, { force: true });
    
    cy.get('#budget-payment-condition').invoke('val').then(val => {
      windowDimensionsData.paymentCondition = val;
    });

    // 4. Validade da Proposta
    const validityDays = [7, 15, 30][Math.floor(Math.random() * 3)];
    cy.log(`Cenário Dinâmico: Validade de +${validityDays} dias`);
    
    cy.contains('button', `+${validityDays} dias`).should('be.visible').click();
      
    cy.get('#budget-valid-until').should('not.have.value', '');
    cy.get('#budget-valid-until').invoke('val').then(val => {
      windowDimensionsData.validUntil = val;
    });

    // 5. Condições Comerciais (Textarea)
    const hasCommercialNotes = Math.random() > 0.5;
    windowDimensionsData.commercialConditions = hasCommercialNotes 
      ? `Condições E2E: Transferência PIX de 50%. Ref: ${Date.now()}` 
      : '';

    if (hasCommercialNotes) {
      cy.get('#budget-commercial-conditions')
        .clear({ force: true })
        .type(windowDimensionsData.commercialConditions, { force: true });
    }

    // 6. Observações Gerais (Textarea)
    const hasGeneralNotes = Math.random() > 0.5;
    windowDimensionsData.notes = hasGeneralNotes 
      ? `Obs E2E: Agendar instalação no período da tarde. Ref: ${Date.now()}` 
      : '';

    if (hasGeneralNotes) {
      cy.get('#budget-notes')
        .clear({ force: true })
        .type(windowDimensionsData.notes, { force: true });
    }

    cy.get('#btn-salvar-proposta').should('be.visible').click();

    cy.get('[data-testid="btn-approve-budget"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    // ---------------------------------------------------------
    // J. APROVAÇÃO DO ORÇAMENTO E GERAÇÃO DA ORDEM DE SERVIÇO
    // ---------------------------------------------------------
    cy.get('[data-testid="order-approval-modal"]').should('be.visible');

    const channels = ['WHATSAPP', 'PRESENCIAL', 'TELEFONE', 'EMAIL'] as const;
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    
    const channelLabels: Record<typeof randomChannel, string> = {
      WHATSAPP: 'WhatsApp',
      PRESENCIAL: 'Presencial',
      TELEFONE: 'Telefone',
      EMAIL: 'E-mail',
    };

    cy.contains('button', channelLabels[randomChannel]).should('be.visible').click({ force: true });

    const randomDaysAhead = Math.floor(Math.random() * 15) + 15; 
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randomDaysAhead);
    const formattedDeliveryDate = futureDate.toISOString().split('T')[0]; 
    
    cy.get('[data-testid="input-data-entrega"]')
      .should('be.visible')
      .click({ force: true })
      .clear({ force: true })
      .type(formattedDeliveryDate, { force: true });

    const hasApprovalNotes = Math.random() > 0.4; 
    const approvalNotesText = hasApprovalNotes
      ? `Obs Aprovação E2E: Cliente confirmou medidas por mensagem. Ref: ${Date.now()}`
      : '';

    if (hasApprovalNotes) {
      cy.get('[data-testid="input-observacoes"]')
        .should('be.visible')
        .clear({ force: true })
        .type(approvalNotesText, { force: true });
    } else {
      cy.get('[data-testid="input-observacoes"]').should('have.value', '');
    }

    cy.get('[data-testid="btn-confirm-approval"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    cy.get('[data-testid="order-approval-modal"]').should('not.exist');
    
    cy.get('[data-testid="btn-advance-production"]').should('be.visible').click();
    cy.get('[data-testid="btn-complete-production"]').should('be.visible').click();

    // ---------------------------------------------------------
    // K. VALIDAÇÃO FINAL DA ORDEM DE SERVIÇO (OrderItemList)
    // ---------------------------------------------------------
    cy.log('Validando se os dados do pedido (Ordem de Serviço) batem com o configurado...');

    cy.get('[data-testid="order-items-container"]').should('be.visible');

    cy.get('tbody tr').first().within(() => {
      cy.contains(productData.name, { matchCase: false }).should('be.visible');
      cy.contains(`${windowDimensionsData.width} × ${windowDimensionsData.height} mm`).should('be.visible');
      cy.get('td').eq(4).should('contain', String(windowDimensionsData.quantity));

      cy.contains(glassData.name, { matchCase: false }).should('exist');
      cy.contains(profileData.name, { matchCase: false }).should('exist');
      cy.contains(hardwareData.name, { matchCase: false }).should('exist');
    });

    // ---------------------------------------------------------
    // L. VALIDAÇÃO DO RESUMO FINANCEIRO (OrderFinancialSummaryCard)
    // ---------------------------------------------------------
    cy.log('Validando o Resumo Financeiro da Ordem de Serviço...');

    cy.get('[data-testid="order-financial-summary-card"]')
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains('Valor Bruto:').should('be.visible');
        cy.contains('Valor Líquido:').should('be.visible');

        // Valida a Taxa de Frete apenas se ela existir (atualmente setada para 0)
        if (windowDimensionsData.freightCost > 0) {
          cy.contains('Taxa de Frete:').should('be.visible');
        } else {
          cy.contains('Taxa de Frete:').should('not.exist');
        }

        if (windowDimensionsData.financial.hasDiscount) {
          cy.contains('Desconto Comercial:').should('be.visible');
        } else {
          cy.contains('Desconto Comercial:').should('not.exist');
        }

        cy.contains('Condição de Pagamento:').should('be.visible');
      });

    // ---------------------------------------------------------
    // M. VALIDAÇÃO DO CRONOGRAMA DE ENTREGA (OrderDeliveryTimelineCard)
    // ---------------------------------------------------------
    cy.log('Validando o Cronograma de Entrega da Ordem de Serviço...');

    // Substituímos o scrollTo genérico pelo scrollIntoView() direto no elemento.
    // O Cypress acha o contêiner exato que tem rolagem e desce até o card ficar visível.
    cy.get('[data-testid="order-delivery-timeline-card"]')
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains('Cronograma de Entrega').should('be.visible');
        cy.contains('Previsão de Entrega:').should('be.visible');

        // Se houveram observações na aprovação, verifica a label de Observações Operacionais
        if (hasApprovalNotes) {
          cy.contains('Observações Operacionais:').should('be.visible');
        }
      });

      // N. VALIDAÇÃO DA ORIGEM E APROVAÇÃO COMERCIAL (OrderOriginBudgetCard)
    // ---------------------------------------------------------
    cy.log('Validando Origem & Aprovação Comercial da Ordem de Serviço...');

    cy.get('[data-testid="order-origin-budget-card"]')
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains('Origem & Aprovação Comercial').should('be.visible');

        // Valida o Canal de Aprovação que foi selecionado dinamicamente no Step J
        cy.contains('Canal de Aprovação').should('be.visible');
        cy.contains(channelLabels[randomChannel]).should('be.visible');

        // Valida a data de aprovação (Data atual)
        cy.contains('Data de Aprovação').should('be.visible');

        // Valida os dados do cliente (Nome, obrigatório)
        cy.contains(clientData.nomeCompleto).should('be.visible');

        // Telefones e Endereços (se o mock da API no before() gerou esses campos)
        if (clientData.telefone) {
          cy.contains(clientData.telefone).should('be.visible');
        }
        if (clientData.endereco) {
          cy.contains(clientData.endereco).should('be.visible');
        }
      });
  });
});