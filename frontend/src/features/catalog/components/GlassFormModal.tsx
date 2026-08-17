import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateGlass, useUpdateGlass } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function GlassFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createGlass, isPending: isCreatePending } = useCreateGlass();
  const { mutate: updateGlass, isPending: isUpdatePending } = useUpdateGlass();
  const isPending = isCreatePending || isUpdatePending;

  const [name, setName] = useState('');
  const [thicknessMm, setThicknessMm] = useState('8');
  const [colorFinish, setColorFinish] = useState('');
  const [ncmCode, setNcmCode] = useState('');
  const [maxWidthMm, setMaxWidthMm] = useState('2000');
  const [maxHeightMm, setMaxHeightMm] = useState('3000');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '');
      setNcmCode(initialData.ncmCode || '');
      setThicknessMm(initialData.thicknessMm?.toString() || '8');
      setColorFinish(initialData.colorFinish || '');
      setMaxWidthMm(initialData.maxWidthMm?.toString() || '2000');
      setMaxHeightMm(initialData.maxHeightMm?.toString() || '3000');
      
      const cp = initialData.costPrice ?? 0;
      const sp = initialData.salePrice ?? initialData.pricePerSqm ?? 0;
      setCostPrice(formatCurrencyInput(cp.toFixed(2)));
      setSalePrice(formatCurrencyInput(sp.toFixed(2)));
      setActive(initialData.active ?? true);
    } else if (isOpen && !initialData) {
      setName('');
      setNcmCode('');
      setThicknessMm('8');
      setColorFinish('');
      setMaxWidthMm('2000');
      setMaxHeightMm('3000');
      setCostPrice('');
      setSalePrice('');
      setActive(true);
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome/descrição é obrigatório.');
      return;
    }

    const parsedCostPrice = parseCurrencyString(costPrice);
    const parsedSalePrice = parseCurrencyString(salePrice);

    if (parsedCostPrice < 0 || parsedSalePrice < 0) {
      toast.error('Os preços não podem ser negativos.');
      return;
    }

    const payload = {
      name,
      thicknessMm: Number(thicknessMm),
      colorFinish,
      maxWidthMm: Number(maxWidthMm),
      maxHeightMm: Number(maxHeightMm),
      costPrice: parsedCostPrice,
      salePrice: parsedSalePrice,
      ncmCode: ncmCode.trim() ? ncmCode.trim() : undefined,
      active
    };

    if (isEditing) {
      updateGlass({ id: initialData.id, data: payload as any }, { 
        onSuccess: onClose, 
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar o vidro.') 
      });
    } else {
      createGlass(payload as any, { 
        onSuccess: onClose, 
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao criar o vidro.') 
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Vidro`}
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
        <Input 
          label="Nome / Descrição" 
          placeholder="Ex: Vidro Temperado 8mm Incolor" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-1 md:col-span-2" 
        />
        <Input 
          label="Código NCM" 
          placeholder="Opcional" 
          value={ncmCode}
          onChange={(e) => setNcmCode(formatInteger(e.target.value).slice(0, 8))}
          className="col-span-1 md:col-span-2" 
        />
        
        <div className="flex flex-col gap-xs">
          <label htmlFor="glass-thickness" className="font-label-md text-label-md font-medium text-on-surface">
            Espessura (mm)
          </label>
          <select
            id="glass-thickness"
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
          placeholder="Ex: INCOLOR" 
          value={colorFinish}
          onChange={(e) => setColorFinish(formatUppercase(e.target.value))}
          disabled={isEditing}
        />

        <Input 
          label="Largura Máxima (mm)" 
          placeholder="Ex: 2000" 
          value={maxWidthMm}
          onChange={(e) => setMaxWidthMm(formatInteger(e.target.value).slice(0, 5))}
        />
        <Input 
          label="Altura Máxima (mm)" 
          placeholder="Ex: 3000" 
          value={maxHeightMm}
          onChange={(e) => setMaxHeightMm(formatInteger(e.target.value).slice(0, 5))}
        />
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">
          <Input 
            label="Preço de Custo" 
            unit="R$/m²"
            placeholder="0,00" 
            value={costPrice}
            onChange={(e) => setCostPrice(formatCurrencyInput(e.target.value))}
          />
          <Input 
            label="Preço de Venda" 
            unit="R$/m²"
            placeholder="0,00" 
            value={salePrice}
            onChange={(e) => setSalePrice(formatCurrencyInput(e.target.value))}
          />
        </div>
        
        {isEditing && (
          <div className="col-span-1 md:col-span-2 mt-xs">
            <StatusToggle active={active} onChange={setActive} />
          </div>
        )}
      </div>
    </Modal>
  );
}
