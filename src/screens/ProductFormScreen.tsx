import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { listCategories, ProductFormData } from '../services/products';
import { useProducts } from '../contexts/ProductsContext';

type Route = RouteProp<RootStackParamList, 'ProductForm'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductForm'>;

interface Category {
  slug: string;
  name: string;
}

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

export function ProductFormScreen() {
  const { addProduct, editProduct } = useProducts();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editingProduct = route.params?.product;
  const isEditing = !!editingProduct;

  const [title, setTitle] = useState(editingProduct?.title ?? '');
  const [description, setDescription] = useState(editingProduct?.description ?? '');
  
  // CORREÇÃO AQUI: Garante que o preço inicial venha formatado no padrão pt-BR (ex: "14,99")
  const [price, setPrice] = useState(
    editingProduct
      ? Number(editingProduct.price).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : ''
  );
  
  const [stock, setStock] = useState(editingProduct ? String(editingProduct.stock) : '');
  const [category, setCategory] = useState(editingProduct?.category ?? '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    navigation.setOptions({
      title: isEditing ? 'Editar Produto' : 'Novo Produto',
      headerBackTitle: 'Voltar',
    });
  }, []);

  function handleSubmit() {
    if (!title.trim()) { Alert.alert('Atenção', 'Informe o título.'); return; }
    if (!description.trim()) { Alert.alert('Atenção', 'Informe a descrição.'); return; }
    
    // Tratamento do preço antes da validação para aceitar o formato "360,00"
    const normalizedPrice = price.replace(/\./g, '').replace(',', '.');
    if (!price.trim() || isNaN(Number(normalizedPrice))) { 
      Alert.alert('Atenção', 'Informe um preço válido.'); 
      return; 
    }
    
    if (!stock.trim() || isNaN(Number(stock))) { Alert.alert('Atenção', 'Informe um estoque válido.'); return; }
    if (!category.trim()) { Alert.alert('Atenção', 'Informe a categoria.'); return; }

    const payload: ProductFormData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(normalizedPrice),      
      stock: parseInt(stock, 10),
      category: category.trim(),
    };

    setIsLoading(true);

    const request = isEditing
      ? editProduct(editingProduct!.id, payload)
      : addProduct(payload);

    request
      .then(() => {
        Alert.alert(
          'Sucesso',
          isEditing ? 'Produto atualizado!' : 'Produto cadastrado!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      })
      .catch((err: any) => Alert.alert('Erro', err.message))
      .finally(() => setIsLoading(false));
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F0F13' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* Título */}
        <Text style={styles.label}>TÍTULO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Camiseta azul"
          placeholderTextColor="#6B7280"
          value={title}
          onChangeText={setTitle}
        />

        {/* Descrição */}
        <Text style={styles.label}>DESCRIÇÃO</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Descrição do produto"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Preço e Estoque lado a lado */}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>PREÇO (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 49,90"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => {
                const onlyNumbers = text.replace(/\D/g, '');
                const limited = onlyNumbers.slice(0, 8);
                const number = parseInt(limited || '0', 10);
                const formatted = (number / 100).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                setPrice(formatted);
              }}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>ESTOQUE</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        {/* Categoria */}
        <Text style={styles.label}>CATEGORIA</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.slug}
              style={[styles.chip, category === cat.slug && styles.chipActive]}
              onPress={() => setCategory(cat.slug)}
            >
              <Text style={[styles.chipText, category === cat.slug && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {category ? (
          <Text style={styles.categorySelected}>
            Selecionada: {TRADUCOES[category] ?? category}
          </Text>
        ) : (
          <Text style={styles.categoryPlaceholder}>Selecione uma categoria acima</Text>
        )}

        {/* Botão */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={isEditing ? 'save-outline' : 'add-circle-outline'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.submitBtnText}>
                {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputMultiline: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  categoryRow: { maxHeight: 40, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
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
  categorySelected: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 8,
  },
  categoryPlaceholder: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 32,
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});