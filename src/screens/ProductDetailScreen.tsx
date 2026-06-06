import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getProduct, Product } from '../services/products';
import { useProducts } from '../contexts/ProductsContext';

type Route = RouteProp<RootStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { productId } = route.params;
  const { removeProduct } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      setError(null);

      getProduct(productId)
        .then((p) => { if (active) setProduct(p); })
        .catch((err) => { if (active) setError(err.message); })
        .finally(() => { if (active) setIsLoading(false); });

      return () => { active = false; };
    }, [productId])
  );

  function handleDelete() {
    Alert.alert(
      'Excluir produto',
      `Deseja remover "${product?.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await removeProduct(productId);
              Alert.alert('Sucesso', 'Produto removido!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Erro', err.message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {product.thumbnail ? (
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>📦</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.title}</Text>
        {product.brand && <Text style={styles.brand}>Marca: {product.brand}</Text>}
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Preço</Text>
            <Text style={styles.statValue}>R$ {product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Estoque</Text>
            <Text style={styles.statValue}>{product.stock} un.</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avaliação</Text>
            <Text style={styles.statValue}>⭐ {product.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProductForm', { product })}
          >
            <Text style={styles.editBtnText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, isDeleting && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.deleteBtnText}>🗑️ Excluir</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorText: { fontSize: 15, color: '#DC2626', marginBottom: 16 },
  backBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '600' },
  image: { width: '100%', height: 260, backgroundColor: '#E5E7EB' },
  imagePlaceholder: {
    width: '100%',
    height: 260,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 80 },
  content: { padding: 20 },
  category: { fontSize: 12, color: '#6B7280', textTransform: 'capitalize', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  brand: { fontSize: 13, color: '#9CA3AF', marginBottom: 8 },
  description: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
  },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  actions: { flexDirection: 'row', gap: 12 },
  editBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
});