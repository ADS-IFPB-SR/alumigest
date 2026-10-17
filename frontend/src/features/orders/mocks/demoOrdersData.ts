import type { Order, OrderSummary } from '../types';
import { formatDate } from '../utils/formatDate';

export const demoOrderId = '01700000-0000-4000-8000-000000000017';
export const demoOrderCodigo = 'OS-2026-0017';

export const demoOrder: Order = {
  id: demoOrderId,
  codigo: demoOrderCodigo,
  orcamentoId: 'orc-2026-0017',
  orcamentoCodigo: 'ORC-2026-0017',
  clienteId: 'cli-0017',
  clienteNome: 'Construtora Silva & Filhos LTDA',
  clienteTelefone: '(83) 98888-1717',
  clienteEndereco: 'Av. das Indústrias, 500 - Galpão 3, Sousa/PB',
  status: 'WAITING_PRODUCTION',
  canalAprovacao: 'WHATSAPP',
  dataAprovacao: '2026-10-15',
  dataPrevisaoEntrega: '2026-11-05',
  valorBruto: 7500,
  valorDesconto: 500,
  taxaInstalacao: 300,
  taxaFrete: 200,
  valorLiquido: 7500,
  condicaoPagamento: '30_60_DIAS',
  observacoes: 'Entregar na portaria da obra (Bloco A). Atenção especial no manuseio do vidro temperado.',
  createdAt: '2026-10-15T08:30:00Z',
  updatedAt: '2026-10-15T08:30:00Z',
  ativo: true,
  items: [
    {
      id: 'item-janela-01',
      orderId: demoOrderId,
      productId: 'prod-janela-120x150',
      descricao: 'Janela de Correr 2 Folhas Linha Suprema',
      larguraMm: 1200,
      alturaMm: 1500,
      quantidade: 2,
      corAluminio: 'Preto Anodizado',
      tipoVidro: 'Incolor 6mm Temperado',
      orientacaoAbertura: 'Esquerda / Direita',
      ferragens: 'Roldanas Blindadas + Fecho Concha',
      valorUnitario: 1500,
      valorTotal: 3000,
      ordem: 1,
      options: [],
    },
    {
      id: 'item-porta-02',
      orderId: demoOrderId,
      productId: 'prod-porta-90x210',
      descricao: 'Porta de Giro 1 Folha Linha Gold',
      larguraMm: 900,
      alturaMm: 2100,
      quantidade: 1,
      corAluminio: 'Branco Eletrostático',
      tipoVidro: 'Fumê 8mm Temperado',
      orientacaoAbertura: 'Giro para Dentro (Direita)',
      ferragens: 'Dobradiças Inox + Fechadura Rolete',
      valorUnitario: 4500,
      valorTotal: 4500,
      ordem: 2,
      options: [],
    },
  ],
};

