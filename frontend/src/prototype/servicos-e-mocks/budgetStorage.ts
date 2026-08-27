import type { Customer, Budget, BudgetItem, BudgetStatus } from '../tipos';

// ─── Local Storage Keys ──────────────────────────────────────
const BUDGETS_KEY = 'alumigest_budgets';
const CUSTOMERS_KEY = 'alumigest_customers';

// ─── Default Sample Customers ────────────────────────────────
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'João Pedro Santos',
    email: 'joao.santos@email.com',
    phone: '(83) 98877-1122',
    document: '089.432.114-55',
    address: 'Rua dos Bancários, 450, João Pessoa - PB',
  },
  {
    id: 'cust-2',
    name: 'Construtora Horizonte Ltda',
    email: 'contato@horizonte.com.br',
    phone: '(83) 3244-9000',
    document: '12.345.678/0001-90',
    address: 'Av. Epitácio Pessoa, 1200, Tambauzinho, João Pessoa - PB',
  },
  {
    id: 'cust-3',
    name: 'Mariana Albuquerque',
    email: 'mariana.albuquerque@gmail.com',
    phone: '(83) 99123-4567',
    document: '045.678.910-12',
    address: 'Av. Cabo Branco, 2100, Apto 402, Cabo Branco, João Pessoa - PB',
  },
];

