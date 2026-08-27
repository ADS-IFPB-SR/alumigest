import { SeparateSaleForm } from '../features/budgets/components/SeparateSaleForm.tsx';

export function SeparateSalePage() {
  return (
    <div className="flex-1 flex flex-col p-md h-full overflow-y-auto animate-in fade-in duration-200">
      <div className="flex justify-center items-start w-full mt-sm sm:mt-lg">
        <SeparateSaleForm />
      </div>
    </div>
  );
}