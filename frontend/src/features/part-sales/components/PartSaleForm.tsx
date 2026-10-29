import React, { useState, useMemo } from 'react';
import { Plus, Trash2, FileText, Tag, ShoppingCart } from 'lucide-react';
import type { MaterialCategoryType, PartSaleItem } from '../types/partSaleTypes';
import { AluminumItemFields } from './AluminumItemFields';
import { usePartCalculation } from '../hooks/usePartCalculation';

export function PartSaleForm() {
  const [category, setCategory] = useState<MaterialCategoryType>('PROFILE');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [heightMm, setHeightMm] = useState<number | ''>(2500);
  const [widthMm, setWidthMm] = useState<number | ''>(800);
  const [unitPrice, setUnitPrice] = useState<number | ''>(45);
  const [lossFactor] = useState<number>(0.05); // 5% perda padrão de corte

  const [items, setItems] = useState<PartSaleItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number | ''>(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Hook de cálculo reativo com o backend
  const calculationPayload = useMemo(() => {
    if (
      typeof quantity !== 'number' ||
      quantity <= 0 ||
      typeof heightMm !== 'number' ||
      heightMm <= 0 ||
      typeof unitPrice !== 'number' ||
      unitPrice <= 0
    ) {
      return null;
    }

    return {
      category,
      heightMm,
      widthMm: category === 'PROFILE' || category === 'HARDWARE' ? null : (typeof widthMm === 'number' ? widthMm : null),
      quantity,
      unitPrice,
      lossFactor: category === 'PROFILE' ? lossFactor : 0,
    };
  }, [category, heightMm, widthMm, quantity, unitPrice, lossFactor]);

  const { calculation } = usePartCalculation({
    payload: calculationPayload,
    debounceMs: 150,
  });

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const desc = description.trim();
    if (!desc) {
      setFormError('Informe a descrição do material.');
      return;
    }

    const qty = typeof quantity === 'number' ? quantity : 0;
    const height = typeof heightMm === 'number' ? heightMm : 0;
    const width = typeof widthMm === 'number' ? widthMm : 0;
    const price = typeof unitPrice === 'number' ? unitPrice : 0;

    if (qty <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }

    if (category === 'PROFILE') {
      if (height <= 0) {
        setFormError('O comprimento deve ser maior que zero.');
        return;
      }
      if (height > 6000) {
        setFormError('O comprimento não pode exceder 6000 mm (1 barra padrão).');
        return;
      }
    }

    if (price <= 0) {
      setFormError('O preço de venda deve ser maior que zero.');
      return;
    }

    // Apuração da medida calculada e subtotal
    const calculatedMeasure = calculation?.calculatedUnitMeasure ?? (
      category === 'PROFILE'
        ? Number(((height / 1000) * qty * (1 + (lossFactor || 0))).toFixed(4))
        : qty
    );

    const subtotal = calculation?.totalPrice ?? Number((calculatedMeasure * price).toFixed(2));

    const newItem: PartSaleItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      categoryLabel: category === 'PROFILE' ? 'Alumínio' : category === 'GLASS' ? 'Vidro' : category === 'FILM' ? 'Película' : 'Ferragem',
      description: desc.toUpperCase(),
      quantity: qty,
      heightMm: height,
      widthMm: category === 'PROFILE' || category === 'HARDWARE' ? null : width,
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

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho da Página */}
      <div className="border-b border-outline-variant/60 dark:border-outline/30 pb-4 mb-2 flex items-center justify-between">
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
      </div>

      {/* GRID: FORMULÁRIO (8 colunas) + RESUMO (4 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ESQUERDA: FORMULÁRIO DE INSERÇÃO & TABELA */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bloco Informações do Material */}
          <form onSubmit={handleAddItem} className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-xl space-y-5">
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
                <label htmlFor="part-category-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1">
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
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary outline-none font-semibold text-slate-900 dark:text-slate-100"
                >
                  <option value="PROFILE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Perfil de Alumínio (Metro)</option>
                  <option value="GLASS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Vidro (Cálculo m²)</option>
                  <option value="FILM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Película (Cálculo m²)</option>
                  <option value="HARDWARE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Ferragem (Unidade)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="part-description-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1">
                  Descrição do Material *
                </label>
                <input
                  id="part-description-input"
                  type="text"
                  data-testid="input-part-description"
                  placeholder={
                    category === 'PROFILE'
                      ? 'Ex: PERFIL U LINHA SUPREMA BRANCO'
                      : 'Ex: VIDRO 8MM INCOLOR'
                  }
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
              /* Fallback Genérico para Vidro / Película / Ferragem */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="part-generic-quantity" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Qtd *
                  </label>
                  <input
                    id="part-generic-quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    placeholder="1"
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-bold focus:border-primary"
                  />
                </div>
                {category !== 'HARDWARE' && (
                  <>
                    <div>
                      <label htmlFor="part-generic-height" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1">
                        Altura (mm) *
                      </label>
                      <input
                        id="part-generic-height"
                        type="number"
                        value={heightMm}
                        placeholder="2000"
                        onChange={(e) => setHeightMm(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-mono font-bold focus:border-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="part-generic-width" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1">
                        Largura (mm) *
                      </label>
                      <input
                        id="part-generic-width"
                        type="number"
                        value={widthMm}
                        placeholder="800"
                        onChange={(e) => setWidthMm(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none font-mono font-bold focus:border-primary"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="part-generic-price" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Preço Venda (R$) *
                  </label>
                  <input
                    id="part-generic-price"
                    type="number"
                    value={unitPrice}
                    placeholder="0.00"
                    onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                              item.category === 'PROFILE'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : item.category === 'GLASS'
                                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30'
                                : item.category === 'FILM'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {item.categoryLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {item.category === 'PROFILE'
                            ? `${item.heightMm} mm (Comp.)`
                            : item.widthMm
                            ? `${item.heightMm} x ${item.widthMm} mm`
                            : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-slate-100">{item.quantity}</td>
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valores calculados em tempo real</p>
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
                  onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                data-testid="btn-export-pdf"
                disabled={items.length === 0}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Exportar PDF</span>
              </button>
              <button
                type="button"
                data-testid="btn-print-labels"
                disabled={items.length === 0}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-on-primary dark:bg-primary-fixed dark:hover:bg-primary-fixed-dim dark:text-on-primary-fixed text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
