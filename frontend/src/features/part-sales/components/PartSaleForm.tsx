import React, { useState, useMemo, useEffect, useId } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Tag,
  ShoppingCart,
  User,
  CheckCircle2,
  Printer,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { MaterialCategoryType, PartSaleItem, PartSaleResponse, CreatePartSaleRequest } from '../types/partSaleTypes';
import { AluminumItemFields } from './AluminumItemFields';
import { usePartCalculation } from '../hooks/usePartCalculation';
import { customersApi } from '@/features/customers/services/customersApi';
import { partSaleApi } from '../services/partSaleApi';

const CATEGORY_DISPLAY_LABELS: Record<MaterialCategoryType, string> = {
  PROFILE: 'Alumínio',
  GLASS: 'Vidro',
  FILM: 'Película',
  HARDWARE: 'Ferragem',
};

const CATEGORY_BADGE_CLASSES: Record<MaterialCategoryType, string> = {
  PROFILE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  GLASS: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  FILM: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  HARDWARE: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
};

function resolveItemWidthMm(category: MaterialCategoryType, width: number | ''): number | null {
  if (category === 'PROFILE' || category === 'HARDWARE') {
    return null;
  }
  return typeof width === 'number' ? width : null;
}

function formatItemDimensions(item: PartSaleItem): string {
  if (item.category === 'PROFILE') {
    return `${item.heightMm} mm (Comp.)`;
  }
  if (item.category === 'HARDWARE') {
    return 'Unidade';
  }
  if (item.widthMm) {
    return `${item.heightMm} x ${item.widthMm} mm`;
  }
  return '-';
}

function generateItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}`;
}

function validateProfileDimensions(heightMm: number | ''): string | null {
  const height = typeof heightMm === 'number' ? heightMm : 0;
  if (height <= 0) {
    return 'O comprimento deve ser maior que zero.';
  }
  if (height > 6000) {
    return 'O comprimento não pode exceder 6000 mm (1 barra padrão).';
  }
  return null;
}

function validateAreaDimensions(heightMm: number | '', widthMm: number | ''): string | null {
  const height = typeof heightMm === 'number' ? heightMm : 0;
  const width = typeof widthMm === 'number' ? widthMm : 0;
  if (height <= 0 || width <= 0) {
    return 'Altura e largura (mm) devem ser maiores que zero.';
  }
  return null;
}

interface ValidatePartFormArgs {
  description: string;
  quantity: number | '';
  heightMm: number | '';
  widthMm: number | '';
  unitPrice: number | '';
  category: MaterialCategoryType;
}

function validatePartForm({
  description,
  quantity,
  heightMm,
  widthMm,
  unitPrice,
  category,
}: ValidatePartFormArgs): string | null {
  if (!description.trim()) {
    return 'Informe a descrição do material.';
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return 'A quantidade deve ser maior que zero.';
  }
  if (category === 'PROFILE') {
    const error = validateProfileDimensions(heightMm);
    if (error) return error;
  }
  if (category === 'GLASS' || category === 'FILM') {
    const error = validateAreaDimensions(heightMm, widthMm);
    if (error) return error;
  }
  if (typeof unitPrice !== 'number' || unitPrice <= 0) {
    return 'O preço de venda deve ser maior que zero.';
  }
  return null;
}

function resolveMaterialPlaceholder(category: MaterialCategoryType): string {
  if (category === 'PROFILE') {
    return 'Ex: PERFIL U LINHA SUPREMA BRANCO';
  }
  if (category === 'HARDWARE') {
    return 'Ex: ROLDANA DUPLA SUPREMA 112';
  }
  return 'Ex: VIDRO 8MM INCOLOR TEMPERADO';
}

interface FallbackMeasureParams {
  category: MaterialCategoryType;
  qty: number;
  height: number;
  width: number;
  lossFactor: number;
}

function calculateFallbackMeasure({
  category,
  qty,
  height,
  width,
  lossFactor,
}: FallbackMeasureParams): number {
  if (category === 'PROFILE') {
    return Number(((height / 1000) * qty * (1 + (lossFactor || 0))).toFixed(4));
  }
  if (category === 'GLASS' || category === 'FILM') {
    return Number(((height * width) / 1_000_000 * qty).toFixed(4));
  }
  return qty;
}

interface CustomerOption {
  id: string;
  nomeCompleto: string;
  documento?: string;
}

export interface PartSaleFormProps {
  initialCustomers?: CustomerOption[];
}

export function PartSaleForm({ initialCustomers }: PartSaleFormProps = {}) {
  const [category, setCategory] = useState<MaterialCategoryType>('PROFILE');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [heightMm, setHeightMm] = useState<number | ''>(2500);
  const [widthMm, setWidthMm] = useState<number | ''>(800);
  const [unitPrice, setUnitPrice] = useState<number | ''>(45);
  const [lossFactor] = useState<number>(0.05); // 5% perda padrão de corte para perfis

  const [items, setItems] = useState<PartSaleItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number | ''>(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Cliente e Observações
  const [customers, setCustomers] = useState<CustomerOption[]>(initialCustomers || []);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Modais e status de persistência
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSale, setSavedSale] = useState<PartSaleResponse | null>(null);

  const clientSelectId = useId();
  const notesInputId = useId();

  // Carrega clientes disponíveis para associação
  useEffect(() => {
    if (initialCustomers && initialCustomers.length > 0) return;
    let isMounted = true;
    customersApi
      .getCustomers({ ativo: true, size: 100 })
      .then((res) => {
        if (isMounted && res?.content) {
          setCustomers(res.content);
        }
      })
      .catch(() => {
        // Fallback silencioso em modo offline/testes unitários
      });
    return () => {
      isMounted = false;
    };
  }, [initialCustomers]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedClientId);
  }, [customers, selectedClientId]);

  // Hook de cálculo reativo com o backend
  const calculationPayload = useMemo(() => {
    if (
      typeof quantity !== 'number' ||
      quantity <= 0 ||
      typeof unitPrice !== 'number' ||
      unitPrice <= 0
    ) {
      return null;
    }

    if (category === 'PROFILE') {
      if (typeof heightMm !== 'number' || heightMm <= 0) return null;
      return {
        category,
        heightMm,
        widthMm: resolveItemWidthMm(category, widthMm),
        quantity,
        unitPrice,
        lossFactor,
      };
    }

    if (category === 'HARDWARE') {
      return {
        category,
        quantity,
        unitPrice,
        lossFactor: 0,
      };
    }

    if (category === 'GLASS' || category === 'FILM') {
      if (typeof heightMm !== 'number' || heightMm <= 0 || typeof widthMm !== 'number' || widthMm <= 0) {
        return null;
      }
      return {
        category,
        heightMm,
        widthMm,
        quantity,
        unitPrice,
        lossFactor: 0,
      };
    }

    return null;
  }, [category, heightMm, widthMm, quantity, unitPrice, lossFactor]);

  const { calculation } = usePartCalculation({
    payload: calculationPayload,
    debounceMs: 150,
  });

  const handleAddItem = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const validationError = validatePartForm({
      description,
      quantity,
      heightMm,
      widthMm,
      unitPrice,
      category,
    });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const qty = typeof quantity === 'number' ? quantity : 0;
    const height = typeof heightMm === 'number' ? heightMm : 0;
    const width = typeof widthMm === 'number' ? widthMm : 0;
    const price = typeof unitPrice === 'number' ? unitPrice : 0;

    // Apuração da medida calculada e subtotal
    const calculatedMeasure =
      calculation?.calculatedUnitMeasure ??
      calculateFallbackMeasure({ category, qty, height, width, lossFactor });

    const subtotal = calculation?.totalPrice ?? Number((calculatedMeasure * price).toFixed(2));

    const newItem: PartSaleItem = {
      id: generateItemId(),
      category,
      categoryLabel: CATEGORY_DISPLAY_LABELS[category] || 'Item',
      description: description.trim().toUpperCase(),
      quantity: qty,
      heightMm: height,
      widthMm: resolveItemWidthMm(category, width),
      unitPrice: price,
      lossFactor: category === 'PROFILE' ? lossFactor : 0,
      calculatedUnitMeasure: calculatedMeasure,
      totalPrice: subtotal,
    };

    setItems((prev) => [...prev, newItem]);
    setDescription('');
    setFormError(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Totais consolidados
  const totalQuantity = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const totalCalculatedMeasure = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.calculatedUnitMeasure, 0);
  }, [items]);

  const subtotalAmount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  }, [items]);

  const discountVal = typeof discountAmount === 'number' && discountAmount >= 0 ? discountAmount : 0;
  const totalAmount = Math.max(0, subtotalAmount - discountVal);

  const handleSaveSale = async () => {
    if (items.length === 0) {
      setFormError('Adicione pelo menos um item à venda antes de salvar.');
      return;
    }

    setIsSaving(true);
    try {
      const targetClientId = selectedClientId || (customers.length > 0 ? customers[0].id : crypto.randomUUID());
      const payload: CreatePartSaleRequest = {
        clientId: targetClientId,
        status: 'APPROVED',
        discountAmount: discountVal,
        items: items.map((it) => ({
          materialType: it.category,
          referenceId: it.materialId || it.id,
          quantity: it.quantity,
          widthMm: it.widthMm,
          heightMm: it.heightMm,
          unitPrice: it.unitPrice,
        })),
      };

      const response = await partSaleApi.create(payload);
      setSavedSale(response);
      toast.success(`Venda avulsa ${response.code} salva com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar venda avulsa:', err);
      toast.error('Não foi possível salvar a venda avulsa. Verifique a conexão com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho da Página */}
      <div className="border-b border-outline-variant/60 dark:border-outline/30 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-primary text-on-primary rounded-lg shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              Venda Avulsa
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
            Lançamento rápido de itens, cálculo automático de medidas e emissão imediata.
          </p>
        </div>

        {savedSale && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Código Gerado: {savedSale.code}</span>
          </div>
        )}
      </div>

      {/* Identificação do Cliente / Pedido */}
      <div className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={clientSelectId}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Cliente / Destinatário</span>
            </label>
            <select
              id={clientSelectId}
              data-testid="select-client"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary outline-none font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="">Cliente Balcão (Não Identificado)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeCompleto} {c.documento ? `(${c.documento})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={notesInputId}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
            >
              Observações Comerciais
            </label>
            <input
              id={notesInputId}
              type="text"
              placeholder="Ex: Entregar com corte bisotado / Pagamento à vista"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* GRID: FORMULÁRIO (8 colunas) + RESUMO (4 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ESQUERDA: FORMULÁRIO DE INSERÇÃO & TABELA */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bloco Informações do Material */}
          <form
            onSubmit={handleAddItem}
            className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-xl space-y-5"
          >
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              Informações do Material
            </h3>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400">
                {formError}
              </div>
            )}

            {/* Linha 1: Categoria e Descrição */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="part-category-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
                >
                  Categoria *
                </label>
                <select
                  id="part-category-select"
                  data-testid="select-part-category"
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as MaterialCategoryType;
                    setCategory(newCat);
                    setFormError(null);
                    if (newCat === 'PROFILE') {
                      setUnitPrice(45);
                      setHeightMm(2500);
                    } else if (newCat === 'HARDWARE') {
                      setUnitPrice(25);
                      setHeightMm('');
                      setWidthMm('');
                    } else {
                      setUnitPrice(120);
                      setHeightMm(2000);
                      setWidthMm(800);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary outline-none font-semibold text-slate-900 dark:text-slate-100"
                >
                  <option value="PROFILE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Perfil de Alumínio (Metro)
                  </option>
                  <option value="GLASS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Vidro (Cálculo m²)
                  </option>
                  <option value="FILM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Película (Cálculo m²)
                  </option>
                  <option value="HARDWARE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Ferragem (Unidade)
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="part-description-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
                >
                  Descrição do Material *
                </label>
                <input
                  id="part-description-input"
                  type="text"
                  data-testid="input-part-description"
                  placeholder={resolveMaterialPlaceholder(category)}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary outline-none font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 uppercase"
                />
              </div>
            </div>

            {/* Linha 2: Campos Especialistas conforme Categoria */}
            {category === 'PROFILE' ? (
              <AluminumItemFields
                lengthMm={heightMm}
                quantity={quantity}
                unitPrice={unitPrice}
                lossFactor={lossFactor}
                calculatedMeters={calculation?.calculatedUnitMeasure}
                totalPrice={calculation?.totalPrice}
                onLengthChange={(val) => setHeightMm(val)}
                onQuantityChange={(val) => setQuantity(val)}
                onPriceChange={(val) => setUnitPrice(val)}
              />
            ) : (
              /* Fallback para Vidro / Película / Ferragem */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="part-generic-quantity"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
                  >
                    Qtd *
                  </label>
                  <input
                    id="part-generic-quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    placeholder="1"
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-bold focus:border-primary"
                  />
                </div>
                {category !== 'HARDWARE' && (
                  <>
                    <div>
                      <label
                        htmlFor="part-generic-height"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
                      >
                        Altura (mm) *
                      </label>
                      <input
                        id="part-generic-height"
                        type="number"
                        value={heightMm}
                        placeholder="2000"
                        onChange={(e) => setHeightMm(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-mono font-bold focus:border-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="part-generic-width"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
                      >
                        Largura (mm) *
                      </label>
                      <input
                        id="part-generic-width"
                        type="number"
                        value={widthMm}
                        placeholder="800"
                        onChange={(e) => setWidthMm(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-mono font-bold focus:border-primary"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label
                    htmlFor="part-generic-price"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1"
                  >
                    Preço Venda (R$) *
                  </label>
                  <input
                    id="part-generic-price"
                    type="number"
                    value={unitPrice}
                    placeholder="0.00"
                    onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-mono font-bold focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Botão de Inserção */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                data-testid="btn-add-part-item"
                onClick={() => handleAddItem()}
                className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary dark:bg-primary-fixed dark:hover:bg-primary-fixed-dim dark:text-on-primary-fixed rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Inserir na Venda</span>
              </button>
            </div>
          </form>

          {/* TABELA DE ITENS ADICIONADOS */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-2xs">
            <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-900 dark:text-slate-100 tracking-wider">
                Itens Adicionados à Venda
              </span>
              <span
                data-testid="badge-total-items-count"
                className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-2.5 py-0.5 rounded-full"
              >
                {items.length} item(ns)
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                Nenhum item adicionado à venda até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" data-testid="table-part-items">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Item / Descrição</th>
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3">Dimensões</th>
                      <th className="py-2.5 px-3 text-center">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Preço Venda</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{item.description}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              CATEGORY_BADGE_CLASSES[item.category] || CATEGORY_BADGE_CLASSES.HARDWARE
                            }`}
                          >
                            {item.categoryLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {formatItemDimensions(item)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-slate-100">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label={`Remover item ${item.description}`}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* DIREITA: RESUMO DA VENDA */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Resumo da Venda
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Valores calculados em tempo real
              </p>
            </div>

            <div className="space-y-3 text-xs border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Total de Peças:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm" data-testid="summary-total-pieces">
                  {totalQuantity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Área / Medida Total:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm" data-testid="summary-total-measure">
                  {totalCalculatedMeasure.toFixed(2)} m²/m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Subtotal Bruto:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm" data-testid="summary-subtotal">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 pt-1">
                <label htmlFor="summary-discount-input" className="text-slate-700 dark:text-slate-200 font-medium">
                  Desconto (R$):
                </label>
                <input
                  id="summary-discount-input"
                  type="number"
                  min="0"
                  step="0.01"
                  data-testid="input-discount-amount"
                  value={discountAmount}
                  placeholder="0,00"
                  onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
                  className="w-24 px-2 py-1 text-right font-mono font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Total Final */}
            <div className="pt-1 text-center space-y-1">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Valor Total da Venda
              </p>
              <p
                data-testid="summary-total-amount"
                className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono"
              >
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
              </p>
            </div>

            {/* Ações */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                data-testid="btn-save-part-sale"
                disabled={items.length === 0 || isSaving}
                onClick={handleSaveSale}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Salvando Venda...' : 'Salvar e Concluir Venda'}</span>
              </button>

              <button
                type="button"
                data-testid="btn-export-pdf"
                disabled={items.length === 0}
                onClick={() => setIsPdfModalOpen(true)}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Exportar PDF</span>
              </button>

              <button
                type="button"
                data-testid="btn-print-labels"
                disabled={items.length === 0}
                onClick={() => setIsLabelModalOpen(true)}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-on-primary dark:bg-primary-fixed dark:hover:bg-primary-fixed-dim dark:text-on-primary-fixed text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO / EXPORTAÇÃO PDF */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Visualização para Exportação / PDF</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="pdfContent" className="p-8 overflow-y-auto flex-1 bg-white dark:bg-slate-950 space-y-6 text-xs text-slate-800 dark:text-slate-200">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">AlumiGest ERP</h1>
                  <p className="text-slate-500 text-[11px]">Gestão de Vidros e Alumínio</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">
                    {savedSale ? `VENDA ${savedSale.code}` : 'VENDA AVULSA'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Cliente / Destinatário:</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {selectedCustomer ? selectedCustomer.nomeCompleto : 'Cliente Balcão (Não Identificado)'}
                </p>
                {selectedCustomer?.documento && (
                  <p className="text-slate-500 text-[11px]">CPF/CNPJ: {selectedCustomer.documento}</p>
                )}
                {notes && <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 italic">Obs: {notes}</p>}
              </div>

              <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Categoria</th>
                    <th className="p-2">Dimensões</th>
                    <th className="p-2 text-center">Qtd</th>
                    <th className="p-2 text-right">Unitário</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2 font-sans font-medium text-slate-800 dark:text-slate-200">{it.description}</td>
                      <td className="p-2 font-sans text-slate-600 dark:text-slate-400 text-[11px]">{it.categoryLabel}</td>
                      <td className="p-2">{formatItemDimensions(it)}</td>
                      <td className="p-2 text-center">{it.quantity}</td>
                      <td className="p-2 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.unitPrice)}
                      </td>
                      <td className="p-2 text-right font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalAmount)}
                    </span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Desconto:</span>
                      <span className="font-mono text-rose-600">
                        - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountVal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-sm border-t border-slate-300 dark:border-slate-700 pt-1">
                    <span>Total:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Documento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ETIQUETAS TÉRMICAS */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-500" />
                <span>Etiquetas Térmicas de Expedição</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {items.length} tipo(s) de material(is) pronto(s) para emissão em impressora térmica (formato padrão 100x52mm).
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-950 text-xs">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-xs flex justify-between items-center"
                >
                  <div>
                    <strong className="text-slate-800 dark:text-slate-100 font-bold block">{it.description}</strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Qtd: {it.quantity} un | Tipo: {it.categoryLabel} | Medida: {formatItemDimensions(it)}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                    100×52mm
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setIsLabelModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
