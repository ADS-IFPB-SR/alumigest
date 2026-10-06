import axios from 'axios';

// Instância base do Axios apontando para a API do Backend Java
export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injeção do JWT no futuro
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
}, async (error) => {
  throw error; 
});

// Interceptor para extrair o campo "data" do ApiResponse do backend quando aplicável
api.interceptors.response.use(
  (response) => {
    // Preserva Blobs, ArrayBuffers e respostas binárias sem tentar desenvelopar
    if (response.data instanceof Blob || response.config.responseType === 'blob') {
      return response;
    }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      response.data.data !== undefined
    ) {
      // O backend sempre envelopa a resposta em um ApiResponse { status, message, data }
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (
      error.response?.data instanceof Blob &&
      error.response.data.type.includes('application/json')
    ) {
      try {
        const text = await error.response.data.text();
        error.response.data = JSON.parse(text);
      } catch {
        // Fallback: mantém o Blob intacto se não for possível parsear
      }
    }
    throw error;
  }
);