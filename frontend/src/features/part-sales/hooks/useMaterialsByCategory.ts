import { useQuery } from '@tanstack/react-query';
import { partSaleApi } from '../services/partSaleApi';
import type { MaterialOption, MaterialCategoryType } from '../types';

export function useMaterialsByCategory(category?: MaterialCategoryType | string) {
  return useQuery<MaterialOption[]>({
    queryKey: ['materials', category],
    queryFn: () => partSaleApi.getMaterialsByCategory(category),
    enabled: Boolean(category),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}

