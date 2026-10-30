import { PartSaleForm } from '../features/part-sales';

export function PartSaleFormPage() {
  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-0 overflow-y-auto">
      <PartSaleForm />
    </div>
  );
}

export { PartSaleFormPage as PartSalePage };
