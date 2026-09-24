import { describe, it, expect } from 'vitest';
import {
  getSvgTheme,
  DEFAULT_FRAME_THEME,
  DEFAULT_GLASS_THEME,
  FRAME_THEMES,
  GLASS_THEMES,
} from '../../../features/budgets/utils/svgTheme';

describe('svgTheme.ts', () => {
  it('deve retornar o tema padrão quando nenhum acabamento for informado', () => {
    const theme = getSvgTheme();
    expect(theme.frameFill).toBe(DEFAULT_FRAME_THEME.frameFill);
    expect(theme.frameStroke).toBe(DEFAULT_FRAME_THEME.frameStroke);
    expect(theme.railFill).toBe(DEFAULT_FRAME_THEME.railFill);
    expect(theme.glassFill).toBe(DEFAULT_GLASS_THEME.glassFill);
    expect(theme.fixedGlassFill).toBe(DEFAULT_GLASS_THEME.fixedGlassFill);
    expect(theme.glassStroke).toBe(DEFAULT_GLASS_THEME.glassStroke);
  });

  describe('acabamentos de perfis de alumínio (FrameTheme)', () => {
    it('deve identificar acabamento preto por nome ou código hex', () => {
      expect(getSvgTheme('Preto').frameFill).toBe(FRAME_THEMES.black.frameFill);
      expect(getSvgTheme('black fosco').frameFill).toBe(FRAME_THEMES.black.frameFill);
      expect(getSvgTheme('#212121').frameFill).toBe(FRAME_THEMES.black.frameFill);
    });

    it('deve identificar acabamento branco', () => {
      expect(getSvgTheme('Branco Brilhante').frameFill).toBe(FRAME_THEMES.white.frameFill);
      expect(getSvgTheme('white').frameFill).toBe(FRAME_THEMES.white.frameFill);
      expect(getSvgTheme('#ffffff').frameFill).toBe(FRAME_THEMES.white.frameFill);
    });

    it('deve identificar acabamento bronze ou champagne', () => {
      expect(getSvgTheme('Bronze 1002').frameFill).toBe(FRAME_THEMES.bronze.frameFill);
      expect(getSvgTheme('champagne fosco').frameFill).toBe(FRAME_THEMES.bronze.frameFill);
      expect(getSvgTheme('#8c6239').frameFill).toBe(FRAME_THEMES.bronze.frameFill);
    });

    it('deve identificar acabamento dourado / gold', () => {
      expect(getSvgTheme('Dourado Anodizado').frameFill).toBe(FRAME_THEMES.gold.frameFill);
      expect(getSvgTheme('gold premium').frameFill).toBe(FRAME_THEMES.gold.frameFill);
      expect(getSvgTheme('#d4af37').frameFill).toBe(FRAME_THEMES.gold.frameFill);
    });

    it('deve identificar acabamentos metálicos cromados, inox ou polidos', () => {
      expect(getSvgTheme('Cromado').frameFill).toBe(FRAME_THEMES.chrome.frameFill);
      expect(getSvgTheme('Inox escovado').frameFill).toBe(FRAME_THEMES.chrome.frameFill);
      expect(getSvgTheme('Polido brilhante').frameFill).toBe(FRAME_THEMES.chrome.frameFill);
      expect(getSvgTheme('#9e9e9e').frameFill).toBe(FRAME_THEMES.chrome.frameFill);
    });

    it('deve identificar acabamento fosco ou anodizado', () => {
      expect(getSvgTheme('Cinza Fosco').frameFill).toBe(FRAME_THEMES.matte.frameFill);
      expect(getSvgTheme('Anodizado Natural').frameFill).toBe(FRAME_THEMES.matte.frameFill);
      expect(getSvgTheme('#b0bec5').frameFill).toBe(FRAME_THEMES.matte.frameFill);
    });

    it('deve usar fallback de frame para cores desconhecidas', () => {
      const theme = getSvgTheme('Cor Inexistente XYZ');
      expect(theme.frameFill).toBe(DEFAULT_FRAME_THEME.frameFill);
    });
  });

  describe('acabamentos de vidro (GlassTheme)', () => {
    it('deve identificar vidro fumê ou cinza', () => {
      expect(getSvgTheme(undefined, 'Fumê 8mm').glassFill).toBe(GLASS_THEMES.smoke.glassFill);
      expect(getSvgTheme(undefined, 'fume temperado').glassFill).toBe(GLASS_THEMES.smoke.glassFill);
      expect(getSvgTheme(undefined, 'Cinza Escuro').glassFill).toBe(GLASS_THEMES.smoke.glassFill);
      expect(getSvgTheme(undefined, '#595959').glassFill).toBe(GLASS_THEMES.smoke.glassFill);
    });

    it('deve identificar vidro verde', () => {
      expect(getSvgTheme(undefined, 'Verde 6mm').glassFill).toBe(GLASS_THEMES.green.glassFill);
      expect(getSvgTheme(undefined, 'green laminado').glassFill).toBe(GLASS_THEMES.green.glassFill);
      expect(getSvgTheme(undefined, '#e0f2f1').glassFill).toBe(GLASS_THEMES.green.glassFill);
    });

    it('deve identificar vidro reflecta / bronze', () => {
      expect(getSvgTheme(undefined, 'Reflecta Bronze').glassFill).toBe(GLASS_THEMES.reflecta.glassFill);
      expect(getSvgTheme(undefined, 'Vidro Bronze').glassFill).toBe(GLASS_THEMES.reflecta.glassFill);
      expect(getSvgTheme(undefined, '#b87333').glassFill).toBe(GLASS_THEMES.reflecta.glassFill);
    });

    it('deve identificar vidro canelado ou texturizado', () => {
      expect(getSvgTheme(undefined, 'Canelado Clássico').glassFill).toBe(GLASS_THEMES.reeded.glassFill);
      expect(getSvgTheme(undefined, 'Textura Mini-Boreal').glassFill).toBe(GLASS_THEMES.reeded.glassFill);
      expect(getSvgTheme(undefined, '#e0e0e0').glassFill).toBe(GLASS_THEMES.reeded.glassFill);
    });

    it('deve usar fallback de vidro para acabamentos não reconhecidos', () => {
      const theme = getSvgTheme(undefined, 'Incolor Comum');
      expect(theme.glassFill).toBe(DEFAULT_GLASS_THEME.glassFill);
    });
  });

  it('deve combinar simultaneamente acabamento de perfil e acabamento de vidro', () => {
    const theme = getSvgTheme('Preto Fosco', 'Fumê 8mm');
    expect(theme.frameFill).toBe(FRAME_THEMES.black.frameFill);
    expect(theme.glassFill).toBe(GLASS_THEMES.smoke.glassFill);
  });
});
