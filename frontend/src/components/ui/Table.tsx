import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  exportValue?: (
    row: T
  ) => string | number | boolean | null | undefined;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];

  onEdit?: (row: T) => void;
  onViewDetails?: (row: T) => void;

  /**
   * Define o data-cy da linha.
   * Exemplo:
   * rowTestId={() => 'glass-row'}
   * rowTestId={() => 'profile-row'}
   */
  rowTestId?: (row: T) => string | undefined;

  /**
   * Define atributos adicionais para a linha.
   * Útil para identificar um registro específico nos testes.
   *
   * Exemplo:
   * rowTestAttributes={(row) => ({
   *   'data-glass-name': row.name
   * })}
   */
  rowTestAttributes?: (
    row: T
  ) => Record<string, string | undefined>;
}

export function Table<
  T extends { id: string | number }
>({
  columns,
  data,
  onEdit,
  onViewDetails,
  rowTestId,
  rowTestAttributes,
}: TableProps<T>) {
  const handleExport = () => {
    if (data.length === 0) {
      return;
    }

    // Cabeçalho do CSV
    const headers = columns
      .map((column) => column.header)
      .join(';');

    // Linhas do CSV
    const rows = data.map((row) => {
      return columns
        .map((column) => {
          if (typeof column.exportValue === 'function') {
            const value = column.exportValue(row);

            return value !== null &&
              value !== undefined
              ? String(value).replace(/;/g, ',')
              : '';
          }

          if (typeof column.accessor !== 'function') {
            const value = row[column.accessor];

            return value !== null &&
              value !== undefined
              ? String(value).replace(/;/g, ',')
              : '';
          }

          return '';
        })
        .join(';');
    });

    const csvContent =
      '\uFEFF' +
      [headers, ...rows].join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.setAttribute(
      'download',
      `exportacao_${new Date().getTime()}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-md flex flex-col flex-1 overflow-hidden shadow-xs relative">

      {/* =====================================================
          Barra de controles
          ===================================================== */}
      <div className="p-xs sm:p-md border-b border-outline-variant bg-surface-container flex justify-between items-center gap-xs sm:gap-sm flex-wrap">

        <div className="flex gap-xs sm:gap-sm">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-xs px-xs py-xs sm:px-sm sm:py-sm border border-outline-variant rounded-md bg-surface-container-lowest text-secondary font-body text-xs sm:text-sm hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              download
            </span>

            <span className="font-medium hidden sm:inline">
              Exportar
            </span>
          </button>
        </div>

        <span className="font-data-mono text-data-mono text-secondary text-xs sm:text-sm font-semibold">
          Total: {data.length}
        </span>
      </div>

      {/* =====================================================
          Tabela
          ===================================================== */}
      <div className="overflow-x-auto flex-1 w-full relative">

        <table className="table-zebra w-full text-left border-collapse min-w-[500px]">

          {/* =================================================
              Cabeçalho
              ================================================= */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-surface-container-low border-b border-outline-variant">

              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    p-xs sm:p-sm lg:p-md
                    font-label-bold
                    text-label-bold
                    text-primary
                    text-xs sm:text-sm
                    text-${column.align || 'left'}
                    ${column.className || ''}
                  `}
                >
                  {column.header}
                </th>
              ))}

              {(onEdit || onViewDetails) && (
                <th
                  className="
                    p-xs sm:p-sm lg:p-md
                    font-label-bold
                    text-label-bold
                    text-primary
                    text-xs sm:text-sm
                    text-center
                    w-20 sm:w-24
                    sticky right-0
                    bg-surface-container-low
                    border-l
                    border-outline-variant
                    shadow-[-4px_0px_8px_rgba(0,0,0,0.06)]
                    z-20
                  "
                >
                  Ações
                </th>
              )}

            </tr>
          </thead>

          {/* =================================================
              Corpo
              ================================================= */}
          <tbody className="font-body text-xs sm:text-sm">

            {data.map((row) => {
              const testAttributes =
                rowTestAttributes?.(row);

              return (
                <tr
                  key={row.id}
                  data-cy={rowTestId?.(row)}
                  {...testAttributes}
                  className="border-b border-outline-variant/40 hover:bg-surface-container-high transition-colors"
                >

                  {/* =========================================
                      Colunas
                      ========================================= */}
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={`
                        p-xs sm:p-sm lg:p-md
                        text-on-surface
                        text-${column.align || 'left'}
                        ${column.className || ''}
                      `}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : (row[
                            column.accessor
                          ] as React.ReactNode)}
                    </td>
                  ))}

                  {/* =========================================
                      Ações
                      ========================================= */}
                  {(onEdit || onViewDetails) && (
                    <td
                      className="
                        p-xs sm:p-sm lg:p-md
                        sticky right-0
                        border-l
                        border-outline-variant/40
                        shadow-[-4px_0px_8px_rgba(0,0,0,0.06)]
                        z-10
                        bg-inherit
                      "
                    >
                      <div className="flex items-center justify-center gap-xs sm:gap-sm">

                        {/* Editar */}
                        {onEdit && (
                          <button
                            type="button"
                            data-cy="table-edit-button"
                            onClick={() =>
                              onEdit(row)
                            }
                            className="p-xs sm:p-sm text-secondary hover:text-primary hover:bg-secondary-container/40 rounded-md transition-colors"
                            title="Editar Cadastro"
                          >
                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                              edit
                            </span>
                          </button>
                        )}

                        {/* Visualizar detalhes */}
                        {onViewDetails && (
                          <button
                            type="button"
                            data-cy="table-details-button"
                            onClick={() =>
                              onViewDetails(row)
                            }
                            className="p-xs sm:p-sm text-secondary hover:text-primary hover:bg-secondary-container/40 rounded-md transition-colors"
                            title="Visualizar Detalhes"
                          >
                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                              open_in_new
                            </span>
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