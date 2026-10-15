// cypress/support/e2e.ts

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    highlight(durationMs?: number): Chainable<JQuery<HTMLElement>>;
    createClientAPI(clientOverrides?: any): Chainable<Response<any>>;
    createProductAPI(productOverrides?: any): Chainable<Response<any>>;
    createGlassAPI(glassOverrides?: any): Chainable<Response<any>>;
    createAluminumProfileAPI(profileOverrides?: any): Chainable<Response<any>>;
    createHardwareAPI(hardwareOverrides?: any): Chainable<Response<any>>;
    // Novo comando genérico para limpeza
    deleteEntityAPI(endpoint: string, id: string | number): Chainable<Response<any>>;
  }
}

// ==========================================
// 1. COMANDO HIGHLIGHT
// ==========================================
Cypress.Commands.add('highlight', { prevSubject: 'element' }, (subject, durationMs = 1500) => {
  cy.wrap(subject).then(($el) => {
    const originalOutline = $el.css('outline');
    const originalBoxShadow = $el.css('box-shadow');$el.css({
      outline: '3px solid #0284c7',
      'box-shadow': '0 0 16px rgba(2, 132, 199, 0.8)',
      transition: 'all 0.3s ease',
    });
    
    setTimeout(() => {
      $el.css({
        outline: originalOutline,
        'box-shadow': originalBoxShadow,
      });
    }, durationMs);
  });
  return cy.wrap(subject);
});

// ==========================================
// 2. FUNÇÕES AUXILIARES PARA DADOS DINÂMICOS
// ==========================================
const generateUniqueString = (prefix: string) => `${prefix} ${Date.now()}`;
const getRandomEnum = (enumArray: any[]) => enumArray[Math.floor(Math.random() * enumArray.length)];
const generateRandomCPF = () => {
  const n = () => Math.floor(Math.random() * 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-00`; 
};
const generateRandomNCM = () => {
  return String(Math.floor(10000000 + Math.random() * 90000000));
};

// ==========================================
// 3. CONFIGURAÇÃO DINÂMICA DA URL
// ==========================================
// Busca a variável de ambiente 'apiUrl' configurada no cypress.config.ts
// Se não encontrar, usa o localhost como fallback seguro de desenvolvimento
const getApiUrl = () => Cypress.env('apiUrl') || 'http://localhost:8081/api/v1';

// ==========================================
// 4. COMANDOS DE CRIAÇÃO E DELEÇÃO VIA API
// ==========================================

Cypress.Commands.add('deleteEntityAPI', (endpoint: string, id: string | number) => {
  // O cy.log entra ANTES da requisição para não misturar contexto assíncrono/síncrono
  cy.log(`Limpeza -> [${endpoint}/${id}]`);
  
  return cy.request({
    method: 'DELETE',
    url: `${getApiUrl()}/${endpoint}/${id}`,
    failOnStatusCode: false // não quebra o teste se a exclusão falhar
  });
});

Cypress.Commands.add('createClientAPI', (clientOverrides = {}) => {
  const personTypes = ['FISICA', 'JURIDICA'];
  const ufs = ['PB', 'SP', 'RJ', 'RN', 'PE', 'CE'];

  const dynamicClient = {
    nomeCompleto: generateUniqueString("Cliente Automação"),
    personType: getRandomEnum(personTypes),
    documento: generateRandomCPF(), 
    telefone: `(83) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    email: `teste.e2e.${Date.now()}@alumigest.com`,
    cep: "58300-000",
    logradouro: "Rua Cypress",
    numero: String(Math.floor(Math.random() * 1000)),
    complemento: "Sala A",
    bairro: "Centro",
    cidade: "Joao Pessoa",
    uf: getRandomEnum(ufs),
    observacoes: "Gerado dinamicamente"
  };

  return cy.request({
    method: 'POST',
    url: `${getApiUrl()}/clients`, 
    body: { ...dynamicClient, ...clientOverrides },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 201) {
      throw new Error(`Falha ao criar cliente via API. Status: ${response.status}`);
    }
    return response;
  });
});

Cypress.Commands.add('createProductAPI', (productOverrides = {}) => {
  const templateTypes = ['SLIDING_DOOR_1F', 'SLIDING_DOOR_2F', 'SWING_DOOR_1F', 'AWNING_WINDOW_1F', 'FIXED_PANEL'];
  const dynamicProduct = {
    name: generateUniqueString("Esquadria E2E"),
    templateType: getRandomEnum(templateTypes),
    templateConfig: {
      profileMm: 25.0,
      aluminumColor: "Branco",
      glassColor: "Incolor",
      openingDirection: "LEFT_TO_RIGHT"
    },
    categoryRequirements: ["GLASS", "PROFILE", "HARDWARE"]
  };

  return cy.request({
    method: 'POST',
    url: `${getApiUrl()}/catalog/products`, 
    body: { ...dynamicProduct, ...productOverrides },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 201) throw new Error(`Falha ao criar produto via API.`);
    return response;
  });
});

Cypress.Commands.add('createGlassAPI', (glassOverrides = {}) => {
  const dynamicGlass = {
    name: generateUniqueString("Vidro Temperado E2E"),
    colorFinish: "Incolor",
    ncmCode: generateRandomNCM(),
    thicknessMm: 8.0,
    costPrice: 50.0,
    salePrice: 150.0,
    maxWidthMm: 2200.0,
    maxHeightMm: 3200.0,
    familyCode: "VIDROS_E2E"
  };

  return cy.request({
    method: 'POST',
    url: `${getApiUrl()}/catalog/glasses`, 
    body: { ...dynamicGlass, ...glassOverrides },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 201) throw new Error(`Falha API (Vidro)`);
    return response;
  });
});

Cypress.Commands.add('createAluminumProfileAPI', (profileOverrides = {}) => {
  const dynamicProfile = {
    name: generateUniqueString("Perfil E2E"),
    commercialReference: `REF-${Math.floor(Math.random() * 1000)}`,
    commercialLine: "Suprema",
    ncmCode: generateRandomNCM(),
    colorFinish: "Branco",
    standardLengthM: 6.0,
    costPrice: 40.0,
    salePrice: 90.0,
    weight: 1.5,
    familyCode: "PERFIS_E2E",
    isHandle: false
  };

  return cy.request({
    method: 'POST',
    url: `${getApiUrl()}/catalog/aluminum-profiles`,
    body: { ...dynamicProfile, ...profileOverrides },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 201) throw new Error(`Falha API (Perfil)`);
    return response;
  });
});

Cypress.Commands.add('createHardwareAPI', (hardwareOverrides = {}) => {
  const dynamicHardware = {
    skuCode: `SKU-${Date.now().toString().slice(-6)}`,
    name: generateUniqueString("Ferragem E2E"),
    unitMeasure: "UN", 
    calculationType: "UNIT", 
    costPrice: 10.0,
    salePrice: 35.0,
    ncmCode: generateRandomNCM(),
    familyCode: "FERRAGENS_E2E",
    isHandle: false
  };

  return cy.request({
    method: 'POST',
    url: `${getApiUrl()}/catalog/hardware`,
    body: { ...dynamicHardware, ...hardwareOverrides },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 201) throw new Error(`Falha API (Ferragem)`);
    return response;
  });
});