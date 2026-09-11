import type { DoorTemplateType } from '../../../../types';
import type { SvgTemplateRenderer } from './types';
import {
  renderSlidingDoor1F,
  renderSlidingDoor2F,
  renderSlidingDoor3F,
  renderSlidingDoor4F,
} from './SlidingDoorRenderers';
import {
  renderSwingDoor,
  renderAwningWindow1F,
  renderDrawerFront,
  renderFixedFacade,
} from './SpecializedDoorRenderers';

export * from './types';
export * from './SlidingDoorRenderers';
export * from './SpecializedDoorRenderers';

export const SVG_RENDERERS: Record<DoorTemplateType, SvgTemplateRenderer> = {
  SLIDING_DOOR_1F: (ctx) =>
    renderSlidingDoor1F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SLIDING_DOOR_2F: (ctx) =>
    renderSlidingDoor2F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SLIDING_DOOR_3F: (ctx) =>
    renderSlidingDoor3F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SLIDING_DOOR_4F: (ctx) =>
    renderSlidingDoor4F(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SWING_DOOR_1F: (ctx) =>
    renderSwingDoor(ctx.svgW, ctx.svgH, 1, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SWING_DOOR_2F: (ctx) =>
    renderSwingDoor(ctx.svgW, ctx.svgH, 2, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  AWNING_WINDOW_1F: (ctx) =>
    renderAwningWindow1F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  AWNING_WINDOW_1F_INV: (ctx) =>
    renderAwningWindow1F(ctx.svgW, ctx.svgH, true, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  FRONT_DRAWER: (ctx) =>
    renderDrawerFront(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  FIXED_PANEL: (ctx) =>
    renderFixedFacade(ctx.svgW, ctx.svgH, ctx.theme),
};
