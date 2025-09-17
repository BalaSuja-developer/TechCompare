import { API_CONFIG } from '../config/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  specs: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
    os: string;
  };
  features: string[];
  rating: number;
  reviews: number;
}

export interface PredictionRequest {
  brand: string;
  display: string;
  processor?: string;
  ram: string;
  storage: string;
  camera?: string;
  battery?: string;
}

export interface PredictionResponse {
  predicted_price: number;
  confidence_score: number;
  model_version: string;
  prediction_id?: string;
  created_at?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      ...API_CONFIG.HEADERS,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async login(username: string, password: string): Promise<ApiResponse<{
    user: { id: string; username: string; role: string };
    token: string;
  }>> {
    return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request(API_CONFIG.ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
    this.clearToken();
    return result;
  }

  async verifyToken(): Promise<ApiResponse<{ user: any }>> {
    return this.request(API_CONFIG.ENDPOINTS.VERIFY_TOKEN);
  }

  // Product methods
  async getProducts(page = 1, limit = 10): Promise<ApiResponse<{
    data: Product[];
    pagination: PaginationInfo;
  }>> {
    // return this.request(`${API_CONFIG.ENDPOINTS.PRODUCTS}?page=${page}&limit=${limit}`);
      return this.request(`${API_CONFIG.ENDPOINTS.PRODUCTS}`);

  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.request(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID.replace(':id', id));
  }

  async searchProducts(query: string, page = 1, limit = 10): Promise<ApiResponse<{
    data: Product[];
    query: string;
  }>> {
    return this.request(
      `${API_CONFIG.ENDPOINTS.PRODUCT_SEARCH}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  }

  async filterProducts(filters: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    ram?: string;
    storage?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    data: Product[];
    filters: any;
  }>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`${API_CONFIG.ENDPOINTS.PRODUCT_FILTER}?${params.toString()}`);
  }

  async compareProducts(productIds: string[]): Promise<ApiResponse<Product[]>> {
    return this.request(API_CONFIG.ENDPOINTS.COMPARE_PRODUCTS, {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
  }

  async getBrands(): Promise<ApiResponse<string[]>> {
    return this.request(`${API_CONFIG.ENDPOINTS.PRODUCTS}/brands`);
  }

  // ML Prediction methods
  async predictPrice(data: PredictionRequest): Promise<ApiResponse<PredictionResponse>> {
    return this.request(API_CONFIG.ENDPOINTS.PREDICT_PRICE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPredictionHistory(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    return this.request(`${API_CONFIG.ENDPOINTS.PREDICT_PRICE}/history?page=${page}&limit=${limit}`);
  }

  // Admin methods
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request(API_CONFIG.ENDPOINTS.ADMIN_STATS);
  }

  async createProduct(productData: any): Promise<ApiResponse<{ id: string }>> {
    return this.request(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse<Product>> {
    return this.request(`${API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS}/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadData(data: any[], type: string): Promise<ApiResponse<{
    total: number;
    successful: number;
    failed: number;
  }>> {
    return this.request(API_CONFIG.ENDPOINTS.ADMIN_UPLOAD, {
      method: 'POST',
      body: JSON.stringify({ data, type }),
    });
  }

  async retrainModel(): Promise<ApiResponse<any>> {
    return this.request(API_CONFIG.ENDPOINTS.ADMIN_RETRAIN, {
      method: 'POST',
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;