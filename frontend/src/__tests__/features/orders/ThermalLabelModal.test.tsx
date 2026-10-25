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
      quantidade: 2, // 2 esquadrias x 2 folhas = 4 etiquetas
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
      quantidade: 1, // 1 esquadria x 1 folha = 1 etiqueta
      corAluminio: 'Branco Pintura Eletrostática',
      tipoVidro: 'Fumê 8mm Temperado',
      valorUnitario: 2000,
      valorTotal: 2000,
      ordem: 2,
    },
  ],
};

describe('ThermalLabelModal — [US-17] Visualização Prévia, Conferência e Impressão Térmica (#492, #493)', () => {
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

  it('Cenário 1: deve gerar paginação exata considerando dedução de folhas (2 janelas x 2 folhas + 1 porta x 1 folha = 5 etiquetas)', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
      />
    );

    expect(screen.getByTestId('thermal-label-modal')).toBeInTheDocument();

    // Total de 5 cards na área de pré-visualização da tela
    const cards = screen.getAllByTestId('thermal-label-card');
    expect(cards).toHaveLength(5);

    // Validação da numeração sequencial fracionada esquadria e folha
    const fractions = screen.getAllByTestId('label-piece-fraction').map((el) => el.textContent);
    expect(fractions).toEqual([
      'Item 01 • Esquadria 01/02 | Folha 01/02',
      'Item 01 • Esquadria 01/02 | Folha 02/02',
      'Item 01 • Esquadria 02/02 | Folha 01/02',
      'Item 01 • Esquadria 02/02 | Folha 02/02',
      'Item 02 • Esquadria 01/01 | Peça 01/01',
    ]);
  });

  it('Cenário 2: deve exibir layout técnico com medidas nominais, especificações e contêiner isolado de impressão', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
      />
    );

    // Marca da empresa e cliente presentes
    expect(screen.getAllByText('Alumiportas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Construtora Alvorada Ltda').length).toBeGreaterThan(0);

    // Medidas nominais em destaque mono nos 5 cards visíveis
    const dimensions = screen.getAllByTestId('label-dimensions').map((el) => el.textContent);
    expect(dimensions).toHaveLength(5);
    expect(dimensions[0]).toContain('1200 x 1500 mm');
    expect(dimensions[4]).toContain('900 x 2100 mm');

    // Especificações técnicas com testids dedicados
    expect(screen.getAllByTestId('label-color')).toHaveLength(5);
    expect(screen.getAllByTestId('label-glass')).toHaveLength(5);
    expect(screen.getAllByTestId('label-date')).toHaveLength(5);

    // Sem menções de código de barras ou badges inválidas
    expect(screen.queryByText('ALUMIGEST US-17')).not.toBeInTheDocument();
    expect(screen.queryByText('GOLD')).not.toBeInTheDocument();

    // Cards de prévia das etiquetas térmicas 100x60mm
    const cards = screen.getAllByTestId('thermal-label-card');
    expect(cards).toHaveLength(5);
  });

  it('Cenário 3: deve permitir conferência e ajuste manual da quantidade de folhas por esquadria', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
      />
    );

    // Conferência inicial do Item 1: 2 folhas deduzidas
    expect(screen.getByTestId('leaves-count-item-1')).toHaveTextContent('2 fls');
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(5);

    // Aumenta folhas do Item 1 para 3 (2 janelas x 3 folhas = 6 etiquetas do item 1 + 1 do item 2 = 7)
    fireEvent.click(screen.getByTestId('btn-increase-leaves-1'));
    expect(screen.getByTestId('leaves-count-item-1')).toHaveTextContent('3 fls');
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(7);

    // Diminui de volta para 2
    fireEvent.click(screen.getByTestId('btn-decrease-leaves-1'));
    expect(screen.getByTestId('leaves-count-item-1')).toHaveTextContent('2 fls');
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(5);

    // Não permite diminuir para menos de 1
    fireEvent.click(screen.getByTestId('btn-decrease-leaves-2'));
    expect(screen.getByTestId('leaves-count-item-2')).toHaveTextContent('1 fl');
    expect(screen.getByTestId('btn-decrease-leaves-2')).toBeDisabled();
  });

  it('Cenário 4: deve permitir alternar filtros rápidos por item e acionar botões de impressão e download', async () => {
    const handleDownload = vi.fn();
    const handleClose = vi.fn();
    const handlePrintThermal = vi.fn();

    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={handleClose}
        order={mockOrderMultiItens}
        onDownloadPdf={handleDownload}
        isDownloadingPdf={false}
        onPrintThermal={handlePrintThermal}
      />
    );

    // Inicialmente 5 etiquetas
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(5);
    expect(screen.getByTestId('btn-modal-download-pdf')).toHaveTextContent('Imprimir (5)');

    // Filtra pelo Item 1 (4 etiquetas)
    fireEvent.click(screen.getByTestId('filter-piece-item-1'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(4);
    expect(screen.getAllByText('Item 01 • Esquadria 01/02 | Folha 01/02').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Item 02 • Esquadria 01/01 | Peça 01/01')).not.toBeInTheDocument();
    expect(screen.getByTestId('btn-modal-download-pdf')).toHaveTextContent('Imprimir Filtradas (4)');

    // Filtra pelo Item 2 (1 etiqueta)
    fireEvent.click(screen.getByTestId('filter-piece-item-2'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(1);
    expect(screen.getAllByText('Item 02 • Esquadria 01/01 | Peça 01/01').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('btn-modal-download-pdf')).toHaveTextContent('Imprimir Filtradas (1)');

    // Volta para todas as peças
    fireEvent.click(screen.getByTestId('filter-piece-all'));
    expect(screen.getAllByTestId('thermal-label-card')).toHaveLength(5);
    expect(screen.getByTestId('btn-modal-download-pdf')).toHaveTextContent('Imprimir (5)');

    // Aciona botão de impressão repassando as folhas customizadas
    fireEvent.click(screen.getByTestId('btn-modal-download-pdf'));
    expect(handleDownload).toHaveBeenCalledTimes(1);
    expect(handleDownload).toHaveBeenCalledWith(undefined, expect.any(Object));

    // Fecha o modal
    fireEvent.click(screen.getByTestId('btn-close-thermal-modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('[BUG #487]: deve repassar o itemId correspondente ao clicar em Imprimir com filtro de item ativo', () => {
    const handleDownload = vi.fn();

    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
        onDownloadPdf={handleDownload}
        isDownloadingPdf={false}
      />
    );

    const printBtn = screen.getByTestId('btn-modal-download-pdf');

    // 1. Estado inicial ('ALL'): rótulo com total de etiquetas físicas calculadas com dedução
    expect(printBtn).toHaveTextContent('Imprimir (5)');

    // 2. Filtra pelo Item 2 (1 etiqueta): rótulo dinâmico e impressão repassa itemId 'item-porta-2'
    fireEvent.click(screen.getByTestId('filter-piece-item-2'));
    expect(printBtn).toHaveTextContent('Imprimir Filtradas (1)');

    fireEvent.click(printBtn);
    expect(handleDownload).toHaveBeenCalledTimes(1);
    expect(handleDownload).toHaveBeenLastCalledWith('item-porta-2', expect.any(Object));

    // 3. Filtra pelo Item 1 (4 etiquetas): rótulo dinâmico e impressão repassa itemId 'item-janela-1'
    fireEvent.click(screen.getByTestId('filter-piece-item-1'));
    expect(printBtn).toHaveTextContent('Imprimir Filtradas (4)');

    fireEvent.click(printBtn);
    expect(handleDownload).toHaveBeenCalledTimes(2);
    expect(handleDownload).toHaveBeenLastCalledWith('item-janela-1', expect.any(Object));

    // 4. Retorna para todas as peças: rótulo volta para 'Imprimir (5)' e repassa undefined
    fireEvent.click(screen.getByTestId('filter-piece-all'));
    expect(printBtn).toHaveTextContent('Imprimir (5)');

    fireEvent.click(printBtn);
    expect(handleDownload).toHaveBeenCalledTimes(3);
    expect(handleDownload).toHaveBeenLastCalledWith(undefined, expect.any(Object));
  });

  it('deve desabilitar o botão "Imprimir" quando isDownloadingPdf for true', () => {
    render(
      <ThermalLabelModal
        isOpen={true}
        onClose={vi.fn()}
        order={mockOrderMultiItens}
        onDownloadPdf={vi.fn()}
        isDownloadingPdf={true}
      />
    );

    const printBtn = screen.getByTestId('btn-modal-download-pdf');
    expect(printBtn).toBeDisabled();
    expect(screen.getByText('Abrindo Impressão...')).toBeInTheDocument();
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
      'Item 01 • Esquadria 01/02 | Peça 01/01',
      'Item 01 • Esquadria 02/02 | Peça 01/01',
      'Item 02 • Esquadria 01/01 | Peça 01/01',
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

