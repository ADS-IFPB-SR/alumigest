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
import type { MaterialCategoryType, PartSaleItemDraft, CalculatePartItemPayload } from '../types';
import { GlassItemFields } from './GlassItemFields';
import { FilmItemFields } from './FilmItemFields';
import { AluminumItemFields } from './AluminumItemFields';
import { usePartCalculation } from '../hooks/usePartCalculation';

interface PartSaleMaterialFormProps {
  readonly onAddItem: (item: PartSaleItemDraft) => void;
}

interface CatalogItemDetail {
  id: string;
  name: string;
  price: number;
}

interface CatalogCollections {
  hardwares: HardwareDTO[];
  glasses: GlassDTO[];
  profiles: ProfileDTO[];
  films: FilmDTO[];
}

interface ParsedMeasures {
  widthMm: number | null;
  heightMm: number | null;
  calculatedArea: number | null;
  linearMeters: number | null;
}

function getActiveCatalogList(
  materialType: MaterialCategoryType,
  catalogs: CatalogCollections
): Array<{ id: string; name: string }> {
  switch (materialType) {
    case 'HARDWARE':
      return catalogs.hardwares;
    case 'GLASS':
      return catalogs.glasses;
    case 'PROFILE':
      return catalogs.profiles;
    case 'FILM':
      return catalogs.films;
    default:
      return [];
  }
}

function findCatalogItem(
  materialType: MaterialCategoryType,
  materialId: string,
  catalogs: CatalogCollections
): CatalogItemDetail | null {
  switch (materialType) {
    case 'HARDWARE': {
      const hw = catalogs.hardwares.find((h) => h.id === materialId);
      return hw ? { id: hw.id, name: hw.name, price: hw.salePrice || 0 } : null;
    }
    case 'GLASS': {
      const g = catalogs.glasses.find((item) => item.id === materialId);
      return g ? { id: g.id, name: g.name, price: g.salePrice ?? g.pricePerSqm ?? 0 } : null;
    }
    case 'PROFILE': {
      const p = catalogs.profiles.find((item) => item.id === materialId);
      return p ? { id: p.id, name: p.name, price: p.salePrice || 0 } : null;
    }
    case 'FILM': {
      const f = catalogs.films.find((item) => item.id === materialId);
      return f ? { id: f.id, name: f.name, price: f.salePrice || 0 } : null;
    }
    default:
      return null;
  }
}

function getDefaultCategoryDimensions(category: MaterialCategoryType): {
  heightMm: string;
  widthMm: string;
  lossFactor: number;
} {
  switch (category) {
    case 'HARDWARE':
      return { heightMm: '', widthMm: '', lossFactor: 0 };
    case 'GLASS':
      return { heightMm: '2000', widthMm: '1000', lossFactor: 0 };
    case 'FILM':
      return { heightMm: '2000', widthMm: '1000', lossFactor: 0.10 };
    case 'PROFILE':
      return { heightMm: '2500', widthMm: '', lossFactor: 0.05 };
    default:
      return { heightMm: '', widthMm: '', lossFactor: 0 };
  }
}

function buildCalculationPayload(
  materialType: MaterialCategoryType,
  quantity: number | '',
  unitPrice: string,
  heightMm: string,
  widthMm: string,
  lossFactor: number
): CalculatePartItemPayload | null {
  const q = typeof quantity === 'number' ? quantity : Number.parseInt(String(quantity), 10);
  const p = Number.parseFloat(String(unitPrice).replace(',', '.'));
  const h = Number.parseInt(String(heightMm), 10);
  const w = Number.parseInt(String(widthMm), 10);

  if (!q || q <= 0 || Number.isNaN(p) || p <= 0) {
    return null;
  }

  switch (materialType) {
    case 'HARDWARE':
      return { category: materialType, quantity: q, unitPrice: p, lossFactor: 0 };
    case 'PROFILE':
      return h > 0 ? { category: materialType, heightMm: h, widthMm: null, quantity: q, unitPrice: p, lossFactor } : null;
    case 'GLASS':
      return h > 0 && w > 0 ? { category: materialType, heightMm: h, widthMm: w, quantity: q, unitPrice: p, lossFactor: 0 } : null;
    case 'FILM':
      return h > 0 && w > 0 ? { category: materialType, heightMm: h, widthMm: w, quantity: q, unitPrice: p, lossFactor } : null;
    default:
      return null;
  }
}

function resolveMeasures(
  materialType: MaterialCategoryType,
  widthMmStr: string,
  heightMmStr: string,
  quantity: number,
  lossFactor: number,
  apiCalculatedMeasure?: number
): { measures: ParsedMeasures | null; errorMessage?: string } {
  if (materialType === 'GLASS' || materialType === 'FILM') {
    const w = widthMmStr ? Number.parseInt(widthMmStr, 10) : 0;
    const h = heightMmStr ? Number.parseInt(heightMmStr, 10) : 0;

    if (w <= 0 || h <= 0) {
      return { measures: null, errorMessage: 'Altura e largura (mm) são obrigatórias para vidros e películas' };
    }
    const area = apiCalculatedMeasure ?? Number(((w * h) / 1_000_000 * quantity).toFixed(4));
    return {
      measures: { widthMm: w, heightMm: h, calculatedArea: area, linearMeters: null },
    };
  }

  if (materialType === 'PROFILE') {
    const h = heightMmStr ? Number.parseInt(heightMmStr, 10) : 0;
    if (h <= 0) {
      return { measures: null, errorMessage: 'Comprimento (mm) é obrigatório para perfis de alumínio' };
    }
    const meters = apiCalculatedMeasure ?? Number(((h / 1000) * quantity * (1 + lossFactor)).toFixed(4));
    return {
      measures: { widthMm: null, heightMm: h, calculatedArea: null, linearMeters: meters },
    };
  }

  return {
    measures: { widthMm: null, heightMm: null, calculatedArea: null, linearMeters: null },
  };
}

