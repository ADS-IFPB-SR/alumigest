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
 <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl max-w-lg w-full flex flex-col items-center shadow-sm animate-in fade-in zoom-in-95 duration-200">
 
 {/* Icon Badge */}
 <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-md">
 <span className="material-symbols-outlined text-[36px]">{icon}</span>
 </div>

 {/* Status Chip */}
 <span className="px-sm py-xs bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider mb-sm">
 Em Desenvolvimento
 </span>

 {/* Title & Description */}
 <h2 className="font-headline text-headline-md font-bold text-on-surface mb-xs">
 {title}
 </h2>
 <p className="font-body text-body-sm text-secondary mb-lg leading-relaxed">
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
