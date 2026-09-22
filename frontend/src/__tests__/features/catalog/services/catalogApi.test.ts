import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogApi } from '@/features/catalog/services/catalogApi';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('catalogApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Glasses Endpoints', () => {
    it('getGlasses deve invocar /catalog/glasses?size=100', async () => {
      const mockData = { content: [{ id: 'g-1', name: 'Vidro' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await catalogApi.getGlasses();

      expect(api.get).toHaveBeenCalledWith('/catalog/glasses?size=100');
      expect(result).toEqual(mockData);
    });

    it('createGlass deve postar dados em /catalog/glasses', async () => {
      const payload = { name: 'Vidro Novo', thicknessMm: 6, colorFinish: 'Fumê', costPrice: 50, salePrice: 100, active: true };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'g-2', ...payload } });

      const result = await catalogApi.createGlass(payload as any);

      expect(api.post).toHaveBeenCalledWith('/catalog/glasses', payload);
      expect(result.id).toBe('g-2');
    });

    it('updateGlass deve fazer put em /catalog/glasses/:id', async () => {
      const payload = { id: 1, name: 'Vidro Atualizado', thicknessMm: 8, colorFinish: 'Verde', costPrice: 60, salePrice: 120, active: true };
      vi.mocked(api.put).mockResolvedValueOnce({ data: payload });

      const result = await catalogApi.updateGlass(1, payload as any);

      expect(api.put).toHaveBeenCalledWith('/catalog/glasses/1', payload);
      expect(result).toEqual(payload);
    });
  });

  describe('Profiles Endpoints', () => {
    it('getProfiles deve invocar /catalog/aluminum-profiles?size=100', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { content: [] } });

      await catalogApi.getProfiles();

      expect(api.get).toHaveBeenCalledWith('/catalog/aluminum-profiles?size=100');
    });

    it('createProfile deve postar em /catalog/aluminum-profiles', async () => {
      const payload = { name: 'Perfil Linha 25', costPrice: 30, salePrice: 60, active: true };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'p-1', ...payload } });

      await catalogApi.createProfile(payload as any);

      expect(api.post).toHaveBeenCalledWith('/catalog/aluminum-profiles', payload);
    });

    it('updateProfile deve fazer put em /catalog/aluminum-profiles/:id', async () => {
      const payload = { id: 2, name: 'Perfil Atualizado', costPrice: 35, salePrice: 70, active: true };
      vi.mocked(api.put).mockResolvedValueOnce({ data: payload });

      await catalogApi.updateProfile(2, payload as any);

      expect(api.put).toHaveBeenCalledWith('/catalog/aluminum-profiles/2', payload);
    });
  });

  describe('Hardwares Endpoints', () => {
    it('getHardwares deve invocar /catalog/hardware?size=100', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { content: [] } });
      await catalogApi.getHardwares();
      expect(api.get).toHaveBeenCalledWith('/catalog/hardware?size=100');
    });

    it('createHardware deve postar em /catalog/hardware', async () => {
      const payload = { name: 'Fecho Concha', costPrice: 15, salePrice: 35, active: true };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'h-1', ...payload } });
      await catalogApi.createHardware(payload as any);
      expect(api.post).toHaveBeenCalledWith('/catalog/hardware', payload);
    });

    it('updateHardware deve fazer put em /catalog/hardware/:id', async () => {
      const payload = { id: 3, name: 'Fecho Concha 2', costPrice: 18, salePrice: 40, active: true };
      vi.mocked(api.put).mockResolvedValueOnce({ data: payload });
      await catalogApi.updateHardware(3, payload as any);
      expect(api.put).toHaveBeenCalledWith('/catalog/hardware/3', payload);
    });
  });

  describe('Films Endpoints', () => {
    it('getFilms deve invocar /catalog/films?size=100', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { content: [] } });
      await catalogApi.getFilms();
      expect(api.get).toHaveBeenCalledWith('/catalog/films?size=100');
    });

    it('createFilm deve postar em /catalog/films', async () => {
      const payload = { name: 'Película G5', costPrice: 20, salePrice: 50, active: true };
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'f-1', ...payload } });
      await catalogApi.createFilm(payload as any);
      expect(api.post).toHaveBeenCalledWith('/catalog/films', payload);
    });

    it('updateFilm deve fazer put em /catalog/films/:id', async () => {
      const payload = { id: 4, name: 'Película G20', costPrice: 22, salePrice: 55, active: true };
      vi.mocked(api.put).mockResolvedValueOnce({ data: payload });
      await catalogApi.updateFilm(4, payload as any);
      expect(api.put).toHaveBeenCalledWith('/catalog/films/4', payload);
    });
  });

  describe('Materials Summary, Products & Families', () => {
    it('getMaterialsSummary deve chamar /catalog/materials?size=1000', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'm-1', name: 'Material' }] });
      const result = await catalogApi.getMaterialsSummary();
      expect(api.get).toHaveBeenCalledWith('/catalog/materials?size=1000');
      expect(result).toHaveLength(1);
    });

    it('getProducts deve chamar /catalog/products?size=100', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { content: [] } });
      await catalogApi.getProducts();
      expect(api.get).toHaveBeenCalledWith('/catalog/products?size=100');
    });

    it('inactivateProduct deve chamar delete em /catalog/products/:id', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } });
      await catalogApi.inactivateProduct('prod-1');
      expect(api.delete).toHaveBeenCalledWith('/catalog/products/prod-1');
    });

    it('getMaterialFamilies deve passar query param groupCode quando fornecido', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: ['SUPREMA', 'LINHA_25'] });
      const families = await catalogApi.getMaterialFamilies('PROFILE');
      expect(api.get).toHaveBeenCalledWith('/catalog/materials/families?groupCode=PROFILE');
      expect(families).toEqual(['SUPREMA', 'LINHA_25']);
    });
  });
});
