import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface Props {
 isOpen: boolean;
 onClose: () => void;
 item: any | null;
 onEdit: () => void;
}

export function MaterialDetailsModal({ isOpen, onClose, item, onEdit }: Props) {
 if (!item) return null;

 const price = item.pricePerSqm || item.pricePerMeter || item.salePrice;
 const itemName = item.name || item.description;

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
 <div className="flex items-center justify-between p-sm bg-surface-container-low border border-outline-variant rounded-sm">
 <div>
 <span className="font-data-mono text-data-mono text-xs text-on-surface-variant block">Código Interno</span>
 <span className="font-title-sm text-title-sm font-bold text-on-surface">{item.skuCode || itemName || 'N/A'}</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="px-sm py-xs border border-success/30 bg-success/10 text-success text-xs font-bold rounded-full">
 Ativo no Catálogo
 </span>
 </div>
 </div>

 {/* Specs Table */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm sm:gap-md">
 <div className="p-sm border border-outline-variant rounded-sm">
 <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">Nome / Descrição</span>
 <span className="font-body-md text-on-surface font-medium">{itemName}</span>
 </div>

 {(item.thicknessMm || item.colorFinish) && (
 <div className="p-sm border border-outline-variant rounded-sm">
 <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">Especificação Técnica</span>
 <span className="font-data-mono text-data-mono text-on-surface">
 {item.thicknessMm ? `${item.thicknessMm}mm ` : ''}{item.colorFinish}
 </span>
 </div>
 )}

 {item.weightPerMeterKg !== undefined && (
 <div className="p-sm border border-outline-variant rounded-sm">
 <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">Peso Linear</span>
 <span className="font-data-mono text-data-mono text-on-surface">{item.weightPerMeterKg.toFixed(3)} Kg/m</span>
 </div>
 )}

 {item.commercialLine && (
 <div className="p-sm border border-outline-variant rounded-sm">
 <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">Linha Comercial</span>
 <span className="font-body-md text-on-surface">{item.commercialLine}</span>
 </div>
 )}

 <div className="p-sm border border-outline-variant rounded-sm sm:col-span-2 bg-surface-container-low">
 <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">Valores e Precificação</span>
 <span className="font-data-mono text-lg font-bold text-primary">
 {typeof price === 'number' ? `R$ ${price.toFixed(2).replace('.', ',')}` : price}
 </span>
 </div>
 </div>

 </div>
 </Modal>
 );
}
