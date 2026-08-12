import { useState } from 'react';
import { Tabs, Tab } from '../../../components/ui/Tabs';
import { GlassTab } from './GlassTab';
import { ProfileTab } from './ProfileTab';
import { FilmTab } from './FilmTab';
import { HardwareTab } from './HardwareTab';
import { MaterialTypeSelectionModal } from './MaterialTypeSelectionModal';
import { MaterialFormModal } from './MaterialFormModal';
import { ProfileFormModal } from './ProfileFormModal';
import { MaterialDetailsModal } from './MaterialDetailsModal';
import { Button } from '../../../components/ui/Button';
import type { MaterialType } from '../types';

export function CatalogView() {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [activeFormType, setActiveFormType] = useState<MaterialType | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [detailsItem, setDetailsItem] = useState<any | null>(null);

  const handleOpenSelectionModal = () => {
    setIsSelectionModalOpen(true);
  };

  const handleSelectTipo = (tipo: MaterialType) => {
    setIsSelectionModalOpen(false);
    setEditingItem(null); // Fresh create
    setActiveFormType(tipo);
  };

  const handleEditItem = (item: any, tipo: MaterialType) => {
    setEditingItem(item);
    setActiveFormType(tipo);
  };

  const handleViewDetails = (item: any) => {
    setDetailsItem(item);
  };

  const handleCloseFormModal = () => {
    setActiveFormType(null);
    setEditingItem(null);
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-sm sm:mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary dark:text-inverse-on-surface leading-tight">
            Catálogo de Materiais
          </h2>
          <p className="font-body text-xs sm:text-body-sm text-secondary dark:text-outline-variant mt-xs">
            Gerencie especificações técnicas e precificação de insumos.
          </p>
        </div>

        <div className="flex items-center gap-sm">
          {/* Mobile search bar */}
          <div className="relative sm:hidden flex-1">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
              search
            </span>
            <input 
              className="w-full pl-xl pr-sm py-xs bg-white dark:bg-surface-container-high/20 border border-outline-variant/80 dark:border-outline/40 rounded-md font-body text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary focus:outline-none" 
              placeholder="Buscar..." 
              type="text" 
            />
          </div>

          <Button 
            variant="primary"
            icon="add"
            onClick={handleOpenSelectionModal}
          >
            Novo Material
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs>
        <Tab label="Vidros">
          <GlassTab 
            onEdit={(item) => handleEditItem(item, 'Glass')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
        <Tab label="Perfis de Alumínio">
          <ProfileTab 
            onEdit={(item) => handleEditItem(item, 'Profile')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
        <Tab label="Películas">
          <FilmTab 
            onEdit={(item) => handleEditItem(item, 'Film')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
        <Tab label="Ferragens">
          <HardwareTab 
            onEdit={(item) => handleEditItem(item, 'Hardware')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
      </Tabs>

      {/* 1. Modal de Seleção de Tipo de Material */}
      <MaterialTypeSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectTipo}
      />

      {/* 2. Modais de Formulário de Cadastro/Edição */}
      {(activeFormType === 'Glass' || activeFormType === 'Film' || activeFormType === 'Hardware') && (
        <MaterialFormModal
          isOpen={true}
          onClose={handleCloseFormModal}
          tipo={activeFormType}
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

      {/* 3. Modal de Visualização de Detalhes (Read-only) */}
      <MaterialDetailsModal
        isOpen={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        item={detailsItem}
        onEdit={() => {
          if (detailsItem) {
            handleEditItem(detailsItem, 'Glass');
          }
        }}
      />
    </>
  );
}
