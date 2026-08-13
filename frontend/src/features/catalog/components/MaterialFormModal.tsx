import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateGlass, useUpdateGlass, useCreateHardware, useUpdateHardware, useCreateFilm, useUpdateFilm } from '../hooks/useCatalog';
import type { MaterialType } from '../types';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger } from '../../../utils/formatters';

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
  const [colorFinish, setColorFinish] = useState('');
  const [price, setPrice] = useState('');
  const [filmType, setFilmType] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('UNIDADE');

  // Reset form on open
  // Populate form on open
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '');
      
      if (tipo === 'Hardware') {
        setSkuCode(initialData.skuCode || '');
        setUnitMeasure(initialData.unitMeasure === 'UN' ? 'UNIDADE' : 'M2');
      } else if (tipo === 'Film') {
        setSkuCode(initialData.commercialReference || '');
        setFilmType(initialData.colorFinish || '');
      } else if (tipo === 'Glass') {
        setThicknessMm(initialData.thicknessMm?.toString() || '8');
        setColorFinish(initialData.colorFinish || '');
      }
      
      const p = initialData.salePrice ?? initialData.pricePerSqm ?? 0;
      setPrice(formatCurrencyInput(p.toFixed(2)));
    } else if (isOpen && !initialData) {
      setName('');
      setSkuCode('');
      setThicknessMm('8');
      setColorFinish('');
      setPrice('');
      setFilmType('');
      setUnitMeasure('UNIDADE');
    }
  }, [isOpen, initialData, tipo]);

  const handleSave = () => {
    const payloadGlass = {
      name,
      thicknessMm: Number(thicknessMm),
      colorFinish,
      pricePerSqm: parseCurrencyString(price),
      maxWidthMm: 2000,
      maxHeightMm: 3000,
      supplierId: "1",
      active: true
    };
    
    const payloadHardware = {
      name,
      skuCode,
      unitMeasure: unitMeasure === 'UNIDADE' ? 'UN' : 'M2',
      calculationType: 'UNIT' as const,
      costPrice: 0,
      salePrice: parseCurrencyString(price),
      active: true
    };
    
    const payloadFilm = {
      name,
      commercialReference: skuCode || 'PEL-001',
      colorFinish: filmType,
      salePrice: parseCurrencyString(price),
      costPrice: 0,
      thicknessMm: 0.08,
      standardLengthM: 30,
      unitMeasure: 'M2',
      active: true
    };

    if (tipo === 'Glass') {
      if (isEditing) updateGlass({ id: initialData.id, data: payloadGlass as any }, { onSuccess: onClose });
      else createGlass(payloadGlass as any, { onSuccess: onClose });
    } else if (tipo === 'Hardware') {
      if (isEditing) updateHardware({ id: initialData.id, data: payloadHardware as any }, { onSuccess: onClose });
      else createHardware(payloadHardware as any, { onSuccess: onClose });
    } else if (tipo === 'Film') {
      if (isEditing) updateFilm({ id: initialData.id, data: payloadFilm as any }, { onSuccess: onClose });
      else createFilm(payloadFilm as any, { onSuccess: onClose });
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
        {tipo === 'Hardware' && (
          <Input 
            label="Código" 
            placeholder="Ex: FER-001" 
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
        
        {tipo === 'Glass' && (
          <>
            <Input 
              label="Espessura" 
              type="number" 
              unit="mm" 
              placeholder="8" 
              value={thicknessMm}
              onChange={(e) => setThicknessMm(formatInteger(e.target.value))} 
            />
            <Input 
              label="Cor / Acabamento" 
              placeholder="Incolor" 
              value={colorFinish}
              onChange={(e) => setColorFinish(formatUppercase(e.target.value))}
            />
          </>
        )}
        
        {tipo === 'Film' && (
          <Input 
            label="Tipo/Cor" 
            placeholder="Ex: JATEADO" 
            value={filmType}
            onChange={(e) => setFilmType(formatUppercase(e.target.value))}
            className="col-span-1 md:col-span-2" 
          />
        )}

        {tipo === 'Hardware' ? (
          <Input 
            label="Preço Unitário" 
            unit="R$" 
            placeholder="0,00" 
            value={price}
            onChange={(e) => setPrice(formatCurrencyInput(e.target.value))}
          />
        ) : (
          <Input 
            label="Preço Metro Quadrado" 
            unit="R$/m²" 
            placeholder="0,00" 
            value={price}
            onChange={(e) => setPrice(formatCurrencyInput(e.target.value))}
          />
        )}
      </div>
    </Modal>
  );
}
