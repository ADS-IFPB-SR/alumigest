import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function CadastroPerfilModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Perfil de Alumínio`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary">{isEditing ? 'Atualizar' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Input label="Código" placeholder="Ex: ALU-SUP-01" defaultValue={initialData?.codigo || ''} />
        <Input label="Linha Comercial" placeholder="Ex: Suprema" defaultValue="Suprema" />
        
        <Input 
          label="Descrição" 
          placeholder="Descrição completa do perfil" 
          defaultValue={initialData?.descricao || ''} 
          className="col-span-1 md:col-span-2" 
        />
        
        <Input 
          label="Peso por Metro" 
          type="number" 
          unit="Kg/m" 
          placeholder="0.000" 
          defaultValue={initialData?.peso ? initialData.peso.toString() : ''} 
        />
        <Input label="Comprimento da Barra" type="number" unit="mm" placeholder="6000" defaultValue="6000" />
        
        <Input 
          label="Preço Metro Linear" 
          unit="R$/m" 
          placeholder="0,00" 
          defaultValue={initialData?.preco ? initialData.preco.toString() : ''} 
          className="col-span-1 md:col-span-2" 
        />
      </div>
    </Modal>
  );
}
