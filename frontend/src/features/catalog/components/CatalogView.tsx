import { useMemo, useState } from 'react';
import { Tabs, Tab } from '../../../components/ui/Tabs';
import {
  KardexDrawer,
  needsPurchaseOrReorder,
  resolveCatalogStockSnapshot,
  useStockBalances,
  type KardexMaterialTarget,
  type StockItem,
} from '@/features/stock';
import { GlassTab } from './GlassTab';
import { ProfileTab } from './ProfileTab';
import { FilmTab } from './FilmTab';
import { HardwareTab } from './HardwareTab';
import { MaterialTypeSelectionModal } from './MaterialTypeSelectionModal';
import { GlassFormModal } from './GlassFormModal';
import { HardwareFormModal } from './HardwareFormModal';
import { FilmFormModal } from './FilmFormModal';
import { ProfileFormModal } from './ProfileFormModal';
import { MaterialDetailsModal } from './MaterialDetailsModal';
import { Button } from '../../../components/ui/Button';
import type {
  FilmDTO,
  GlassDTO,
  HardwareDTO,
  MaterialType,
  ProfileDTO,
} from '../types';

type CatalogMaterialItem = GlassDTO | ProfileDTO | HardwareDTO | FilmDTO;

const HIDE_ALERT_STORAGE_KEY = 'alumigest.catalog.hideStockAlert';

