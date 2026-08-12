import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateProfile } from '../hooks/useCatalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function ProfileFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createProfile, isPending } = useCreateProfile();

  const [skuCode, setSkuCode] = useState('');
  const [commercialLine, setCommercialLine] = useState('Suprema');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('6000');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (isOpen && !initialData) {
      setSkuCode('');
      setCommercialLine('Suprema');
      setDescription('');
      setWeight('');
      setLength('6000');
      setPrice('');
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    createProfile({
      skuCode,
      description,
      commercialLine,
      weightPerMeterKg: Number(weight.replace(',', '.')),
      barLengthMm: Number(length),
      pricePerMeter: Number(price.replace(',', '.')),
      active: true
    }, {
      onSuccess: onClose
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Perfil de Alumínio`}
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
          label="Código" 
          placeholder="Ex: ALU-SUP-01" 
          value={skuCode}
          onChange={(e) => setSkuCode(e.target.value)} 
        />
        <Input 
          label="Linha Comercial" 
          placeholder="Ex: Suprema" 
          value={commercialLine}
          onChange={(e) => setCommercialLine(e.target.value)} 
        />
        
        <Input 
          label="Descrição" 
          placeholder="Descrição completa do perfil" 
          value={description}
          onChange={(e) => setDescription(e.target.value)} 
          className="col-span-1 md:col-span-2" 
        />
        
        <Input 
          label="Peso por Metro" 
          type="number" 
          unit="Kg/m" 
          placeholder="0.000" 
          value={weight}
          onChange={(e) => setWeight(e.target.value)} 
        />
        <Input 
          label="Comprimento da Barra" 
          type="number" 
          unit="mm" 
          placeholder="6000" 
          value={length}
          onChange={(e) => setLength(e.target.value)} 
        />
        
        <Input 
          label="Preço Metro Linear" 
          unit="R$/m" 
          placeholder="0,00" 
          value={price}
          onChange={(e) => setPrice(e.target.value)} 
          className="col-span-1 md:col-span-2" 
        />
      </div>
    </Modal>
  );
}
