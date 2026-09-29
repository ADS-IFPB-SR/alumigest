import { describe, it, expect } from 'vitest';
import {
  TYPOLOGY_REGISTRY,
  getTypologyMetadata,
} from '../../../features/budgets/domain/typologyRegistry';
import type { DoorTemplateType } from '../../../features/budgets/types';

describe('typologyRegistry.ts', () => {
  describe('TYPOLOGY_REGISTRY', () => {
    it('deve conter as 10 tipologias canônicas registradas', () => {
      const expectedTemplates: DoorTemplateType[] = [
        'SLIDING_DOOR_1F',
        'SLIDING_DOOR_2F',
        'SLIDING_DOOR_3F',
        'SLIDING_DOOR_4F',
        'SWING_DOOR_1F',
        'SWING_DOOR_2F',
        'AWNING_WINDOW_1F',
        'AWNING_WINDOW_1F_INV',
        'FRONT_DRAWER',
        'FIXED_PANEL',
      ];

      expectedTemplates.forEach((type) => {
        const metadata = TYPOLOGY_REGISTRY[type];
        expect(metadata).toBeDefined();
        expect(metadata.templateType).toBe(type);
        expect(metadata.label).toBeTruthy();
        expect(metadata.mechanicalAxis).toBeTruthy();
      });
    });

    it('deve mapear os eixos mecânicos corretos por tipo de esquadria', () => {
      expect(TYPOLOGY_REGISTRY.SLIDING_DOOR_2F.mechanicalAxis).toBe('VERTICAL_AXIS');
      expect(TYPOLOGY_REGISTRY.SWING_DOOR_1F.mechanicalAxis).toBe('VERTICAL_AXIS');
      expect(TYPOLOGY_REGISTRY.AWNING_WINDOW_1F.mechanicalAxis).toBe('HORIZONTAL_AXIS');
      expect(TYPOLOGY_REGISTRY.AWNING_WINDOW_1F_INV.mechanicalAxis).toBe('HORIZONTAL_AXIS');
      expect(TYPOLOGY_REGISTRY.FRONT_DRAWER.mechanicalAxis).toBe('PANEL_SURFACE');
      expect(TYPOLOGY_REGISTRY.FIXED_PANEL.mechanicalAxis).toBe('FIXED');
    });

    it('deve definir posições de puxador adequadas para esquadrias horizontais e painel fixo', () => {
      expect(TYPOLOGY_REGISTRY.AWNING_WINDOW_1F.defaultHandlePosition).toBe('BOTTOM');
      expect(TYPOLOGY_REGISTRY.AWNING_WINDOW_1F_INV.defaultHandlePosition).toBe('TOP');
      expect(TYPOLOGY_REGISTRY.FRONT_DRAWER.defaultHandlePosition).toBe('CENTER');
      expect(TYPOLOGY_REGISTRY.FIXED_PANEL.allowedHandlePositions).toHaveLength(0);
    });
  });

  describe('getTypologyMetadata', () => {
    it('deve retornar metadados da tipologia padrão quando templateType não for informado', () => {
      const metaNull = getTypologyMetadata(null);
      expect(metaNull.templateType).toBe('SLIDING_DOOR_2F');
      expect(metaNull.label).toBe('Esquadria Padrão');

      const metaUndefined = getTypologyMetadata(undefined);
      expect(metaUndefined.templateType).toBe('SLIDING_DOOR_2F');
    });

    it('deve retornar a tipologia solicitada quando presente no registry', () => {
      const meta = getTypologyMetadata('SWING_DOOR_1F');
      expect(meta.templateType).toBe('SWING_DOOR_1F');
      expect(meta.defaultOpeningDirection).toBe('OUTSIDE');
      expect(meta.mechanicalAxis).toBe('VERTICAL_AXIS');
    });

    it('deve retornar fallback padrão quando tipologia desconhecida for fornecida', () => {
      const meta = getTypologyMetadata('TIPOLOGIA_DESCONHECIDA');
      expect(meta.templateType).toBe('SLIDING_DOOR_2F');
    });

    it('deve sobrescrever allowedHandlePositions quando fornecido pelo schema do produto', () => {
      const meta = getTypologyMetadata('SLIDING_DOOR_2F', ['CENTER', 'LEFT']);
      expect(meta.allowedHandlePositions).toEqual(['CENTER', 'LEFT']);
      expect(meta.defaultHandlePosition).toBe('CENTER');
    });

    it('deve preservar o defaultHandlePosition se ele constar nas opções permitidas do schema', () => {
      const meta = getTypologyMetadata('SLIDING_DOOR_2F', ['LEFT', 'RIGHT']);
      expect(meta.defaultHandlePosition).toBe('RIGHT');
    });
  });
});
