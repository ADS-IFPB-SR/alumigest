import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { budgetsApi } from '../features/budgets/services/budgetsApi';
import { useDeleteBudget, useUpdateBudgetStatus, useCreateBudget } from '../features/budgets/hooks/useBudgets';
import { Button } from '../components/ui/Button';
import {
  TEMPLATE_TYPE_INFO,
  type BudgetStatus,
  type DoorTemplateType,
  type CreateBudgetPayload,
} from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';
import { WindowSvgPreview } from '../features/budgets/components/builder/WindowSvgPreview';
import { BudgetMaterialsSummary } from '../features/budgets/components/BudgetMaterialsSummary';
import { BudgetStatusPipeline } from '../features/budgets/components/BudgetStatusPipeline';
import { api } from '../lib/api';

const DIRECTION_LABELS: Record<string, string> = {
  'LEFT_TO_RIGHT': 'Esquerda para Direita',
  'RIGHT_TO_LEFT': 'Direita para Esquerda',
  'CENTER_OPENING': 'Abertura Central',
  'OUTWARD': 'Abre para Fora',
  'INWARD': 'Abre para Dentro'
};

function parseJsonConfig<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    budgetsApi.getBudgetById(id)
      .then((resData) => {
        const clientData = resData.customer ?? resData.cliente ?? resData.client ?? {};
        const clientId = resData.clientId ?? resData.customerId ?? clientData.id;
        const clientName = resData.clientName ?? resData.customerName ?? clientData.name ?? clientData.nome ?? 'Cliente não identificado';
        const clientPhone = resData.clientPhone ?? resData.telefoneCliente ?? resData.phone ?? resData.telefone ?? clientData.phone ?? clientData.telefone;
        const rawItems = resData.items ?? resData.itens ?? resData.esquadrias ?? [];

        const normalized = {
          ...resData,
          id: resData.id,
          code: resData.code ?? resData.codigo,
          status: resData.status ?? 'DRAFT',
          subtotal: Number(resData.subtotal ?? resData.valorSubtotal ?? 0),
          discountPercent: Number(resData.discountPercent ?? resData.percentualDesconto ?? 0),
          discountValue: Number(resData.discountValue ?? resData.valorDesconto ?? 0),
          total: Number(resData.total ?? resData.valorTotal ?? resData.valorLiquido ?? 0),
          notes: resData.notes ?? resData.observacoes,
          commercialConditions: resData.commercialConditions ?? resData.condicoesComerciais ?? resData.paymentCondition,
          createdAt: resData.createdAt ?? resData.dataCriacao,
          validUntil: resData.validUntil ?? resData.dataValidade,
          customer: {
            id: clientId,
            name: clientName,
            phone: clientPhone,
            email: resData.clientEmail ?? resData.emailCliente ?? clientData.email,
            document: resData.clientDocument ?? clientData.document ?? clientData.cpfCnpj,
            address: resData.clientAddress ?? clientData.address ?? clientData.endereco,
            notes: clientData.notes ?? clientData.observations,
          },
          items: Array.isArray(rawItems)
            ? rawItems.map((item: any, idx: number) => ({
                id: item.id ?? `item-${idx}`,
                productId: item.productId ?? item.produtoId,
                productName: item.productName ?? item.nomeProduto ?? item.descricao ?? '',
                templateType: item.templateType ?? item.tipoTemplate,
                templateConfig: parseJsonConfig(item.templateConfig ?? item.configuracaoTemplate, {}),
                handleConfig: parseJsonConfig(item.handleConfig ?? item.configuracaoPuxador, { handleType: 'NONE' }),
                drillingConfig: parseJsonConfig(item.drillingConfig ?? item.configuracaoFuracao, { holeCount: 0 }),
                widthMm: Number(item.widthMm ?? item.larguraMm ?? item.width ?? 0),
                heightMm: Number(item.heightMm ?? item.alturaMm ?? item.height ?? 0),
                quantity: Number(item.quantity ?? item.quantidade ?? 1),
                subtotal: Number(item.subtotal ?? item.valorTotal ?? 0),
                notes: item.notes ?? item.observacoes,
                options: Array.isArray(item.options ?? item.opcoes ?? item.materiais)
                  ? (item.options ?? item.opcoes ?? item.materiais).map((opt: any) => ({
                      id: opt.id,
                      materialId: opt.materialId ?? opt.idMaterial,
                      materialName: opt.materialName ?? opt.nomeMaterial ?? opt.descricao ?? '',
                      categoryType: opt.categoryType ?? opt.tipoCategoria,
                      quantity: Number(opt.quantity ?? opt.quantidade ?? 0),
                      unitPrice: Number(opt.unitPrice ?? opt.precoUnitario ?? 0),
                      totalPrice: Number(opt.totalPrice ?? opt.precoTotal ?? 0),
                    }))
                  : [],
              }))
            : [],
        };

        setBudget(normalized);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar orçamento:', err);
        setIsError(true);
        setIsLoading(false);
      });
  }, [id]);

  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBudgetStatus();
  const { mutate: createBudget, isPending: isDuplicating } = useCreateBudget();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isGeneratingWhatsApp, setIsGeneratingWhatsApp] = useState(false);

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const [showCreatedBanner, setShowCreatedBanner] = useState<boolean>(() => {
    return Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);
  });

  useEffect(() => {
    if ((location.state as { justCreated?: boolean } | null)?.justCreated) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleDelete = () => {
    if (!budget) return;
    deleteBudget(budget.id, {
      onSuccess: () => {
        navigate('/orcamentos');
      },
    });
  };

  const handleStatusChange = (newStatus: BudgetStatus) => {
    if (!budget || budget.status === newStatus || isUpdatingStatus) return;
    updateStatus({ id: budget.id, status: newStatus });
  };

  const handleDuplicateBudget = () => {
    if (!budget || isDuplicating) return;

    const payload: CreateBudgetPayload = {
      customerId: budget.customer?.id ?? budget.customerId ?? '',
      discountPercent: budget.discountPercent ?? 0,
      notes: budget.notes ? `${budget.notes} (Cópia do orçamento ${budget.code})` : `Cópia do orçamento ${budget.code}`,
      commercialConditions: budget.commercialConditions,
      validUntil: budget.validUntil,
      items: (budget.items ?? []).map((item: any) => ({
        productId: item.productId,
        templateType: item.templateType,
        templateConfig: item.templateConfig,
        handleConfig: item.handleConfig,
        drillingConfig: item.drillingConfig,
        width: item.widthMm ?? item.larguraMm ?? item.width,
        height: item.heightMm ?? item.alturaMm ?? item.height,
        quantity: item.quantity ?? item.quantidade ?? 1,
        laborCost: item.laborCost,
        options: (item.options ?? []).map((opt: any) => ({
          materialId: opt.materialId,
          quantity: opt.quantity,
          categoryType: opt.categoryType,
        })),
        notes: item.notes,
      })),
    };

    createBudget(payload, {
      onSuccess: (newBudget) => {
        if (newBudget?.id) {
          navigate(`/orcamentos/${newBudget.id}`, { state: { justCreated: true } });
        } else {
          navigate('/orcamentos');
        }
      },
    });
  };

  const handleDownloadPdfComercial = async () => {
    if (!budget || isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      const response = await api.get(`/orcamentos/${budget.id}/pdf-comercial`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Orcamento_${budget.code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF comercial:', error);
      alert('Erro ao gerar o PDF. Verifique o console.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyWhatsApp = async () => {
    if (!budget || isGeneratingWhatsApp) return;
    try {
      setIsGeneratingWhatsApp(true);
      const response = await api.get(`/orcamentos/${budget.id}/resumo-whatsapp`);
      
      const text = typeof response.data === 'string' 
        ? response.data 
        : response.data?.text || '';
        
      await navigator.clipboard.writeText(text);
      alert('Resumo copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao gerar resumo para o WhatsApp:', error);
      alert('Erro ao copiar o resumo para o WhatsApp.');
    } finally {
      setIsGeneratingWhatsApp(false);
    }
  };

  const handleEmitirViaTecnica = () => {
    if (!budget) return;
    navigate(`/orcamentos/${budget.id}/pdf-tecnico`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl gap-sm text-secondary">
        <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
        <span className="font-body-sm">Carregando orçamento...</span>
      </div>
    );
  }

  if (isError || !budget) {
    return (
      <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
        <span className="material-symbols-outlined text-error text-[48px]">error</span>
        <p className="font-headline text-headline-md text-on-surface">Orçamento não encontrado</p>
        <p className="text-sm text-on-surface-variant">
          O orçamento com ID <code className="font-data-mono bg-surface-container px-xs rounded">{id}</code> não foi encontrado.
        </p>
        <Link to="/orcamentos">
          <Button variant="primary" icon="arrow_back">Voltar aos Orçamentos</Button>
        </Link>
      </div>
    );
  }

  // Verificação de orçamento expirado
  const isExpired = budget.validUntil 
    ? new Date(budget.validUntil) < new Date() && budget.status !== 'APPROVED' && budget.status !== 'REJECTED'
    : false;

  const subtotal = budget.subtotal ?? 0;
  const discountValue = budget.discountValue ?? 0;
  const freightCost = (budget as any).freightCost ?? 0;
  const installationCost = (budget as any).installationCost ?? (budget as any).installationFee ?? 0;
  const total = budget.total ?? 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      <header className="border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md px-md lg:px-xl py-sm flex flex-col gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-sm flex-wrap w-full">
          <Link
            to="/orcamentos"
            className="flex items-center gap-1 text-xs font-label font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-surface-container shrink-0"
            title="Voltar aos orçamentos"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Orçamentos</span>
          </Link>
          
          <span className="text-outline-variant shrink-0 hidden sm:inline">/</span>

          <h1 className="font-headline text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight whitespace-nowrap shrink-0">
            {budget.code}
          </h1>

          <div className="ml-xs sm:ml-sm flex-shrink-0 flex items-center gap-2">
            <BudgetStatusPipeline
              status={budget.status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
            />

            {isExpired && (
              <span className="inline-flex items-center gap-1 bg-error/10 border border-error/30 text-error px-2 py-0.5 rounded-full text-[11px] font-label font-bold tracking-wide uppercase">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Expirado
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-xs sm:gap-sm flex-wrap shrink-0 w-full pb-1">
          <button
            type="button"
            onClick={handleDownloadPdfComercial}
            disabled={isDownloadingPdf}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer shrink-0"
            title="Emitir PDF Comercial"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDownloadingPdf ? 'progress_activity' : 'picture_as_pdf'}
            </span>
            <span className="whitespace-nowrap">
              {isDownloadingPdf ? 'Gerando...' : 'PDF Comercial'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            disabled={isGeneratingWhatsApp}
            className="p-2 text-on-surface-variant hover:text-emerald-600 hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer shrink-0"
            title="Copiar resumo para WhatsApp"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isGeneratingWhatsApp ? 'progress_activity' : 'share'}
            </span>
            <span className="whitespace-nowrap">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleEmitirViaTecnica}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium cursor-pointer shrink-0"
            title="Emitir Via Técnica (Oficina)"
          >
            <span className="material-symbols-outlined text-[18px]">engineering</span>
            <span className="whitespace-nowrap">Via Técnica</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium shrink-0"
            title="Imprimir proposta"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className="whitespace-nowrap">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicateBudget}
            disabled={isDuplicating}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer shrink-0"
            title="Duplicar este orçamento como uma nova proposta"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDuplicating ? 'progress_activity' : 'content_copy'}
            </span>
            <span className="whitespace-nowrap">
              {isDuplicating ? 'Duplicando...' : 'Duplicar'}
            </span>
          </button>

          <Button
            variant="outline"
            icon="delete"
            onClick={() => setShowDeleteModal(true)}
            className="text-error border-error/30 hover:bg-error/10 hover:border-error text-xs py-1.5 px-2.5 shrink-0"
            title="Excluir este orçamento"
          >
            <span className="whitespace-nowrap">Excluir</span>
          </Button>

          <Link to={`/orcamentos/${budget.id}/editar`} className="shrink-0">
            <Button variant="outline" icon="edit" className="text-xs py-1.5 px-3 whitespace-nowrap">
              Editar
            </Button>
          </Link>

          <Link to="/orcamentos/novo" className="shrink-0">
            <Button variant="primary" icon="add" className="text-xs py-1.5 px-3 whitespace-nowrap">
              Novo
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-md lg:p-xl">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-md">

          {showCreatedBanner && (
            <div className="bg-tertiary-container/20 border border-tertiary-container/40 rounded-xl p-md flex items-center justify-between gap-sm animate-fadeIn">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <div>
                  <p className="font-label font-bold text-on-surface text-sm">Orçamento gerado com sucesso!</p>
                  <p className="text-xs text-on-surface-variant font-body">
                    A proposta <strong className="font-data-mono">{budget.code}</strong> foi salva no sistema.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedBanner(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"
                aria-label="Fechar aviso"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md lg:gap-lg items-start">
            <div className="lg:col-span-8 flex flex-col gap-md">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
                <div className="bg-surface-container-low/50 border-b border-outline-variant px-md py-sm flex justify-between items-center flex-wrap gap-xs">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[20px] text-primary">window</span>
                    <h2 className="font-label font-bold text-sm sm:text-base text-on-surface uppercase tracking-wider">
                      Esquadrias & Itens do Orçamento
                    </h2>
                  </div>
                  <div className="flex items-center gap-sm text-xs font-data-mono text-on-surface-variant">
                    <span className="bg-surface px-2 py-0.5 rounded border border-outline-variant font-semibold text-primary">
                      {budget.items?.length ?? 0} {budget.items?.length === 1 ? 'modelo' : 'modelos'}
                    </span>
                    <span>
                      {budget.items?.reduce((sum: number, item: any) => sum + (item.quantity ?? item.quantidade ?? 0), 0) ?? 0} un no total
                    </span>
                  </div>
                </div>

                {!budget.items || budget.items.length === 0 ? (
                  <div className="p-xl text-center flex flex-col items-center justify-center gap-sm bg-surface-container-lowest">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-xs">
                      <span className="material-symbols-outlined text-[28px]">design_services</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface text-base">
                      Nenhuma esquadria adicionada a esta proposta
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-md font-body">
                      Este orçamento ainda não possui itens cadastrados. Clique no botão abaixo para adicionar esquadrias sob medida com o motor de cálculo.
                    </p>
                    <Link to={`/orcamentos/${budget.id}/editar`} className="mt-xs">
                      <Button variant="primary" icon="add">
                        Configurar Esquadrias
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/50">
                    {budget.items.map((item: any, idx: number) => {
                      const itemId = item.id || `item-${idx}`;
                      const isExpanded = expandedItems[itemId] ?? false;
                      
                      const largura = item.widthMm ?? item.larguraMm ?? item.width ?? 2000;
                      const altura = item.heightMm ?? item.alturaMm ?? item.height ?? 2100;
                      const qtd = item.quantity ?? item.quantidade ?? 1;
                      const subtotalItem = item.subtotal ?? 0;
                      const unitPrice = qtd > 0 ? (subtotalItem / qtd) : 0;

                      const templateType = item.templateType;
                      const templateConfig = typeof item.templateConfig === 'string'
                        ? JSON.parse(item.templateConfig || '{}')
                        : (item.templateConfig || {});
                      const handleConfig = typeof item.handleConfig === 'string'
                        ? JSON.parse(item.handleConfig || '{}')
                        : (item.handleConfig || { handleType: 'NONE' });
                      const drillingConfig = typeof item.drillingConfig === 'string'
                        ? JSON.parse(item.drillingConfig || '{}')
                        : (item.drillingConfig || { holeCount: 0, divisionType: 'EQUAL' });

                      const dirKey = templateConfig.openingDirection;
                      const directionLabel = dirKey ? DIRECTION_LABELS[dirKey] || dirKey : null;
                      const options = item.options || [];
                      const hasOptions = options.length > 0;

                      return (
                        <div key={itemId} className="p-md hover:bg-surface-container-lowest/50 transition-colors flex flex-col gap-sm">
                          <div className="flex flex-col sm:flex-row gap-md items-start">
                            {templateType ? (
                              <div className="shrink-0 bg-surface-container-low rounded-lg p-2 border border-outline-variant self-center sm:self-start w-[140px] flex items-center justify-center">
                                <WindowSvgPreview
                                  templateType={templateType as DoorTemplateType}
                                  widthMm={largura}
                                  heightMm={altura}
                                  openingDirection={templateConfig.openingDirection ?? 'LEFT_TO_RIGHT'}
                                  handleConfig={handleConfig}
                                  drillingConfig={drillingConfig}
                                  templateName={item.productName}
                                  aluminumColor={templateConfig.aluminumColor}
                                  glassFinish={templateConfig.glassFinish}
                                  maxHeight={110}
                                />
                              </div>
                            ) : (
                              <div className="shrink-0 bg-surface-container-low rounded-lg p-4 border border-outline-variant text-on-surface-variant flex flex-col items-center justify-center w-[120px] h-[90px]">
                                <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
                                <span className="text-[10px] font-label mt-1">Item Padrão</span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0 w-full flex flex-col gap-xs">
                              <div className="flex items-start justify-between gap-sm flex-wrap">
                                <div>
                                  <h3 className="font-label font-bold text-on-surface text-base">
                                    {item.productName || 'Esquadria Personalizada'}
                                  </h3>
                                  <p className="text-xs text-on-surface-variant font-body">
                                    {templateType && TEMPLATE_TYPE_INFO[templateType as DoorTemplateType]?.label
                                      ? TEMPLATE_TYPE_INFO[templateType as DoorTemplateType].label
                                      : 'Esquadria sob medida'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 flex gap-4">
                                  {qtd > 1 && (
                                    <div className="flex flex-col items-end justify-center border-r border-outline-variant pr-4">
                                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Unitário</span>
                                      <span className="font-data-mono font-medium text-on-surface-variant text-sm">
                                        {formatBRL(unitPrice)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-end justify-center">
                                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                                      Total ({qtd} un)
                                    </span>
                                    <span className="font-data-mono font-extrabold text-primary text-lg leading-tight">
                                      {formatBRL(subtotalItem)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-xs text-xs font-data-mono text-on-surface-variant mt-2">
                                <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-bold text-on-surface flex items-center gap-1" title="Largura x Altura">
                                  <span className="material-symbols-outlined text-[14px] text-primary">square_foot</span>
                                  {largura} × {altura} mm
                                </span>
                                
                                {templateConfig.aluminumColor && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant flex items-center gap-1" title="Cor do Perfil">
                                    <span className="material-symbols-outlined text-[14px]">format_paint</span>
                                    {templateConfig.aluminumColor}
                                  </span>
                                )}
                                
                                {templateConfig.glassFinish && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant flex items-center gap-1" title="Tipo de Vidro">
                                    <span className="material-symbols-outlined text-[14px]">grid_view</span>
                                    {templateConfig.glassFinish}
                                  </span>
                                )}

                                {directionLabel && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant flex items-center gap-1" title="Sentido de Abertura">
                                    <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                                    {directionLabel}
                                  </span>
                                )}
                                
                                {handleConfig.handleType && handleConfig.handleType !== 'NONE' && (
                                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1 font-semibold" title="Ferragem Principal">
                                    <span className="material-symbols-outlined text-[14px]">door_front</span>
                                    Ferragem: {handleConfig.handleType}
                                  </span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-xs text-on-surface-variant/90 italic font-body bg-surface-container-low/60 px-2 py-1 rounded border border-outline-variant/40 mt-1">
                                  <span className="font-semibold not-italic text-on-surface mr-1">Observação:</span>
                                  {item.notes}
                                </p>
                              )}

                              {hasOptions && (
                                <div className="mt-2 pt-1 border-t border-outline-variant/30 flex justify-between items-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleItemExpanded(itemId)}
                                    className="flex items-center gap-1 text-xs font-label font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-none cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                      expand_more
                                    </span>
                                    <span>
                                      {isExpanded ? 'Ocultar Insumos' : `Ver Insumos da Esquadria (${options.length})`}
                                    </span>
                                  </button>
                                  <span className="text-[11px] font-data-mono text-on-surface-variant">
                                    {options.length} materiais calculados
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {hasOptions && isExpanded && (
                            <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant/60 flex flex-col gap-1 mt-1 animate-fadeIn">
                              <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider pb-1 border-b border-outline-variant/40">
                                Insumos & Componentes Utilizados:
                              </p>
                              <div className="divide-y divide-outline-variant/30">
                                {options.map((opt: any, oIdx: number) => (
                                  <div
                                    key={opt.id ?? opt.materialId ?? `opt-${oIdx}`}
                                    className="flex justify-between items-center text-xs py-1 gap-2"
                                  >
                                    <span className="font-body text-on-surface truncate flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                      {opt.materialName || opt.categoryType || 'Insumo'}
                                    </span>
                                    <span className="font-data-mono text-on-surface-variant shrink-0">
                                      {opt.quantity !== undefined ? `${opt.quantity} unid` : null}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {budget.items && budget.items.length > 0 && (
                <BudgetMaterialsSummary items={budget.items} />
              )}

              {budget.notes && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm">
                  <h3 className="font-label font-bold text-xs uppercase tracking-wider text-on-surface-variant pb-xs border-b border-outline-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                    {' '}Observações Internas / Gerais
                  </h3>
                  <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/50 text-xs font-body">
                    <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{budget.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-md lg:sticky lg:top-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm">
                <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                  <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                    {' '}Cliente
                  </span>
                  {budget.customer?.id && (
                    <Link
                      to={`/clientes/${budget.customer.id}`}
                      className="text-[11px] font-label font-semibold text-primary hover:underline"
                    >
                      Ver cadastro
                    </Link>
                  )}
                </div>

                <div className="flex items-start gap-sm pt-xs">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
                    {(budget.customer?.name ?? budget.customerId ?? 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label font-bold text-on-surface text-sm sm:text-base truncate">
                      {budget.customer?.name ?? budget.customerId}
                    </p>
                    {budget.customer?.document && (
                      <p className="text-[11px] font-data-mono text-on-surface-variant">
                        Doc: {budget.customer.document}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-xs pt-xs border-t border-outline-variant/50 text-xs font-body text-on-surface-variant">
                  {budget.customer?.phone ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 min-w-0">
                        <span className="material-symbols-outlined text-[15px] text-primary shrink-0">phone</span>
                        <span className="font-data-mono truncate">{budget.customer.phone}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:+55${budget.customer.phone.replace(/\D/g, '')}`}
                          className="text-[11px] text-primary font-label font-semibold hover:underline flex items-center gap-0.5"
                          title="Ligar"
                        >
                          <span className="material-symbols-outlined text-[14px]">call</span>
                        </a>
                        <a
                          href={`https://wa.me/55${budget.customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-label font-semibold hover:underline flex items-center gap-0.5"
                          title="WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[14px]">forum</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] italic text-on-surface-variant/70">Telefone não informado</p>
                  )}

                  {budget.customer?.email && (
                    <div className="flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[15px] text-primary shrink-0">mail</span>
                      <span className="truncate">{budget.customer.email}</span>
                    </div>
                  )}

                  {budget.customer?.address && (
                    <div className="flex items-start gap-1 pt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">location_on</span>
                      <span className="line-clamp-2 text-[11px]">{budget.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm">
                <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                  <h3 className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                    {' '}Fechamento Financeiro
                  </h3>
                  <span className="text-[10px] font-data-mono text-secondary px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50">
                    BRL (R$)
                  </span>
                </div>

                <div className="flex flex-col gap-xs pt-xs">
                  <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
                    <span className="text-on-surface-variant font-body">Valor Bruto dos Itens:</span>
                    <span className="font-data-mono text-on-surface font-semibold">{formatBRL(subtotal)}</span>
                  </div>

                  {freightCost > 0 && (
                    <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
                      <span className="text-on-surface-variant font-body">Taxa de Frete:</span>
                      <span className="font-data-mono text-on-surface">+ {formatBRL(freightCost)}</span>
                    </div>
                  )}
                  {installationCost > 0 && (
                    <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
                      <span className="text-on-surface-variant font-body">Taxa de Instalação:</span>
                      <span className="font-data-mono text-on-surface">+ {formatBRL(installationCost)}</span>
                    </div>
                  )}

                  {discountValue > 0 && (
                    <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
                      <span className="text-on-surface-variant font-body flex items-center gap-1.5">
                        <span>Desconto Aplicado</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error/10 border border-error/20 text-error font-extrabold tracking-wide">
                          {budget.discountPercent && budget.discountPercent > 0 ? `${budget.discountPercent}%` : 'R$'}
                        </span>
                      </span>
                      <span className="font-data-mono text-error font-bold">− {formatBRL(discountValue)}</span>
                    </div>
                  )}

                  <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant flex flex-col gap-0.5 mt-xs shadow-inner">
                    <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider">
                      Valor Líquido a Pagar
                    </span>
                    <span className="font-data-mono font-extrabold text-primary text-3xl leading-tight tracking-tight">
                      {formatBRL(total)}
                    </span>
                  </div>

                  {budget.commercialConditions && (
                    <div className="mt-2 pt-2 border-t border-outline-variant">
                      <span className="text-[10px] font-label font-bold text-on-surface uppercase flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                        Condição de Pagamento
                      </span>
                      <p className="text-[11px] font-body text-on-surface-variant bg-surface-container px-2 py-1.5 rounded-md border border-outline-variant/50">
                        {budget.commercialConditions}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 pt-3 text-[10px] font-body text-on-surface-variant/80 border-t border-outline-variant mt-2">
                    <div className="flex items-center justify-between">
                      <span>Emitido em:</span>
                      <strong className="font-data-mono">
                        {budget.createdAt ? new Date(budget.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </strong>
                    </div>
                    {budget.validUntil && (
                      <div className="flex items-center justify-between">
                        <span>Válido até:</span>
                        <strong className="font-data-mono text-error/80">
                          {new Date(budget.validUntil).toLocaleDateString('pt-BR')}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-xl p-lg max-w-sm w-full shadow-2xl flex flex-col gap-md">
            <div className="flex items-center gap-sm text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="font-headline font-bold text-on-surface text-base">Excluir Orçamento?</h4>
            </div>
            <p className="text-sm text-on-surface-variant font-body">
              Tem certeza que deseja excluir o orçamento <strong>{budget.code}</strong> de <strong>{budget.customer?.name ?? budget.customerId}</strong> ({formatBRL(budget.total || 0)})? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-sm mt-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-md py-xs rounded-md border border-outline-variant text-sm font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-md py-xs rounded-md bg-error text-on-error text-sm font-label font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}