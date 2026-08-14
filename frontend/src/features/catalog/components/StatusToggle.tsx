

interface Props {
  active: boolean;
  onChange: (active: boolean) => void;
  title?: string;
  description?: string;
}

export function StatusToggle({ 
  active, 
  onChange, 
  title = "Status do Material", 
  description = "Materiais inativos não aparecem em novos orçamentos." 
}: Props) {
  return (
    <div className="col-span-1 md:col-span-2 flex items-center justify-between p-sm border border-outline-variant/40 rounded-md bg-surface-container-lowest dark:bg-surface-container-high/20 mt-xs">
      <div>
        <p className="font-label-bold text-sm text-on-surface dark:text-inverse-on-surface">{title}</p>
        <p className="text-xs text-secondary dark:text-outline-variant">{description}</p>
      </div>
      <button 
        type="button"
        aria-label="Alternar status"
        onClick={() => onChange(!active)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-green-600 dark:bg-green-500' : 'bg-surface-variant dark:bg-outline'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