function calculateItemSubtotal(
  materialType: MaterialCategoryType,
  priceNum: number,
  quantity: number,
  measures: ParsedMeasures,
  apiTotalPrice?: number
): number {
  if (apiTotalPrice != null) {
    return apiTotalPrice;
  }
  if (materialType === 'HARDWARE') {
    return Number((priceNum * quantity).toFixed(2));
  }
  if (measures.calculatedArea != null) {
    return Number((measures.calculatedArea * priceNum).toFixed(2));
  }
  if (measures.linearMeters != null) {
    return Number((measures.linearMeters * priceNum).toFixed(2));
  }
  return Number((priceNum * quantity).toFixed(2));
}

function resolveReferenceId(
  selectedId: string,
  description: string,
  catalogItems: Array<{ id: string; name: string }>
): string {
  if (selectedId) {
    return selectedId;
  }
  const trimmed = description.trim().toLowerCase();
  const match = catalogItems.find((it) => it.name.trim().toLowerCase() === trimmed);
  if (match) {
    return match.id;
  }
  if (catalogItems.length > 0) {
    return catalogItems[0].id;
  }
  return crypto.randomUUID();
}

function formatHardwareOption(hw: HardwareDTO): string {
  const sku = hw.skuCode ? `(${hw.skuCode})` : '';
  const price = (hw.salePrice ?? 0).toFixed(2);
  return `${hw.name} ${sku} - R$ ${price}`;
}

function formatGlassOption(g: GlassDTO): string {
  const thickness = g.thicknessMm ? `(${g.thicknessMm}mm)` : '';
  const price = (g.salePrice ?? g.pricePerSqm ?? 0).toFixed(2);
  return `${g.name} ${thickness} - R$ ${price}/m²`;
}

function formatProfileOption(p: ProfileDTO): string {
  const ref = p.commercialReference ? `(${p.commercialReference})` : '';
  const price = (p.salePrice ?? 0).toFixed(2);
  return `${p.name} ${ref} - R$ ${price}/m`;
}

function formatFilmOption(f: FilmDTO): string {
  const finish = f.colorFinish ? `(${f.colorFinish})` : '';
  const price = (f.salePrice ?? 0).toFixed(2);
  return `${f.name} ${finish} - R$ ${price}/m²`;
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

    const defaults = getDefaultCategoryDimensions(newType);
    setHeightMm(defaults.heightMm);
    setWidthMm(defaults.widthMm);
    setLossFactor(defaults.lossFactor);
  };

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterialId(materialId);
    if (!materialId) {
      setDescription('');
      setUnitPrice('');
      return;
    }

    const item = findCatalogItem(materialType, materialId, {
      hardwares: activeHardwares,
      glasses: activeGlasses,
      profiles: activeProfiles,
      films: activeFilms,
    });

    if (item) {
      setDescription(item.name);
      setUnitPrice(item.price > 0 ? item.price.toFixed(2) : '0.00');
    }
  };

  const calculationPayload = useMemo(() => {
    return buildCalculationPayload(
      materialType,
      quantity,
      unitPrice,
      heightMm,
      widthMm,
      lossFactor
    );
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

    const { measures, errorMessage } = resolveMeasures(
      materialType,
      widthMm,
      heightMm,
      qNum,
      lossFactor,
      calculation?.calculatedUnitMeasure
    );

    if (!measures) {
      toast.error(errorMessage || 'Medidas inválidas');
      return;
    }

    const subtotal = calculateItemSubtotal(
      materialType,
      priceNum,
      qNum,
      measures,
      calculation?.totalPrice
    );

    const currentList = getActiveCatalogList(materialType, {
      hardwares: activeHardwares,
      glasses: activeGlasses,
      profiles: activeProfiles,
      films: activeFilms,
    });

    const refId = resolveReferenceId(selectedMaterialId, description, currentList);
    const isLossFactorCategory = materialType === 'PROFILE' || materialType === 'FILM';

    const newItem: PartSaleItemDraft = {
      tempId: crypto.randomUUID(),
      materialType,
      referenceId: refId,
      description: description.trim().toUpperCase(),
      quantity: qNum,
      widthMm: measures.widthMm,
      heightMm: measures.heightMm,
      linearMeters: measures.linearMeters,
      unitPrice: priceNum,
      totalPrice: subtotal,
      calculatedAreaSqm: measures.calculatedArea,
      notes: notes.trim() || null,
      lossFactor: isLossFactorCategory ? lossFactor : 0,
    };

    onAddItem(newItem);

    // Reset campos
    setSelectedMaterialId('');
    setDescription('');
    setQuantity(1);
    setUnitPrice('');
    setNotes('');
    const defaults = getDefaultCategoryDimensions(materialType);
    setHeightMm(defaults.heightMm);
    setWidthMm(defaults.widthMm);
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
                      {formatHardwareOption(hw)}
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
                      {formatGlassOption(g)}
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
                      {formatProfileOption(p)}
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
                      {formatFilmOption(f)}
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