// ─── Default Sample Budgets ──────────────────────────────────
const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'orc-1',
    code: 'ORC-2026-001',
    customer: INITIAL_CUSTOMERS[0],
    status: 'APPROVED',
    notes: 'Entrega e instalação programadas para 10 dias úteis após medição final in loco.',
    createdAt: '2026-08-15T10:30:00.000Z',
    updatedAt: '2026-08-18T14:20:00.000Z',
    validUntil: '2026-09-15T10:30:00.000Z',
    discountPercent: 5,
    discountValue: 124.50,
    subtotal: 2490.00,
    total: 2365.50,
    items: [
      {
        id: 'item-101',
        productId: 'prod-1',
        productName: 'Porta de Correr 2 Folhas (Linha Suprema)',
        productImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=60',
        templateType: 'SLIDING_DOOR_2F',
        templateConfig: {
          templateType: 'SLIDING_DOOR_2F',
          aluminumColor: 'BLACK',
          glassFinish: 'CLEAR',
          openingDirection: 'LEFT_TO_RIGHT',
          handleType: 'SHELL_LOCK',
        },
        width: 1800,
        height: 2100,
        quantity: 1,
        laborCost: 350,
        subtotal: 1450.00,
        notes: 'Instalação na varanda gourmet do apartamento.',
        options: [
          {
            materialId: 'mat-vidro-8mm',
            materialName: 'Vidro Temperado 8mm',
            unitMeasure: 'M2',
            selectedType: 'Incolor Temperado',
            selectedColor: 'Transparente',
            quantity: 3.78,
            unitPrice: 180,
            totalPrice: 680.40,
          },
          {
            materialId: 'mat-perfil-suprema',
            materialName: 'Perfil de Alumínio (Linha Suprema)',
            unitMeasure: 'BARRA_6M',
            selectedType: 'Trilho Superior e Inferior',
            selectedColor: 'Preto Fosco Anodizado',
            quantity: 2,
            unitPrice: 120,
            totalPrice: 240.00,
          },
          {
            materialId: 'mat-kit-roldanas',
            materialName: 'Kit Roldanas Côncavas 1125',
            unitMeasure: 'PAR',
            selectedType: 'Rolamento Blindado',
            quantity: 2,
            unitPrice: 45,
            totalPrice: 90.00,
          },
          {
            materialId: 'mat-fechadura-bico',
            materialName: 'Fechadura Bico de Papagaio',
            unitMeasure: 'UN',
            selectedType: 'Com Chave Tetra',
            selectedColor: 'Preta',
            quantity: 1,
            unitPrice: 89.60,
            totalPrice: 89.60,
          },
        ],
      },
      {
        id: 'item-102',
        productId: 'prod-3',
        productName: 'Box de Banheiro Frontal (1 Fixo + 1 Porta)',
        productImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=60',
        templateType: 'GLASS_BOX_FRONTAL',
        templateConfig: {
          templateType: 'GLASS_BOX_FRONTAL',
          aluminumColor: 'WHITE',
          glassFinish: 'SMOKE',
          openingDirection: 'LEFT_TO_RIGHT',
          handleType: 'BAR_TUBULAR',
        },
        width: 1200,
        height: 1900,
        quantity: 1,
        laborCost: 200,
        subtotal: 1040.00,
        notes: 'Banheiro da suíte master.',
        options: [
          {
            materialId: 'mat-vidro-8mm',
            materialName: 'Vidro Temperado 8mm',
            unitMeasure: 'M2',
            selectedType: 'Temperado Fumê',
            selectedColor: 'Fumê',
            quantity: 2.28,
            unitPrice: 210,
            totalPrice: 478.80,
          },
          {
            materialId: 'mat-kit-box',
            materialName: 'Kit Box Alumínio F1',
            unitMeasure: 'UN',
            selectedType: 'Trilhos + Acessórios de Vedação',
            selectedColor: 'Branco Eletrostático',
            quantity: 1,
            unitPrice: 320,
            totalPrice: 320.00,
          },
          {
            materialId: 'mat-puxador-box',
            materialName: 'Puxador Duplo para Box',
            unitMeasure: 'UN',
            selectedType: 'Tipo Concha em Alumínio',
            selectedColor: 'Branco',
            quantity: 1,
            unitPrice: 41.20,
            totalPrice: 41.20,
          },
        ],
      },
    ],
  },
  {
    id: 'orc-2',
    code: 'ORC-2026-002',
    customer: INITIAL_CUSTOMERS[1],
    status: 'SENT',
    notes: 'Proposta para condomínio Edifício Blue Ocean. Pagamento 50% de entrada e 50% na conclusão.',
    createdAt: '2026-08-17T09:00:00.000Z',
    updatedAt: '2026-08-17T11:15:00.000Z',
    validUntil: '2026-09-17T09:00:00.000Z',
    discountPercent: 8,
    discountValue: 478.40,
    subtotal: 5980.00,
    total: 5501.60,
    items: [
      {
        id: 'item-201',
        productId: 'prod-4',
        productName: 'Porta Pivotante em Alumínio Ripado',
        productImageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&auto=format&fit=crop&q=60',
        templateType: 'PIVOTING_DOOR',
        templateConfig: {
          templateType: 'PIVOTING_DOOR',
          aluminumColor: 'BLACK',
          glassFinish: 'CLEAR',
          openingDirection: 'LEFT_TO_RIGHT',
          handleType: 'BAR_TUBULAR',
          isSlatted: true,
        },
        width: 1100,
        height: 2400,
        quantity: 1,
        laborCost: 650,
        subtotal: 3280.00,
        notes: 'Porta de entrada do hall social.',
        options: [
          {
            materialId: 'mat-perfil-ripado',
            materialName: 'Perfil Ripado de Alumínio',
            unitMeasure: 'BARRA_6M',
            selectedType: 'Ripado 3D',
            selectedColor: 'Preto Fosco',
            quantity: 4,
            unitPrice: 380,
            totalPrice: 1520.00,
          },
          {
            materialId: 'mat-pivo-inox',
            materialName: 'Kit Pivô de Inox com Rolamento',
            unitMeasure: 'UN',
            selectedType: 'Capacidade 150kg',
            quantity: 1,
            unitPrice: 280,
            totalPrice: 280.00,
          },
          {
            materialId: 'mat-puxador-inox',
            materialName: 'Puxador Tubular Inox 80cm',
            unitMeasure: 'UN',
            selectedType: 'Aço Inox 304 Escovado',
            quantity: 1,
            unitPrice: 340,
            totalPrice: 340.00,
          },
          {
            materialId: 'mat-fechadura-rolete',
            materialName: 'Fechadura Rolete com Cilindro Tetra',
            unitMeasure: 'UN',
            selectedType: 'Segurança Máxima',
            selectedColor: 'Cromado',
            quantity: 1,
            unitPrice: 490,
            totalPrice: 490.00,
          },
        ],
      },
      {
        id: 'item-202',
        productId: 'prod-2',
        productName: 'Janela 4 Folhas (2 Fixas + 2 Móveis)',
        productImageUrl: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=300&auto=format&fit=crop&q=60',
        templateType: 'SLIDING_WINDOW_4F',
        templateConfig: {
          templateType: 'SLIDING_WINDOW_4F',
          aluminumColor: 'BLACK',
          glassFinish: 'GREEN',
          openingDirection: 'CENTER_TO_SIDES',
          handleType: 'SHELL_LOCK',
        },
        width: 1500,
        height: 1200,
        quantity: 2,
        laborCost: 250,
        subtotal: 2700.00,
        notes: 'Janelas dos quartos 01 e 02.',
        options: [
          {
            materialId: 'mat-vidro-6mm',
            materialName: 'Vidro Temperado 6mm',
            unitMeasure: 'M2',
            selectedType: 'Temperado Verde',
            selectedColor: 'Verde',
            quantity: 3.6,
            unitPrice: 160,
            totalPrice: 576.00,
          },
          {
            materialId: 'mat-perfil-suprema',
            materialName: 'Perfil Linha Suprema Janela 4F',
            unitMeasure: 'BARRA_6M',
            selectedType: 'Linha 25',
            selectedColor: 'Preto Fosco',
            quantity: 3,
            unitPrice: 110,
            totalPrice: 330.00,
          },
          {
            materialId: 'mat-fecho-concha',
            materialName: 'Fecho Concha Automático',
            unitMeasure: 'PAR',
            selectedType: 'Com Trava',
            selectedColor: 'Preto',
            quantity: 2,
            unitPrice: 38,
            totalPrice: 76.00,
          },
        ],
      },
    ],
  },
  {
    id: 'orc-3',
    code: 'ORC-2026-003',
    customer: INITIAL_CUSTOMERS[2],
    status: 'DRAFT',
    notes: 'Aguardando confirmação do cliente quanto à cor do perfil.',
    createdAt: '2026-08-20T14:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z',
    validUntil: '2026-09-20T14:00:00.000Z',
    discountPercent: 0,
    discountValue: 0,
    subtotal: 1040.00,
    total: 1040.00,
    items: [
      {
        id: 'item-301',
        productId: 'prod-3',
        productName: 'Box de Banheiro Frontal (1 Fixo + 1 Porta)',
        productImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=60',
        templateType: 'GLASS_BOX_FRONTAL',
        templateConfig: {
          templateType: 'GLASS_BOX_FRONTAL',
          aluminumColor: 'BRONZE',
          glassFinish: 'CLEAR',
          openingDirection: 'LEFT_TO_RIGHT',
          handleType: 'BAR_TUBULAR',
        },
        width: 1150,
        height: 1900,
        quantity: 1,
        laborCost: 180,
        subtotal: 1040.00,
        options: [
          {
            materialId: 'mat-vidro-8mm',
            materialName: 'Vidro Temperado 8mm',
            unitMeasure: 'M2',
            selectedType: 'Incolor',
            quantity: 2.18,
            unitPrice: 180,
            totalPrice: 392.40,
          },
          {
            materialId: 'mat-kit-box',
            materialName: 'Kit Box Alumínio F1',
            unitMeasure: 'UN',
            selectedType: 'Alumínio Anodizado',
            selectedColor: 'Bronze',
            quantity: 1,
            unitPrice: 350,
            totalPrice: 350.00,
          },
        ],
      },
    ],
  },
];

