import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThermalLabelModal } from '../../../features/orders/components/ThermalLabelModal';
import type { Order } from '../../../features/orders/types';

const mockOrderMultiItens: Order = {
  id: 'order-multi-123',
  codigo: 'OS-2026-0017',
  orcamentoId: 'orc-123',
  clienteNome: 'Construtora Alvorada Ltda',
  status: 'WAITING_PRODUCTION',
  canalAprovacao: 'WHATSAPP',
  dataAprovacao: '2026-10-15',
  dataPrevisaoEntrega: '2026-10-30',
  valorBruto: 6000,
  valorDesconto: 0,
  taxaInstalacao: 0,
  taxaFrete: 0,
  valorLiquido: 6000,
  observacoes: 'Entregar na portaria da obra',
  createdAt: '2026-10-15T10:00:00Z',
  updatedAt: '2026-10-15T10:00:00Z',
  ativo: true,
  items: [
    {
      id: 'item-janela-1',
      orderId: 'order-multi-123',
      descricao: 'Janela de Correr 2 Folhas',
      larguraMm: 1200,
      alturaMm: 1500,
      quantidade: 2, // 2 peças físicas
      corAluminio: 'Preto Anodizado',
      tipoVidro: 'Incolor 6mm Temperado',
      valorUnitario: 2000,
      valorTotal: 4000,
      ordem: 1,
    },
    {
      id: 'item-porta-2',
      orderId: 'order-multi-123',
      descricao: 'Porta de Giro 1 Folha',
      larguraMm: 900,
      alturaMm: 2100,
      quantidade: 1, // 1 peça física
      corAluminio: 'Branco Pintura Eletrostática',
      tipoVidro: 'Fumê 8mm Temperado',
      valorUnitario: 2000,
      valorTotal: 2000,
      ordem: 2,
    },
  ],
};

