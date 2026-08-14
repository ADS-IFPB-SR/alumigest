export function filterByStatus<T extends { active?: boolean }>(
  item: T,
  filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE'
): boolean {
  if (filterStatus === 'ACTIVE' && !item.active) return false;
  if (filterStatus === 'INACTIVE' && item.active) return false;
  return true;
}