export const demoOrderSummaries: OrderSummary[] = [
  {
    id: demoOrderId,
    codigo: demoOrderCodigo,
    orcamentoId: 'orc-2026-0017',
    orcamentoCodigo: 'ORC-2026-0017',
    clienteNome: 'Construtora Silva & Filhos LTDA',
    clienteTelefone: '(83) 98888-1717',
    status: 'WAITING_PRODUCTION',
    statusDescricao: 'Aguardando Produção',
    canalAprovacao: 'WHATSAPP',
    canalAprovacaoDescricao: 'WhatsApp',
    dataAprovacao: '2026-10-15',
    dataPrevisaoEntrega: '2026-11-05',
    valorLiquido: 7500,
    quantidadeItens: 2,
    createdAt: '2026-10-15T08:30:00Z',
  },
  {
    id: '01600000-0000-4000-8000-000000000016',
    codigo: 'OS-2026-0016',
    orcamentoId: 'orc-2026-0016',
    orcamentoCodigo: 'ORC-2026-0016',
    clienteNome: 'Residencial Bela Vista',
    clienteTelefone: '(83) 99999-1616',
    status: 'IN_PRODUCTION',
    statusDescricao: 'Em Produção',
    canalAprovacao: 'PRESENCIAL',
    canalAprovacaoDescricao: 'Presencial',
    dataAprovacao: '2026-10-14',
    dataPrevisaoEntrega: '2026-10-29',
    valorLiquido: 4500,
    quantidadeItens: 1,
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: '01500000-0000-4000-8000-000000000015',
    codigo: 'OS-2026-0015',
    orcamentoId: 'orc-2026-0015',
    orcamentoCodigo: 'ORC-2026-0015',
    clienteNome: 'Edifício Mirante do Vale',
    clienteTelefone: '(83) 97777-1515',
    status: 'CANCELLED',
    statusDescricao: 'Cancelado',
    canalAprovacao: 'TELEFONE',
    canalAprovacaoDescricao: 'Telefone',
    dataAprovacao: '2026-10-10',
    dataPrevisaoEntrega: '2026-10-20',
    valorLiquido: 2800,
    quantidadeItens: 1,
    createdAt: '2026-10-10T14:20:00Z',
  },
];

function escapePdf(text: string): string {
  return text.replace(/[\\()\x80-\uFFFF]/g, (char) => {
    if (char === '\\' || char === '(' || char === ')') {
      return '\\' + char;
    }
    const code = char.codePointAt(0) ?? 0;
    return code <= 255 ? `\\${code.toString(8).padStart(3, '0')}` : '';
  });
}

function splitTwoLines(text: string): [string, string] {
  if (text.length <= 48) return [text, ''];
  const splitIdx = text.lastIndexOf(' ', 48);
  const cut = splitIdx > 15 ? splitIdx : 48;
  const line1 = text.slice(0, cut).trim();
  const line2 = text.slice(cut).trim().slice(0, 75);
  return [line1, line2];
}

/**
 * Compila um documento PDF 1.4 térmico puro válido (100x60mm / 283.46pt x 170.08pt)
 * com diagramação vetorial precisa e cantos arredondados, sincronizado 1:1 com os dados da O.S.
 */
