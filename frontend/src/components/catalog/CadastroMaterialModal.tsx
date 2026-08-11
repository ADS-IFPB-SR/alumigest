import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'Vidro' | 'Película' | 'Ferragem';
  initialData?: any;
}

export function CadastroMaterialModal({ isOpen, onClose, tipo, initialData }: Props) {
  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de ${tipo}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary">{isEditing ? 'Atualizar' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {tipo === 'Ferragem' && (
          <Input 
            label="Código" 
            placeholder="Ex: FER-001" 
            defaultValue={initialData?.codigo || ''} 
            className="col-span-1 md:col-span-2" 
          />
        )}
        <Input 
          label="Nome / Descrição" 
          placeholder={`Nome do ${tipo.toLowerCase()}`} 
          defaultValue={initialData?.nome || initialData?.descricao || ''} 
          className="col-span-1 md:col-span-2" 
        />
        
        {tipo === 'Vidro' && (
          <>
            <Input label="Espessura" type="number" unit="mm" placeholder="8" defaultValue="8" />
            <Input label="Cor / Acabamento" placeholder="Incolor" defaultValue={initialData?.especificacoes?.split('|')[0] || ''} />
          </>
        )}
        
        {tipo === 'Película' && (
          <Input 
            label="Tipo" 
            placeholder="Ex: JATEADO" 
            defaultValue={initialData?.tipo || ''} 
            className="col-span-1 md:col-span-2" 
          />
        )}

        {tipo === 'Ferragem' ? (
          <Input 
            label="Preço Unitário" 
            unit="R$" 
            placeholder="0,00" 
            defaultValue={initialData?.preco ? initialData.preco.toString() : ''} 
          />
        ) : (
          <Input 
            label="Preço Metro Quadrado" 
            unit="R$/m²" 
            placeholder="0,00" 
            defaultValue={initialData?.preco ? initialData.preco.toString() : ''} 
          />
        )}
      </div>
    </Modal>
  );
}
