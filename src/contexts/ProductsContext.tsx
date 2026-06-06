import React, { createContext, useContext, useState, useRef } from 'react';
import {
  Product,
  ProductFormData,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
} from '../services/products';

const PAGE_SIZE = 10;

interface ProductsContextData {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (reset: boolean, searchQuery?: string, category?: string) => Promise<void>;
  addProduct: (data: ProductFormData) => Promise<void>;
  editProduct: (id: number, data: Partial<ProductFormData>) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextData>({} as ProductsContextData);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipRef = useRef(0);

  async function fetchProducts(
    reset: boolean,
    searchQuery?: string,
    category?: string
  ) {
    if (reset) skipRef.current = 0;
    const skip = skipRef.current;

    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (searchQuery?.trim()) {
        result = await searchProducts(searchQuery.trim(), PAGE_SIZE, skip);
      } else if (category) {
        result = await getProductsByCategory(category, PAGE_SIZE, skip);
      } else {
        result = await listProducts(PAGE_SIZE, skip);
      }

      skipRef.current = skip + result.products.length;
      setTotal(result.total);

      if (reset) {
        setProducts(result.products);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = result.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function addProduct(data: ProductFormData) {
    const newProduct = await createProduct(data);
    setProducts((prev) => [{ ...newProduct, id: Date.now() }, ...prev]);
    setTotal((prev) => prev + 1);
  }

  async function editProduct(id: number, data: Partial<ProductFormData>) {
    await updateProduct(id, data);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }

  async function removeProduct(id: number) {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => prev - 1);
  }

  return (
    <ProductsContext.Provider value={{
      products, total, isLoading, error,
      fetchProducts, addProduct, editProduct, removeProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}