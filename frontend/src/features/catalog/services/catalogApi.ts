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
  ProductRequest
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const catalogApi = {
  // Glasses (Ainda não implementado no backend)
  getGlasses: async () => {
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

  // Profiles
  getProfiles: async () => {
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

  // Hardware
  getHardwares: async () => {
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

  // Films
  getFilms: async () => {
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

  // Product Categories
  getProductCategories: async () => {
    const response = await api.get<ProductCategory[]>('/catalog/product-categories');
    return response.data;
  },

  // Material Summary (Unified List)
  getMaterialsSummary: async () => {
    const response = await api.get<MaterialSummary[]>('/catalog/materials?size=1000');
    return response.data;
  },

  // Products
  getProducts: async () => {
    const response = await api.get<PageResponse<Product>>('/catalog/products?size=100');
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

