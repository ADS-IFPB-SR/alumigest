import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onEdit: () => void;
}

export function DetalhesMaterialModal({ isOpen, onClose, item, onEdit }: Props) {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Especificações Técnicas e Detalhes"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button 
            variant="primary" 
            icon="edit" 
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            Editar Cadastro
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-md">
        
        {/* Status Header */}
        <div className="flex items-center justify-between p-sm bg-surface-container-low dark:bg-surface-container-high/20 border border-outline-variant dark:border-outline/30 rounded-sm">
          <div>
            <span className="font-data-mono text-data-mono text-xs text-on-surface-variant dark:text-outline-variant block">Código Interno</span>
            <span className="font-title-sm text-title-sm font-bold text-on-surface dark:text-inverse-on-surface">{item.codigo || item.nome || 'N/A'}</span>
          </div>
          <span className="px-sm py-xs bg-success/10 text-success text-xs font-bold rounded-full">
            Ativo no Catálogo
          </span>
        </div>

        {/* Specs Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm sm:gap-md">
          <div className="p-sm border border-outline-variant dark:border-outline/30 rounded-sm">
            <span className="font-label-bold text-xs text-on-surface-variant dark:text-outline-variant block mb-xs">Nome / Descrição</span>
            <span className="font-body-md text-on-surface dark:text-inverse-on-surface font-medium">{item.nome || item.descricao}</span>
          </div>

          {item.especificacoes && (
            <div className="p-sm border border-outline-variant dark:border-outline/30 rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant dark:text-outline-variant block mb-xs">Especificação Técnica</span>
              <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">{item.especificacoes}</span>
            </div>
          )}

          {item.peso !== undefined && (
            <div className="p-sm border border-outline-variant dark:border-outline/30 rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant dark:text-outline-variant block mb-xs">Peso Linear</span>
              <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">{item.peso.toFixed(3)} Kg/m</span>
            </div>
          )}

          {item.tipo && (
            <div className="p-sm border border-outline-variant dark:border-outline/30 rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant dark:text-outline-variant block mb-xs">Categoria / Tipo</span>
              <span className="font-body-md text-on-surface dark:text-inverse-on-surface">{item.tipo}</span>
            </div>
          )}

          <div className="p-sm border border-outline-variant dark:border-outline/30 rounded-sm sm:col-span-2 bg-surface-container-low dark:bg-surface-container-high/10">
            <span className="font-label-bold text-xs text-on-surface-variant dark:text-outline-variant block mb-xs">Valores e Precificação</span>
            <span className="font-data-mono text-lg font-bold text-primary dark:text-primary-fixed">
              {typeof item.preco === 'number' ? `R$ ${item.preco.toFixed(2).replace('.', ',')}` : item.preco}
            </span>
          </div>
        </div>

      </div>
    </Modal>
  );
}
