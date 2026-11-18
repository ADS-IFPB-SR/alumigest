/**
 * Calcula a lista de páginas e reticências a serem exibidas na janela de paginação deslizante.
 * Mantém no máximo 7 elementos visíveis, ajustando início, meio e fim conforme a página ativa.
 *
 * @param page Página atual (0-indexed)
 * @param totalPages Total de páginas disponíveis
 */
export function getVisiblePages(
  page: number,
  totalPages: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [0];

  if (page > 2) {
    pages.push('ellipsis-start');
  }

  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages - 2, page + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (page < totalPages - 3) {
    pages.push('ellipsis-end');
  }

  pages.push(totalPages - 1);

  return pages;
}
