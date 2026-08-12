import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateGlass, useCreateHardware, useCreateFilm } from '../hooks/useCatalog';
import type { MaterialType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tipo: MaterialType;
  initialData?: any; // Para futura edição
}

export function MaterialFormModal({ isOpen, onClose, tipo, initialData }: Props) {
  const isEditing = Boolean(initialData);

  const { mutate: createGlass, isPending: isGlassPending } = useCreateGlass();
  const { mutate: createHardware, isPending: isHardwarePending } = useCreateHardware();
  const { mutate: createFilm, isPending: isFilmPending } = useCreateFilm();

  const isPending = isGlassPending || isHardwarePending || isFilmPending;

  // Estado do formulário
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [thicknessMm, setThicknessMm] = useState('8');
  const [colorFinish, setColorFinish] = useState('');
  const [price, setPrice] = useState('');
  const [filmType, setFilmType] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('UNIDADE');

  // Reset form on open
  useEffect(() => {
    if (isOpen && !initialData) {
      setName('');
      setSkuCode('');
      setThicknessMm('8');
      setColorFinish('');
      setPrice('');
      setFilmType('');
      setUnitMeasure('UNIDADE');
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (tipo === 'Glass') {
      createGlass({
        name,
        thicknessMm: Number(thicknessMm),
        colorFinish,
        pricePerSqm: Number(price.replace(',', '.')),
        maxWidthMm: 2000,
        maxHeightMm: 3000,
        supplierId: 1, // Mock fornecedor
        active: true
      }, {
        onSuccess: onClose
      });
    } else if (tipo === 'Hardware') {
      createHardware({
        name,
        skuCode,
        unitMeasure,
        salePrice: Number(price.replace(',', '.')),
        supplierId: 1,
        active: true
      }, {
        onSuccess: onClose
      });
    } else if (tipo === 'Film') {
      createFilm({
        name,
        colorFinish: filmType, // Use colorFinish per FilmDTO
        salePrice: Number(price.replace(',', '.')),
        active: true
      }, {
        onSuccess: onClose
      });
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
            onChange={(e) => setSkuCode(e.target.value)}
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
              onChange={(e) => setThicknessMm(e.target.value)} 
            />
            <Input 
              label="Cor / Acabamento" 
              placeholder="Incolor" 
              value={colorFinish}
              onChange={(e) => setColorFinish(e.target.value)}
            />
          </>
        )}
        
        {tipo === 'Film' && (
          <Input 
            label="Tipo/Cor" 
            placeholder="Ex: JATEADO" 
            value={filmType}
            onChange={(e) => setFilmType(e.target.value)}
            className="col-span-1 md:col-span-2" 
          />
        )}

        {tipo === 'Hardware' ? (
          <Input 
            label="Preço Unitário" 
            unit="R$" 
            placeholder="0,00" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        ) : (
          <Input 
            label="Preço Metro Quadrado" 
            unit="R$/m²" 
            placeholder="0,00" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        )}
      </div>
    </Modal>
  );
}