export function generateDemoThermalLabelsPdf(order?: Order): Blob {
  const targetOrder = order || demoOrder;
  const widthPt = 283.46;
  const heightPt = 170.08;

  const totalPieces = targetOrder.items?.reduce((acc, it) => acc + (it.quantidade || 1), 0) || 1;
  const pieces: Array<{
    item: string;
    desc: string;
    cliente: string;
    dim: string;
    cor: string;
    vidro: string;
    local: string;
    orderCodigo: string;
    dataEmissao: string;
  }> = [];

  let globalCounter = 1;
  const formattedDate = targetOrder.dataAprovacao
    ? formatDate(targetOrder.dataAprovacao)
    : formatDate(new Date().toISOString());

  const localText = targetOrder.observacoes || targetOrder.clienteEndereco || 'Não informado';

  (targetOrder.items || []).forEach((item, itemIdx) => {
    const itemNum = itemIdx + 1;
    const qtd = Math.max(1, item.quantidade || 1);

    for (let p = 1; p <= qtd; p++) {
      const piecePad = String(globalCounter).padStart(2, '0');
      const totalPad = String(totalPieces).padStart(2, '0');
      const itemPad = String(itemNum).padStart(2, '0');

      pieces.push({
        item: `Item ${itemPad} | Peça ${piecePad}/${totalPad}`,
        desc: item.descricao || 'Esquadria de Alumínio',
        cliente: targetOrder.clienteNome || 'Cliente',
        dim: `${item.larguraMm || 0} x ${item.alturaMm || 0} mm`,
        cor: item.corAluminio || 'Não informado',
        vidro: item.tipoVidro || 'Não informado',
        local: localText,
        orderCodigo: targetOrder.codigo ? `#${targetOrder.codigo}` : '#OS-S/COD',
        dataEmissao: formattedDate,
      });

      globalCounter++;
    }
  });

  if (pieces.length === 0) {
    pieces.push({
      item: 'Item 01 | Peça 01/01',
      desc: 'Esquadria Padrão',
      cliente: targetOrder.clienteNome || 'Cliente',
      dim: '0 x 0 mm',
      cor: 'Não informado',
      vidro: 'Não informado',
      local: localText,
      orderCodigo: targetOrder.codigo ? `#${targetOrder.codigo}` : '#OS-S/COD',
      dataEmissao: formattedDate,
    });
  }

  const pageKids = pieces.map((_, idx) => `${3 + idx * 2} 0 R`).join(' ');
  const fontObjId1 = 3 + pieces.length * 2;
  const fontObjId2 = fontObjId1 + 1;

  let pdf = `%PDF-1.4\n`;
  pdf += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  pdf += `2 0 obj\n<< /Type /Pages /Kids [${pageKids}] /Count ${pieces.length} >>\nendobj\n`;

  const pdfRoundedRectPath = (x: number, y: number, w: number, h: number, r: number) => {
    const c = r * 0.55228475;
    const x0 = x, x1 = x + r, x2 = x + w - r, x3 = x + w;
    const y0 = y, y1 = y + r, y2 = y + h - r, y3 = y + h;
    return [
      `${x1.toFixed(2)} ${y0.toFixed(2)} m`,
      `${x2.toFixed(2)} ${y0.toFixed(2)} l`,
      `${(x2 + c).toFixed(2)} ${y0.toFixed(2)} ${x3.toFixed(2)} ${(y0 + r - c).toFixed(2)} ${x3.toFixed(2)} ${y1.toFixed(2)} c`,
      `${x3.toFixed(2)} ${y2.toFixed(2)} l`,
      `${x3.toFixed(2)} ${(y2 + c).toFixed(2)} ${(x2 + c).toFixed(2)} ${y3.toFixed(2)} ${x2.toFixed(2)} ${y3.toFixed(2)} c`,
      `${x1.toFixed(2)} ${y3.toFixed(2)} l`,
      `${(x1 - c).toFixed(2)} ${y3.toFixed(2)} ${x0.toFixed(2)} ${(y2 + c).toFixed(2)} ${x0.toFixed(2)} ${y2.toFixed(2)} c`,
      `${x0.toFixed(2)} ${y1.toFixed(2)} l`,
      `${x0.toFixed(2)} ${(y0 + r - c).toFixed(2)} ${(x1 - c).toFixed(2)} ${y0.toFixed(2)} ${x1.toFixed(2)} ${y0.toFixed(2)} c`,
      `h`,
    ].join(' ');
  };

  pieces.forEach((p, idx) => {
    const pageObjId = 3 + idx * 2;
    const contentObjId = pageObjId + 1;
    const [localLine1, localLine2] = splitTwoLines(p.local);

    const stream = [
      // 1. Moldura externa com cantos arredondados da etiqueta
      `q 0.06 0.09 0.16 RG 1 w ${pdfRoundedRectPath(8, 8, 267.46, 154.08, 6)} S Q`,

      // 2. Cabeçalho: Marca, Cliente e Código OS
      `BT`,
      `/F1 8 Tf 0.25 0.3 0.4 rg 14 148 Td (ALUMIPORTAS) Tj`,
      `ET`,
      `BT`,
      `/F1 5.5 Tf 0.4 0.45 0.55 rg 14 138 Td (CLIENTE: ) Tj`,
      `/F1 6.5 Tf 0.06 0.09 0.16 rg (${escapePdf(p.cliente.toUpperCase().slice(0, 36))}) Tj`,
      `ET`,
      `BT`,
      `/F1 8.5 Tf 0.06 0.09 0.16 rg 206 148 Td (${escapePdf(p.orderCodigo)}) Tj`,
      `ET`,

      // 3. Badge da Peça Física (Fundo preto com cantos arredondados e texto branco)
      `q 0.06 0.09 0.16 rg ${pdfRoundedRectPath(186, 134, 83, 11, 3)} f Q`,
      `BT`,
      `/F1 6.5 Tf 1 1 1 rg 190 137 Td (${escapePdf(p.item)}) Tj`,
      `ET`,

      // 4. Linha horizontal separadora
      `q 0.06 0.09 0.16 RG 1.5 w 14 129 m 269.46 129 l S Q`,

      // 5. Descrição do Produto
      `BT`,
      `/F1 8.5 Tf 0.06 0.09 0.16 rg 14 118 Td (${escapePdf(p.desc.slice(0, 48))}) Tj`,
      `ET`,

      // 6. Caixa Central de Medidas Nominais (Fundo cinza claro e borda com cantos arredondados)
      `q 0.96 0.97 0.98 rg ${pdfRoundedRectPath(14, 74, 255.46, 36, 4)} f Q`,
      `q 0.06 0.09 0.16 RG 0.8 w ${pdfRoundedRectPath(14, 74, 255.46, 36, 4)} S Q`,
      `BT`,
      `/F1 6 Tf 0.4 0.45 0.55 rg 86 101 Td (MEDIDAS NOMINAIS [L X A]) Tj`,
      `ET`,
      `BT`,
      `/F1 14 Tf 0.02 0.04 0.1 rg 78 83 Td (${escapePdf(p.dim)}) Tj`,
      `ET`,

      // 7. Especificações Técnicas (Cor e Vidro)
      `BT`,
      `/F1 5.5 Tf 0.4 0.45 0.55 rg 14 63 Td (COR / ACABAMENTO:) Tj`,
      `ET`,
      `BT`,
      `/F1 7 Tf 0.06 0.09 0.16 rg 14 54 Td (${escapePdf(p.cor.slice(0, 26))}) Tj`,
      `ET`,
      `BT`,
      `/F1 5.5 Tf 0.4 0.45 0.55 rg 145 63 Td (VIDRO ESPECIFICADO:) Tj`,
      `ET`,
      `BT`,
      `/F1 7 Tf 0.06 0.09 0.16 rg 145 54 Td (${escapePdf(p.vidro.slice(0, 26))}) Tj`,
      `ET`,

      // 8. Linha divisória sutil e Local / Obs
      `q 0.88 0.91 0.94 RG 0.6 w 14 47 m 269.46 47 l S Q`,
      `BT`,
      `/F1 5.5 Tf 0.4 0.45 0.55 rg 14 39 Td (LOCAL / OBS: ) Tj`,
      `/F2 6 Tf 0.1 0.15 0.2 rg (${escapePdf(localLine1)}) Tj`,
      `ET`,
      ...(localLine2
        ? [
            `BT`,
            `/F2 6 Tf 0.1 0.15 0.2 rg 14 32 Td (${escapePdf(localLine2)}) Tj`,
            `ET`,
          ]
        : []),

      // 9. Linha horizontal antes do Rodapé
      `q 0.06 0.09 0.16 RG 1.2 w 14 26 m 269.46 26 l S Q`,

      // 10. Rodapé Limpo (Sem Código de Barras e Apenas Data à Esquerda)
      `BT`,
      `/F1 6 Tf 0.1 0.15 0.25 rg 14 16 Td (DATA: ${escapePdf(p.dataEmissao)}) Tj`,
      `ET`,
    ].join('\n');

    pdf += `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId1} 0 R /F2 ${fontObjId2} 0 R >> >> >>\nendobj\n`;
    pdf += `${contentObjId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  });

  pdf += `${fontObjId1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`;
  pdf += `${fontObjId2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;

  const totalObjects = fontObjId2 + 1;
  pdf += `xref\n0 ${totalObjects}\n0000000000 65535 f \n`;
  pdf += `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${pdf.length}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}
