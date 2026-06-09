# 📦 MiniStock Mobile

Aplicativo mobile de gerenciamento de estoque desenvolvido em **React Native com Expo**, consumindo a API pública **DummyJSON**. O sistema permite autenticação, consulta, busca, filtro, cadastro, edição e exclusão de produtos, simulando o gerenciamento de estoque de uma empresa em tempo real.

---

## 📖 Sobre o Projeto

O **MiniStock Mobile** foi desenvolvido como projeto avaliativo da disciplina de Desenvolvimento Mobile, com foco na utilização profissional da biblioteca **Axios** para consumo de APIs REST.

O aplicativo foi criado para auxiliar equipes de estoque que trabalham em depósitos e necessitam consultar e gerenciar produtos diretamente pelo celular.

---

## 🚀 Tecnologias Utilizadas

- React Native
- Expo SDK 54
- TypeScript
- Axios
- React Navigation (Native Stack)
- AsyncStorage
- Context API
- Expo Vector Icons
- DummyJSON API

---

## 🏗️ Arquitetura do Projeto

```text
src/
│
├── components/
│   ├── EmptyState.tsx
│   ├── Loading.tsx
│   └── ProductCard.tsx
│
├── contexts/
│   ├── AuthContext.tsx
│   └── ProductsContext.tsx
│
├── screens/
│   ├── LoginScreen.tsx
│   ├── ProductListScreen.tsx
│   ├── ProductDetailScreen.tsx
│   └── ProductFormScreen.tsx
│
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── products.ts
│
└── App.tsx
```

---

## 🔐 Funcionalidades

### Login e Autenticação

- Login via API DummyJSON
- Persistência do token utilizando AsyncStorage
- Logout funcional
- Controle global de autenticação via Context API
- Tratamento automático de sessão expirada

### Gerenciamento de Produtos

- Listagem de produtos em grid
- Paginação infinita (Infinite Scroll)
- Pull To Refresh
- Busca dinâmica por nome
- Busca independente de acentuação
- Filtro por categorias
- Visualização de detalhes do produto
- Cadastro de novos produtos
- Edição de produtos
- Exclusão com confirmação

### Tratamento de Estados

- Loading inicial
- Loading de paginação
- Estado vazio
- Tratamento de erros da API
- Tratamento de timeout
- Tratamento de falta de conexão

---

## 🌐 API Utilizada

**DummyJSON**

https://dummyjson.com

### Credenciais de Teste

```text
Usuário: emilys
Senha: emilyspass
```

---

## ⚙️ Implementação do Axios

O projeto segue os requisitos exigidos pela atividade.

### Instância Única

Arquivo:

```text
src/services/api.ts
```

Configurações:

- baseURL centralizada
- timeout configurado
- interceptors globais

### Request Interceptor

Responsável por:

- Recuperar token do AsyncStorage
- Inserir Authorization automaticamente em todas as requisições

### Response Interceptor

Tratamento centralizado para:

- 400 → Credenciais inválidas
- 401 → Sessão expirada
- 404 → Recurso não encontrado
- 500+ → Erro interno do servidor
- Timeout
- Falta de conexão

### Uso de Params

Todas as consultas utilizam o objeto `params` do Axios:

```ts
params: {
  limit,
  skip
}
```

Sem concatenação manual de query strings.

### Separação de Responsabilidades

Nenhuma tela realiza chamadas Axios diretamente.

Todas as requisições ficam centralizadas em:

```text
src/services/auth.ts
src/services/products.ts
```

---

## 💾 Persistência Local

O AsyncStorage é utilizado para:

### Token de Autenticação

```text
@ministock_token
```

### Produtos Cadastrados Localmente

```text
@ministock_local_products
```

Como a DummyJSON não persiste alterações reais no banco de dados, os produtos criados pelo usuário são armazenados localmente para manter o funcionamento completo do CRUD.

---

## 📱 Telas Desenvolvidas

### 🔑 Login

- Autenticação via API
- Validação de campos
- Exibição/ocultação de senha
- Tratamento de erros

### 📋 Lista de Produtos

- Grid responsivo
- Busca por produtos
- Filtro por categorias
- Paginação infinita
- Pull To Refresh
- Botão de cadastro rápido

### 📦 Detalhes do Produto

- Imagem
- Nome
- Categoria
- Marca
- Descrição
- Preço
- Estoque
- Avaliação

### ✏️ Cadastro e Edição

- Cadastro de novos produtos
- Edição de produtos existentes
- Validação dos campos
- Formatação automática de preço
- Seleção de categoria

---

## 📸 Capturas de Tela

### Tela de Login

<img src="https://github.com/user-attachments/assets/a7bdb1c9-2283-427c-83da-b0761dfbbf6a" width="250">

### Lista de Produtos

<img src="https://github.com/user-attachments/assets/5ead586f-4d98-4e1c-aa22-d24e7185e05a" width="250">

### Detalhes do Produto

<img src="https://github.com/user-attachments/assets/93801eba-a862-4f9c-85d2-287596301be3" width="250">

### Cadastro de Produto

<img src="https://github.com/user-attachments/assets/0a26e3bb-cc80-4576-89d0-19bea3d07c46" width="250">

---

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/anabmaia76/Trabalho_Ministock.git
```

### 2. Acessar a pasta do projeto

```bash
cd Trabalho_Ministock
```

### 3. Instalar as dependências

```bash
npm install
```

Caso necessário, instalar manualmente:

### React Navigation

```bash
npm install @react-navigation/native @react-navigation/native-stack
```

### Dependências nativas do Expo

```bash
npx expo install react-native-screens react-native-safe-area-context
```

### Axios e AsyncStorage

```bash
npm install axios @react-native-async-storage/async-storage
```

### Ícones

```bash
npx expo install @expo/vector-icons
```

### 4. Executar o projeto

```bash
npx expo start
```

---

## 🎥 Vídeo Demonstrativo

Vídeo apresentando o funcionamento completo da aplicação:

https://www.youtube.com/shorts/Sr4Y_xhcOG8

---

## 🔗 Repositório GitHub

Código-fonte disponível em:

https://github.com/anabmaia76/Trabalho_Ministock

---

## ✅ Requisitos Atendidos

- ✅ Login autenticado
- ✅ Persistência de token
- ✅ Logout funcional
- ✅ Axios em todas as requisições
- ✅ Instância única do Axios
- ✅ Request Interceptor
- ✅ Response Interceptor
- ✅ Paginação infinita
- ✅ Pull To Refresh
- ✅ Busca por termo
- ✅ Busca sem diferenciação de acentos
- ✅ Filtro por categoria
- ✅ Tela de detalhes
- ✅ Cadastro de produto
- ✅ Edição de produto
- ✅ Exclusão com confirmação
- ✅ AsyncStorage
- ✅ Context API
- ✅ Tratamento de loading
- ✅ Tratamento de erros
- ✅ Organização em camadas

---

## 👩‍💻 Desenvolvido por

**Ana Beatriz Maia**

Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento Mobile utilizando React Native, Expo e Axios.