// ─── Customer Storage ────────────────────────────────────────
export function getCustomers(): Customer[] {
  const raw = localStorage.getItem(CUSTOMERS_KEY);
  if (!raw) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomer(customer: Customer): Customer {
  const customers = getCustomers();
  const existing = customers.findIndex((c) => c.id === customer.id);
  if (existing >= 0) {
    customers[existing] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  return customer;
}

// ─── Budget Storage ──────────────────────────────────────────
export function getBudgets(): Budget[] {
  const raw = localStorage.getItem(BUDGETS_KEY);
  if (!raw) {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(INITIAL_BUDGETS));
    return INITIAL_BUDGETS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BUDGETS;
  } catch {
    return INITIAL_BUDGETS;
  }
}

export function getBudgetById(id: string): Budget | undefined {
  return getBudgets().find((b) => b.id === id);
}

function generateBudgetCode(): string {
  const year = new Date().getFullYear();
  const budgets = getBudgets();
  const thisYear = budgets.filter((b) => b.code.includes(`ORC-${year}`));
  const nextNum = thisYear.length + 1;
  return `ORC-${year}-${String(nextNum).padStart(3, '0')}`;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).substring(2, 11);
}

export function createBudget(customer: Customer, items: BudgetItem[], discountPercent: number, notes?: string): Budget {
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const discountValue = subtotal * (discountPercent / 100);
  const total = subtotal - discountValue;
  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const budget: Budget = {
    id: generateId(),
    code: generateBudgetCode(),
    customer,
    items,
    subtotal,
    discountPercent,
    discountValue,
    total,
    status: 'DRAFT' as BudgetStatus,
    notes,
    createdAt: now,
    updatedAt: now,
    validUntil,
  };

  const budgets = getBudgets();
  budgets.unshift(budget); // newest first
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  return budget;
}

export function updateBudget(
  id: string,
  customer: Customer,
  items: BudgetItem[],
  discountPercent: number,
  notes?: string
): Budget | undefined {
  const budgets = getBudgets();
  const idx = budgets.findIndex((b) => b.id === id);
  if (idx < 0) return undefined;

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const discountValue = subtotal * (discountPercent / 100);
  const total = subtotal - discountValue;
  const now = new Date().toISOString();

  budgets[idx] = {
    ...budgets[idx],
    customer,
    items,
    subtotal,
    discountPercent,
    discountValue,
    total,
    notes,
    updatedAt: now,
  };

  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  return budgets[idx];
}

export function updateBudgetStatus(id: string, status: BudgetStatus): Budget | undefined {
  const budgets = getBudgets();
  const idx = budgets.findIndex((b) => b.id === id);
  if (idx < 0) return undefined;
  budgets[idx].status = status;
  budgets[idx].updatedAt = new Date().toISOString();
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  return budgets[idx];
}
