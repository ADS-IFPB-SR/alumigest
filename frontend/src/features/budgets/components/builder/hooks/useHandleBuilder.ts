import { useState, useCallback } from 'react';
import type {
  HandleConfig,
  HandleType,
  HandlePosition,
  HandleOrientation,
  HandleSide,
  HandleCoverage,
} from '../../../types';

/**
 * Propriedades para o hook useHandleBuilder.
 */
export interface UseHandleBuilderProps {
  /** Posições de puxador permitidas para a tipologia atual */
  allowedHandlePositions: HandlePosition[];
  /** Posição padrão caso a atual não seja suportada */
  defaultHandlePosition: HandlePosition;
  /** Callback opcional notificado quando a configuração sofrer alterações */
  onConfigChange?: (newConfig: HandleConfig) => void;
}

/**
 * Subhook especializado na geometria e regras técnicas do puxador:
 * - Tipo de puxador (Tubular, Fecho Concha, Maçaneta, Perfil Puxador, Sem Puxador).
 * - Regra de Auto-Orientação: Posições laterais (LEFT/RIGHT) forçam automaticamente orientação vertical.
 * - Posições horizontais (TOP/BOTTOM) forçam orientação horizontal (deitado).
 * - Restrições de extensão (FULL vs PIECE) exclusivas para Perfil Puxador.
 */
export function useHandleBuilder({
  allowedHandlePositions,
  defaultHandlePosition,
  onConfigChange,
}: UseHandleBuilderProps) {
  const [handleConfig, setHandleConfig] = useState<HandleConfig>({
    handleType: 'BAR_TUBULAR',
    side: 'ONE_SIDE',
    coverage: 'FULL',
    pieceLengthCm: 40,
  });

  const handleHandleTypeChange = useCallback(
    (type: HandleType) => {
      setHandleConfig((prev) => {
        const isProfile = type === 'PROFILE_HANDLE';
        const currentPos = prev.position;
        const validPosition =
          currentPos && allowedHandlePositions.includes(currentPos)
            ? currentPos
            : defaultHandlePosition;

        const newConfig: HandleConfig = {
          ...prev,
          handleType: type,
          position: validPosition,
          side: prev.side ?? 'ONE_SIDE',
          coverage: isProfile ? prev.coverage ?? 'FULL' : undefined,
          pieceLengthCm:
            isProfile && prev.coverage === 'PIECE'
              ? prev.pieceLengthCm ?? 40
              : undefined,
        };

        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [allowedHandlePositions, defaultHandlePosition, onConfigChange]
  );

  const handleHandlePositionChange = useCallback(
    (position: HandlePosition) => {
      setHandleConfig((prev) => {
        // Se a posição for lateral (LEFT ou RIGHT), força para VERTICAL
        // Se for topo/base, força para HORIZONTAL
        // Se for centro, mantém a orientação atual ou vertical
        let nextOrientation: HandleOrientation = prev.orientation ?? 'VERTICAL';
        if (position === 'TOP' || position === 'BOTTOM') {
          nextOrientation = 'HORIZONTAL';
        } else if (position === 'LEFT' || position === 'RIGHT') {
          nextOrientation = 'VERTICAL';
        }

        const newConfig: HandleConfig = {
          ...prev,
          position,
          orientation: nextOrientation,
        };

        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const handleHandleOrientationChange = useCallback(
    (orientation: HandleOrientation) => {
      setHandleConfig((prev) => {
        const newConfig: HandleConfig = {
          ...prev,
          orientation,
        };
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const handleHandleSideChange = useCallback(
    (side: HandleSide) => {
      setHandleConfig((prev) => {
        const newConfig: HandleConfig = { ...prev, side };
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const handleHandleCoverageChange = useCallback(
    (coverage: HandleCoverage) => {
      setHandleConfig((prev) => {
        const newConfig: HandleConfig = {
          ...prev,
          coverage,
          pieceLengthCm: coverage === 'PIECE' ? prev.pieceLengthCm ?? 40 : undefined,
        };
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const handleHandlePieceLengthChange = useCallback(
    (pieceLengthCm: number) => {
      setHandleConfig((prev) => {
        const newConfig: HandleConfig = {
          ...prev,
          pieceLengthCm,
        };
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  return {
    handleConfig,
    setHandleConfig,
    handleHandleTypeChange,
    handleHandlePositionChange,
    handleHandleOrientationChange,
    handleHandleSideChange,
    handleHandleCoverageChange,
    handleHandlePieceLengthChange,
  };
}
