import React from 'react';
import { Input } from '../../../../components/ui/Input';

interface DimensionsFormProps {
  widthMm: number | '';
  heightMm: number | '';
  quantity: number | '';
  onWidthChange: (val: number | '') => void;
  onHeightChange: (val: number | '') => void;
  onQuantityChange: (val: number | '') => void;
  errors?: { widthMm?: string; heightMm?: string; quantity?: string };
}

export const DimensionsForm: React.FC<DimensionsFormProps> = ({
  widthMm,
  heightMm,
  quantity,
  onWidthChange,
  onHeightChange,
  onQuantityChange,
  errors = {},
}) => {
  const handleNumericInput = (
    value: string,
    setter: (val: number | '') => void,
    max = 9999,
  ) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num >= 0 && num <= max) {
      setter(num);
    }
  };

  const handleQuantityInput = (value: string) => {
    if (value === '') {
      onQuantityChange('');
      return;
    }
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num >= 0 && num <= 999) {
      onQuantityChange(num);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <p className="text-sm text-on-surface-variant font-body">
        Informe as dimensões da esquadria em milímetros:
      </p>

      <div className="grid grid-cols-3 gap-sm">
        {/* Largura */}
        <div className="col-span-1">
          <Input
            label="Largura *"
            id="dimension-width"
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            unit="mm"
            value={widthMm === '' ? '' : widthMm}
            onChange={(e) => handleNumericInput(e.target.value, onWidthChange, 9999)}
            error={errors.widthMm}
            placeholder="Ex: 2000"
          />
        </div>

        {/* Altura */}
        <div className="col-span-1">
          <Input
            label="Altura *"
            id="dimension-height"
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            unit="mm"
            value={heightMm === '' ? '' : heightMm}
            onChange={(e) => handleNumericInput(e.target.value, onHeightChange, 9999)}
            error={errors.heightMm}
            placeholder="Ex: 2100"
          />
        </div>

        {/* Quantidade */}
        <div className="col-span-1">
          <Input
            label="Quantidade *"
            id="dimension-qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            unit="un"
            value={quantity === '' ? '' : quantity}
            onChange={(e) => handleQuantityInput(e.target.value)}
            onBlur={() => {
              if (quantity === '' || quantity < 1) onQuantityChange(1);
            }}
            error={errors.quantity}
            placeholder="1"
          />
        </div>
      </div>

      {/* Área calculada */}
      {widthMm && heightMm && widthMm > 0 && heightMm > 0 && (
        <div className="flex items-center gap-sm bg-surface-container rounded-md p-sm border border-outline-variant">
          <span className="material-symbols-outlined text-secondary text-[18px]">straighten</span>
          <div className="flex flex-col gap-xs sm:flex-row sm:gap-md text-xs font-data-mono">
            <span>
              <span className="text-on-surface-variant">Área: </span>
              <span className="text-on-surface font-semibold">
                {((+widthMm / 1000) * (+heightMm / 1000)).toFixed(2)} m²
              </span>
              <span className="text-on-surface-variant"> / unidade</span>
            </span>
            {typeof quantity === 'number' && quantity > 1 && (
              <span>
                <span className="text-on-surface-variant">Total ({quantity}× ): </span>
                <span className="text-primary font-semibold">
                  {((+widthMm / 1000) * (+heightMm / 1000) * quantity).toFixed(2)} m²
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
