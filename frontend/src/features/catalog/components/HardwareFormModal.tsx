import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateHardware, useUpdateHardware } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function HardwareFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createHardware, isPending: isCreatePending } = useCreateHardware();
  const { mutate: updateHardware, isPending: isUpdatePending } = useUpdateHardware();
  const isPending = isCreatePending || isUpdatePending;

  const [skuCode, setSkuCode] = useState('');
  const [name, setName] = useState('');
  const [ncmCode, setNcmCode] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('UN');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isOpen && initialData) {
      setSkuCode(initialData.skuCode || '');
      setName(initialData.name || '');
      setNcmCode(initialData.ncmCode || '');
      setUnitMeasure(initialData.unitMeasure || 'UN');
      
      const cp = initialData.costPrice ?? 0;
      const sp = initialData.salePrice ?? 0;
      setCostPrice(formatCurrencyInput(cp.toFixed(2)));
      setSalePrice(formatCurrencyInput(sp.toFixed(2)));
      setActive(initialData.active ?? true);
    } else if (isOpen && !initialData) {
      setSkuCode('');
      setName('');
      setNcmCode('');
      setUnitMeasure('UN');
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

    if (!skuCode.trim()) {
      toast.error('O código/referência é obrigatório para ferragens.');
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
      skuCode,
      unitMeasure,
      calculationType: unitMeasure === 'UN' ? 'UNIT' : (unitMeasure === 'PAR' ? 'PAIR' : 'LINEAR_METER'),
      costPrice: parsedCostPrice,
      salePrice: parsedSalePrice,
      ncmCode: ncmCode.trim() ? ncmCode.trim() : undefined,
      active
    };

    if (isEditing) {
      updateHardware({ id: initialData.id, data: payload as any }, { 
        onSuccess: onClose, 
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar a ferragem.') 
      });
    } else {
      createHardware(payload as any, { 
        onSuccess: onClose, 
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao criar a ferragem.') 
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Ferragem / Acessório`}
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
          label="Código (SKU)" 
          placeholder="Ex: FER-001" 
          value={skuCode}
          onChange={(e) => setSkuCode(formatUppercase(e.target.value))}
          className="col-span-1 md:col-span-2" 
        />
        <Input 
          label="Nome / Descrição" 
          placeholder="Ex: Fechadura para Porta" 
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">
          <Input 
            label="Preço de Custo" 
            unit="R$"
            placeholder="0,00" 
            value={costPrice}
            onChange={(e) => setCostPrice(formatCurrencyInput(e.target.value))}
          />
          <Input 
            label="Preço de Venda" 
            unit="R$"
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
