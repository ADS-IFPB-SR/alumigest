import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onEdit: () => void;
}

export function MaterialDetailsModal({
  isOpen,
  onClose,
  item,
  onEdit,
}: Props) {
  if (!item) return null;

  const price =
    item.pricePerSqm ||
    item.pricePerMeter ||
    item.salePrice;

  const itemName =
    item.name ||
    item.description;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Especificações Técnicas e Detalhes"
      footer={
        <>
          <Button
            variant="ghost"
            data-cy="details-close-button"
            onClick={onClose}
          >
            Fechar
          </Button>

          <Button
            variant="primary"
            icon="edit"
            data-cy="details-edit-button"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            Editar Cadastro
          </Button>
        </>
      }
    >
      <div
        data-cy="material-details-modal"
        className="flex flex-col gap-md"
      >
        {/* Status Header */}
        <div className="flex items-center justify-between p-sm bg-surface-container-low border border-outline-variant rounded-sm">
          <div>
            <span className="font-data-mono text-data-mono text-xs text-on-surface-variant block">
              Código Interno
            </span>

            <span
              data-cy="details-internal-code"
              className="font-title-sm text-title-sm font-bold text-on-surface"
            >
              {item.skuCode ||
                item.commercialReference ||
                itemName ||
                'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-sm">
            <span
              data-cy="details-status"
              className={`px-sm py-xs text-xs font-bold rounded-full ${
                item.active
                  ? 'border border-success/30 bg-success/10 text-success'
                  : 'border border-error/30 bg-error/10 text-error'
              }`}
            >
              {item.active
                ? 'Ativo no Catálogo'
                : 'Inativo no Catálogo'}
            </span>
          </div>
        </div>

        {/* Especificações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm sm:gap-md">

          {/* Nome */}
          <div className="p-sm border border-outline-variant rounded-sm">
            <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
              Nome / Descrição
            </span>

            <span
              data-cy="details-name"
              className="font-body-md text-on-surface font-medium"
            >
              {itemName}
            </span>
          </div>

          {/* Linha Comercial */}
          {item.commercialLine && (
            <div className="p-sm border border-outline-variant rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
                Linha Comercial
              </span>

              <span
                data-cy="details-commercial-line"
                className="font-body-md text-on-surface"
              >
                {item.commercialLine}
              </span>
            </div>
          )}

          {/* Especificação Técnica */}
          {(item.thicknessMm || item.colorFinish) && (
            <div className="p-sm border border-outline-variant rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
                Especificação Técnica
              </span>

              <span
                data-cy="details-technical-spec"
                className="font-data-mono text-data-mono text-on-surface"
              >
                {item.thicknessMm
                  ? `${item.thicknessMm}mm `
                  : ''}
                {item.colorFinish || ''}
              </span>
            </div>
          )}

          {/* Dimensões Máximas */}
          {(item.maxWidthMm !== undefined ||
            item.maxHeightMm !== undefined) && (
            <div className="p-sm border border-outline-variant rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
                Dimensões Máximas (mm)
              </span>

              <span
                data-cy="details-dimensions"
                className="font-data-mono text-data-mono text-on-surface"
              >
                {item.maxWidthMm} L x {item.maxHeightMm} A
              </span>
            </div>
          )}

          {/* Peso Linear */}
          {(item.weightPerMeterKg !== undefined ||
            item.weight !== undefined) && (
            <div className="p-sm border border-outline-variant rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
                Peso Linear
              </span>

              <span
                data-cy="details-weight"
                className="font-data-mono text-data-mono text-on-surface"
              >
                {Number(
                  item.weightPerMeterKg ??
                    item.weight
                ).toFixed(3)}{' '}
                Kg/m
              </span>
            </div>
          )}

          {/* Comprimento */}
          {(item.standardLengthM !== undefined ||
            item.length !== undefined) && (
            <div className="p-sm border border-outline-variant rounded-sm">
              <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
                Comprimento
              </span>

              <span
                data-cy="details-length"
                className="font-data-mono text-data-mono text-on-surface"
              >
                {Number(
                  item.standardLengthM ??
                    item.length
                ).toFixed(1).replace('.', ',')}{' '}
                m
              </span>
            </div>
          )}

          {/* Valores */}
          <div className="p-sm border border-outline-variant rounded-sm sm:col-span-2 bg-surface-container-low">
            <span className="font-label-bold text-xs text-on-surface-variant block mb-xs">
              Valores e Precificação
            </span>

            <span
              data-cy="details-price"
              className="font-data-mono text-lg font-bold text-primary"
            >
              {typeof price === 'number'
                ? `R$ ${price
                    .toFixed(2)
                    .replace('.', ',')}`
                : price}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}