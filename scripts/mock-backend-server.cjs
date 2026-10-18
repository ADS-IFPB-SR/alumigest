// scripts/mock-backend-server.cjs
// Servidor mock HTTP local para desenvolvimento, inspeção visual e testes E2E
const http = require('http');
const url = require('url');

const PORT = 8081;

const orderId = '01400000-0000-4000-8000-000000000430';
const orderCode = 'OS-2026-0430';

let currentStatus = 'WAITING_PRODUCTION';

const getOrderData = () => ({
  id: orderId,
  codigo: orderCode,
  orcamentoId: 'b1400000-0000-4000-8000-000000000430',
  orcamentoCodigo: 'ORC-2026-0430',
  clienteId: 'c1400000-0000-4000-8000-000000000430',
  clienteNome: 'Construtora Aliança & Engenharia Ltda',
  clienteTelefone: '(83) 98888-0430',
  clienteEndereco: 'Av. Epitácio Pessoa, 430 - João Pessoa/PB',
  status: currentStatus,
  canalAprovacao: 'WHATSAPP',
  dataAprovacao: '2026-10-10',
  dataPrevisaoEntrega: '2026-10-30',
  valorBruto: 3500.0,
  valorDesconto: 0.0,
  taxaInstalacao: 0.0,
  taxaFrete: 0.0,
  valorLiquido: 3500.0,
  condicaoPagamento: '50% de entrada + 50% na instalação final',
  observacoesPagamento: 'Valores congelados e acordados em proposta comercial vinculante.',
  justificativaCancelamento: null,
  items: [
    {
      id: 'item-lock-01',
      ordem: 0,
      descricao: 'Janela de Correr 2 Folhas Linha Suprema',
      larguraMm: 1500,
      alturaMm: 1200,
      quantidade: 2,
      valorUnitario: 1250.0,
      valorTotal: 2500.0,
      corAluminio: 'Branco',
      tipoVidro: 'Incolor 6mm',
      orientacaoAbertura: 'SLIDING_2_DOOR',
      ferragens: 'Roldana Dupla e Fecho Concha',
      options: [
        {
          id: 'opt-01',
          materialName: 'Perfil Linha Suprema Alumínio',
          quantity: 5.4,
          unitMeasure: 'M',
          unitCost: 85.0,
        },
        {
          id: 'opt-02',
          materialName: 'Vidro Temperado Incolor 6mm',
          quantity: 1.8,
          unitMeasure: 'M2',
          unitCost: 180.0,
        },
      ],
    },
    {
      id: 'item-lock-02',
      ordem: 1,
      descricao: 'Porta Pivotante Linha Gold com Puxador Inox',
      larguraMm: 900,
      alturaMm: 2100,
      quantidade: 1,
      valorUnitario: 1000.0,
      valorTotal: 1000.0,
      corAluminio: 'Preto Anodizado',
      tipoVidro: 'Fumê 8mm',
      orientacaoAbertura: 'PIVOT_CENTER',
      ferragens: 'Pivô Superior/Inferior Inox e Fechadura Rolete',
      options: [
        {
          id: 'opt-03',
          materialName: 'Perfil Linha Gold Alumínio',
          quantity: 6.0,
          unitMeasure: 'M',
          unitCost: 110.0,
        },
      ],
    },
  ],
});

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. Download do comprovante PDF
  if (pathname.includes('/pdf/comprovante')) {
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="comprovante-OS-2026-0430.pdf"',
    });
    res.end('%PDF-1.4 Mock Comprovante AlumiGest OS-2026-0430 Total: R$ 3.500,00');
    return;
  }

  // 2. Mutação de status
  if (method === 'PATCH' && pathname.includes('/status')) {
    const newStatus = parsedUrl.query.status || 'IN_PRODUCTION';
    currentStatus = newStatus;
    const responsePayload = {
      status: 200,
      message: 'Status atualizado com sucesso',
      data: getOrderData(),
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // 3. Detalhes da Ordem de Serviço
  if (method === 'GET' && pathname.endsWith(`/orders/${orderId}`)) {
    const responsePayload = {
      status: 200,
      message: 'Ordem encontrada',
      data: getOrderData(),
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // 4. Listagem de Ordens de Serviço
  if (method === 'GET' && (pathname === '/api/v1/orders' || pathname === '/orders')) {
    const order = getOrderData();
    const responsePayload = {
      status: 200,
      message: 'Sucesso',
      data: {
        content: [
          {
            id: order.id,
            codigo: order.codigo,
            orcamentoId: order.orcamentoId,
            orcamentoCodigo: order.orcamentoCodigo,
            clienteId: order.clienteId,
            clienteNome: order.clienteNome,
            clienteTelefone: order.clienteTelefone,
            status: order.status,
            canalAprovacao: order.canalAprovacao,
            dataAprovacao: order.dataAprovacao,
            dataPrevisaoEntrega: order.dataPrevisaoEntrega,
            valorTotal: order.valorLiquido,
            valorLiquido: order.valorLiquido,
            quantidadeItens: order.items.length,
          },
        ],
        page: {
          size: 10,
          number: 0,
          totalElements: 1,
          totalPages: 1,
        },
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      },
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // 5. Orçamento de Origem
  if (pathname.includes('/budgets/')) {
    const responsePayload = {
      status: 200,
      message: 'Orçamento encontrado',
      data: {
        id: 'b1400000-0000-4000-8000-000000000430',
        code: 'ORC-2026-0430',
        total: 3500.0,
      },
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // 6. Catálogo (perfis, vidros, ferragens)
  if (pathname.includes('/catalog/')) {
    const responsePayload = {
      status: 200,
      message: 'Sucesso',
      data: {
        content: [
          { id: 1, name: 'Perfil Linha Suprema Alumínio', price: 85.0 },
          { id: 2, name: 'Perfil Linha Gold Alumínio', price: 110.0 },
          { id: 3, name: 'Vidro Temperado Incolor 6mm', price: 180.0 },
        ],
        totalElements: 3,
        totalPages: 1,
      },
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // Resposta genérica para outras rotas da API
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 200, message: 'OK', data: {} }));
});

server.listen(PORT, () => {
  console.log(`Mock Backend Server rodando na porta ${PORT}`);
});
