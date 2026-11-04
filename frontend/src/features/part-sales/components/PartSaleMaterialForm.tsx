import { useState, useMemo, type SyntheticEvent } from 'react';
import { Plus, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useHardwares,
  useGlasses,
  useProfiles,
  useFilms,
} from '@/features/catalog/hooks/useCatalog';
import type { HardwareDTO, GlassDTO, ProfileDTO, FilmDTO } from '@/features/catalog/types';
import type { MaterialCategoryType, PartSaleItemDraft } from '../types';
import { GlassItemFields } from './GlassItemFields';
import { FilmItemFields } from './FilmItemFields';
import { AluminumItemFields } from './AluminumItemFields';
import { usePartCalculation } from '../hooks/usePartCalculation';

interface PartSaleMaterialFormProps {
  readonly onAddItem: (item: PartSaleItemDraft) => void;
}

export function PartSaleMaterialForm({ onAddItem }: PartSaleMaterialFormProps) {
  const [materialType, setMaterialType] = useState<MaterialCategoryType>('HARDWARE');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [heightMm, setHeightMm] = useState<string>('');
  const [widthMm, setWidthMm] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [lossFactor, setLossFactor] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const { data: hardwaresResponse } = useHardwares();
  const { data: glassesResponse } = useGlasses();
  const { data: profilesResponse } = useProfiles();
  const { data: filmsResponse } = useFilms();

  const activeHardwares = useMemo(() => {
    const list: HardwareDTO[] = hardwaresResponse?.content || [];
    return list.filter((h: HardwareDTO) => h.active);
  }, [hardwaresResponse]);

  const activeGlasses = useMemo(() => {
    const list: GlassDTO[] = glassesResponse?.content || [];
    return list.filter((g: GlassDTO) => g.active !== false);
  }, [glassesResponse]);

  const activeProfiles = useMemo(() => {
    const list: ProfileDTO[] = profilesResponse?.content || [];
    return list.filter((p: ProfileDTO) => p.active);
  }, [profilesResponse]);

  const activeFilms = useMemo(() => {
    const list: FilmDTO[] = filmsResponse?.content || [];
    return list.filter((f: FilmDTO) => f.active !== false);
  }, [filmsResponse]);

  const handleCategoryChange = (cat: string) => {
    const newType = cat as MaterialCategoryType;
    setMaterialType(newType);
    setSelectedMaterialId('');
    setDescription('');
    setUnitPrice('');

    if (newType === 'HARDWARE') {
      setHeightMm('');
      setWidthMm('');
      setLossFactor(0);
    } else if (newType === 'GLASS') {
      setHeightMm('2000');
      setWidthMm('1000');
      setLossFactor(0);
    } else if (newType === 'FILM') {
      setHeightMm('2000');
      setWidthMm('1000');
      setLossFactor(0.10);
    } else if (newType === 'PROFILE') {
      setHeightMm('2500');
      setWidthMm('');
      setLossFactor(0.05);
    }
  };

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterialId(materialId);
    if (!materialId) {
      setDescription('');
      setUnitPrice('');
      return;
    }

    if (materialType === 'HARDWARE') {
      const hw = activeHardwares.find((h) => h.id === materialId);
      if (hw) {
        setDescription(hw.name);
        setUnitPrice(hw.salePrice ? hw.salePrice.toFixed(2) : '0.00');
      }
    } else if (materialType === 'GLASS') {
      const g = activeGlasses.find((item) => item.id === materialId);
      if (g) {
        setDescription(g.name);
        const price = g.salePrice ?? g.pricePerSqm ?? 0;
        setUnitPrice(price > 0 ? price.toFixed(2) : '0.00');
      }
    } else if (materialType === 'PROFILE') {
      const p = activeProfiles.find((item) => item.id === materialId);
      if (p) {
        setDescription(p.name);
        setUnitPrice(p.salePrice ? p.salePrice.toFixed(2) : '0.00');
      }
    } else if (materialType === 'FILM') {
      const f = activeFilms.find((item) => item.id === materialId);
      if (f) {
        setDescription(f.name);
        setUnitPrice(f.salePrice ? f.salePrice.toFixed(2) : '0.00');
      }
    }
  };

  const calculationPayload = useMemo(() => {
    const q = typeof quantity === 'number' ? quantity : Number.parseInt(String(quantity), 10);
    const p = Number.parseFloat(String(unitPrice).replace(',', '.'));
    const h = Number.parseInt(String(heightMm), 10);
    const w = Number.parseInt(String(widthMm), 10);

    if (!q || q <= 0 || Number.isNaN(p) || p <= 0) {
      return null;
    }

    if (materialType === 'HARDWARE') {
      return {
        category: materialType,
        quantity: q,
        unitPrice: p,
        lossFactor: 0,
      };
    }

    if (materialType === 'PROFILE') {
      if (!h || h <= 0) return null;
      return {
        category: materialType,
        heightMm: h,
        widthMm: null,
        quantity: q,
        unitPrice: p,
        lossFactor,
      };
    }

    if (materialType === 'GLASS') {
      if (!h || h <= 0 || !w || w <= 0) return null;
      return {
        category: materialType,
        heightMm: h,
        widthMm: w,
        quantity: q,
        unitPrice: p,
        lossFactor: 0,
      };
    }

    if (materialType === 'FILM') {
      if (!h || h <= 0 || !w || w <= 0) return null;
      return {
        category: materialType,
        heightMm: h,
        widthMm: w,
        quantity: q,
        unitPrice: p,
        lossFactor,
      };
    }

    return null;
  }, [materialType, heightMm, widthMm, quantity, unitPrice, lossFactor]);

  const { calculation } = usePartCalculation({
    payload: calculationPayload,
    debounceMs: 150,
  });

  const handleInsert = (e: SyntheticEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Informe a descrição do material ou selecione um item do catálogo');
      return;
    }

    const qNum = typeof quantity === 'number' ? quantity : Number.parseInt(String(quantity), 10);
    if (!qNum || qNum <= 0) {
      toast.error('Informe uma quantidade válida e positiva');
      return;
    }

    const priceNum = Number.parseFloat(String(unitPrice).replace(',', '.'));
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error('Informe um preço unitário válido');
      return;
    }

    let calculatedArea: number | null = null;
    let wNum: number | null = null;
    let hNum: number | null = null;
    let linearMeters: number | null = null;

    if (materialType === 'GLASS' || materialType === 'FILM') {
      wNum = widthMm ? Number.parseInt(String(widthMm), 10) : null;
      hNum = heightMm ? Number.parseInt(String(heightMm), 10) : null;

      if (!wNum || wNum <= 0 || !hNum || hNum <= 0) {
        toast.error('Altura e largura (mm) são obrigatórias para vidros e películas');
        return;
      }
      calculatedArea = calculation?.calculatedUnitMeasure ?? Number(((wNum * hNum) / 1_000_000 * qNum).toFixed(4));
    } else if (materialType === 'PROFILE') {
      hNum = heightMm ? Number.parseInt(String(heightMm), 10) : null;
      if (!hNum || hNum <= 0) {
        toast.error('Comprimento (mm) é obrigatório para perfis de alumínio');
        return;
      }
      linearMeters = calculation?.calculatedUnitMeasure ?? Number(((hNum / 1000) * qNum * (1 + lossFactor)).toFixed(4));
    }

    // Calcula subtotal do item
    let subtotal = 0;
    if (calculation?.totalPrice != null) {
      subtotal = calculation.totalPrice;
    } else if (materialType === 'HARDWARE') {
      subtotal = Number((priceNum * qNum).toFixed(2));
    } else if (calculatedArea != null) {
      subtotal = Number((calculatedArea * priceNum).toFixed(2));
    } else if (linearMeters != null) {
      subtotal = Number((linearMeters * priceNum).toFixed(2));
    } else {
      subtotal = Number((priceNum * qNum).toFixed(2));
    }

    // Resolver referenceId do catálogo para evitar 404
    const currentList =
      materialType === 'HARDWARE'
        ? activeHardwares
        : materialType === 'GLASS'
          ? activeGlasses
          : materialType === 'PROFILE'
            ? activeProfiles
            : activeFilms;

    let refId = selectedMaterialId;
    if (!refId && description.trim()) {
      const match = currentList.find((it) => it.name.trim().toLowerCase() === description.trim().toLowerCase());
      if (match) {
        refId = match.id;
      }
    }

    if (!refId && currentList.length > 0) {
      refId = currentList[0].id;
    }

    const newItem: PartSaleItemDraft = {
      tempId: crypto.randomUUID(),
      materialType,
      referenceId: refId || crypto.randomUUID(),
      description: description.trim().toUpperCase(),
      quantity: qNum,
      widthMm: wNum,
      heightMm: hNum,
      linearMeters,
      unitPrice: priceNum,
      totalPrice: subtotal,
      calculatedAreaSqm: calculatedArea,
      notes: notes.trim() || null,
      lossFactor: (materialType === 'PROFILE' || materialType === 'FILM') ? lossFactor : 0,
    };

    onAddItem(newItem);

    // Reset campos
    setSelectedMaterialId('');
    setDescription('');
    setQuantity(1);
    setUnitPrice('');
    setNotes('');
    if (materialType === 'HARDWARE') {
      setHeightMm('');
      setWidthMm('');
    } else if (materialType === 'GLASS' || materialType === 'FILM') {
      setHeightMm('2000');
      setWidthMm('1000');
    } else if (materialType === 'PROFILE') {
      setHeightMm('2500');
      setWidthMm('');
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-navy-900" /> Informações do Material
      </h3>

      <form onSubmit={handleInsert} data-testid="part-sale-material-form" className="space-y-4">
        {/* Linha 1: Categoria e Seleção / Descrição */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="itemCategory" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Categoria *
            </label>
            <select
              id="itemCategory"
              data-testid="select-item-category"
              value={materialType}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium"
            >
              <option value="HARDWARE">Ferragem (Unidade)</option>
              <option value="GLASS">Vidro (Cálculo m²)</option>
              <option value="PROFILE">Perfil de Alumínio (Metro)</option>
              <option value="FILM">Película (Cálculo m²)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="itemDescription" className="block text-xs font-semibold text-slate-700 uppercase">
                Descrição do Material *
              </label>
              <span className="text-[11px] text-slate-500">
                Selecione do catálogo abaixo ou digite
              </span>
            </div>

            <div className="space-y-2">
              {materialType === 'HARDWARE' && (
                <select
                  id="selectHardwareCatalog"
                  data-testid="select-hardware-catalog"
                  value={selectedMaterialId}
                  onChange={(e) => handleMaterialSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium text-slate-700"
                >
                  <option value="">-- Selecionar Ferragem do Catálogo (Opcional) --</option>
                  {activeHardwares.map((hw) => (
                    <option key={hw.id} value={hw.id}>
                      {hw.name} {hw.skuCode ? `(${hw.skuCode})` : ''} - R$ {hw.salePrice?.toFixed(2)}
                    </option>
                  ))}
                </select>
              )}

              {materialType === 'GLASS' && (
                <select
                  id="selectGlassCatalog"
                  data-testid="select-glass-catalog"
                  value={selectedMaterialId}
                  onChange={(e) => handleMaterialSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium text-slate-700"
                >
                  <option value="">-- Selecionar Vidro do Catálogo --</option>
                  {activeGlasses.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.thicknessMm ? `(${g.thicknessMm}mm)` : ''} - R$ {(g.salePrice ?? g.pricePerSqm)?.toFixed(2)}/m²
                    </option>
                  ))}
                </select>
              )}

              {materialType === 'PROFILE' && (
                <select
                  id="selectProfileCatalog"
                  data-testid="select-profile-catalog"
                  value={selectedMaterialId}
                  onChange={(e) => handleMaterialSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium text-slate-700"
                >
                  <option value="">-- Selecionar Perfil do Catálogo --</option>
                  {activeProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.commercialReference ? `(${p.commercialReference})` : ''} - R$ {p.salePrice?.toFixed(2)}/m
                    </option>
                  ))}
                </select>
              )}

              {materialType === 'FILM' && (
                <select
                  id="selectFilmCatalog"
                  data-testid="select-film-catalog"
                  value={selectedMaterialId}
                  onChange={(e) => handleMaterialSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium text-slate-700"
                >
                  <option value="">-- Selecionar Película do Catálogo --</option>
                  {activeFilms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.colorFinish ? `(${f.colorFinish})` : ''} - R$ {f.salePrice?.toFixed(2)}/m²
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                id="itemDescription"
                data-testid="input-item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: ROLDANA DUPLA SUPREMA 112"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-semibold uppercase"
              />
            </div>
          </div>
        </div>

        {/* Linha 2: Campos Especialistas Renderizados por Categoria */}
        {materialType === 'PROFILE' && (
          <AluminumItemFields
            lengthMm={heightMm === '' ? '' : Number(heightMm)}
            quantity={quantity === '' ? '' : Number(quantity)}
            unitPrice={unitPrice === '' ? '' : Number(unitPrice)}
            lossFactor={lossFactor}
            calculatedMeters={calculation?.calculatedUnitMeasure}
            totalPrice={calculation?.totalPrice}
            onLengthChange={(val) => setHeightMm(val === '' ? '' : String(val))}
            onQuantityChange={(val) => setQuantity(val === '' ? '' : Number(val))}
            onPriceChange={(val) => setUnitPrice(val === '' ? '' : String(val))}
          />
        )}

        {materialType === 'GLASS' && (
          <GlassItemFields
            widthMm={widthMm === '' ? '' : Number(widthMm)}
            heightMm={heightMm === '' ? '' : Number(heightMm)}
            quantity={quantity === '' ? '' : Number(quantity)}
            unitPrice={unitPrice === '' ? '' : Number(unitPrice)}
            calculatedArea={calculation?.calculatedUnitMeasure}
            totalPrice={calculation?.totalPrice}
            minimumAreaApplied={calculation?.minimumAreaApplied}
            onWidthChange={(val) => setWidthMm(val === '' ? '' : String(val))}
            onHeightChange={(val) => setHeightMm(val === '' ? '' : String(val))}
            onQuantityChange={(val) => setQuantity(val === '' ? '' : Number(val))}
            onPriceChange={(val) => setUnitPrice(val === '' ? '' : String(val))}
          />
        )}

        {materialType === 'FILM' && (
          <FilmItemFields
            widthMm={widthMm === '' ? '' : Number(widthMm)}
            heightMm={heightMm === '' ? '' : Number(heightMm)}
            quantity={quantity === '' ? '' : Number(quantity)}
            unitPrice={unitPrice === '' ? '' : Number(unitPrice)}
            lossFactor={lossFactor}
            calculatedArea={calculation?.calculatedUnitMeasure}
            totalPrice={calculation?.totalPrice}
            onWidthChange={(val) => setWidthMm(val === '' ? '' : String(val))}
            onHeightChange={(val) => setHeightMm(val === '' ? '' : String(val))}
            onQuantityChange={(val) => setQuantity(val === '' ? '' : Number(val))}
            onPriceChange={(val) => setUnitPrice(val === '' ? '' : String(val))}
            onLossFactorChange={setLossFactor}
          />
        )}

        {materialType === 'HARDWARE' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="itemQty" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Qtd *
              </label>
              <input
                type="number"
                id="itemQty"
                data-testid="input-hardware-quantity"
                value={quantity}
                min="1"
                step="1"
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label htmlFor="itemPrice" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Preço Unidade (R$) *
              </label>
              <input
                type="number"
                id="itemPrice"
                data-testid="input-hardware-price"
                value={unitPrice}
                min="0"
                step="0.01"
                placeholder="28.50"
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        )}

        {/* Botão de Inserção */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            onClick={handleInsert}
            data-testid="btn-insert-material"
            className="px-5 py-2.5 bg-navy-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Inserir na Venda
          </button>
        </div>
      </form>
    </div>
  );
}
