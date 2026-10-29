import { PartSaleForm } from '../features/part-sales';

export function PartSaleFormPage() {
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 h-full overflow-y-auto animate-in fade-in duration-200">
      <PartSaleForm />
    </div>
  );
}
