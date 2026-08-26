import type { DoorTemplateType, MaterialCategoryType } from '../../types/templates';
import { DOOR_TEMPLATE_LABELS, MATERIAL_CATEGORY_LABELS, MATERIAL_CATEGORY_ICONS } from '../../types/templates';

interface ProductCostSummaryProps {
  name: string;
  templateType: DoorTemplateType | null;
  categoryRequirements: MaterialCategoryType[];
  onSave: () => void;
  isPending: boolean;
  isEditing: boolean;
}

export function ProductCostSummary({ 
  name,
  templateType, 
  categoryRequirements, 
  onSave, 
  isPending, 
  isEditing 
}: ProductCostSummaryProps) {
  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm h-fit sticky top-4">
      <div className="p-md border-b border-outline-variant bg-primary text-on-primary rounded-t-lg flex items-center justify-between">
        <h3 className="font-title-sm text-title-sm font-semibold">Resumo da Esquadria</h3>
        <span className="material-symbols-outlined text-[20px]">tune</span>
      </div>
      
      <div className="p-md flex flex-col gap-md">
        {/* Nome e Modelo */}
        <div className="flex flex-col gap-xs pb-sm border-b border-outline-variant/60">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Produto</span>
          <span className="font-label-bold text-label-bold text-on-surface truncate">
            {name.trim() || <span className="text-on-surface-variant/40 italic">Sem nome definido</span>}
          </span>
          <div className="flex items-center gap-xs mt-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Modelo:</span>
            <span className="font-label text-body-sm font-semibold text-primary">
              {templateType ? DOOR_TEMPLATE_LABELS[templateType] : 'Sem Template'}
            </span>
          </div>
        </div>
        
        {/* Insumos Habilitados no Orçamento */}
        <div className="flex flex-col gap-xs py-xs border-b border-outline-variant/60">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Categorias no Orçamento ({categoryRequirements.length})
          </span>
          {categoryRequirements.length > 0 ? (
            <div className="flex flex-wrap gap-xs mt-xs">
              {categoryRequirements.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-[2px] px-sm py-[2px] rounded-full bg-surface-container text-on-surface font-label text-[11px]"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {MATERIAL_CATEGORY_ICONS[cat]}
                  </span>
                  {MATERIAL_CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          ) : (
            <span className="font-body-sm text-body-sm text-on-surface-variant/60 italic">
              Nenhuma categoria selecionada
            </span>
          )}
        </div>

        {/* Informação sobre o Orçamento */}
        <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/40 text-on-surface-variant text-xs flex gap-xs items-start">
          <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-[2px]">info</span>
          <span>
            Os materiais específicos, dimensões e custos serão definidos dinamicamente durante a criação do orçamento.
          </span>
        </div>

        {/* Botão Salvar */}
        <button 
          className="mt-xs w-full py-sm bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-xs disabled:opacity-50 cursor-pointer shadow-sm"
          onClick={onSave}
          disabled={isPending}
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {isPending ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Salvar Produto')}
        </button>
      </div>
    </aside>
  );
}
