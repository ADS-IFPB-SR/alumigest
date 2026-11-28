// cypress/support/e2e.ts

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    highlight(durationMs?: number): Chainable<JQuery<HTMLElement>>;
    selectRequiredMaterialsStep2(): Chainable<void>;
    createClientAPI(clientOverrides?: any): Chainable<Response<any>>;
    createProductAPI(body?: any): Chainable<Response<any>>;
    createGlassAPI(glassOverrides?: any): Chainable<Response<any>>;
    createAluminumProfileAPI(profileOverrides?: any): Chainable<Response<any>>;
    createHardwareAPI(hardwareOverrides?: any): Chainable<Response<any>>;
    // Novo comando genérico para limpeza
    deleteEntityAPI(endpoint: string, id: string | number): Chainable<Response<any>>;
  }
}

// ==========================================
// 0. AUTENTICAÇÃO JWT E2E (SPRING SECURITY 6 STATELESS)
// ==========================================
const getApiUrl = () => Cypress.env('apiUrl') || 'http://localhost:8081/api/v1';
const getE2eEmail = () => Cypress.env('e2eEmail') || 'e2e@alumigest.com';
const getE2ePassword = () => Cypress.env('e2ePassword') || 'AlumiGestE2E#2026!';
const SKIP_AUTO_AUTH_HEADER = 'x-skip-auto-auth';

let cachedAuthToken: string | null = null;

function isAutoAuthDisabled(): boolean {
  return Cypress.env('skipAutoAuth') === true;
}

function hasHeaderCaseInsensitive(headers: Record<string, unknown> | undefined, name: string): boolean {
  if (!headers) {
    return false;
  }
  const target = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === target);
}

function stripSkipAutoAuthHeader(
  headers?: Record<string, unknown>
): { cleanedHeaders?: Record<string, unknown>; skipRequested: boolean } {
  if (!headers) {
    return { cleanedHeaders: headers, skipRequested: false };
  }
  let skipRequested = false;
  const cleanedHeaders: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === SKIP_AUTO_AUTH_HEADER) {
      skipRequested = true;
    } else {
      cleanedHeaders[key] = value;
    }
  }
  return { cleanedHeaders, skipRequested };
}

function normalizeRequestOptions(args: unknown[]): Partial<Cypress.RequestOptions> {
  const [first, second, third] = args;
  if (typeof first === 'object' && first !== null) {
    return { ...(first as Partial<Cypress.RequestOptions>) };
  }
  if (typeof first === 'string' && typeof second === 'string') {
    return {
      method: first as Cypress.HttpMethod,
      url: second,
      ...(third !== undefined ? { body: third as Cypress.RequestBody } : {}),
    };
  }
  return {
    url: String(first),
    ...(second !== undefined ? { body: second as Cypress.RequestBody } : {}),
  };
}

function shouldAttachAuthHeader(url?: string, headers?: Record<string, unknown>): boolean {
  if (isAutoAuthDisabled() || !url || !url.includes('/api/') || url.includes('/auth/login')) {
    return false;
  }
  return !hasHeaderCaseInsensitive(headers, 'authorization');
}

function ensureE2eAuthToken(): void {
  if (isAutoAuthDisabled() || cachedAuthToken) {
    return;
  }
  cy.request({
    method: 'POST',
    url: `${getApiUrl()}/auth/login`,
    body: {
      email: getE2eEmail(),
      password: getE2ePassword(),
    },
    log: false,
  }).then((response) => {
    const token = response.body?.token;
    if (!token || typeof token !== 'string') {
      throw new Error(`Falha ao autenticar operador E2E. Status: ${response.status}`);
    }
    cachedAuthToken = token;
  });
}

