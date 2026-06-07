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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { listCategories, Product } from '../services/products';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductsContext';
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
  'tops': 'Moda',
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
  'mobile-accessories': 'Acessórios',
  'sports-accessories': 'Esportes',
  'vehicle': 'Veículos',
  'kitchen-accessories': 'Cozinha',
  'beauty': 'Beleza',
};

function ProductGridCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {product.thumbnail ? (
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="cube-outline" size={32} color="#7C3AED" />
        </View>
      )}
      <Text style={styles.cardTitle} numberOfLines={2}>{product.title}</Text>
      <Text style={styles.cardCategory}>{TRADUCOES[product.category] ?? product.category}</Text>
      <Text style={styles.cardPrice}>R$ {product.price.toFixed(2)}</Text>
      <Text style={styles.cardStock}>Est. {product.stock}</Text>
    </TouchableOpacity>
  );
}

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MiniStock</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
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
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {isLoading && products.length === 0 ? (
        <Loading message="Buscando produtos..." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, justifyContent: 'flex-start' }}
          renderItem={({ item }) => (
            <ProductGridCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          )}
          ListEmptyComponent={
            !isLoading ? <EmptyState message="Nenhum produto encontrado." /> : null
          }
          ListFooterComponent={isLoadingMore ? <Loading message="Carregando mais..." /> : null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#7C3AED"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', {})}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#0F0F13',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  logoutBtn: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoriesWrapper: {
    height: 44,
    marginBottom: 12,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: '#2D2D3D',
    height: 32,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { fontSize: 12, color: '#9CA3AF' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  errorBanner: {
    backgroundColor: '#2D1515',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: { color: '#EF4444', fontSize: 13 },
  card: {
    width: '48%',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  cardImage: {
    width: '100%',
    height: 85,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#13131A',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 85,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#13131A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  cardCategory: { fontSize: 11, color: '#6B7280', marginBottom: 4, textTransform: 'capitalize' },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#7C3AED', marginBottom: 2 },
  cardStock: { fontSize: 11, color: '#6B7280' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});