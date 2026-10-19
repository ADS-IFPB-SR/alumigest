import type {
  Order,
  OrderItem,
  OrderItemOption,
  OrderStatus,
  ApprovalChannel,
} from '../../../src/features/orders/types';
import { formatBRL } from '../../../src/features/budgets/utils/calculations';

// ==========================================
// 1. POOLS DE DADOS REALISTAS DE ESQUADRIAS
// ==========================================

const TIPOLOGIAS = [
  'Janela de Correr 2 Folhas Linha Suprema',
  'Janela de Correr 4 Folhas Linha Suprema',
  'Porta de Giro 1 Folha com Fechadura Rolete',
  'Janela Maxim-ar 1 Folha Linha Master',
  'Porta de Correr 2 Folhas com Bandeira Superior',
  'Porta Pivotante Linha Gold com Puxador Inox',
] as const;

const CORES_ALUMINIO = [
  'Preto Fosco',
  'Branco Brilhante',
  'Bronze 1003',
  'Anodizado Natural',
  'Champagne Fosco',
] as const;

const TIPOS_VIDRO = [
  'Incolor 6mm',
  'Fosco Jateado 8mm',
  'Verde Temperado 6mm',
  'Fumê 8mm',
  'Laminado Incolor 8mm',
] as const;

const ABERTURAS = [
  'Esquerda/Direita',
  'Abertura para Direita',
  'Abertura para Esquerda',
  'Central para Laterais',
] as const;

const FERRAGENS = [
  'Fecho Concha Alcoa',
  'Puxador Inox Tubular 600mm',
  'Fechadura Rolete Stam',
  'Dobradiça Inox Reforçada',
  'Kit Pivotante com Mola de Piso',
] as const;

const CLIENTES = [
  {
    nome: 'Construtora Horizonte & Edificações LTDA',
    telefone: '(83) 98888-4310',
    endereco: 'Av. Epitácio Pessoa, 431 - João Pessoa/PB',
  },
  {
    nome: 'Engenharia & Soluções Arquitetura EIRELI',
    telefone: '(83) 98765-4321',
    endereco: 'Rua das Trincheiras, 102 - Sousa/PB',
  },
  {
    nome: 'Residencial Alphaville Incorporadora',
    telefone: '(83) 99123-4567',
    endereco: 'Av. Argemiro de Figueiredo, 500 - Cabedelo/PB',
  },
  {
    nome: 'Vidraçaria e Decorações Planalto',
    telefone: '(83) 99654-3210',
    endereco: 'Rua Presidente João Pessoa, 78 - Campina Grande/PB',
  },
] as const;

// ==========================================
// 2. FUNÇÕES UTILITÁRIAS PARA GERAÇÃO DINÂMICA
// ==========================================

