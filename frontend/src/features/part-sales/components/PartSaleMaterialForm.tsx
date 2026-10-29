import { useState, useMemo } from 'react';
import { Plus, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHardwares } from '@/features/catalog/hooks/useCatalog';
import type { HardwareDTO } from '@/features/catalog/types';
import type { MaterialCategoryType, PartSaleItemDraft } from '../types';

interface PartSaleMaterialFormProps {
  readonly onAddItem: (item: PartSaleItemDraft) => void;
}

export function PartSaleMaterialForm({ onAddItem }: PartSaleMaterialFormProps) {
  const [materialType, setMaterialType] = useState<MaterialCategoryType>('HARDWARE');
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [heightMm, setHeightMm] = useState<string>('');
  const [widthMm, setWidthMm] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { data: hardwaresResponse } = useHardwares();

  const activeHardwares = useMemo(() => {
    const list: HardwareDTO[] = hardwaresResponse?.content || [];
    return list.filter((h: HardwareDTO) => h.active);
  }, [hardwaresResponse]);

  const handleCategoryChange = (cat: string) => {
    const newType = cat as MaterialCategoryType;
    setMaterialType(newType);
    if (newType === 'HARDWARE') {
      setHeightMm('');
      setWidthMm('');
    }
  };

  const handleHardwareSelect = (hardwareId: string) => {
    setSelectedHardwareId(hardwareId);
    const hw = activeHardwares.find((h) => h.id === hardwareId);
    if (hw) {
      setDescription(hw.name);
      setUnitPrice(hw.salePrice ? hw.salePrice.toFixed(2) : '0.00');
    }
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Informe a descrição do material');
      return;
    }

    if (!quantity || quantity <= 0) {
      toast.error('Informe uma quantidade válida e positiva');
      return;
    }

    const priceNum = parseFloat(unitPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Informe um preço unitário válido');
      return;
    }

    let calculatedArea: number | null = null;
    let wNum: number | null = null;
    let hNum: number | null = null;

    if (materialType === 'GLASS' || materialType === 'FILM') {
      wNum = widthMm ? parseInt(widthMm, 10) : null;
      hNum = heightMm ? parseInt(heightMm, 10) : null;

      if (!wNum || wNum <= 0 || !hNum || hNum <= 0) {
        toast.error('Altura e largura (mm) são obrigatórias para vidros e películas');
        return;
      }
      calculatedArea = Number(((wNum * hNum) / 1_000_000 * quantity).toFixed(4));
    }

    // Calcula subtotal do item
    let subtotal = 0;
    if (materialType === 'HARDWARE') {
      subtotal = Number((priceNum * quantity).toFixed(2));
    } else if (calculatedArea) {
      subtotal = Number((calculatedArea * priceNum).toFixed(2));
    } else {
      subtotal = Number((priceNum * quantity).toFixed(2));
    }

    const newItem: PartSaleItemDraft = {
      tempId: crypto.randomUUID(),
      materialType,
      referenceId: selectedHardwareId || crypto.randomUUID(),
      description: description.trim().toUpperCase(),
      quantity,
      widthMm: wNum,
      heightMm: hNum,
      linearMeters: null,
      unitPrice: priceNum,
      totalPrice: subtotal,
      calculatedAreaSqm: calculatedArea,
      notes: notes.trim() || null,
    };

    onAddItem(newItem);

    // Limpar campos
    setDescription('');
    setSelectedHardwareId('');
    setQuantity(1);
    setHeightMm('');
    setWidthMm('');
    setUnitPrice('');
    setNotes('');
  };

  const isHardware = materialType === 'HARDWARE';

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
              {isHardware && activeHardwares.length > 0 && (
                <span className="text-[11px] text-slate-500">
                  Ou selecione do catálogo abaixo
                </span>
              )}
            </div>

            {isHardware && activeHardwares.length > 0 ? (
              <div className="space-y-2">
                <select
                  id="selectHardwareCatalog"
                  value={selectedHardwareId}
                  onChange={(e) => handleHardwareSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium text-slate-700 mb-1"
                >
                  <option value="">-- Selecionar Ferragem do Catálogo (Opcional) --</option>
                  {activeHardwares.map((hw) => (
                    <option key={hw.id} value={hw.id}>
                      {hw.name} {hw.skuCode ? `(${hw.skuCode})` : ''} - R$ {hw.salePrice?.toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="itemDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: ROLDANA DUPLA SUPREMA 112"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-semibold uppercase"
                />
              </div>
            ) : (
              <input
                type="text"
                id="itemDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: ROLDANA DUPLA SUPREMA 112"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-semibold uppercase"
              />
            )}
          </div>
        </div>

        {/* Linha 2: Quantidade, Medidas (Ocultas para Ferragem) e Preço */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="itemQty" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Qtd *
            </label>
            <input
              type="number"
              id="itemQty"
              value={quantity}
              min="1"
              step="1"
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-bold text-slate-800"
            />
          </div>

          {/* Altura - Oculto quando Ferragem */}
          <div id="containerHeight" className={isHardware ? 'hidden' : ''}>
            <label htmlFor="itemHeight" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Altura (mm) *
            </label>
            <input
              type="number"
              id="itemHeight"
              value={heightMm}
              min="0"
              step="1"
              placeholder="2000"
              onChange={(e) => setHeightMm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-mono"
            />
          </div>

          {/* Largura - Oculto quando Ferragem */}
          <div id="containerWidth" className={isHardware ? 'hidden' : ''}>
            <label htmlFor="itemWidth" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Largura (mm) *
            </label>
            <input
              type="number"
              id="itemWidth"
              value={widthMm}
              min="0"
              step="1"
              placeholder="800"
              onChange={(e) => setWidthMm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-mono"
            />
          </div>

          <div>
            <label htmlFor="itemPrice" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {isHardware ? 'Preço Unidade (R$) *' : 'Preço Venda (R$) *'}
            </label>
            <input
              type="number"
              id="itemPrice"
              value={unitPrice}
              min="0"
              step="0.01"
              placeholder="28.50"
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-mono font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Botão de Inserção */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            onClick={handleInsert}
            className="px-5 py-2.5 bg-navy-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Inserir na Venda
          </button>
        </div>
      </form>
    </div>
  );
}
