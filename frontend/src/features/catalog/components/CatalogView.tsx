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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary dark:text-inverse-on-surface leading-tight">
            Catálogo de Materiais
          </h2>
          <p className="font-body text-sm text-secondary dark:text-outline-variant mt-xs">
            Gerencie especificações técnicas e precificação de insumos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
          {/* Universal Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary dark:text-outline-variant pointer-events-none text-[18px]">
              search
            </span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-xl pr-sm py-sm bg-white dark:bg-surface-container-high/20 border border-outline-variant/80 dark:border-outline/40 rounded-md font-body text-sm text-on-surface dark:text-inverse-on-surface focus:border-primary focus:outline-none transition-colors shadow-sm" 
              placeholder="Buscar código ou insumo..." 
              type="text" 
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="appearance-none bg-white dark:bg-surface-container-high/20 border border-outline-variant/80 dark:border-outline/40 rounded-md font-body text-sm text-on-surface dark:text-inverse-on-surface focus:border-primary focus:outline-none transition-colors shadow-sm pl-sm pr-xl py-sm min-w-[140px] cursor-pointer"
            >
              <option className="dark:bg-[#182230] dark:text-inverse-on-surface" value="ALL">Todos (Status)</option>
              <option className="dark:bg-[#182230] dark:text-inverse-on-surface" value="ACTIVE">Apenas Ativos</option>
              <option className="dark:bg-[#182230] dark:text-inverse-on-surface" value="INACTIVE">Apenas Inativos</option>
            </select>
            <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-secondary dark:text-outline-variant pointer-events-none text-[18px]">
              expand_more
            </span>
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
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Glass')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
        <Tab label="Perfis de Alumínio">
          <ProfileTab 
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Profile')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
        <Tab label="Películas">
          <FilmTab 
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onEdit={(item) => handleEditItem(item, 'Film')} 
            onViewDetails={handleViewDetails} 
          />
        </Tab>
        <Tab label="Ferragens">
          <HardwareTab 
            searchQuery={searchQuery}
            filterStatus={filterStatus}
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
