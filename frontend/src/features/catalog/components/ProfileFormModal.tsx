import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateProfile, useUpdateProfile } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger, formatWeightInput, parseWeightString } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';

interface Props {
 isOpen: boolean;
 onClose: () => void;
 initialData?: any;
}

export function ProfileFormModal({ isOpen, onClose, initialData }: Props) {
 const isEditing = Boolean(initialData);
 const { mutate: createProfile, isPending: isCreatePending } = useCreateProfile();
 const { mutate: updateProfile, isPending: isUpdatePending } = useUpdateProfile();
 const isPending = isCreatePending || isUpdatePending;

 const [skuCode, setSkuCode] = useState('');
 const [commercialLine, setCommercialLine] = useState('');
 const [description, setDescription] = useState('');
 const [ncmCode, setNcmCode] = useState('');
 const [colorFinish, setColorFinish] = useState('INCOLOR');
 const [weight, setWeight] = useState('');
 const [length, setLength] = useState('3');
 const [costPrice, setCostPrice] = useState('');
 const [price, setPrice] = useState('');
 const [active, setActive] = useState(true);

 // Populate form on open
 useEffect(() => {
 if (isOpen && initialData) {
 setSkuCode(initialData.commercialReference || '');
 setCommercialLine(initialData.commercialLine || '');
 setDescription(initialData.name || '');
 setNcmCode(initialData.ncmCode || '');
 setColorFinish(initialData.colorFinish || 'INCOLOR');
 setWeight(formatWeightInput(initialData.weight?.toFixed(3) || ''));
 setLength(initialData.standardLengthM?.toString() || '3');
 
 const cp = initialData.costPrice ?? 0;
 const p = initialData.salePrice ?? 0;
 setCostPrice(formatCurrencyInput(cp.toFixed(2)));
 setPrice(formatCurrencyInput(p.toFixed(2)));
 setActive(initialData.active ?? true);
 } else if (isOpen && !initialData) {
 setSkuCode('');
 setCommercialLine('');
 setDescription('');
 setNcmCode('');
 setColorFinish('INCOLOR');
 setWeight('');
 setLength('3');
 setCostPrice('');
 setPrice('');
 setActive(true);
 }
 }, [isOpen, initialData]);

 const handleSave = () => {
 const payload = {
 commercialReference: skuCode,
 commercialLine: commercialLine,
 name: description,
 standardLengthM: Number(length),
 weight: parseWeightString(weight),
 unitMeasure: 'BARRA_6M' as const,
 ncmCode: ncmCode,
 colorFinish: colorFinish,
 costPrice: parseCurrencyString(costPrice),
 salePrice: parseCurrencyString(price),
 active
 };
 
 if (isEditing) {
 updateProfile({ id: initialData.id, data: payload as any }, { onSuccess: onClose });
 } else {
 createProfile(payload as any, { onSuccess: onClose });
 }
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
 onChange={(e) => setSkuCode(formatUppercase(e.target.value))} 
 />
 <Input 
 label="Linha Comercial" 
 placeholder="Ex: Rometal" 
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
 label="Cor / Acabamento" 
 placeholder="Ex: INCOLOR" 
 value={colorFinish}
 onChange={(e) => setColorFinish(formatUppercase(e.target.value))} 
 />
 <Input 
 label="Código NCM" 
 placeholder="Opcional" 
 value={ncmCode}
 onChange={(e) => setNcmCode(e.target.value)} 
 />

 <Input 
 label="Peso por Metro" 
 unit="Kg/m" 
 placeholder="0,000" 
 value={weight}
 onChange={(e) => setWeight(formatWeightInput(e.target.value))} 
 />
 <Input 
 label="Comprimento da Barra" 
 unit="m" 
 placeholder="3" 
 value={length}
 onChange={(e) => setLength(formatInteger(e.target.value))} 
 />
 
 <Input 
 label="Preço de Custo" 
 unit="R$" 
 placeholder="0,00" 
 value={costPrice}
 onChange={(e) => setCostPrice(formatCurrencyInput(e.target.value))} 
 />
 <Input 
 label="Preço Metro Linear (Venda)" 
 unit="R$/m" 
 placeholder="0,00" 
 value={price}
 onChange={(e) => setPrice(formatCurrencyInput(e.target.value))} 
 className="col-span-1 md:col-span-2" 
 />
 
 {isEditing && (
 <StatusToggle active={active} onChange={setActive} />
 )}
 </div>
 </Modal>
 );
}
