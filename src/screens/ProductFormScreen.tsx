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
import { RootStackParamList } from '../../App';
import { listCategories, ProductFormData } from '../services/products';
import { useProducts } from '../contexts/ProductsContext';

type Route = RouteProp<RootStackParamList, 'ProductForm'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductForm'>;

export function ProductFormScreen() {
  const { addProduct, editProduct } = useProducts();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editingProduct = route.params?.product;
  const isEditing = !!editingProduct;

  const [title, setTitle] = useState(editingProduct?.title ?? '');
  const [description, setDescription] = useState(editingProduct?.description ?? '');
  const [price, setPrice] = useState(editingProduct ? String(editingProduct.price) : '');
  const [stock, setStock] = useState(editingProduct ? String(editingProduct.stock) : '');
  const [category, setCategory] = useState(editingProduct?.category ?? '');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
    navigation.setOptions({ title: isEditing ? 'Editar Produto' : 'Novo Produto' });
  }, []);

  function handleSubmit() {
    if (!title.trim()) { Alert.alert('Atenção', 'Informe o título.'); return; }
    if (!description.trim()) { Alert.alert('Atenção', 'Informe a descrição.'); return; }
    if (!price.trim() || isNaN(Number(price))) { Alert.alert('Atenção', 'Informe um preço válido.'); return; }
    if (!stock.trim() || isNaN(Number(stock))) { Alert.alert('Atenção', 'Informe um estoque válido.'); return; }
    if (!category.trim()) { Alert.alert('Atenção', 'Informe a categoria.'); return; }

    const payload: ProductFormData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Camiseta azul"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Descrição do produto"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 49.90"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={price}
          onChangeText={(text) => setPrice(text.replace(',', '.'))}
        />

        <Text style={styles.label}>Estoque</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={stock}
          onChangeText={setStock}
        />

        <Text style={styles.label}>Categoria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={String(cat)}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(String((cat as any).name ?? cat))}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {String((cat as any).name ?? cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {category ? (
          <Text style={styles.categorySelected}>Selecionada: {category}</Text>
        ) : (
          <Text style={styles.categoryPlaceholder}>Selecione uma categoria acima</Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? '💾 Salvar alterações' : '➕ Cadastrar produto'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#111827',
  },
  inputMultiline: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  categoryRow: { maxHeight: 40, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
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
  categorySelected: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 8,
  },
  categoryPlaceholder: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 28,
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});