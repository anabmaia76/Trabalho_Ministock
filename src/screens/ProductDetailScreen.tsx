import React, { useCallback, useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { getProduct, Product } from '../services/products';
import { useProducts } from '../contexts/ProductsContext';

type Route = RouteProp<RootStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const LOCAL_ID_THRESHOLD = 100000;

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

export function ProductDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { productId } = route.params;
  const { products, removeProduct } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UseRef para evitar que o hook tente buscar o produto na API após ser deletado
  const isNavigatingOut = useRef(false);

  useFocusEffect(
    useCallback(() => {
      // Se estamos saindo da tela por exclusão, não faz nada
      if (isNavigatingOut.current) return;

      let active = true;
      setIsLoading(true);
      setError(null);

      const productFromContext = products.find((p) => p.id === productId);

      if (productFromContext) {
        setProduct(productFromContext);
        setIsLoading(false);
      } else {
        getProduct(productId)
          .then((p) => {
            if (active) setProduct(p);
          })
          .catch((err) => {
            if (active) setError(err.message);
          })
          .finally(() => {
            if (active) setIsLoading(false);
          });
      }

      return () => {
        active = false;
      };
    }, [productId, products])
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
              // Bloqueia disparos indesejados do useFocusEffect antes de rodar a remoção
              isNavigatingOut.current = true;
              
              await removeProduct(productId);
              
              Alert.alert('Sucesso', 'Produto removido!', [
                { 
                  text: 'OK', 
                  onPress: () => navigation.goBack() 
                },
              ]);
            } catch (err: any) {
              // Se falhar, reverte a flag para permitir recarga caso necessário
              isNavigatingOut.current = false;
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
        <ActivityIndicator size="large" color="#7C3AED" />
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
      {/* Imagem */}
      {product.thumbnail ? (
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="cube-outline" size={80} color="#7C3AED" />
        </View>
      )}

      <View style={styles.content}>
        {/* Badge categoria */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {(TRADUCOES[product.category] ?? product.category).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>{product.title}</Text>
        {product.brand && <Text style={styles.brand}>Marca: {product.brand}</Text>}
        <Text style={styles.description}>{product.description}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PREÇO</Text>
            <Text style={styles.statValue}>R$ {product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ESTOQUE</Text>
            <Text style={styles.statValueWhite}>{product.stock} un.</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVALIAÇÃO</Text>
            <Text style={styles.statValueWhite}>⭐ {product.rating?.toFixed(1) ?? '—'}</Text>
          </View>
        </View>

        {/* Botões */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProductForm', { product })}
          >
            <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, isDeleting && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.deleteBtnText}>Excluir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F0F13' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorText: { fontSize: 15, color: '#EF4444', marginBottom: 16 },
  backBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '600' },
  image: { width: '100%', height: 260, backgroundColor: '#1A1A24' },
  imagePlaceholder: {
    width: '100%',
    height: 260,
    backgroundColor: '#1A1A24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D2D3D',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  brand: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  description: { fontSize: 14, color: '#9CA3AF', lineHeight: 22, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  statLabel: { fontSize: 10, color: '#6B7280', marginBottom: 4, letterSpacing: 1 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  statValueWhite: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  actions: { flexDirection: 'row', gap: 12 },
  editBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  editBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
});