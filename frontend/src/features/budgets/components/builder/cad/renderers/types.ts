import type React from 'react';
import type {
  HandleConfig,
  DrillingConfig,
} from '../../../../types';
import type { SvgTheme } from '../../../../utils/svgTheme';
import type { ResolvedHandleInfo } from '../resolveHandleInfo';

export interface SvgRenderContext {
  svgW: number;
  svgH: number;
  inverted: boolean;
  handleConfig: HandleConfig;
  resolvedHandle: ResolvedHandleInfo;
  drillingConfig: DrillingConfig;
  widthMm: number;
  heightMm: number;
  theme: SvgTheme;
}

export type SvgTemplateRenderer = (ctx: SvgRenderContext) => React.ReactNode;
