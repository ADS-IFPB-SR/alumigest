import { api } from '../../../lib/api';
import type { 
  GlassDTO, 
  ProfileDTO, 
  HardwareDTO, 
  FilmDTO, 
  PageResponse 
} from '../types';

export const catalogApi = {
  // Glasses
  getGlasses: async () => {
    const response = await api.get<PageResponse<GlassDTO>>('/glasses?size=100');
    return response.data;
  },
  createGlass: async (data: Omit<GlassDTO, 'id'>) => {
    const response = await api.post<GlassDTO>('/glasses', data);
    return response.data;
  },
  updateGlass: async (id: number, data: GlassDTO) => {
    const response = await api.put<GlassDTO>(`/glasses/${id}`, data);
    return response.data;
  },

  // Profiles
  getProfiles: async () => {
    const response = await api.get<PageResponse<ProfileDTO>>('/profiles?size=100');
    return response.data;
  },
  createProfile: async (data: Omit<ProfileDTO, 'id'>) => {
    const response = await api.post<ProfileDTO>('/profiles', data);
    return response.data;
  },
  updateProfile: async (id: number, data: ProfileDTO) => {
    const response = await api.put<ProfileDTO>(`/profiles/${id}`, data);
    return response.data;
  },

  // Hardware
  getHardwares: async () => {
    const response = await api.get<PageResponse<HardwareDTO>>('/hardwares?size=100');
    return response.data;
  },
  createHardware: async (data: Omit<HardwareDTO, 'id'>) => {
    const response = await api.post<HardwareDTO>('/hardwares', data);
    return response.data;
  },
  updateHardware: async (id: number, data: HardwareDTO) => {
    const response = await api.put<HardwareDTO>(`/hardwares/${id}`, data);
    return response.data;
  },

  // Films
  getFilms: async () => {
    const response = await api.get<PageResponse<FilmDTO>>('/films?size=100');
    return response.data;
  },
  createFilm: async (data: Omit<FilmDTO, 'id'>) => {
    const response = await api.post<FilmDTO>('/films', data);
    return response.data;
  },
  updateFilm: async (id: number, data: FilmDTO) => {
    const response = await api.put<FilmDTO>(`/films/${id}`, data);
    return response.data;
  },
};
