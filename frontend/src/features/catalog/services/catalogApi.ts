import { api } from '../../../lib/api';
import type {
  GlassDTO,
  ProfileDTO,
  HardwareDTO,
  FilmDTO,
  PageResponse,
  ProductCategory,
  MaterialSummary,
  Product,
  ProductRequest,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const catalogApi = {
  // ── Glasses ──────────────────────────────────────────────────────────────
  getGlasses: async (): Promise<PageResponse<GlassDTO>> => {
    const response = await api.get<PageResponse<GlassDTO>>('/catalog/glasses?size=100');
    return response.data;
  },
  createGlass: async (data: Omit<GlassDTO, 'id'>) => {
    const response = await api.post<GlassDTO>('/catalog/glasses', data);
    return response.data;
  },
  updateGlass: async (id: number, data: GlassDTO) => {
    const response = await api.put<GlassDTO>(`/catalog/glasses/${id}`, data);
    return response.data;
  },

  // ── Profiles ──────────────────────────────────────────────────────────────
  getProfiles: async (): Promise<PageResponse<ProfileDTO>> => {
    const response = await api.get<PageResponse<ProfileDTO>>('/catalog/aluminum-profiles?size=100');
    return response.data;
  },
  createProfile: async (data: Omit<ProfileDTO, 'id'>) => {
    const response = await api.post<ProfileDTO>('/catalog/aluminum-profiles', data);
    return response.data;
  },
  updateProfile: async (id: number, data: ProfileDTO) => {
    const response = await api.put<ProfileDTO>(`/catalog/aluminum-profiles/${id}`, data);
    return response.data;
  },

  // ── Hardware ──────────────────────────────────────────────────────────────
  getHardwares: async (): Promise<PageResponse<HardwareDTO>> => {
    const response = await api.get<PageResponse<HardwareDTO>>('/catalog/hardware?size=100');
    return response.data;
  },
  createHardware: async (data: Omit<HardwareDTO, 'id'>) => {
    const response = await api.post<HardwareDTO>('/catalog/hardware', data);
    return response.data;
  },
  updateHardware: async (id: number, data: HardwareDTO) => {
    const response = await api.put<HardwareDTO>(`/catalog/hardware/${id}`, data);
    return response.data;
  },

  // ── Films ──────────────────────────────────────────────────────────────────
  getFilms: async (): Promise<PageResponse<FilmDTO>> => {
    const response = await api.get<PageResponse<FilmDTO>>('/catalog/films?size=100');
    return response.data;
  },
  createFilm: async (data: Omit<FilmDTO, 'id'>) => {
    const response = await api.post<FilmDTO>('/catalog/films', data);
    return response.data;
  },
  updateFilm: async (id: number, data: FilmDTO) => {
    const response = await api.put<FilmDTO>(`/catalog/films/${id}`, data);
    return response.data;
  },

  // ── Product Categories ────────────────────────────────────────────────────
  getProductCategories: async (): Promise<ProductCategory[]> => {
    const response = await api.get<ProductCategory[]>('/catalog/product-categories');
    return response.data;
  },
  createProductCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post<ProductCategory>('/catalog/product-categories', data);
    return response.data;
  },

  // ── Material Summary (lista unificada para o builder) ─────────────────────
  // Consome o endpoint /catalog/materials que o MaterialController já fornece.
  getMaterialsSummary: async (): Promise<MaterialSummary[]> => {
    const response = await api.get<MaterialSummary[]>('/catalog/materials?size=1000');
    return response.data;
  },

  // ── Products (Esquadrias / Templates) ────────────────────────────────────
  getProducts: async (): Promise<PageResponse<Product>> => {
    const response = await api.get<PageResponse<Product>>('/catalog/products?size=100');
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await api.get<Product>(`/catalog/products/${id}`);
    return response.data;
  },
  createProduct: async (data: ProductRequest) => {
    const response = await api.post<Product>('/catalog/products', data);
    return response.data;
  },
  updateProduct: async (id: string, data: ProductRequest) => {
    const response = await api.put<Product>(`/catalog/products/${id}`, data);
    return response.data;
  },
  inactivateProduct: async (id: string) => {
    const response = await api.delete(`/catalog/products/${id}`);
    return response.data;
  },
};