Cypress.Commands.overwrite('request', (originalFn, ...args: unknown[]) => {
  const options = normalizeRequestOptions(args);
  const { cleanedHeaders, skipRequested } = stripSkipAutoAuthHeader(
    options.headers as Record<string, unknown> | undefined
  );
  const sanitizedOptions = skipRequested
    ? { ...options, headers: cleanedHeaders }
    : options;

  if (skipRequested || !shouldAttachAuthHeader(sanitizedOptions.url, cleanedHeaders)) {
    return originalFn(sanitizedOptions as Cypress.RequestOptions);
  }

  if (cachedAuthToken) {
    return originalFn({
      ...sanitizedOptions,
      headers: {
        ...sanitizedOptions.headers,
        Authorization: `Bearer ${cachedAuthToken}`,
      },
    } as Cypress.RequestOptions);
  }

  return originalFn({
    method: 'POST',
    url: `${getApiUrl()}/auth/login`,
    body: {
      email: getE2eEmail(),
      password: getE2ePassword(),
    },
    log: false,
  } as Cypress.RequestOptions).then((loginResponse) => {
    const token = loginResponse.body?.token;
    if (!token || typeof token !== 'string') {
      throw new Error(`Falha ao autenticar operador E2E. Status: ${loginResponse.status}`);
    }
    cachedAuthToken = token;
    return originalFn({
      ...sanitizedOptions,
      headers: {
        ...sanitizedOptions.headers,
        Authorization: `Bearer ${token}`,
      },
    } as Cypress.RequestOptions);
  });
});

before(() => {
  ensureE2eAuthToken();
});

beforeEach(() => {
  ensureE2eAuthToken();

  // Injeta Bearer JWT nas chamadas da aplicação sem interferir em mocks/aliases dos specs
  cy.intercept({ url: '**/api/**', middleware: true }, (req) => {
    const skipHeaderKey = Object.keys(req.headers).find(
      (key) => key.toLowerCase() === SKIP_AUTO_AUTH_HEADER
    );
    if (skipHeaderKey) {
      delete req.headers[skipHeaderKey];
      return;
    }
    if (
      !isAutoAuthDisabled() &&
      cachedAuthToken &&
      !req.url.includes('/auth/login') &&
      !req.headers.authorization
    ) {
      req.headers.authorization = `Bearer ${cachedAuthToken}`;
    }
  });

  // Evita que fontes externas bloqueiem o evento window.load em Electron headless
  cy.intercept('GET', 'https://fonts.googleapis.com/**', {
    statusCode: 200,
    headers: { 'content-type': 'text/css; charset=utf-8' },
    body: '',
  });
  cy.intercept('GET', 'https://fonts.gstatic.com/**', {
    statusCode: 200,
    headers: { 'content-type': 'font/woff2' },
    body: '',
  });
});

Cypress.Commands.add('selectRequiredMaterialsStep2', () => {
  cy.get('select[data-testid^="select-material-"]').should('have.length.at.least', 1);
  cy.get('select[data-testid^="select-material-"]').then(($selects) => {
    const total = $selects.length;
    for (let i = 0; i < total; i++) {
      cy.get('select[data-testid^="select-material-"]').eq(i).then(($select) => {
        const val = $select.val();
        const firstText = $select.find('option').eq(0).text();
        const needsSelection = !val && (firstText.includes('Selecione') || firstText.includes('Sem') || firstText.includes('Nenhuma'));
        if (needsSelection) {
          cy.wrap($select).find('option').should('have.length.greaterThan', 1);
          cy.get('select[data-testid^="select-material-"]').eq(i).then(($fresh) => {
            const firstRealVal = String($fresh.find('option').eq(1).val() || '');
            if (firstRealVal) {
              cy.wrap($fresh).scrollIntoView().select(firstRealVal, { force: true });
            }
          });
        }
      });
    }
  });
});

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
let uniqueCounter = 0;
const nextUniqueToken = () => {
  uniqueCounter += 1;
  const rand = Math.random().toString(36).slice(2, 6);
  return `${Date.now()}-${uniqueCounter}-${rand}`;
};

const generateUniqueString = (prefix: string) => `${prefix} ${nextUniqueToken()}`;
const getRandomEnum = (enumArray: any[]) => enumArray[Math.floor(Math.random() * enumArray.length)];
const generateRandomCPF = () => {
  uniqueCounter += 1;
  const counterDigits = String(uniqueCounter % 100).padStart(2, '0');
  const d = () => Math.floor(Math.random() * 10);
  return `${d()}${d()}${d()}.${d()}${d()}${d()}.${d()}${d()}${d()}-${counterDigits}`;
};
const generateRandomNCM = () => {
  return String(Math.floor(10000000 + Math.random() * 90000000));
};

// ==========================================
// 3. COMANDOS DE CRIAÇÃO E DELEÇÃO VIA API
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
    email: `teste.e2e.${nextUniqueToken()}@alumigest.com`,
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
    commercialReference: `REF-${nextUniqueToken()}`,
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
    skuCode: `SKU-${nextUniqueToken()}`,
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