import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const LOCAL_ID_THRESHOLD = 100000;
const STORAGE_KEY = '@ministock_local_products';

interface ProductsContextData {
  products: Product[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  localProducts: Product[];
  fetchProducts: (reset: boolean, searchQuery?: string, category?: string) => Promise<void>;
  addProduct: (data: ProductFormData) => Promise<void>;
  editProduct: (id: number, data: Partial<ProductFormData>) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextData>({} as ProductsContextData);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const skipRef = useRef(0);
  const isFetchingRef = useRef(false);

  // Carrega produtos locais do AsyncStorage ao iniciar
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setLocalProducts(JSON.parse(data));
      })
      .catch(() => {});
  }, []);

  // Salva produtos locais no AsyncStorage sempre que mudam
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localProducts)).catch(() => {});
  }, [localProducts]);

  // Produtos exibidos: locais filtrados + produtos da API
  const products = React.useMemo(() => {
    const hasFilter = currentSearch.trim() || currentCategory;

    if (hasFilter) {
      // Com filtro: filtra locais pelo termo de busca também
      const filteredLocals = currentSearch.trim()
        ? localProducts.filter((p) =>
            p.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
            p.category.toLowerCase().includes(currentSearch.toLowerCase())
          )
        : currentCategory
        ? localProducts.filter((p) => p.category === currentCategory)
        : [];

      const apiIds = new Set(apiProducts.map((p) => p.id));
      const uniqueLocals = filteredLocals.filter((p) => !apiIds.has(p.id));
      return [...uniqueLocals, ...apiProducts];
    }

    // Sem filtro: todos os locais + API
    const apiIds = new Set(apiProducts.map((p) => p.id));
    const uniqueLocals = localProducts.filter((p) => !apiIds.has(p.id));
    return [...uniqueLocals, ...apiProducts];
  }, [apiProducts, localProducts, currentSearch, currentCategory]);

  async function fetchProducts(
    reset: boolean,
    searchQuery?: string,
    category?: string
  ) {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setCurrentSearch(searchQuery ?? '');
    setCurrentCategory(category ?? '');

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
        setApiProducts(result.products);
      } else {
        setApiProducts((prev) => {
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
    const localId = Date.now() + LOCAL_ID_THRESHOLD;
    const productWithId = { ...newProduct, id: localId };
    setLocalProducts((prev) => [productWithId, ...prev]);
    setTotal((prev) => prev + 1);
  }

  async function editProduct(id: number, data: Partial<ProductFormData>) {
    const isLocal = id >= LOCAL_ID_THRESHOLD;
    if (!isLocal) {
      await updateProduct(id, data);
    }
    if (isLocal) {
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );
    } else {
      setApiProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );
    }
  }

  async function removeProduct(id: number) {
    const isLocal = id >= LOCAL_ID_THRESHOLD;
    if (!isLocal) {
      await deleteProduct(id);
      setApiProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      setLocalProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setTotal((prev) => prev - 1);
  }

  return (
    <ProductsContext.Provider value={{
      products, total, isLoading, isLoadingMore, error, hasMore, localProducts,
      fetchProducts, addProduct, editProduct, removeProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}