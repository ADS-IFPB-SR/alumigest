import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface Props {
  title: string;
  icon: string;
  description: string;
}

export function PlaceholderPage({ title, icon, description }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-md text-center h-full">
      <div className="bg-surface-container-lowest dark:bg-[#182230] border border-outline-variant/80 dark:border-outline/30 rounded-lg p-xl max-w-lg w-full flex flex-col items-center shadow-sm animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-fixed/10 flex items-center justify-center text-primary dark:text-primary-fixed mb-md">
          <span className="material-symbols-outlined text-[36px]">{icon}</span>
        </div>

        {/* Status Chip */}
        <span className="px-sm py-xs bg-secondary-container/60 dark:bg-secondary-container/20 text-on-secondary-container dark:text-primary-fixed text-xs font-bold rounded-full uppercase tracking-wider mb-sm">
          Em Desenvolvimento
        </span>

        {/* Title & Description */}
        <h2 className="font-headline text-headline-md font-bold text-primary dark:text-inverse-on-surface mb-xs">
          {title}
        </h2>
        <p className="font-body text-body-sm text-secondary dark:text-outline-variant mb-lg leading-relaxed">
          {description}
        </p>

        {/* Action to Return */}
        <Link to="/">
          <Button variant="primary" icon="swap_horiz">
            Ir para Catálogo de Materiais
          </Button>
        </Link>
      </div>
    </div>
  );
}
