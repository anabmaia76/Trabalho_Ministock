import { api } from './api';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  thumbnail: string;
  images: string[];
  rating: number;
  brand?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export async function listProducts(limit: number, skip: number): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>('/products', {
    params: { limit, skip },
  });
  return data;
}

export async function searchProducts(
  q: string,
  limit: number,
  skip: number
): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>('/products/search', {
    params: { q, limit, skip },
  });
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function listCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>('/products/category-list');
  return data;
}

export async function getProductsByCategory(
  slug: string,
  limit: number,
  skip: number
): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>(`/products/category/${slug}`, {
    params: { limit, skip },
  });
  return data;
}

export async function createProduct(product: ProductFormData): Promise<Product> {
  const { data } = await api.post<Product>('/products/add', product);
  return data;
}

export async function updateProduct(
  id: number,
  product: Partial<ProductFormData>
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id: number): Promise<{ isDeleted: boolean }> {
  const { data } = await api.delete<{ isDeleted: boolean }>(`/products/${id}`);
  return data;
}