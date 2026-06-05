import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  listProducts,
  searchProducts,
  listCategories,
  getProductsByCategory,
  Product,
} from '../services/products';
import { useAuth } from '../contexts/AuthContext';

const PAGE_SIZE = 10;

type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

export function ProductListScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const skipRef = useRef(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (reset: boolean) => {
    const skip = reset ? 0 : skipRef.current;
    try {
      setError(null);
      let result;

      if (searchQuery.trim()) {
        result = await searchProducts(searchQuery.trim(), PAGE_SIZE, skip);
      } else if (selectedCategory) {
        result = await getProductsByCategory(selectedCategory, PAGE_SIZE, skip);
      } else {
        result = await listProducts(PAGE_SIZE, skip);
      }

      if (reset) {
        setProducts(result.products);
        skipRef.current = result.products.length;
      } else {
        setProducts((prev) => [...prev, ...result.products]);
        skipRef.current += result.products.length;
      }

      setHasMore(skipRef.current < result.total);
    } catch (err: any) {
      setError(err.message);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts(true).finally(() => setIsLoading(false));
  }, [fetchProducts]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {}, 400);
  }, [searchQuery]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchProducts(true);
    setIsRefreshing(false);
  }

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchProducts(false);
    setIsLoadingMore(false);
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 MiniStock</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar produtos..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filtro de categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={String(cat)}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(String(cat))}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {String((cat as any).name ?? cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Erro */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Loading inicial */}
      {isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>📦 Nenhum produto encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
              <View style={styles.cardImage}>
                <Text style={styles.cardImagePlaceholder}>📦</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>R$ {item.price.toFixed(2)}</Text>
                  <Text style={styles.cardStock}>Estoque: {item.stock}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando mais...</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#4F46E5"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Botão flutuante — novo produto */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', {})}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  logoutBtn: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  searchInput: {
    margin: 16,
    marginBottom: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesRow: { maxHeight: 44, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 32,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { fontSize: 12, color: '#374151', textTransform: 'capitalize' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: { color: '#DC2626', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  emptyText: { fontSize: 16, color: '#6B7280' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholder: { fontSize: 32 },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardCategory: { fontSize: 12, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  cardStock: { fontSize: 12, color: '#9CA3AF' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
});