describe('ThermalLabelModal — [US-17.5] Visualização Prévia Contínua e Filtros de Etiquetas Térmicas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    render(
      <ThermalLabelModal
        isOpen={false}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
      />
    );

    expect(screen.queryByTestId('thermal-label-modal')).not.toBeInTheDocument();
  });

  it('Cenário 1: deve gerar paginação exata por peça física (3 peças no total: 2 janelas + 1 porta)', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
      />
    );

    expect(screen.getByTestId('thermal-label-modal')).toBeInTheDocument();
    
    // Total de 3 cards físicos
    const cards = screen.getAllByTestId('thermal-label-card');
    expect(cards).toHaveLength(3);

    // Validação da numeração sequencial fracionada
    const fractions = screen.getAllByTestId('label-piece-fraction').map((el) => el.textContent);
    expect(fractions).toEqual([
      'Item 01 | Peça 01/03',
      'Item 01 | Peça 02/03',
      'Item 02 | Peça 03/03',
    ]);
  });

  it('Cenário 2: deve exibir layout técnico de alto contraste com medidas nominais, especificações e sem código de barras', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
      />
    );

    // Marca da empresa
    expect(screen.getAllByText('Alumiportas').length).toBeGreaterThan(0);
    // Código da O.S.
    expect(screen.getAllByText('#OS-2026-0017')).toHaveLength(3);
    // Cliente
    expect(screen.getAllByText('Construtora Alvorada Ltda').length).toBeGreaterThan(0);

    // Medidas nominais em destaque mono
    const dimensions = screen.getAllByTestId('label-dimensions').map((el) => el.textContent);
    expect(dimensions[0]).toContain('1200 x 1500 mm');
    expect(dimensions[1]).toContain('1200 x 1500 mm');
    expect(dimensions[2]).toContain('900 x 2100 mm');

    // Especificações técnicas com testids dedicados
    expect(screen.getAllByTestId('label-color')).toHaveLength(3);
    expect(screen.getAllByTestId('label-glass')).toHaveLength(3);
    expect(screen.getAllByText(/Preto Anodizado/)).toHaveLength(2);
    expect(screen.getAllByText(/Incolor 6mm Temperado/)).toHaveLength(2);
    expect(screen.getAllByText(/Branco Pintura Eletrostática/)).toHaveLength(1);
    expect(screen.getAllByText(/Fumê 8mm Temperado/)).toHaveLength(1);
    expect(screen.getAllByText(/Entregar na portaria da obra/)).toHaveLength(3);

    // Rodapé limpo com data, sem código de barras, sem código de item e sem badge GOLD
    expect(screen.getAllByTestId('label-date')).toHaveLength(3);
    expect(screen.queryByText('ALUMIGEST US-17')).not.toBeInTheDocument();
    expect(screen.queryByText('GOLD')).not.toBeInTheDocument();
  });

  it('Cenário 3: deve permitir alternar filtros rápidos por item e acionar botões de impressão e download', () => {
    const handleDownload = vi.fn();
    const handleClose = vi.fn();
    window.print = vi.fn();

    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={handleClose}
        order={mockOrderMultiItens}
        onDownloadPdf={handleDownload}
        isDownloadingPdf={false}
      />
    );

    // Inicialmente 3 peças
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(3);

    // Filtra pelo Item 1 (2 peças)
    fireEvent.click(screen.getByTestId('filter-piece-item-1'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(2);
    expect(screen.getByText('Item 01 | Peça 01/03')).toBeInTheDocument();
    expect(screen.getByText('Item 01 | Peça 02/03')).toBeInTheDocument();
    expect(screen.queryByText('Item 02 | Peça 03/03')).not.toBeInTheDocument();

    // Filtra pelo Item 2 (1 peça)
    fireEvent.click(screen.getByTestId('filter-piece-item-2'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(1);
    expect(screen.getByText('Item 02 | Peça 03/03')).toBeInTheDocument();

    // Volta para todas as peças
    fireEvent.click(screen.getByTestId('filter-piece-all'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(3);

    // Aciona botão de imprimir na impressora térmica
    fireEvent.click(screen.getByTestId('btn-modal-print-thermal'));
    expect(window.print).toHaveBeenCalledTimes(1);

    // Aciona botão de download PDF
    fireEvent.click(screen.getByTestId('btn-modal-download-pdf'));
    expect(handleDownload).toHaveBeenCalledTimes(1);

    // Fecha o modal
    fireEvent.click(screen.getByTestId('btn-close-thermal-modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão "Baixar PDF" quando isDownloadingPdf for true', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
        onDownloadPdf={vi.fn()}
        isDownloadingPdf={true}
      />
    );

    const downloadBtn = screen.getByTestId('btn-modal-download-pdf');
    expect(downloadBtn).toBeDisabled();
    expect(screen.getByText('Baixando PDF...')).toBeInTheDocument();
  });
});

describe('ThermalLabelModal — [BUG #486] Paridade com o resolvedor do backend', () => {
  const baseItem = mockOrderMultiItens.items![0];

  const orderDivergente: Order = {
    ...mockOrderMultiItens,
    items: [
      {
        ...baseItem,
        id: 'item-porta',
        descricao: 'Porta de Giro',
        quantidade: 1,
        ordem: 2,
        templateConfig: { ambiente: 'Cozinha' },
      },
      {
        ...baseItem,
        id: 'item-01',
        descricao: 'Janela 2 Folhas',
        quantidade: 0,
        ordem: 3,
        templateConfig: '{"ambiente":"Varanda Gourmet"}',
      },
      {
        ...baseItem,
        id: 'item-janela',
        descricao: 'Janela Basculante',
        quantidade: 2,
        ordem: 1,
        templateConfig: '{"ambiente":"Quarto Casal"}',
      },
    ],
  };

  it('não gera etiqueta nem botão de filtro para item com quantidade zero', () => {
    render(<ThermalLabelModal isOpen={true} onClose={vi.fn()} order={orderDivergente} />);

    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(3);
    expect(screen.queryByText('Janela 2 Folhas')).not.toBeInTheDocument();
    expect(screen.queryByText('Varanda Gourmet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filter-piece-item-3')).not.toBeInTheDocument();
    expect(screen.getByText('Todas as Peças (3)')).toBeInTheDocument();
  });

  it('ordena as etiquetas e os filtros pelo campo ordem do item', () => {
    render(<ThermalLabelModal isOpen={true} onClose={vi.fn()} order={orderDivergente} />);

    const fractions = screen.getAllByTestId('label-piece-fraction').map((el) => el.textContent);
    expect(fractions).toEqual([
      'Item 01 | Peça 01/03',
      'Item 01 | Peça 02/03',
      'Item 02 | Peça 03/03',
    ]);

    expect(screen.getByTestId('filter-piece-item-1')).toHaveTextContent('Item 1 (2 Peças)');
    expect(screen.getByTestId('filter-piece-item-2')).toHaveTextContent('Item 2 (1 Peça)');

    fireEvent.click(screen.getByTestId('filter-piece-item-2'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(1);
    expect(screen.getByText('Porta de Giro')).toBeInTheDocument();
  });

  it('exibe o ambiente do templateConfig na linha LOCAL / OBS', () => {
    render(<ThermalLabelModal isOpen={true} onClose={vi.fn()} order={orderDivergente} />);

    const locais = screen.getAllByTestId('label-local').map((el) => el.textContent);
    expect(locais).toEqual(['Quarto Casal', 'Quarto Casal', 'Cozinha']);
    expect(screen.queryByText('Entregar na portaria da obra')).not.toBeInTheDocument();
  });
});

