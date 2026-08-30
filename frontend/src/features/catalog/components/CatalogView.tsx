import { useState } from 'react';
import { Tabs, Tab } from '../../../components/ui/Tabs';
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
import type { MaterialType } from '../types';

export function CatalogView() {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [activeFormType, setActiveFormType] = useState<MaterialType | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [detailsItem, setDetailsItem] = useState<{ item: any; tipo: MaterialType } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const handleOpenSelectionModal = () => {
    setIsSelectionModalOpen(true);
  };

  const handleSelectTipo = (tipo: MaterialType) => {
    setIsSelectionModalOpen(false);
    setEditingItem(null);
    setActiveFormType(tipo);
  };

  const handleEditItem = (item: any, tipo: MaterialType) => {
    setEditingItem(item);
    setActiveFormType(tipo);
  };

  const handleViewDetails = (item: any, tipo: MaterialType) => {
    setDetailsItem({ item, tipo });
  };

  const handleCloseFormModal = () => {
    setActiveFormType(null);
    setEditingItem(null);
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
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

      {/* Tabs */}
      <Tabs>
        <Tab
          label="Vidros"
          dataCy="catalog-tab-glasses"
        >
          <GlassTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Glass')}
            onViewDetails={(item) => handleViewDetails(item, 'Glass')}
          />
        </Tab>

        <Tab
          label="Perfis de Alumínio"
          dataCy="catalog-tab-profiles"
        >
          <ProfileTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Profile')}
            onViewDetails={(item) => handleViewDetails(item, 'Profile')}
          />
        </Tab>

        <Tab
          label="Películas"
          dataCy="catalog-tab-films"
        >
          <FilmTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Film')}
            onViewDetails={(item) => handleViewDetails(item, 'Film')}
          />
        </Tab>

        <Tab
          label="Ferragens"
          dataCy="catalog-tab-hardwares"
        >
          <HardwareTab
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Hardware')}
            onViewDetails={(item) => handleViewDetails(item, 'Hardware')}
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
    </>
  );
}