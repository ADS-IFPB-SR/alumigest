export interface FrameTheme {
  frameFill: string;
  frameStroke: string;
  railFill: string;
}

export interface GlassTheme {
  glassFill: string;
  fixedGlassFill: string;
  glassStroke: string;
}

export interface SvgTheme extends FrameTheme, GlassTheme {}

// ─── Dicionários de Tokens Visuais (Imutáveis) ──────────────────────────────
export const DEFAULT_FRAME_THEME: Readonly<FrameTheme> = {
  frameFill: '#374765',
  frameStroke: '#1b2b48',
  railFill: '#2d3b55',
};

export const DEFAULT_GLASS_THEME: Readonly<GlassTheme> = {
  glassFill: '#c5dcf5',
  fixedGlassFill: '#d8eaf8',
  glassStroke: '#93b8e0',
};

export const FRAME_THEMES: Record<string, FrameTheme> = {
  black:  { frameFill: '#212121', frameStroke: '#09090b', railFill: '#18181b' },
  white:  { frameFill: '#f8fafc', frameStroke: '#94a3b8', railFill: '#e2e8f0' },
  bronze: { frameFill: '#78350f', frameStroke: '#451a03', railFill: '#5c2406' },
  gold:   { frameFill: '#b45309', frameStroke: '#78350f', railFill: '#92400e' },
  chrome: { frameFill: '#94a3b8', frameStroke: '#475569', railFill: '#64748b' },
  matte:  { frameFill: '#475569', frameStroke: '#1e293b', railFill: '#334155' },
};

export const GLASS_THEMES: Record<string, GlassTheme> = {
  smoke:    { glassFill: '#64748b', glassStroke: '#334155', fixedGlassFill: '#475569' },
  green:    { glassFill: '#a7f3d0', glassStroke: '#059669', fixedGlassFill: '#6ee7b7' },
  reflecta: { glassFill: '#fed7aa', glassStroke: '#d97706', fixedGlassFill: '#fdba74' },
  reeded:   { glassFill: '#f1f5f9', glassStroke: '#cbd5e1', fixedGlassFill: '#e2e8f0' },
};

// ─── Matchers de Aliases (Lookup Table de Reconhecimento) ───────────────────
interface ThemeMatcher<T> {
  keys: string[];
  theme: T;
}

const FRAME_MATCHERS: ThemeMatcher<FrameTheme>[] = [
  { keys: ['preto', 'black', '#212121'], theme: FRAME_THEMES.black },
  { keys: ['branco', 'white', '#ffffff'], theme: FRAME_THEMES.white },
  { keys: ['bronze', 'champ', '#8c6239'], theme: FRAME_THEMES.bronze },
  { keys: ['dourad', 'gold', '#d4af37'], theme: FRAME_THEMES.gold },
  { keys: ['cromad', 'inox', 'polid', '#9e9e9e'], theme: FRAME_THEMES.chrome },
  { keys: ['fosco', 'anodiz', '#b0bec5'], theme: FRAME_THEMES.matte },
];

const GLASS_MATCHERS: ThemeMatcher<GlassTheme>[] = [
  { keys: ['fume', 'fumê', 'cinza', '#595959'], theme: GLASS_THEMES.smoke },
  { keys: ['verde', 'green', '#e0f2f1'], theme: GLASS_THEMES.green },
  { keys: ['reflecta', 'bronze', '#b87333'], theme: GLASS_THEMES.reflecta },
  { keys: ['canelad', 'textur', '#e0e0e0'], theme: GLASS_THEMES.reeded },
];

/**
 * Resolve qualquer entrada de acabamento contra a tabela de matchers sem bifurcações condicionais.
 */
function resolveTheme<T>(input: string | undefined, matchers: ThemeMatcher<T>[], fallback: T): T {
  if (!input) return fallback;
  const normalized = input.toLowerCase();
  const match = matchers.find((m) => m.keys.some((k) => normalized.includes(k)));
  return match ? match.theme : fallback;
}

/**
 * Computa o tema de cores dinâmico do preview SVG com base no acabamento do alumínio e do vidro.
 */
export function getSvgTheme(aluminumColor?: string, glassFinish?: string): SvgTheme {
  return {
    ...resolveTheme(aluminumColor, FRAME_MATCHERS, DEFAULT_FRAME_THEME),
    ...resolveTheme(glassFinish, GLASS_MATCHERS, DEFAULT_GLASS_THEME),
  };
}
