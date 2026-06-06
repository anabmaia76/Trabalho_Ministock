import React, { useEffect, useRef, useState } from 'react';
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
import { listCategories } from '../services/products';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';

interface Category {
  slug: string;
  name: string;
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

const TRADUCOES: Record<string, string> = {
  'smartphones': 'Smartphones',
  'laptops': 'Laptops',
  'fragrances': 'Perfumes',
  'skincare': 'Skincare',
  'groceries': 'Mercearia',
  'home-decoration': 'Decoração',
  'furniture': 'Móveis',
  'tops': 'Blusas',
  'womens-dresses': 'Vestidos',
  'womens-shoes': 'Calçados Fem.',
  'mens-shirts': 'Camisas Masc.',
  'mens-shoes': 'Calçados Masc.',
  'mens-watches': 'Relógios Masc.',
  'womens-watches': 'Relógios Fem.',
  'womens-bags': 'Bolsas',
  'womens-jewellery': 'Joias',
  'sunglasses': 'Óculos',
  'automotive': 'Automotivo',
  'motorcycle': 'Motos',
  'lighting': 'Iluminação',
  'tablets': 'Tablets',
  'mobile-accessories': 'Acessórios Mobile',
  'sports-accessories': 'Esportes',
  'vehicle': 'Veículos',
  'kitchen-accessories': 'Cozinha',
  'beauty': 'Beleza',
};

export function ProductListScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const { products, isLoading, isLoadingMore, hasMore, error, fetchProducts } = useProducts();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    listCategories()
      .then((data) => {
        const formatted = (data as any[]).map((cat: any) => ({
          slug: typeof cat === 'string' ? cat : cat.slug,
          name: typeof cat === 'string'
            ? (TRADUCOES[cat] ?? cat)
            : (TRADUCOES[cat.slug] ?? cat.name ?? cat.slug),
        }));
        setCategories(formatted);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchProducts(true, '', '');
      return;
    }
    fetchProducts(true, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await fetchProducts(true, searchQuery, selectedCategory);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLoadMore() {
    if (!hasMore || isLoadingMore) return;
    await fetchProducts(false, searchQuery, selectedCategory);
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📦 MiniStock</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutBtn}>Sair</Text>
          </TouchableOpacity>
        </View>
        <Loading message="Buscando produtos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 MiniStock</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar produtos..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
            key={cat.slug}
            style={[styles.chip, selectedCategory === cat.slug && styles.chipActive]}
            onPress={() => setSelectedCategory(cat.slug)}
          >
            <Text style={[styles.chipText, selectedCategory === cat.slug && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState message="Nenhum produto encontrado." />}
        ListFooterComponent={isLoadingMore ? <Loading message="Carregando mais..." /> : null}
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