function readHideAlertPreference(): boolean {
  try {
    return globalThis.localStorage?.getItem(HIDE_ALERT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistHideAlertPreference(value: boolean): void {
  try {
    globalThis.localStorage?.setItem(HIDE_ALERT_STORAGE_KEY, String(value));
  } catch {
    // Ignora falha de armazenamento em ambientes restritos
  }
}

function toKardexTarget(
  item: CatalogMaterialItem,
  defaultUnitMeasure: string
): KardexMaterialTarget {
  const skuCode =
    ('skuCode' in item ? item.skuCode : undefined) ||
    ('commercialReference' in item ? item.commercialReference : undefined);
  const unitMeasure =
    'unitMeasure' in item && item.unitMeasure ? item.unitMeasure : defaultUnitMeasure;

  return {
    id: item.id,
    skuCode,
    name: item.name,
    unitMeasure,
  };
}

export function CatalogView() {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [activeFormType, setActiveFormType] = useState<MaterialType | null>(null);
  const [editingItem, setEditingItem] = useState<CatalogMaterialItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<{
    item: CatalogMaterialItem;
    tipo: MaterialType;
  } | null>(null);
  const [selectedKardexMaterial, setSelectedKardexMaterial] =
    useState<KardexMaterialTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [onlyNeedsPurchase, setOnlyNeedsPurchase] = useState(false);
  const [hideStockAlert, setHideStockAlert] = useState<boolean>(readHideAlertPreference);

  const {
    data: stockItems = [],
    isError: isStockError,
    refetch: refetchStock,
  } = useStockBalances();

  const { stockByMaterialId, pendingPurchaseCount } = useMemo(() => {
    const map = new Map<string, StockItem>();
    let pendingCount = 0;

    for (const item of stockItems) {
      map.set(item.materialId, item);
      const snapshot = resolveCatalogStockSnapshot(item, item.unitMeasure);
      if (needsPurchaseOrReorder(snapshot.displayStatus)) {
        pendingCount += 1;
      }
    }

    return { stockByMaterialId: map, pendingPurchaseCount: pendingCount };
  }, [stockItems]);

  const handleOpenSelectionModal = () => {
    setIsSelectionModalOpen(true);
  };

  const handleSelectTipo = (tipo: MaterialType) => {
    setIsSelectionModalOpen(false);
    setEditingItem(null);
    setActiveFormType(tipo);
  };

  const handleEditItem = (item: CatalogMaterialItem, tipo: MaterialType) => {
    setEditingItem(item);
    setActiveFormType(tipo);
  };

  const handleViewDetails = (item: CatalogMaterialItem, tipo: MaterialType) => {
    setDetailsItem({ item, tipo });
  };

  const handleOpenKardex = (item: CatalogMaterialItem, defaultUnitMeasure: string) => {
    setSelectedKardexMaterial(toKardexTarget(item, defaultUnitMeasure));
  };

  const handleCloseFormModal = () => {
    setActiveFormType(null);
    setEditingItem(null);
  };

  const handleToggleHideStockAlert = (checked: boolean) => {
    setHideStockAlert(checked);
    persistHideAlertPreference(checked);
  };

  const stockFilterControls = (
    <>
      <label
        data-testid="filter-needs-purchase-label"
        className={`cursor-pointer select-none inline-flex items-center gap-xs px-2.5 py-1 rounded-md border shadow-xs text-xs transition-colors ${
          onlyNeedsPurchase
            ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-200'
            : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <input
          id="catalog-filter-needs-purchase"
          name="onlyNeedsPurchase"
          type="checkbox"
          data-cy="filter-needs-purchase"
          checked={onlyNeedsPurchase}
          onChange={(e) => setOnlyNeedsPurchase(e.target.checked)}
          className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
        />
        <span className="font-medium">Apenas com necessidade de compra</span>
        <span
          data-testid="needs-purchase-count"
          className={`font-data-mono tabular-nums text-[11px] font-bold px-1.5 py-px rounded-full ${
            onlyNeedsPurchase
              ? 'bg-rose-600 text-white'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
          }`}
        >
          {pendingPurchaseCount}
        </span>
      </label>

      <label
        data-testid="toggle-hide-stock-alert-label"
        className={`cursor-pointer select-none inline-flex items-center gap-xs px-2.5 py-1 rounded-md border shadow-xs text-xs transition-colors ${
          hideStockAlert
            ? 'bg-secondary-container border-primary/40 text-primary'
            : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <input
          id="catalog-toggle-hide-stock-alert"
          name="hideStockAlert"
          type="checkbox"
          data-cy="toggle-hide-stock-alert"
          checked={hideStockAlert}
          onChange={(e) => handleToggleHideStockAlert(e.target.checked)}
          className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
        />
        <span className="font-medium">Ocultar Alerta de Estoque</span>
      </label>
    </>
  );

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-sm gap-sm flex-none">
        <div>
          <h2
            data-cy="catalog-title"
            className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight"
          >
            Catálogo de Materiais
          </h2>

          <p className="font-body text-sm text-secondary mt-xs">
            Gerencie especificações técnicas e precificação de insumos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
          {/* Universal Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
              search
            </span>

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-xl pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-body text-sm text-on-surface focus:border-primary focus:outline-none transition-colors shadow-sm"
              placeholder="Buscar código ou insumo..."
              type="text"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              data-cy="catalog-status-filter"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
                )
              }
              className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-md font-body text-sm text-on-surface focus:border-primary focus:outline-none transition-colors shadow-sm pl-sm pr-xl py-sm min-w-[140px] cursor-pointer"
            >
              <option value="ALL">Todos (Status)</option>
              <option value="ACTIVE">Apenas Ativos</option>
              <option value="INACTIVE">Apenas Inativos</option>
            </select>

            <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Novo Material */}
          <Button
            variant="primary"
            icon="add"
            onClick={handleOpenSelectionModal}
            data-cy="new-material-button"
          >
            Novo Material
          </Button>
        </div>
      </div>

      {isStockError && (
        <div
          role="alert"
          data-testid="stock-balance-error-banner"
          className="mb-sm px-md py-xs rounded-md border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 flex flex-wrap items-center justify-between gap-sm text-xs flex-none"
        >
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              warning
            </span>
            <span>
              Não foi possível carregar os saldos de estoque. Os valores exibidos podem estar desatualizados.
            </span>
          </span>
          <button
            type="button"
            onClick={() => void refetchStock()}
            className="px-sm py-xs rounded border border-amber-400/70 dark:border-amber-400/40 font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs rightSlot={stockFilterControls}>
        <Tab label="Vidros" dataCy="catalog-tab-glasses">
          <GlassTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            stockByMaterialId={stockByMaterialId}
            onlyNeedsPurchase={onlyNeedsPurchase}
            hideStockAlert={hideStockAlert}
            onEdit={(item) => handleEditItem(item, 'Glass')}
            onViewDetails={(item) => handleViewDetails(item, 'Glass')}
            onOpenKardex={(item) => handleOpenKardex(item, 'M2')}
          />
        </Tab>

        <Tab label="Perfis de Alumínio" dataCy="catalog-tab-profiles">
          <ProfileTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            stockByMaterialId={stockByMaterialId}
            onlyNeedsPurchase={onlyNeedsPurchase}
            hideStockAlert={hideStockAlert}
            onEdit={(item) => handleEditItem(item, 'Profile')}
            onViewDetails={(item) => handleViewDetails(item, 'Profile')}
            onOpenKardex={(item) => handleOpenKardex(item, 'BARRA_6M')}
          />
        </Tab>

        <Tab label="Películas" dataCy="catalog-tab-films">
          <FilmTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            stockByMaterialId={stockByMaterialId}
            onlyNeedsPurchase={onlyNeedsPurchase}
            hideStockAlert={hideStockAlert}
            onEdit={(item) => handleEditItem(item, 'Film')}
            onViewDetails={(item) => handleViewDetails(item, 'Film')}
            onOpenKardex={(item) => handleOpenKardex(item, 'M2')}
          />
        </Tab>

        <Tab label="Ferragens" dataCy="catalog-tab-hardwares">
          <HardwareTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            stockByMaterialId={stockByMaterialId}
            onlyNeedsPurchase={onlyNeedsPurchase}
            hideStockAlert={hideStockAlert}
            onEdit={(item) => handleEditItem(item, 'Hardware')}
            onViewDetails={(item) => handleViewDetails(item, 'Hardware')}
            onOpenKardex={(item) => handleOpenKardex(item, 'UN')}
          />
        </Tab>
      </Tabs>

      {/* Modal de Seleção de Tipo */}
      <MaterialTypeSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectTipo}
      />

      {/* Modais de Formulário */}
      {activeFormType === 'Glass' && (
        <GlassFormModal
          isOpen={true}
          onClose={handleCloseFormModal}
          initialData={editingItem}
        />
      )}

      {activeFormType === 'Hardware' && (
        <HardwareFormModal
          isOpen={true}
          onClose={handleCloseFormModal}
          initialData={editingItem}
        />
      )}

      {activeFormType === 'Film' && (
        <FilmFormModal
          isOpen={true}
          onClose={handleCloseFormModal}
          initialData={editingItem}
        />
      )}

      {activeFormType === 'Profile' && (
        <ProfileFormModal
          isOpen={true}
          onClose={handleCloseFormModal}
          initialData={editingItem}
        />
      )}

      {/* Modal de Detalhes */}
      <MaterialDetailsModal
        isOpen={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        item={detailsItem?.item}
        onEdit={() => {
          if (detailsItem) {
            handleEditItem(detailsItem.item, detailsItem.tipo);
            setDetailsItem(null);
          }
        }}
      />

      {/* Gaveta Lateral de Extrato Kardex (US-22.2) */}
      <KardexDrawer
        isOpen={Boolean(selectedKardexMaterial)}
        material={selectedKardexMaterial}
        stockItem={
          selectedKardexMaterial
            ? stockByMaterialId.get(selectedKardexMaterial.id)
            : undefined
        }
        onClose={() => setSelectedKardexMaterial(null)}
      />
    </>
  );
}
