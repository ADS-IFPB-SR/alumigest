/**
 * Formata strings de data (YYYY-MM-DD ou ISO) para o padrão brasileiro dd/MM/yyyy.
 */
export function formatDate(val?: string | null): string {
  if (!val) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return val;
  }
}
