import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';

const MOCK_PRODUCTS = [
  { id: 1, title: 'Camiseta Azul', category: 'clothing', price: 49.9, stock: 30, thumbnail: '' },
  { id: 2, title: 'Tênis Esportivo', category: 'footwear', price: 199.9, stock: 12, thumbnail: '' },
  { id: 3, title: 'Mochila Casual', category: 'bags', price: 129.9, stock: 8, thumbnail: '' },
  { id: 4, title: 'Óculos de Sol', category: 'accessories', price: 89.9, stock: 25, thumbnail: '' },
  { id: 5, title: 'Relógio Clássico', category: 'accessories', price: 299.9, stock: 5, thumbnail: '' },
  { id: 6, title: 'Calça Jeans', category: 'clothing', price: 149.9, stock: 18, thumbnail: '' },
];

const MOCK_CATEGORIES = ['clothing', 'footwear', 'bags', 'accessories'];

export function ProductListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ProductList'>>();

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 MiniStock</Text>
        <TouchableOpacity>
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
        {MOCK_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de produtos */}
      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('ProductDetail')}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Botão flutuante — novo produto */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProductForm')}>
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