export function randomChoice<T>(list: readonly T[] | T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

export function generateUUID(): string {
  // Gera UUID v4 válido RFC 4122
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==========================================
// 3. FACTORY BUILDERS
// ==========================================

/**
 * Cria uma opção de insumo/material (vidro, perfil, acessório) do item de esquadria.
 */
export function buildOrderItemOption(overrides: Partial<OrderItemOption> = {}): OrderItemOption {
  const isPerfil = Math.random() > 0.5;
  const unitMeasure = isPerfil ? 'M' : 'M2';
  const categoryType = isPerfil ? 'ALUMINIO' : 'VIDRO';
  const materialName = isPerfil
    ? randomChoice([
        'Perfil Guia Superior Linha Suprema',
        'Perfil Guia Inferior Linha Suprema',
        'Perfil Montante Lateral Reforçado',
        'Perfil Travessa Central',
      ])
    : randomChoice([
        'Vidro Temperado Float Incolor 6mm',
        'Vidro Laminado Acústico 8mm',
        'Vidro Temperado Jateado 8mm',
      ]);

  const quantity = overrides.quantity ?? randomFloat(1.2, 4.5, 1);
  const unitPrice = overrides.unitPrice ?? randomFloat(35.0, 190.0, 2);
  const totalPrice = overrides.totalPrice ?? Number((quantity * unitPrice).toFixed(2));

  return {
    id: generateUUID(),
    orderItemId: generateUUID(),
    materialId: generateUUID(),
    materialName,
    unitMeasure,
    categoryType,
    selectedType: null,
    selectedColor: null,
    quantity,
    unitPrice,
    totalPrice,
    ...overrides,
  };
}

/**
 * Cria um item de esquadria do pedido com dimensões, acabamentos e opções dinâmicas.
 */
export function buildOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  const id = overrides.id ?? generateUUID();
  const orderId = overrides.orderId ?? generateUUID();
  const descricao = overrides.descricao ?? randomChoice(TIPOLOGIAS);
  const larguraMm = overrides.larguraMm ?? randomInt(800, 2400);
  const alturaMm = overrides.alturaMm ?? randomInt(600, 2200);
  const quantidade = overrides.quantidade ?? randomInt(1, 3);
  const valorUnitario = overrides.valorUnitario ?? randomInt(1200, 3500);
  const valorTotal = overrides.valorTotal ?? Number((quantidade * valorUnitario).toFixed(2));

  const defaultOptions: OrderItemOption[] = [
    buildOrderItemOption({ orderItemId: id }),
    buildOrderItemOption({ orderItemId: id }),
  ];

  return {
    id,
    orderId,
    productId: overrides.productId ?? `prod-${generateUUID().slice(0, 8)}`,
    descricao,
    larguraMm,
    alturaMm,
    quantidade,
    corAluminio: overrides.corAluminio ?? randomChoice(CORES_ALUMINIO),
    tipoVidro: overrides.tipoVidro ?? randomChoice(TIPOS_VIDRO),
    orientacaoAbertura: overrides.orientacaoAbertura ?? randomChoice(ABERTURAS),
    ferragens: overrides.ferragens ?? randomChoice(FERRAGENS),
    valorUnitario,
    valorTotal,
    templateConfig: null,
    handleConfig: null,
    drillingConfig: null,
    ordem: overrides.ordem ?? 1,
    options: overrides.options !== undefined ? overrides.options : defaultOptions,
    ...overrides,
  };
}

export interface BuildOrderOptions extends Partial<Order> {
  itemsCount?: number;
}

/**
 * Constrói uma Order (Pedido de Venda) completa com itens, snapshot estrutural e cálculos consistentes.
 */
export function buildOrder(options: BuildOrderOptions = {}): Order {
  const { itemsCount = 2, ...orderOverrides } = options;

  const id = orderOverrides.id ?? generateUUID();
  const ano = new Date().getFullYear();
  const codigo = orderOverrides.codigo ?? `OS-${ano}-${String(randomInt(100, 9999)).padStart(4, '0')}`;
  const orcamentoId = orderOverrides.orcamentoId ?? generateUUID();
  const orcamentoCodigo =
    orderOverrides.orcamentoCodigo ?? `ORC-${ano}-${String(randomInt(100, 9999)).padStart(4, '0')}`;

  const cliente = randomChoice(CLIENTES);
  const clienteId = orderOverrides.clienteId ?? generateUUID();
  const clienteNome = orderOverrides.clienteNome ?? cliente.nome;
  const clienteTelefone = orderOverrides.clienteTelefone ?? cliente.telefone;
  const clienteEndereco = orderOverrides.clienteEndereco ?? cliente.endereco;

  // Itens dinâmicos
  let items: OrderItem[];
  if (orderOverrides.items) {
    items = orderOverrides.items.map((item, index) => ({
      ...item,
      orderId: id,
      ordem: item.ordem ?? index + 1,
    }));
  } else {
    items = Array.from({ length: itemsCount }, (_, index) =>
      buildOrderItem({
        orderId: id,
        ordem: index + 1,
      })
    );
  }

  // Cálculos financeiros consistentes
  const valorBrutoCalculado = items.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
  const valorBruto = orderOverrides.valorBruto ?? Number(valorBrutoCalculado.toFixed(2));
  const valorDesconto = orderOverrides.valorDesconto ?? 0;
  const taxaInstalacao = orderOverrides.taxaInstalacao ?? 0;
  const taxaFrete = orderOverrides.taxaFrete ?? 0;
  const valorLiquido =
    orderOverrides.valorLiquido ??
    Number((valorBruto - valorDesconto + taxaInstalacao + taxaFrete).toFixed(2));

  const status: OrderStatus = orderOverrides.status ?? 'WAITING_PRODUCTION';
  const canalAprovacao: ApprovalChannel = orderOverrides.canalAprovacao ?? 'WHATSAPP';

  return {
    id,
    codigo,
    orcamentoId,
    orcamentoCodigo,
    clienteId,
    clienteNome,
    clienteTelefone,
    clienteEndereco,
    status,
    canalAprovacao,
    dataAprovacao: orderOverrides.dataAprovacao ?? '2026-10-15',
    dataPrevisaoEntrega: orderOverrides.dataPrevisaoEntrega ?? '2026-10-30',
    dataConclusao: orderOverrides.dataConclusao ?? null,
    valorBruto,
    valorDesconto,
    taxaInstalacao,
    taxaFrete,
    valorLiquido,
    condicaoPagamento: orderOverrides.condicaoPagamento ?? 'À Vista (PIX / Dinheiro)',
    observacoesPagamento: orderOverrides.observacoesPagamento ?? null,
    observacoes:
      orderOverrides.observacoes ??
      'Pedido formalizado com snapshot integral de esquadrias gerado por Factory.',
    justificativaCancelamento: orderOverrides.justificativaCancelamento ?? null,
    createdAt: orderOverrides.createdAt ?? '2026-10-15T08:30:00-03:00',
    updatedAt: orderOverrides.updatedAt ?? '2026-10-15T08:30:00-03:00',
    ativo: orderOverrides.ativo ?? true,
    items,
    ...orderOverrides,
  };
}

// ==========================================
// 4. HELPERS DE FORMATAÇÃO E ASSERÇÃO
// ==========================================

export function formatOrderItemDimensions(item: OrderItem): string {
  return `${item.larguraMm} × ${item.alturaMm} mm`;
}

export { formatBRL };
