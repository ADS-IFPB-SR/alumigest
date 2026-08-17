import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateFilm, useUpdateFilm } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function FilmFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createFilm, isPending: isCreatePending } = useCreateFilm();
  const { mutate: updateFilm, isPending: isUpdatePending } = useUpdateFilm();
  const isPending = isCreatePending || isUpdatePending;

  const [skuCode, setSkuCode] = useState('');
  const [name, setName] = useState('');
  const [ncmCode, setNcmCode] = useState('');
  const [filmType, setFilmType] = useState('');
  const [thicknessMm, setThicknessMm] = useState('0.08');
  const [standardLengthM, setStandardLengthM] = useState('30');
  const [maxWidthMm, setMaxWidthMm] = useState('1520');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isOpen && initialData) {
      setSkuCode(initialData.commercialReference || '');
      setName(initialData.name || '');
      setNcmCode(initialData.ncmCode || '');
      setFilmType(initialData.colorFinish || '');
      setThicknessMm(initialData.thicknessMm?.toString() || '0.08');
      setStandardLengthM(initialData.standardLengthM?.toString() || '30');
      setMaxWidthMm(initialData.maxWidthMm?.toString() || '1520');
      
      const cp = initialData.costPrice ?? 0;
      const sp = initialData.salePrice ?? 0;
      setCostPrice(formatCurrencyInput(cp.toFixed(2)));
      setSalePrice(formatCurrencyInput(sp.toFixed(2)));
      setActive(initialData.active ?? true);
    } else if (isOpen && !initialData) {
      setSkuCode('');
      setName('');
      setNcmCode('');
      setFilmType('');
      setThicknessMm('0.08');
      setStandardLengthM('30');
      setMaxWidthMm('1520');
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

    if (isEditing) {
      updateFilm({ id: initialData.id, data: payload as any }, { 
        onSuccess: onClose, 
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar a película.') 
      });
    } else {
      createFilm(payload as any, { 
        onSuccess: onClose, 
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao criar a película.') 
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Película`}
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
          label="Referência Comercial (Opcional)" 
          placeholder="Ex: G20" 
          value={skuCode}
          onChange={(e) => setSkuCode(formatUppercase(e.target.value))}
          className="col-span-1 md:col-span-2" 
        />
        <Input 
          label="Nome / Descrição" 
          placeholder="Ex: Película G20 Fumê" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-1 md:col-span-2" 
        />
        <Input 
          label="Código NCM" 
          placeholder="Opcional" 
          value={ncmCode}
          onChange={(e) => setNcmCode(e.target.value)}
          className="col-span-1 md:col-span-2" 
        />
        
        <Input 
          label="Tipo/Cor" 
          placeholder="Ex: FUMÊ" 
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
