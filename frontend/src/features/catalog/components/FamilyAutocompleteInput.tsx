import React, { useState, useRef, useEffect } from 'react';
import { useMaterialFamilies } from '../hooks/useCatalog';

interface FamilyAutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  groupCode: 'VIDRO' | 'ALUMINIO' | 'FERRAGEM' | 'PELICULA';
  placeholder?: string;
  error?: string;
  'data-cy'?: string;
}

export const FamilyAutocompleteInput: React.FC<FamilyAutocompleteInputProps> = ({
  label,
  value,
  onChange,
  groupCode,
  placeholder = 'Ex: FAM-VIDRO-TEMP-8MM',
  error,
  'data-cy': dataCy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: families = [], isLoading } = useMaterialFamilies(groupCode);

  // Filtra as famílias de acordo com o texto digitado (case-insensitive)
  const filteredFamilies = families.filter((f) =>
    f.toUpperCase().includes((value || '').trim().toUpperCase())
  );

  const isExactMatch = families.some(
    (f) => f.toUpperCase() === (value || '').trim().toUpperCase()
  );

  // Fecha o dropdown ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selected: string) => {
    onChange(selected.toUpperCase());
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-xs w-full relative">
      <div className="flex items-center justify-between">
        <label className="font-label-bold text-label-bold text-on-surface text-xs">
          {label}
        </label>
        {families.length > 0 && (
          <span className="text-[10px] text-on-surface-variant/70">
            {families.length} {families.length === 1 ? 'família existente' : 'famílias existentes'}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          data-cy={dataCy}
          type="text"
          value={value}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            } else if (e.key === 'Enter' && isOpen && filteredFamilies.length > 0) {
              e.preventDefault();
              handleSelect(filteredFamilies[0]);
            }
          }}
          className={`w-full px-sm py-xs bg-surface-container-low border ${
            error ? 'border-error' : 'border-outline-variant'
          } rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none focus:ring-0 transition-all uppercase`}
        />

        {value && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs p-1"
            title="Limpar campo"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown com sugestões flutuantes */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-container-highest/95 backdrop-blur-sm border border-outline-variant/60 rounded-md shadow-lg max-h-56 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {filteredFamilies.length > 0 ? (
            <div>
              <div className="px-sm py-1 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                Famílias cadastradas (clique para selecionar)
              </div>
              {filteredFamilies.map((family) => {
                const isSelected = family.toUpperCase() === (value || '').trim().toUpperCase();
                return (
                  <button
                    key={family}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(family)}
                    className={`w-full text-left px-sm py-2 text-xs flex items-center justify-between hover:bg-primary/10 transition-colors ${
                      isSelected ? 'bg-primary/15 font-bold text-primary' : 'text-on-surface'
                    }`}
                  >
                    <span className="font-mono">{family}</span>
                    {isSelected ? (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                        Atual
                      </span>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant">
                        Existente
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Opção indicando criação de nova família */}
          {value.trim() && !isExactMatch && (
            <div className={`p-2 ${filteredFamilies.length > 0 ? 'border-t border-outline-variant/30' : ''}`}>
              <div className="text-[11px] text-on-surface-variant mb-1">
                Nova família a ser criada:
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(value.trim())}
                className="w-full text-left px-sm py-1.5 text-xs bg-secondary-container/40 hover:bg-secondary-container/70 text-on-secondary-container rounded flex items-center justify-between transition-colors"
              >
                <span className="font-mono font-bold">{value.trim()}</span>
                <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-semibold">
                  + Nova Família
                </span>
              </button>
            </div>
          )}

          {isLoading && (
            <div className="p-3 text-center text-xs text-on-surface-variant animate-pulse">
              Carregando famílias existentes...
            </div>
          )}

          {!isLoading && filteredFamilies.length === 0 && !value.trim() && (
            <div className="p-3 text-center text-xs text-on-surface-variant">
              Nenhuma família cadastrada para este insumo ainda. Digite um código acima para criar a primeira!
            </div>
          )}
        </div>
      )}

      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
      <span className="text-[10px] text-on-surface-variant">
        Agrupa materiais de mesma categoria para troca rápida de cor no orçamento.
      </span>
    </div>
  );
};
