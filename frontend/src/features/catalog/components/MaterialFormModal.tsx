import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateGlass, useUpdateGlass, useCreateHardware, useUpdateHardware, useCreateFilm, useUpdateFilm } from '../hooks/useCatalog';
import type { MaterialType } from '../types';
import { formatCurrencyInput, parseCurrencyString, formatUppercase } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';

interface Props {
 isOpen: boolean;
 onClose: () => void;
 tipo: MaterialType;
 initialData?: any; // Para futura edição
}

export function MaterialFormModal({ isOpen, onClose, tipo, initialData }: Props) {
 const isEditing = Boolean(initialData);

 const { mutate: createGlass, isPending: isGlassPending } = useCreateGlass();
 const { mutate: updateGlass, isPending: isUpdateGlassPending } = useUpdateGlass();
 
 const { mutate: createHardware, isPending: isHardwarePending } = useCreateHardware();
 const { mutate: updateHardware, isPending: isUpdateHardwarePending } = useUpdateHardware();
 
 const { mutate: createFilm, isPending: isFilmPending } = useCreateFilm();
 const { mutate: updateFilm, isPending: isUpdateFilmPending } = useUpdateFilm();

 const isPending = isGlassPending || isUpdateGlassPending || isHardwarePending || isUpdateHardwarePending || isFilmPending || isUpdateFilmPending;

 // Estado do formulário
 const [name, setName] = useState('');
 const [skuCode, setSkuCode] = useState('');
 const [thicknessMm, setThicknessMm] = useState('8');
 const [standardLengthM, setStandardLengthM] = useState('30');
 const [maxWidthMm, setMaxWidthMm] = useState('1520'); // ex: bobina 1.52m
 const [colorFinish, setColorFinish] = useState('');
 const [costPrice, setCostPrice] = useState('');
 const [salePrice, setSalePrice] = useState('');
 const [filmType, setFilmType] = useState('');
 const [unitMeasure, setUnitMeasure] = useState('UN');
 const [ncmCode, setNcmCode] = useState('');
 const [active, setActive] = useState(true);

 // Reset form on open
 // Populate form on open
 useEffect(() => {
  if (isOpen && initialData) {
  setName(initialData.name || '');
  setNcmCode(initialData.ncmCode || '');
  
   if (tipo === 'Hardware') {
   setSkuCode(initialData.skuCode || '');
   setUnitMeasure(initialData.unitMeasure || 'UN');
   } else if (tipo === 'Film') {
  setSkuCode(initialData.commercialReference || '');
  setFilmType(initialData.colorFinish || '');
  setThicknessMm(initialData.thicknessMm?.toString() || '0.08');
  setStandardLengthM(initialData.standardLengthM?.toString() || '30');
  setMaxWidthMm(initialData.maxWidthMm?.toString() || '1520');
  } else if (tipo === 'Glass') {
  setThicknessMm(initialData.thicknessMm?.toString() || '8');
  setColorFinish(initialData.colorFinish || '');
  }
  
  const cp = initialData.costPrice ?? 0;
  const sp = initialData.salePrice ?? initialData.pricePerSqm ?? 0;
  setCostPrice(formatCurrencyInput(cp.toFixed(2)));
  setSalePrice(formatCurrencyInput(sp.toFixed(2)));
  setActive(initialData.active ?? true);
  } else if (isOpen && !initialData) {
  setName('');
  setSkuCode('');
  setNcmCode('');
  setThicknessMm(tipo === 'Film' ? '0.08' : '8');
  setStandardLengthM('30');
  setMaxWidthMm('1520');
  setColorFinish('');
   setCostPrice('');
   setSalePrice('');
   setFilmType('');
   setUnitMeasure('UN');
   setActive(true);
  }
  }, [isOpen, initialData, tipo]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome/descrição é obrigatório.');
      return;
    }

    if ((tipo === 'Hardware' || tipo === 'Film') && !skuCode.trim() && tipo === 'Hardware') {
      toast.error('O código/referência é obrigatório para ferragens.');
      return;
    }

    const parsedCostPrice = parseCurrencyString(costPrice);
    const parsedSalePrice = parseCurrencyString(salePrice);

    if (parsedCostPrice < 0 || parsedSalePrice < 0) {
      toast.error('Os preços não podem ser negativos.');
      return;
    }

    const payloadGlass = {
      name,
      thicknessMm: Number(thicknessMm),
      colorFinish,
      costPrice: parsedCostPrice,
      salePrice: parsedSalePrice
    };
    
    const updatePayloadGlass = {
      name,
      costPrice: parsedCostPrice, // Será ignorado pelo backend até Herbert arrumar
      salePrice: parsedSalePrice
    };
    
    const payloadHardware = {
      name,
      skuCode,
      unitMeasure: unitMeasure,
      calculationType: unitMeasure === 'UN' ? 'UNIT' : (unitMeasure === 'PAR' ? 'PAIR' : 'LINEAR_METER'),
      costPrice: parsedCostPrice,
      salePrice: parsedSalePrice,
      ncmCode,
      active
    };
    
    const payloadFilm = {
      name,
      commercialReference: skuCode || undefined,
      colorFinish: filmType,
      salePrice: parsedSalePrice,
      costPrice: parsedCostPrice,
      thicknessMm: Number(thicknessMm) || 0.08,
      standardLengthM: Number(standardLengthM) || 30,
      maxWidthMm: Number(maxWidthMm) || 1520,
      ncmCode,
      unitMeasure: initialData?.unitMeasure || 'M2',
      active
    };

    if (tipo === 'Glass') {
      if (isEditing) updateGlass({ id: initialData.id, data: updatePayloadGlass as any }, { onSuccess: onClose, onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar o vidro.') });
      else createGlass(payloadGlass as any, { onSuccess: onClose, onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao criar o vidro.') });
    } else if (tipo === 'Hardware') {
      if (isEditing) updateHardware({ id: initialData.id, data: payloadHardware as any }, { onSuccess: onClose, onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar a ferragem.') });
      else createHardware(payloadHardware as any, { onSuccess: onClose, onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao criar a ferragem.') });
    } else if (tipo === 'Film') {
      if (isEditing) updateFilm({ id: initialData.id, data: payloadFilm as any }, { onSuccess: onClose, onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar a película.') });
      else createFilm(payloadFilm as any, { onSuccess: onClose, onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao criar a película.') });
    }
  };

  const tipoTranslate: Record<string, string> = {
    'Glass': 'Vidro',
    'Profile': 'Perfil',
    'Hardware': 'Ferragem',
    'Film': 'Película'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de ${tipoTranslate[tipo] || tipo}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {(tipo === 'Hardware' || tipo === 'Film') && (
          <Input 
            label={tipo === 'Hardware' ? "Código" : "Referência Comercial (Opcional)"} 
            placeholder={tipo === 'Hardware' ? "Ex: FER-001" : "Ex: G20"} 
            value={skuCode}
            onChange={(e) => setSkuCode(formatUppercase(e.target.value))}
            className="col-span-1 md:col-span-2" 
          />
        )}
        <Input 
          label="Nome / Descrição" 
          placeholder={`Nome do material`} 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-1 md:col-span-2" 
        />
        {(tipo === 'Hardware' || tipo === 'Film') && (
          <Input 
            label="Código NCM" 
            placeholder="Opcional" 
            value={ncmCode}
            onChange={(e) => setNcmCode(e.target.value)}
            className="col-span-1 md:col-span-2" 
          />
        )}
        
        {tipo === 'Glass' && (
          <>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md font-medium text-on-surface">
                Espessura (mm)
              </label>
              <select
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-sm py-xs h-[42px] font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
                value={thicknessMm}
                onChange={(e) => setThicknessMm(e.target.value)}
                disabled={isEditing}
              >
                <option value="2">2 mm</option>
                <option value="4">4 mm</option>
                <option value="6">6 mm</option>
                <option value="8">8 mm</option>
                <option value="10">10 mm</option>
              </select>
            </div>
            <Input 
              label="Cor / Acabamento" 
              placeholder="Incolor" 
              value={colorFinish}
              onChange={(e) => setColorFinish(formatUppercase(e.target.value))}
              disabled={isEditing}
            />
          </>
        )}
 
 {tipo === 'Film' && (
  <>
   <Input 
   label="Tipo/Cor" 
   placeholder="Ex: JATEADO" 
   value={filmType}
   onChange={(e) => setFilmType(formatUppercase(e.target.value))}
   className="col-span-1 md:col-span-2" 
   />
   <Input 
   label="Espessura (mm)" 
   placeholder="Ex: 0.08" 
   value={thicknessMm}
   onChange={(e) => setThicknessMm(e.target.value)}
   />
   <Input 
   label="Comprimento da Bobina (m)" 
   placeholder="Ex: 30" 
   value={standardLengthM}
   onChange={(e) => setStandardLengthM(e.target.value)}
   />
   <Input 
   label="Largura da Bobina (mm)" 
   placeholder="Ex: 1520" 
   value={maxWidthMm}
   onChange={(e) => setMaxWidthMm(e.target.value)}
   className="col-span-1 md:col-span-2" 
   />
  </>
 )}

 {tipo === 'Hardware' && (
  <div className="flex flex-col gap-xs col-span-1 md:col-span-2">
    <label className="font-label-md text-label-md font-medium text-on-surface">
      Unidade de Medida
    </label>
    <select
      className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-sm py-xs h-[42px] font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
      value={unitMeasure}
      onChange={(e) => setUnitMeasure(e.target.value)}
    >
      <option value="UN">Unidade (UN)</option>
      <option value="PAR">Par (PAR)</option>
      <option value="METRO">Metro Linear (M)</option>
    </select>
  </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">
   <Input 
     label="Preço de Custo" 
     unit={tipo === 'Hardware' ? "R$" : "R$/m²"}
     placeholder="0,00" 
     value={costPrice}
     onChange={(e) => setCostPrice(formatCurrencyInput(e.target.value))}
   />
   <Input 
     label="Preço de Venda" 
     unit={tipo === 'Hardware' ? "R$" : "R$/m²"}
     placeholder="0,00" 
     value={salePrice}
     onChange={(e) => setSalePrice(formatCurrencyInput(e.target.value))}
   />
 </div>
 
 {isEditing && (
 <StatusToggle active={active} onChange={setActive} />
 )}
 </div>
 </Modal>
 );
}
