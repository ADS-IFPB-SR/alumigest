import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  exportValue?: (row: T) => string | number | boolean | null | undefined;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onViewDetails?: (row: T) => void;
}

export function Table<T extends { id: string | number }>({ columns, data, onEdit, onViewDetails }: TableProps<T>) {

  const handleExport = () => {
    if (data.length === 0) return;

    // Generate CSV header
    const headers = columns.map(col => col.header).join(';');
    
    // Generate CSV rows
    const rows = data.map(row => {
      return columns.map(col => {
        if (typeof col.exportValue === 'function') {
          const val = col.exportValue(row);
          return val !== null && val !== undefined ? String(val).replace(/;/g, ',') : '';
        }
        if (typeof col.accessor !== 'function') {
          const val = row[col.accessor];
          return val !== null && val !== undefined ? String(val).replace(/;/g, ',') : '';
        }
        return '';
      }).join(';');
    });

    const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exportacao_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-[#182230] border border-outline-variant/80 dark:border-outline/30 rounded-md flex flex-col flex-1 overflow-hidden shadow-xs relative">
      
      {/* Table Controls / Filter Bar */}
      <div className="p-xs sm:p-md border-b border-outline-variant/60 dark:border-outline/30 bg-[#F8FAFC] dark:bg-surface-container-high/20 flex justify-between items-center gap-xs sm:gap-sm flex-wrap">
        <div className="flex gap-xs sm:gap-sm">
          <button 
            onClick={handleExport}
            className="flex items-center gap-xs px-xs py-xs sm:px-sm sm:py-sm border border-outline-variant/80 dark:border-outline/40 rounded-md bg-white dark:bg-[#182230] text-secondary dark:text-outline-variant font-body text-xs sm:text-sm hover:bg-surface-container-low dark:hover:bg-surface-variant/30 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">download</span>
            <span className="font-medium hidden sm:inline">Exportar</span>
          </button>
        </div>
        <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant text-xs sm:text-sm font-semibold">
          Total: {data.length}
        </span>
      </div>

      {/* The Table - Responsive Container with Sticky Actions Column */}
      <div className="overflow-x-auto flex-1 w-full relative">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#F8FAFC] dark:bg-[#1a2536] border-b border-outline-variant/80 dark:border-outline/30">
              {columns.map((col, index) => (
                <th key={index} className={`p-xs sm:p-sm lg:p-md font-label-bold text-label-bold text-primary dark:text-inverse-on-surface text-xs sm:text-sm text-${col.align || 'left'} ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onViewDetails) && (
                <th className="p-xs sm:p-sm lg:p-md font-label-bold text-label-bold text-primary dark:text-inverse-on-surface text-xs sm:text-sm text-center w-20 sm:w-24 sticky right-0 bg-[#F8FAFC] dark:bg-[#1a2536] border-l border-outline-variant/40 dark:border-outline/20 shadow-[-4px_0px_8px_rgba(0,0,0,0.06)] z-20">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="font-body text-xs sm:text-sm">
            {data.map((row, rowIndex) => {
              const bgClass = rowIndex % 2 === 0 ? 'bg-white dark:bg-[#182230]' : 'bg-[#F1F5F9]/70 dark:bg-[#151e2b]';
              return (
                <tr 
                  key={row.id} 
                  className={`border-b border-outline-variant/40 dark:border-outline/20 hover:bg-[#E2E8F0]/50 dark:hover:bg-surface-variant/20 transition-colors ${bgClass}`}
                >
                  {columns.map((col, index) => (
                    <td key={index} className={`p-xs sm:p-sm lg:p-md text-on-surface dark:text-inverse-on-surface text-${col.align || 'left'} ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onViewDetails) && (
                    <td className={`p-xs sm:p-sm lg:p-md sticky right-0 ${bgClass} border-l border-outline-variant/40 dark:border-outline/20 shadow-[-4px_0px_8px_rgba(0,0,0,0.06)] z-10`}>
                      <div className="flex items-center justify-center gap-xs sm:gap-sm">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)} 
                            className="p-xs sm:p-sm text-secondary dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed hover:bg-secondary-container/40 rounded-md transition-colors" 
                            title="Editar Cadastro"
                          >
                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">edit</span>
                          </button>
                        )}
                        {onViewDetails && (
                          <button 
                            onClick={() => onViewDetails(row)} 
                            className="p-xs sm:p-sm text-secondary dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed hover:bg-secondary-container/40 rounded-md transition-colors" 
                            title="Visualizar Detalhes"
                          >
                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">open_in_new</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
