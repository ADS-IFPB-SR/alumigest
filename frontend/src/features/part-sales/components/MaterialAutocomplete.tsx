import { useState, useEffect, useRef, useId, useMemo } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { useMaterialsByCategory } from '../hooks/useMaterialsByCategory';
import type { MaterialCategoryType, MaterialOption } from '../types/partSaleTypes';
import { formatMaterialLabel } from '../utils/materialFormatters';

export interface MaterialAutocompleteProps {
  readonly category: MaterialCategoryType;
  readonly value?: string; // UUID do material selecionado
  readonly onChange: (material: MaterialOption | null) => void;
  readonly error?: string | null;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly dataTestId?: string;
}

export function MaterialAutocomplete({
  category,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  dataTestId = 'input-material-autocomplete',
}: MaterialAutocompleteProps) {
  const inputId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: materials = [], isLoading } = useMaterialsByCategory(category);

  const selectedMaterial = useMemo(() => {
    if (!value) return null;
    return materials.find((m) => m.id === value) || null;
  }, [materials, value]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Sincroniza o texto do input quando um material selecionado muda externamente
  useEffect(() => {
    if (selectedMaterial) {
      setSearchTerm(formatMaterialLabel(selectedMaterial));
    } else if (!value) {
      setSearchTerm('');
    }
  }, [selectedMaterial, value]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Se tinha um item selecionado, restaura o label
        if (selectedMaterial) {
          setSearchTerm(formatMaterialLabel(selectedMaterial));
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedMaterial]);

  // Filtra opções por texto (nome, cor, espessura)
  const filteredMaterials = useMemo(() => {
    if (!searchTerm.trim()) {
      return materials;
    }
    const cleanQuery = searchTerm.toLowerCase().trim();
    return materials.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(cleanQuery);
      const colorMatch = m.color?.toLowerCase().includes(cleanQuery) ?? false;
      const thicknessMatch = m.thicknessMm
        ? `${m.thicknessMm}mm`.includes(cleanQuery) || `${m.thicknessMm}`.includes(cleanQuery)
        : false;
      const familyMatch = m.familyCode?.toLowerCase().includes(cleanQuery) ?? false;
      return nameMatch || colorMatch || thicknessMatch || familyMatch;
    });
  }, [materials, searchTerm]);

  const handleSelect = (material: MaterialOption) => {
    onChange(material);
    setSearchTerm(formatMaterialLabel(material));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
  };

  const placeholderText = useMemo(() => {
    switch (category) {
      case 'GLASS':
        return 'Digite para buscar vidro (ex: 8mm, Incolor, Fumê)...';
      case 'PROFILE':
        return 'Digite para buscar perfil (ex: Linha Suprema, Branco, Fosco)...';
      case 'FILM':
        return 'Digite para buscar película (ex: G20, G5, Grafite)...';
      case 'HARDWARE':
        return 'Digite para buscar ferragem (ex: Roldana 112, Puxador)...';
      default:
        return 'Selecione ou busque o material...';
    }
  }, [category]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1"
      >
        Material do Catálogo *
      </label>

      <div className="relative">
        <input
          id={inputId}
          data-testid={dataTestId}
          type="text"
          disabled={disabled}
          value={searchTerm}
          placeholder={placeholderText}
          autoComplete="off"
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            if (!isOpen) setIsOpen(true);

            // Permite seleção automática se o texto corresponder exatamente a um material do catálogo
            const exactMatch = materials.find(
              (m) =>
                formatMaterialLabel(m).toLowerCase() === val.toLowerCase() ||
                m.name.toLowerCase() === val.toLowerCase()
            );

            if (exactMatch) {
              onChange(exactMatch);
            } else if (selectedMaterial && val !== formatMaterialLabel(selectedMaterial)) {
              // Limpa a seleção ativa ao editar o texto para algo diferente
              onChange(null);
            }
          }}
          className={`w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg outline-none font-medium transition-colors ${
            error
              ? 'border-red-500 ring-1 ring-red-500 text-red-900 dark:text-red-200 focus:border-red-500'
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        {searchTerm && !disabled && (
          <button
            type="button"
            data-testid="btn-clear-material"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Limpar material selecionado"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p
          data-testid="material-autocomplete-error"
          className="mt-1 text-xs font-semibold text-red-500 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {/* Dropdown com a lista de materiais filtrados */}
      {isOpen && !disabled && (
        <div
          data-testid="material-autocomplete-dropdown"
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl"
        >
          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-cyan-500" />
              Carregando materiais cadastrados...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Nenhum material encontrado para a categoria selecionada.
            </div>
          ) : (
            <ul className="py-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMaterials.map((item) => {
                const isSelected = item.id === value;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-testid={`material-option-${item.id}`}
                      onClick={() => handleSelect(item)}
                      className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSelected && <Check className="w-4 h-4 text-cyan-600 flex-shrink-0" />}
                        <div className="truncate">
                          <span className="font-semibold block truncate">
                            {formatMaterialLabel(item)}
                          </span>
                          {item.familyCode && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                              Família: {item.familyCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
