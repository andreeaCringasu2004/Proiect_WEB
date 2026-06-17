import apiClient from '../api/apiClient';
import { Product } from '../context/DataContext';

const mapBackendProduct = (p: any): Product => ({
  ...p,
  sellerId: p.seller?.id || p.sellerId,
  expertId: p.expert?.id || p.expertId,
  categoryId: p.category?.id || p.categoryId,
  category: typeof p.category === 'object' && p.category !== null ? (p.category.name || 'Unknown') : (p.category || 'Unknown')
});

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<any[]>('/products');
    return response.data.map(mapBackendProduct);
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<any>(`/products/${id}`);
    return mapBackendProduct(response.data);
  },

  approveProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.put<any>(`/products/${id}/approve`);
    return mapBackendProduct(response.data);
  },

  rejectProduct: async (id: number, reason: string): Promise<Product> => {
    const response = await apiClient.put<any>(`/products/${id}/reject`, { reason });
    return mapBackendProduct(response.data);
  },

  createProduct: async (product: any): Promise<Product> => {
    const payload = {
      title: product.title,
      description: product.description,
      medium: product.medium,
      year: product.year ? parseInt(product.year) : null,
      dimensions: product.dimensions,
      artist: product.artist || null,
      provenance: product.provenance || null,
      images: product.images || [product.img],
      documents: product.documents || [],
      seller: { id: product.sellerId }
    };
    const response = await apiClient.post<any>('/products', payload);
    return mapBackendProduct(response.data);
  },

  updateProduct: async (id: number, product: any): Promise<Product> => {
    const payload = {
      title: product.title,
      description: product.description,
      medium: product.medium,
      year: product.year ? parseInt(product.year) : null,
      dimensions: product.dimensions,
      artist: product.artist || null,
      provenance: product.provenance || null,
      images: product.images || [product.img],
      documents: product.documents || [],
    };
    const response = await apiClient.put<any>(`/products/${id}`, payload);
    return mapBackendProduct(response.data);
  }
};
