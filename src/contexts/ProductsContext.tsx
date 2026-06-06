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
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const skipRef = useRef(0);
  const isFetchingRef = useRef(false);

  async function fetchProducts(
    reset: boolean,
    searchQuery?: string,
    category?: string
  ) {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (reset) {
      skipRef.current = 0;
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);

    try {
      const skip = skipRef.current;
      let result;

      if (searchQuery?.trim()) {
        result = await searchProducts(searchQuery.trim(), PAGE_SIZE, skip);
      } else if (category) {
        result = await getProductsByCategory(category, PAGE_SIZE, skip);
      } else {
        result = await listProducts(PAGE_SIZE, skip);
      }

      const newSkip = skip + result.products.length;
      skipRef.current = newSkip;
      setTotal(result.total);
      setHasMore(newSkip < result.total);

      if (reset) {
        setProducts(result.products);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newOnes = result.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newOnes];
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
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
      products, total, isLoading, isLoadingMore, error, hasMore,
      fetchProducts, addProduct, editProduct, removeProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}