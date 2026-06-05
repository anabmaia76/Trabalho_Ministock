import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const MOCK_PRODUCT = {
  id: 1,
  title: 'Tênis Esportivo Nike Air Max',
  description:
    'Tênis esportivo com amortecimento avançado, ideal para corridas e atividades físicas intensas. Solado de borracha de alta durabilidade e cabedal em mesh respirável.',
  price: 199.9,
  stock: 12,
  category: 'footwear',
  brand: 'Nike',
  rating: 4.5,
  thumbnail: '',
};

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>>();
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete() {
    Alert.alert(
      'Excluir produto',
      `Deseja remover "${MOCK_PRODUCT.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            setTimeout(() => setIsDeleting(false), 1500);
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Imagem do produto */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>📦</Text>
      </View>

      <View style={styles.content}>

        {/* Categoria e título */}
        <Text style={styles.category}>{MOCK_PRODUCT.category}</Text>
        <Text style={styles.title}>{MOCK_PRODUCT.title}</Text>
        <Text style={styles.brand}>Marca: {MOCK_PRODUCT.brand}</Text>

        {/* Descrição */}
        <Text style={styles.description}>{MOCK_PRODUCT.description}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Preço</Text>
            <Text style={styles.statValue}>R$ {MOCK_PRODUCT.price.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Estoque</Text>
            <Text style={styles.statValue}>{MOCK_PRODUCT.stock} un.</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avaliação</Text>
            <Text style={styles.statValue}>⭐ {MOCK_PRODUCT.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ProductForm')}>
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
  imagePlaceholder: {
    width: '100%',
    height: 260,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 80 },
  content: { padding: 20 },
  category: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  brand: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
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