import type {
  HandleConfig,
  HandlePosition,
  HandleSide,
  HandleCoverage,
  HandleType,
  MaterialSelection,
  HandleOrientation,
} from '../../../types';

export interface ResolvedHandleInfo {
  handleType: HandleType;
  position: HandlePosition;
  orientation?: HandleOrientation;
  side: HandleSide;
  coverage: HandleCoverage;
  pieceLengthMm: number;
  label: string;
}

/** Resolve tipo de puxador, dimensões e lado a partir da config técnica do Step 3 e do material */
export function resolveHandleInfo(
  handleConfig?: HandleConfig,
  handleMaterial?: MaterialSelection | null,
  heightMm: number = 2100,
  defaultPosition: HandlePosition = 'RIGHT',
): ResolvedHandleInfo {
  const safeHeight = typeof heightMm === 'number' && heightMm > 0 ? heightMm : 2100;
  const side: HandleSide = handleConfig?.side ?? 'ONE_SIDE';
  const position: HandlePosition = handleConfig?.position ?? defaultPosition;
  const orientation = handleConfig?.orientation;
  const handleType: HandleType = handleConfig?.handleType ?? 'BAR_TUBULAR';

  // Se o tipo for explicitamente 'NONE' ou se a quantidade do insumo foi zerada
  if (
    handleType === 'NONE' ||
    (handleMaterial !== undefined &&
      handleMaterial !== null &&
      handleMaterial.quantity !== undefined &&
      handleMaterial.quantity <= 0)
  ) {
    return {
      handleType: 'NONE',
      position,
      orientation,
      side,
      coverage: 'FULL',
      pieceLengthMm: safeHeight,
      label: 'Sem Puxador',
    };
  }

  // Cobertura e comprimento em mm
  const isLinear = handleType === 'PROFILE_HANDLE' || handleType === 'BAR_TUBULAR';
  const coverage: HandleCoverage = isLinear ? (handleConfig?.coverage ?? 'FULL') : 'FULL';

  let pieceLengthMm = safeHeight;
  if (isLinear && coverage === 'PIECE') {
    if (handleConfig?.pieceLengthCm) {
      pieceLengthMm = handleConfig.pieceLengthCm * 10;
    } else {
      pieceLengthMm = 400; // fallback padrão de 40cm
    }
  }

  let typeName = 'Puxador';
  if (handleType === 'PROFILE_HANDLE') typeName = 'Puxador Perfil';
  else if (handleType === 'SHELL_LOCK') typeName = 'Fecho Concha';
  else if (handleType === 'LEVER_HANDLE') typeName = 'Maçaneta';
  else if (handleType === 'BAR_TUBULAR') typeName = 'Puxador Tubular';

  const dimLabel = isLinear
    ? (coverage === 'FULL' ? '(Total)' : `(${pieceLengthMm}mm)`)
    : '';

  return {
    handleType,
    position,
    orientation,
    side,
    coverage,
    pieceLengthMm,
    label: `${typeName} ${dimLabel}`.trim(),
  };
}
