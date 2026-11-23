import { useSearchParams } from 'react-router-dom';
import { CatalogView } from '../features/catalog';

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const initialOnlyNeedsPurchase = searchParams.get('needsPurchase') === 'true';

  return <CatalogView initialOnlyNeedsPurchase={initialOnlyNeedsPurchase} />;
}
