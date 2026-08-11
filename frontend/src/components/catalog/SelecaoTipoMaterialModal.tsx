import { Modal } from '../ui/Modal';

export type MaterialType = 'Vidro' | 'Perfil' | 'Película' | 'Ferragem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tipo: MaterialType) => void;
}

const tipos: { type: MaterialType; title: string; desc: string; icon: string }[] = [
  {
    type: 'Vidro',
    title: 'Vidro',
    desc: 'Vidros temperados, laminados, float e insulados por m²',
    icon: 'window',
  },
  {
    type: 'Perfil',
    title: 'Perfil de Alumínio',
    desc: 'Linhas Suprema, Gold, Integrada por metro linear/barra',
    icon: 'view_column',
  },
  {
    type: 'Película',
    title: 'Película de Proteção/Estética',
    desc: 'Películas jateadas, fumê, insulfilm por m²',
    icon: 'texture',
  },
  {
    type: 'Ferragem',
    title: 'Ferragem / Acessório',
    desc: 'Roldanas, fechos, dobradiças e fechaduras por unidade',
    icon: 'hardware',
  },
];

export function SelecaoTipoMaterialModal({ isOpen, onClose, onSelect }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecione o Tipo de Material para Cadastrar"
    >
      <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant mb-xs">
        Escolha uma das categorias abaixo para abrir o formulário com os parâmetros específicos:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm sm:gap-md">
        {tipos.map((item) => (
          <button
            key={item.type}
            onClick={() => onSelect(item.type)}
            className="flex flex-col text-left p-md border border-outline-variant dark:border-outline/40 rounded-lg bg-surface-container-low dark:bg-surface-container-high/20 hover:border-primary dark:hover:border-primary-fixed hover:bg-surface-container-high dark:hover:bg-surface-variant/30 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform text-[28px]">
                {item.icon}
              </span>
              <h3 className="font-title-sm text-title-sm font-semibold text-on-surface dark:text-inverse-on-surface">
                {item.title}
              </h3>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-outline-variant">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
