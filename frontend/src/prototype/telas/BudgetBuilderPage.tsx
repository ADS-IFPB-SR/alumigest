import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProducts, useMaterialsSummary } from '../../features/catalog/hooks/useCatalog';
import { useBudgets } from '../servicos-e-mocks/useBudgets';
import type { 
  Customer, 
  BudgetItem, 
  BudgetItemOption, 
  Product, 
  MaterialSummary, 
  TemplateConfig, 
  GlassFinish, 
  HandleType,
  HandleConfig,
  HoleDrillingConfig,
  OpeningDirection,
  ProductCategoryRequirement
} from '../tipos';
import { DoorTemplateSvg } from '../componentes-templates-svg/DoorTemplateSvg';
import { ALUMINUM_COLORS, GLASS_FINISHES, getTemplateDefinition } from '../componentes-templates-svg/templateDefinitions';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrencyInput, parseCurrencyString } from '../../utils/formatters';
import toast from 'react-hot-toast';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).substring(2, 11);
}

interface CategorySelectionState {
  materialId: string;
  quantity: string;
  customType?: string;
  customColor?: string;
}

export function BudgetBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: productsData } = useProducts();
  const { data: materialsData = [] } = useMaterialsSummary();
  const { customers, addCustomer, addBudget, editBudget, findBudget } = useBudgets();

  const products: Product[] = productsData?.content || [];
  const materials: MaterialSummary[] = Array.isArray(materialsData) ? materialsData : [];

  const materialsMap = useMemo(() => {
    const map = new Map<string, MaterialSummary>();
    materials.forEach((m) => map.set(m.id, m));
    return map;
  }, [materials]);

  // Material category pools
  const glassMaterials = useMemo(() => materials.filter(m => m.id.startsWith('mat-vidro') || m.unitMeasure === 'M2'), [materials]);
  const profileMaterials = useMemo(() => materials.filter(m => m.id.startsWith('mat-perfil') || m.unitMeasure === 'BARRA_6M' || m.unitMeasure === 'METRO'), [materials]);
  const hardwareMaterials = useMemo(() => materials.filter(m => m.id.startsWith('mat-kit') || m.id.startsWith('mat-fech') || m.id.startsWith('mat-piv') || m.id.startsWith('mat-pux') || m.id.startsWith('mat-fecho') || m.unitMeasure === 'UN' || m.unitMeasure === 'PAR'), [materials]);
  const filmMaterials = useMemo(() => materials.filter(m => m.id.startsWith('mat-pelicula')), [materials]);

  // ─── Customer State ────────────────────────────────────────
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', document: '', address: '' });

  // ─── Budget Items State ────────────────────────────────────
  const [budgetCode, setBudgetCode] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [notes, setNotes] = useState('');

  // ─── Load Existing Data if Editing ─────────────────────────
  useEffect(() => {
    if (isEditing && id) {
      const existing = findBudget(id);
      if (existing) {
        setBudgetCode(existing.code);
        setSelectedCustomer(existing.customer);
        setBudgetItems(existing.items || []);
        setDiscountPercent(existing.discountPercent ? String(existing.discountPercent) : '');
        setNotes(existing.notes || '');
      }
    } else if (!isEditing) {
      setBudgetCode('');
      setSelectedCustomer(null);
      setBudgetItems([]);
      setDiscountPercent('');
      setNotes('');
    }
  }, [id, isEditing, findBudget]);

  // ─── Product Configuration Modal ──────────────────────────
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [configWidth, setConfigWidth] = useState('');
  const [configHeight, setConfigHeight] = useState('');
  const [configQuantity, setConfigQuantity] = useState('1');
  const [configLaborCost, setConfigLaborCost] = useState('');
  const [configNotes, setConfigNotes] = useState('');

  // Template Visual State
  const [configTemplateConfig, setConfigTemplateConfig] = useState<TemplateConfig>({
    templateType: 'SLIDING_DOOR_2F',
    aluminumColor: 'BLACK',
    glassFinish: 'CLEAR',
    openingDirection: 'LEFT_TO_RIGHT',
    handleType: 'BAR_TUBULAR',
  });

  // Handle & Drilling State
  const [configHandle, setConfigHandle] = useState<HandleConfig>({
    handleType: 'BAR_TUBULAR',
    side: 'ONE_SIDE',
    coverage: 'FULL',
    pieceLengthCm: 20,
  });

  const [configDrilling, setConfigDrilling] = useState<HoleDrillingConfig & { customDistancesText: string }>({
    holeCount: 2,
    divisionType: 'EQUAL',
    customDistancesText: '100, 500, 560, 100',
  });

  // Category selections state: { [categoryReqId]: { materialId, quantity, customType, customColor } }
  const [categorySelections, setCategorySelections] = useState<Record<string, CategorySelectionState>>({});

  // Computed area in m2
  const computedAreaM2 = useMemo(() => {
    const w = Number(configWidth) || 0;
    const h = Number(configHeight) || 0;
    if (w <= 0 || h <= 0) return 0;
    return (w * h) / 1_000_000;
  }, [configWidth, configHeight]);

  // Update auto quantities when dimensions change
  useEffect(() => {
    if (!configuringProduct || computedAreaM2 <= 0) return;
    setCategorySelections((prev) => {
      const next = { ...prev };
      let changed = false;

      const reqs = getProductRequirements(configuringProduct);
      reqs.forEach((req) => {
        const current = next[req.id];
        if (current && (req.categoryType === 'GLASS' || req.categoryType === 'FILM')) {
          const newQtyStr = computedAreaM2.toFixed(2);
          if (current.quantity !== newQtyStr) {
            next[req.id] = { ...current, quantity: newQtyStr };
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [computedAreaM2, configuringProduct]);

  // Helper to extract requirements from product
  function getProductRequirements(p: Product): ProductCategoryRequirement[] {
    if (p.categoryRequirements && p.categoryRequirements.length > 0) {
      return p.categoryRequirements;
    }
    if (p.templateType === 'PIVOTING_DOOR') {
      return [
        { id: 'cr-perfil', categoryType: 'PROFILE', label: 'Perfil de Alumínio e Ripado' },
        { id: 'cr-ferragem', categoryType: 'HARDWARE', label: 'Kit Pivô e Fechaduras' },
      ];
    }
    return [
      { id: 'cr-vidro', categoryType: 'GLASS', label: 'Vidro das Folhas' },
      { id: 'cr-perfil', categoryType: 'PROFILE', label: 'Perfis e Trilhos' },
      { id: 'cr-ferragem', categoryType: 'HARDWARE', label: 'Ferragens e Acessórios' },
      { id: 'cr-pelicula', categoryType: 'FILM', label: 'Película de Proteção' },
    ];
  }

  // ─── Filtered Customers ────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter((c) => 
      c.name.toLowerCase().includes(q) || 
      c.phone?.includes(q) || 
      c.document?.includes(q)
    );
  }, [customers, customerSearch]);

  // ─── Calculations ──────────────────────────────────────────
  const subtotal = budgetItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discountParsed = Number(discountPercent.replace(',', '.')) || 0;
  const discountValue = subtotal * (discountParsed / 100);
  const total = subtotal - discountValue;

  // ─── Customer Handlers ─────────────────────────────────────
  const handleCreateCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }
    const customer: Customer = {
      id: generateId(),
      name: newCustomer.name.trim(),
      email: newCustomer.email || undefined,
      phone: newCustomer.phone || undefined,
      document: newCustomer.document || undefined,
      address: newCustomer.address || undefined,
    };
    addCustomer(customer);
    setSelectedCustomer(customer);
    setIsNewCustomerOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', document: '', address: '' });
    toast.success(`Cliente "${customer.name}" cadastrado!`);
  };

  // ─── Product Configuration ─────────────────────────────────
  const openProductConfig = (product: Product) => {
    const tType = product.templateType || 'SLIDING_DOOR_2F';
    const def = getTemplateDefinition(tType);

    setConfiguringProduct(product);
    setEditingItemIndex(null);
    setConfigWidth(String(def.defaultWidth));
    setConfigHeight(String(def.defaultHeight));
    setConfigQuantity('1');
    setConfigLaborCost('0,00');
    setConfigNotes('');

    const initialHandle: HandleConfig = {
      handleType: 'BAR_TUBULAR',
      side: 'ONE_SIDE',
      coverage: 'FULL',
      pieceLengthCm: 20,
    };

    const initialDrilling: HoleDrillingConfig & { customDistancesText: string } = {
      holeCount: tType === 'PIVOTING_DOOR' ? 3 : 2,
      divisionType: 'EQUAL',
      customDistancesText: '100, 500, 560, 100',
    };

    const initialTemplateConfig: TemplateConfig = {
      templateType: tType,
      aluminumColor: product.templateConfig?.aluminumColor || 'BLACK',
      glassFinish: product.templateConfig?.glassFinish || 'CLEAR',
      openingDirection: product.templateConfig?.openingDirection || def.supportedOpeningDirections[0] || 'LEFT_TO_RIGHT',
      handleType: 'BAR_TUBULAR',
      isSlatted: product.templateConfig?.isSlatted ?? (tType === 'PIVOTING_DOOR'),
      handleConfig: initialHandle,
      drillingConfig: initialDrilling,
      ...product.templateConfig,
    };

    setConfigTemplateConfig(initialTemplateConfig);
    setConfigHandle(initialHandle);
    setConfigDrilling(initialDrilling);

    // Initial category selections
    const area = (def.defaultWidth * def.defaultHeight) / 1_000_000;
    const reqs = getProductRequirements(product);
    const initialSelections: Record<string, CategorySelectionState> = {};

    reqs.forEach((req) => {
      if (req.categoryType === 'GLASS') {
        const defaultMat = glassMaterials.find(g => g.id === 'mat-vidro-8mm') || glassMaterials[0];
        initialSelections[req.id] = {
          materialId: defaultMat?.id || '',
          quantity: area.toFixed(2),
        };
      } else if (req.categoryType === 'PROFILE') {
        const defaultMat = profileMaterials.find(p => p.id === 'mat-perfil-suprema') || profileMaterials[0];
        initialSelections[req.id] = {
          materialId: defaultMat?.id || '',
          quantity: '2',
        };
      } else if (req.categoryType === 'HARDWARE') {
        let defaultMat = hardwareMaterials[0];
        if (tType.includes('BOX')) defaultMat = hardwareMaterials.find(h => h.id.includes('box')) || defaultMat;
        else if (tType === 'PIVOTING_DOOR') defaultMat = hardwareMaterials.find(h => h.id.includes('pivo')) || defaultMat;
        else defaultMat = hardwareMaterials.find(h => h.id.includes('roldana') || h.id.includes('fech')) || defaultMat;

        initialSelections[req.id] = {
          materialId: defaultMat?.id || '',
          quantity: '1',
        };
      } else if (req.categoryType === 'FILM') {
        initialSelections[req.id] = {
          materialId: 'none', // Optional by default
          quantity: area.toFixed(2),
        };
      }
    });

    setCategorySelections(initialSelections);
    setIsProductPickerOpen(false);
  };

  const openEditExistingItem = (item: BudgetItem, index: number) => {
    const matchingProduct = products.find(p => p.id === item.productId) || {
      id: item.productId,
      name: item.productName,
      categoryId: '',
      categoryName: 'Geral',
      laborCost: item.laborCost,
      isActive: true,
      templateType: item.templateType || 'SLIDING_DOOR_2F',
      templateConfig: item.templateConfig,
      imageUrl: item.productImageUrl,
      items: [],
      categoryRequirements: [],
    };

    const tType = item.templateType || matchingProduct.templateType || 'SLIDING_DOOR_2F';
    const def = getTemplateDefinition(tType);

    setConfiguringProduct(matchingProduct);
    setEditingItemIndex(index);
    setConfigWidth(String(item.width || def.defaultWidth));
    setConfigHeight(String(item.height || def.defaultHeight));
    setConfigQuantity(String(item.quantity));
    setConfigLaborCost(formatCurrencyInput((item.laborCost || 0).toFixed(2)));
    setConfigNotes(item.notes || '');

    const currentHandle: HandleConfig = item.handleConfig || {
      handleType: item.templateConfig?.handleType || 'BAR_TUBULAR',
      side: 'ONE_SIDE',
      coverage: 'FULL',
      pieceLengthCm: 20,
    };

    const currentDrilling: HoleDrillingConfig & { customDistancesText: string } = {
      holeCount: item.drillingConfig?.holeCount ?? (tType === 'PIVOTING_DOOR' ? 3 : 2),
      divisionType: item.drillingConfig?.divisionType || 'EQUAL',
      customDistancesMm: item.drillingConfig?.customDistancesMm,
      customDistancesText: item.drillingConfig?.customDistancesMm ? item.drillingConfig.customDistancesMm.join(', ') : '100, 500, 560, 100',
    };

    const initialTemplateConfig: TemplateConfig = {
      templateType: tType,
      aluminumColor: item.templateConfig?.aluminumColor || matchingProduct.templateConfig?.aluminumColor || 'BLACK',
      glassFinish: item.templateConfig?.glassFinish || matchingProduct.templateConfig?.glassFinish || 'CLEAR',
      openingDirection: item.templateConfig?.openingDirection || matchingProduct.templateConfig?.openingDirection || def.supportedOpeningDirections[0] || 'LEFT_TO_RIGHT',
      handleType: currentHandle.handleType,
      isSlatted: item.templateConfig?.isSlatted ?? (tType === 'PIVOTING_DOOR'),
      handleConfig: currentHandle,
      drillingConfig: currentDrilling,
      ...item.templateConfig,
    };

    setConfigTemplateConfig(initialTemplateConfig);
    setConfigHandle(currentHandle);
    setConfigDrilling(currentDrilling);

    const reqs = getProductRequirements(matchingProduct);
    const selections: Record<string, CategorySelectionState> = {};

    reqs.forEach((req, idx) => {
      const matchOpt = item.options.find(o => o.categoryType === req.categoryType || o.materialId) || item.options[idx];
      if (matchOpt) {
        selections[req.id] = {
          materialId: matchOpt.materialId,
          quantity: String(matchOpt.quantity),
          customType: matchOpt.selectedType,
          customColor: matchOpt.selectedColor,
        };
      } else {
        selections[req.id] = {
          materialId: 'none',
          quantity: '1',
        };
      }
    });

    setCategorySelections(selections);
  };

  const handleConfirmProduct = () => {
    if (!configuringProduct) return;
    const w = Number(configWidth);
    const h = Number(configHeight);
    if (!w || w <= 0) { toast.error('Largura inválida.'); return; }
    if (!h || h <= 0) { toast.error('Altura inválida.'); return; }

    const labor = parseCurrencyString(configLaborCost);
    const options: BudgetItemOption[] = [];
    let itemMaterialsTotal = 0;

    const reqs = getProductRequirements(configuringProduct);

    reqs.forEach((req) => {
      const sel = categorySelections[req.id];
      if (sel && sel.materialId && sel.materialId !== 'none') {
        const mat = materialsMap.get(sel.materialId);
        const qty = Number(sel.quantity.replace(',', '.')) || 1;
        const unitPrice = mat?.costPrice || mat?.salePrice || 100;
        const totalPrice = unitPrice * qty;
        itemMaterialsTotal += totalPrice;

        options.push({
          materialId: sel.materialId,
          materialName: mat?.name || req.label,
          unitMeasure: mat?.unitMeasure || 'UN',
          categoryType: req.categoryType,
          selectedType: sel.customType || mat?.commercialReference,
          selectedColor: sel.customColor || mat?.colorFinish,
          quantity: qty,
          unitPrice,
          totalPrice,
        });
      }
    });

    const qty = Number(configQuantity) || 1;
    const singleSubtotal = itemMaterialsTotal + labor;
    const subtotalItem = singleSubtotal * qty;

    const customDistancesMm = configDrilling.divisionType === 'CUSTOM_DISTANCE'
      ? configDrilling.customDistancesText.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
      : undefined;

    const budgetItem: BudgetItem = {
      id: editingItemIndex !== null ? budgetItems[editingItemIndex].id : generateId(),
      productId: configuringProduct.id,
      productName: configuringProduct.name,
      productImageUrl: configuringProduct.imageUrl,
      templateType: configuringProduct.templateType || 'SLIDING_DOOR_2F',
      templateConfig: {
        ...configTemplateConfig,
        handleType: configHandle.handleType,
        handleConfig: configHandle,
        drillingConfig: {
          holeCount: configDrilling.holeCount,
          divisionType: configDrilling.divisionType,
          customDistancesMm,
        },
      },
      handleConfig: configHandle,
      drillingConfig: {
        holeCount: configDrilling.holeCount,
        divisionType: configDrilling.divisionType,
        customDistancesMm,
      },
      width: w,
      height: h,
      quantity: qty,
      laborCost: labor,
      options,
      subtotal: subtotalItem,
      notes: configNotes || undefined,
    };

    if (editingItemIndex !== null) {
      setBudgetItems((prev) => prev.map((it, idx) => (idx === editingItemIndex ? budgetItem : it)));
      toast.success(`"${configuringProduct.name}" atualizado no orçamento!`);
    } else {
      setBudgetItems((prev) => [...prev, budgetItem]);
      toast.success(`"${configuringProduct.name}" adicionado ao orçamento!`);
    }

    setConfiguringProduct(null);
    setEditingItemIndex(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setBudgetItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // ─── Save Budget & Redirect ────────────────────────────────
  const handleSaveBudget = () => {
    if (!selectedCustomer) { toast.error('Selecione um cliente para o orçamento.'); return; }
    if (budgetItems.length === 0) { toast.error('Adicione ao menos uma esquadria ao orçamento.'); return; }

    if (isEditing && id) {
      const updated = editBudget(id, selectedCustomer, budgetItems, discountParsed, notes || undefined);
      if (updated) {
        toast.success(`Orçamento ${updated.code} atualizado com sucesso!`);
        navigate(`/orcamentos/${updated.id}`);
      }
    } else {
      const budget = addBudget(selectedCustomer, budgetItems, discountParsed, notes || undefined);
      toast.success(`Orçamento ${budget.code} criado com sucesso!`);
      navigate(`/orcamentos/${budget.id}`);
    }
  };

  const currentReqs = configuringProduct ? getProductRequirements(configuringProduct) : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative">
      {/* Header */}
      <div className="flex-none px-md lg:px-margin-desktop py-sm border-b border-outline-variant bg-surface z-10 flex items-center justify-between">
        <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/orcamentos" className="hover:text-primary transition-colors">Orçamentos</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">
            {isEditing ? `Editar Orçamento (${budgetCode || id})` : 'Novo Orçamento'}
          </span>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => navigate(isEditing && id ? `/orcamentos/${id}` : '/orcamentos')}
            className="flex items-center gap-xs px-md py-xs border border-outline text-on-surface rounded-sm font-label-bold text-label-bold hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveBudget}
            disabled={!selectedCustomer || budgetItems.length === 0}
            className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {isEditing ? 'Atualizar Orçamento' : 'Salvar & Ver Proposta'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-md lg:p-margin-desktop max-w-container-max mx-auto w-full">
        <h2 className="font-headline text-headline-md lg:text-headline-lg text-on-surface mb-xs">
          {isEditing ? `Editar Orçamento ${budgetCode}` : 'Novo Orçamento'}
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
          {isEditing 
            ? 'Atualize as medidas, quantidades de esquadrias, insumos, mão de obra ou dados do cliente.'
            : 'Selecione o cliente, adicione produtos do catálogo e configure as especificações de cada esquadria.'}
        </p>

        <div className="flex flex-col xl:flex-row gap-lg pb-xl">
          {/* Left Column - Form */}
          <div className="flex-1 flex flex-col gap-lg min-w-0">
            {/* ─── STEP 1: Customer ──────────────────── */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm">
              <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                1. Cliente
              </h3>

              {selectedCustomer ? (
                <div className="flex items-center justify-between p-sm bg-surface-container-low rounded-md border border-outline-variant/60">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary-container text-[20px]">person</span>
                    </div>
                    <div>
                      <span className="font-title-sm text-title-sm text-on-surface font-semibold block">{selectedCustomer.name}</span>
                      <span className="font-body-sm text-xs text-on-surface-variant">
                        {[selectedCustomer.phone, selectedCustomer.document, selectedCustomer.email].filter(Boolean).join(' · ')}
                      </span>
                      {selectedCustomer.address && (
                        <span className="font-body-sm text-xs text-on-surface-variant block mt-0.5">
                          📍 {selectedCustomer.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-error hover:bg-error-container p-xs rounded-md transition-colors cursor-pointer"
                    title="Trocar cliente"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-sm">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Buscar por nome, telefone ou documento..."
                      className="w-full pl-xl pr-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
                    />
                  </div>

                  {customerSearch && filteredCustomers.length > 0 && (
                    <div className="border border-outline-variant rounded-md max-h-40 overflow-y-auto">
                      {filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                          className="w-full text-left px-sm py-sm hover:bg-surface-container-high transition-colors border-b border-outline-variant/40 last:border-b-0 cursor-pointer"
                        >
                          <span className="font-body-sm text-body-sm text-on-surface font-medium block">{c.name}</span>
                          <span className="font-body-sm text-xs text-on-surface-variant">{c.phone || c.document || ''}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-xs">
                    <span className="font-body-sm text-xs text-outline">Não encontrou o cliente?</span>
                    <Button variant="outline" icon="person_add" onClick={() => setIsNewCustomerOpen(true)}>
                      Cadastrar Novo Cliente
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* ─── STEP 2: Products / Budget Items ────── */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm">
              <div className="flex items-center justify-between mb-md pb-xs border-b border-outline-variant">
                <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">window</span>
                  2. Itens do Orçamento ({budgetItems.length})
                </h3>
                <Button variant="primary" icon="add" onClick={() => setIsProductPickerOpen(true)}>
                  Adicionar Esquadria
                </Button>
              </div>

              {budgetItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-xl text-center border-2 border-dashed border-outline-variant/60 rounded-md bg-surface-container-low/30">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-sm">layers</span>
                  <p className="font-body text-body-sm text-on-surface font-medium mb-xs">
                    Nenhum produto adicionado ao orçamento.
                  </p>
                  <p className="font-body-sm text-xs text-outline mb-md max-w-sm">
                    Clique no botão acima para escolher um modelo de esquadria e configurar as medidas, acabamentos e insumos.
                  </p>
                  <Button variant="outline" icon="add" onClick={() => setIsProductPickerOpen(true)}>
                    Selecionar Esquadria
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-sm">
                  {budgetItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="border border-outline-variant rounded-md p-md bg-surface hover:bg-surface-container-low transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-md"
                    >
                      {/* Product SVG Thumbnail + Info */}
                      <div className="flex items-center gap-md">
                        <div className="w-16 h-16 rounded-md bg-white border border-outline-variant/80 p-1 flex items-center justify-center shrink-0 shadow-inner">
                          <DoorTemplateSvg
                            templateType={item.templateType || 'SLIDING_DOOR_2F'}
                            widthMm={item.width}
                            heightMm={item.height}
                            config={item.templateConfig}
                            showDimensions={false}
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-xs">
                            <span className="font-title-sm text-title-sm text-on-surface font-bold">{item.productName}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-semibold">
                              Qtd: {item.quantity}x
                            </span>
                          </div>
                          <p className="font-data-mono text-xs text-secondary mt-0.5">
                            Cota: {item.width}mm × {item.height}mm · Área: {((item.width * item.height) / 1_000_000).toFixed(2)}m²
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.options.slice(0, 3).map((opt, oidx) => (
                              <span key={oidx} className="text-[10px] px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded border border-outline-variant/40">
                                {opt.materialName} ({opt.quantity} {opt.unitMeasure})
                              </span>
                            ))}
                            {item.options.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded">
                                +{item.options.length - 3} itens
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subtotal & Actions */}
                      <div className="flex items-center gap-md self-end md:self-center">
                        <div className="text-right">
                          <span className="text-xs text-on-surface-variant block">Subtotal</span>
                          <span className="font-data-mono text-title-sm text-on-surface font-bold">
                            R$ {item.subtotal.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex items-center gap-xs">
                          <button
                            onClick={() => openEditExistingItem(item, idx)}
                            className="p-xs text-primary hover:bg-primary-container/20 rounded-md transition-colors cursor-pointer"
                            title="Editar especificações"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-xs text-error hover:bg-error-container rounded-md transition-colors cursor-pointer"
                            title="Remover item"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ─── STEP 3: Observations ───────────────── */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm">
              <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">notes</span>
                3. Observações Gerais da Proposta
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condições de pagamento, prazo de entrega, detalhes de instalação in loco..."
                rows={3}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all resize-none"
              />
            </section>
          </div>

          {/* Right Column - Summary Card */}
          <div className="xl:w-80 flex flex-col gap-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm sticky top-4">
              <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                Resumo Financeiro
              </h3>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal dos Itens</span>
                  <span className="font-data-mono text-on-surface font-semibold">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Desconto Comercial (%)</span>
                    {discountValue > 0 && (
                      <span className="text-success font-data-mono font-medium">
                        - R$ {discountValue.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value.replace(/[^0-9,]/g, ''))}
                    placeholder="0%"
                    className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none text-right"
                  />
                </div>

                <div className="border-t border-outline-variant pt-sm mt-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-title-sm text-on-surface font-bold">Total Final</span>
                    <span className="font-data-mono text-title-lg text-primary font-bold">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSaveBudget}
                  disabled={!selectedCustomer || budgetItems.length === 0}
                  className="w-full mt-md py-sm bg-primary text-on-primary rounded font-label-bold text-label-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  {isEditing ? 'Atualizar Orçamento' : 'Salvar & Ver Proposta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: Pick Product Template ───────────── */}
      <Modal isOpen={isProductPickerOpen} onClose={() => setIsProductPickerOpen(false)} title="Selecione um Modelo de Esquadria">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md max-h-[65vh] overflow-y-auto p-1">
          {products.map((prod) => (
            <button
              key={prod.id}
              onClick={() => openProductConfig(prod)}
              className="p-md rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low hover:border-primary/60 transition-all text-left flex flex-col gap-sm shadow-xs cursor-pointer group"
            >
              <div className="h-32 bg-white rounded-md border border-outline-variant/60 p-2 flex items-center justify-center shadow-inner group-hover:scale-[1.02] transition-transform">
                <DoorTemplateSvg
                  templateType={prod.templateType || 'SLIDING_DOOR_2F'}
                  config={prod.templateConfig}
                  showDimensions={false}
                  className="w-full h-full"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider font-mono block">
                  {prod.categoryName || 'Esquadria'}
                </span>
                <span className="font-title-sm text-title-sm text-on-surface font-bold group-hover:text-primary transition-colors block">
                  {prod.name}
                </span>
                <span className="text-xs text-on-surface-variant block mt-0.5">
                  {prod.categoryRequirements?.length || 3} categorias configuradas
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* ─── MODAL: New Customer ────────────────────── */}
      <Modal isOpen={isNewCustomerOpen} onClose={() => setIsNewCustomerOpen(false)} title="Novo Cliente">
        <div className="flex flex-col gap-sm">
          <div>
            <label className="font-label-bold text-xs text-on-surface block mb-1">Nome Completo / Razão Social *</label>
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="Ex: Carlos Eduardo Silveira"
              className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="font-label-bold text-xs text-on-surface block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="(83) 99999-8888"
                className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded text-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="font-label-bold text-xs text-on-surface block mb-1">CPF / CNPJ</label>
              <input
                type="text"
                value={newCustomer.document}
                onChange={(e) => setNewCustomer({ ...newCustomer, document: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded text-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="font-label-bold text-xs text-on-surface block mb-1">Endereço da Obra</label>
            <input
              type="text"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              placeholder="Rua, Número, Bairro, Cidade"
              className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-sm mt-md pt-sm border-t border-outline-variant">
            <Button variant="outline" onClick={() => setIsNewCustomerOpen(false)}>Cancelar</Button>
            <Button variant="primary" icon="check" onClick={handleCreateCustomer}>Salvar e Selecionar</Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL (PORTAL): Configure Product Specifications ── */}
      {configuringProduct && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150">
          <div className="bg-surface border border-outline-variant rounded-xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-title-sm text-title-md text-on-surface font-bold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                  {configuringProduct.name}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Configure as medidas, furação, puxador, sentido de abertura e insumos das categorias.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setConfiguringProduct(null); setEditingItemIndex(null); }}
                className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Body (Split 2 Columns) */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-6">
              {/* Left Column: Visual Blueprint & Controls */}
              <div className="lg:w-5/12 flex flex-col gap-4">
                <span className="font-label-bold text-xs text-primary uppercase tracking-wider flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">architecture</span>
                  Gabarito & Parâmetros Técnicos
                </span>

                {/* SVG Blueprint Canvas */}
                <div className="h-64 bg-white rounded-lg border border-outline-variant p-2 flex items-center justify-center shadow-inner relative">
                  <DoorTemplateSvg
                    templateType={configuringProduct.templateType || 'SLIDING_DOOR_2F'}
                    widthMm={Number(configWidth) || 1500}
                    heightMm={Number(configHeight) || 2100}
                    config={configTemplateConfig}
                    showDimensions={true}
                    className="w-full h-full"
                  />
                </div>

                {/* 1. Sentido de Abertura (Inversão dinâmica) */}
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col gap-2">
                  <span className="font-label-bold text-xs text-on-surface font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
                    Sentido de Abertura da Porta / Folha
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const val: OpeningDirection = 'LEFT_TO_RIGHT';
                        setConfigTemplateConfig(prev => ({ ...prev, openingDirection: val }));
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        configTemplateConfig.openingDirection === 'LEFT_TO_RIGHT'
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span>➔ Abrir p/ Direita</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const val: OpeningDirection = 'RIGHT_TO_LEFT';
                        setConfigTemplateConfig(prev => ({ ...prev, openingDirection: val }));
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        configTemplateConfig.openingDirection === 'RIGHT_TO_LEFT'
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span>⬅ Abrir p/ Esquerda</span>
                    </button>
                  </div>
                </div>

                {/* 2. Puxador Controls */}
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col gap-2">
                  <span className="font-label-bold text-xs text-on-surface font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">drag_handle</span>
                    Configuração de Puxador
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-on-surface-variant font-medium block mb-1">Tipo de Puxador</label>
                      <select
                        value={configHandle.handleType}
                        onChange={(e) => {
                          const val = e.target.value as HandleType;
                          const nextH = { ...configHandle, handleType: val };
                          setConfigHandle(nextH);
                          setConfigTemplateConfig(prev => ({
                            ...prev,
                            handleType: val,
                            handleConfig: nextH,
                          }));
                        }}
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="BAR_TUBULAR">Tubular Inox</option>
                        <option value="SHELL_LOCK">Fecho Concha</option>
                        <option value="LEVER_HANDLE">Maçaneta Alavanca</option>
                        <option value="NONE">Sem Puxador</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-on-surface-variant font-medium block mb-1">Lados do Puxador</label>
                      <select
                        value={configHandle.side}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          const nextH = { ...configHandle, side: val };
                          setConfigHandle(nextH);
                          setConfigTemplateConfig(prev => ({
                            ...prev,
                            handleConfig: nextH,
                          }));
                        }}
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="ONE_SIDE">1 Lado (Apenas 1 Face)</option>
                        <option value="BOTH_SIDES">2 Lados (Ambos os Lados)</option>
                      </select>
                    </div>
                  </div>

                  {configHandle.handleType !== 'NONE' && (
                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-outline-variant/40">
                      <label className="text-[11px] text-on-surface-variant font-medium">Extensão do Puxador</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const nextH: HandleConfig = { ...configHandle, coverage: 'FULL' };
                            setConfigHandle(nextH);
                            setConfigTemplateConfig(prev => ({ ...prev, handleConfig: nextH }));
                          }}
                          className={`flex-1 py-1 rounded text-xs font-medium border transition-all cursor-pointer ${
                            configHandle.coverage === 'FULL'
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          Inteiro (Altura Total)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextH: HandleConfig = { ...configHandle, coverage: 'PIECE' };
                            setConfigHandle(nextH);
                            setConfigTemplateConfig(prev => ({ ...prev, handleConfig: nextH }));
                          }}
                          className={`flex-1 py-1 rounded text-xs font-medium border transition-all cursor-pointer ${
                            configHandle.coverage === 'PIECE'
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          Pedaço (Tamanho)
                        </button>
                      </div>

                      {configHandle.coverage === 'PIECE' && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[11px] text-on-surface-variant font-medium">Tamanho:</span>
                          {[10, 15, 20, 30, 40, 60, 80].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const nextH: HandleConfig = { ...configHandle, pieceLengthCm: size };
                                setConfigHandle(nextH);
                                setConfigTemplateConfig(prev => ({ ...prev, handleConfig: nextH }));
                              }}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                                configHandle.pieceLengthCm === size
                                  ? 'border-primary bg-primary text-on-primary font-bold shadow-xs'
                                  : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                              }`}
                            >
                              {size}cm
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Furação Controls (na borda externa contrária) */}
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col gap-2">
                  <span className="font-label-bold text-xs text-on-surface font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">adjust</span>
                    Configuração de Furação (Borda Externa Oposta)
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-on-surface-variant font-medium block mb-1">Qtd de Furos</label>
                      <select
                        value={configDrilling.holeCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const nextD = { ...configDrilling, holeCount: val };
                          setConfigDrilling(nextD);
                          setConfigTemplateConfig(prev => ({
                            ...prev,
                            drillingConfig: nextD,
                          }));
                        }}
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value={0}>Sem furação</option>
                        <option value={1}>1 Furo</option>
                        <option value={2}>2 Furos</option>
                        <option value={3}>3 Furos</option>
                        <option value={4}>4 Furos</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-on-surface-variant font-medium block mb-1">Divisão dos Furos</label>
                      <select
                        value={configDrilling.divisionType}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          const nextD = { ...configDrilling, divisionType: val };
                          setConfigDrilling(nextD);
                          setConfigTemplateConfig(prev => ({
                            ...prev,
                            drillingConfig: nextD,
                          }));
                        }}
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="EQUAL">Por igual (Automático)</option>
                        <option value="CUSTOM_DISTANCE">Com medida (Distâncias)</option>
                      </select>
                    </div>
                  </div>

                  {configDrilling.divisionType === 'CUSTOM_DISTANCE' && configDrilling.holeCount > 0 && (
                    <div>
                      <label className="text-[11px] text-on-surface-variant font-medium block mb-1">
                        Distâncias entre furos e bordas (mm)
                      </label>
                      <input
                        type="text"
                        value={configDrilling.customDistancesText}
                        onChange={(e) => {
                          const text = e.target.value;
                          const parsed = text.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
                          const nextD = { ...configDrilling, customDistancesText: text, customDistancesMm: parsed };
                          setConfigDrilling(nextD);
                          setConfigTemplateConfig(prev => ({ ...prev, drillingConfig: nextD }));
                        }}
                        placeholder="Ex: 100, 500, 560, 100"
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Acabamentos do Template */}
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col gap-2">
                  <span className="font-label-bold text-xs text-on-surface font-bold">Acabamentos do Template</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-on-surface-variant block mb-1">Cor do Alumínio</label>
                      <select
                        value={configTemplateConfig.aluminumColor || 'BLACK'}
                        onChange={(e) => setConfigTemplateConfig(prev => ({ ...prev, aluminumColor: e.target.value as any }))}
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
                      >
                        {ALUMINUM_COLORS.map(col => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-on-surface-variant block mb-1">Acabamento do Vidro</label>
                      <select
                        value={configTemplateConfig.glassFinish || 'CLEAR'}
                        onChange={(e) => setConfigTemplateConfig(prev => ({ ...prev, glassFinish: e.target.value as GlassFinish }))}
                        className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
                      >
                        {GLASS_FINISHES.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dimensions, Dynamic Category Material Pickers, Labor */}
              <div className="lg:w-7/12 flex flex-col gap-4">
                {/* Dimensions */}
                <div>
                  <span className="font-label-bold text-xs text-primary uppercase tracking-wider flex items-center gap-xs mb-2">
                    <span className="material-symbols-outlined text-[16px]">straighten</span>
                    Medidas e Quantidade de Peças
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-label-bold text-xs text-on-surface block mb-1">Largura (mm) *</label>
                      <input
                        type="number"
                        value={configWidth}
                        onChange={(e) => setConfigWidth(e.target.value)}
                        placeholder="Ex: 1500"
                        className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-label-bold text-xs text-on-surface block mb-1">Altura (mm) *</label>
                      <input
                        type="number"
                        value={configHeight}
                        onChange={(e) => setConfigHeight(e.target.value)}
                        placeholder="Ex: 2100"
                        className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-label-bold text-xs text-on-surface block mb-1">Qtd de Esquadrias</label>
                      <input
                        type="number"
                        value={configQuantity}
                        onChange={(e) => setConfigQuantity(e.target.value)}
                        min="1"
                        className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  {computedAreaM2 > 0 && (
                    <span className="text-[11px] text-secondary font-mono block mt-1.5">
                      📐 Área Calculada: <strong>{computedAreaM2.toFixed(2)} m²</strong> por unidade
                    </span>
                  )}
                </div>

                {/* Dynamic Material Selection by Category */}
                <div>
                  <span className="font-label-bold text-xs text-primary uppercase tracking-wider flex items-center gap-xs mb-2">
                    <span className="material-symbols-outlined text-[16px]">category</span>
                    Seleção de Insumos por Categoria do Template
                  </span>

                  <div className="flex flex-col gap-2.5 max-h-[44vh] overflow-y-auto pr-1">
                    {currentReqs.map((req) => {
                      const sel = categorySelections[req.id] || { materialId: '', quantity: '1' };
                      const currentMat = materialsMap.get(sel.materialId);

                      let pool: MaterialSummary[] = [];
                      if (req.categoryType === 'GLASS') pool = glassMaterials;
                      else if (req.categoryType === 'PROFILE') pool = profileMaterials;
                      else if (req.categoryType === 'HARDWARE') pool = hardwareMaterials;
                      else if (req.categoryType === 'FILM') pool = filmMaterials;
                      else pool = materials;

                      const calculatedPrice = currentMat ? (currentMat.costPrice || currentMat.salePrice) * (Number(sel.quantity.replace(',', '.')) || 1) : 0;

                      return (
                        <div
                          key={req.id}
                          className="p-3 rounded-lg border border-outline-variant/80 bg-surface-container-low flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-on-surface flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[16px] text-primary">
                                {req.categoryType === 'GLASS' ? 'window' : req.categoryType === 'PROFILE' ? 'view_kanban' : req.categoryType === 'HARDWARE' ? 'hardware' : 'layers'}
                              </span>
                              {req.label}
                            </span>
                            {calculatedPrice > 0 && (
                              <span className="font-data-mono text-xs font-bold text-primary">
                                R$ {calculatedPrice.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>

                          {/* Dropdown Material Selector */}
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_95px] gap-2 items-center mt-1">
                            <select
                              value={sel.materialId}
                              onChange={(e) => {
                                const newMatId = e.target.value;
                                setCategorySelections(prev => ({
                                  ...prev,
                                  [req.id]: {
                                    ...prev[req.id],
                                    materialId: newMatId,
                                    quantity: req.categoryType === 'GLASS' || req.categoryType === 'FILM'
                                      ? computedAreaM2.toFixed(2)
                                      : prev[req.id]?.quantity || '1',
                                  }
                                }));
                              }}
                              className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded text-xs font-body-sm text-on-surface focus:border-primary focus:outline-none"
                            >
                              {req.categoryType === 'FILM' && (
                                <option value="none">-- Sem Película / Nenhuma --</option>
                              )}
                              {pool.map((mat) => (
                                <option key={mat.id} value={mat.id}>
                                  {mat.name} · R$ {(mat.costPrice || mat.salePrice).toFixed(2)} / {mat.unitMeasure}
                                </option>
                              ))}
                            </select>

                            {/* Quantity Input */}
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={sel.quantity}
                                disabled={sel.materialId === 'none'}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9,.]/g, '');
                                  setCategorySelections(prev => ({
                                    ...prev,
                                    [req.id]: { ...prev[req.id], quantity: val }
                                  }));
                                }}
                                className="w-full px-2 py-1 bg-surface border border-outline-variant rounded text-center text-xs font-data-mono text-on-surface focus:border-primary focus:outline-none disabled:opacity-40"
                              />
                              <span className="text-[10px] font-mono text-on-surface-variant shrink-0">
                                {currentMat?.unitMeasure || (req.categoryType === 'GLASS' || req.categoryType === 'FILM' ? 'M²' : 'UN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Labor & Notes */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/60">
                  <div>
                    <label className="font-label-bold text-xs text-on-surface block mb-1">Mão de Obra deste Item (R$)</label>
                    <input
                      type="text"
                      value={configLaborCost}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                        if (!raw) { setConfigLaborCost(''); return; }
                        const num = Number(raw) / 100;
                        setConfigLaborCost(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                      }}
                      placeholder="0,00"
                      className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-label-bold text-xs text-on-surface block mb-1">Observações do Item</label>
                    <input
                      type="text"
                      value={configNotes}
                      onChange={(e) => setConfigNotes(e.target.value)}
                      placeholder="Ex: Furação especial, vãos fora de prumo"
                      className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { setConfiguringProduct(null); setEditingItemIndex(null); }}
                className="px-4 py-2 border border-outline text-on-surface rounded font-label-bold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmProduct}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded font-label-bold text-xs hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">{editingItemIndex !== null ? 'check' : 'add_shopping_cart'}</span>
                {editingItemIndex !== null ? 'Salvar Alterações' : 'Adicionar ao Orçamento'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
