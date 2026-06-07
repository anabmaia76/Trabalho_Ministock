import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha usuário e senha.');
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      Alert.alert('Erro ao entrar', error.message || 'Credenciais inválidas.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.box}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <Ionicons name="cube-outline" size={32} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>MiniStock</Text>
        <Text style={styles.subtitle}>GERENCIAMENTO DE ESTOQUE</Text>

        {/* Usuário */}
        <Text style={styles.label}>USUÁRIO</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu usuário"
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        {/* Senha */}
        <Text style={styles.label}>SENHA</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Botão */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#1A1A24',
    borderRadius: 20,
    padding: 28,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: '#13131A',
    marginBottom: 20,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D3D',
    borderRadius: 10,
    backgroundColor: '#13131A',
    marginBottom: 28,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});