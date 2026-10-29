# Documentação da Estrutura do Projeto - SS Connect Mobile

## Visão Geral

Aplicativo mobile desenvolvido com **React Native** e **Expo** para gerenciamento de cotações de produtos agrícolas.

## Tecnologias Utilizadas

- **React Native** 0.81.5
- **Expo** ~54.0.36
- **TypeScript** ~5.9.2
- **React Navigation** v7 (Native Stack)
- **Expo Status Bar** ~3.0.9
- **Expo Linear Gradient** ~15.0.8

## Estrutura de Diretórios

```
ss-connect-mobile/
├── App.tsx                          # Entry point do aplicativo
├── index.ts                         # Registro do componente root
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
├── app.json                         # Configuração Expo
│
├── src/
│   ├── navigation/                  # Navegação
│   │   ├── AppNavigator.tsx         # Stack Navigator principal
│   │   └── types.ts                 # Tipos TypeScript para navegação
│   │
│   ├── features/                    # Features (telas)
│   │   ├── login/                   # Tela de Login
│   │   │   ├── index.tsx           # Componente principal
│   │   │   └── styles.ts           # Estilos da tela
│   │   │
│   │   └── home/                    # Tela Home
│   │       ├── index.tsx           # Componente principal
│   │       ├── styles.ts           # Estilos da tela
│   │       └── components/         # Componentes da Home
│   │           ├── Header.tsx      # Header com saudação
│   │           ├── InfoCard.tsx    # Card de informações do cliente
│   │           ├── ActionGrid.tsx  # Grid de ações
│   │           ├── ActionItem.tsx  # Item de ação individual
│   │           ├── LastQuote.tsx   # Última cotação
│   │           └── TipCard.tsx     # Card de dicas
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   ├── styles.ts
│   │   │   └── types.ts
│   │   ├── TextField/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Loading/
│   │   │   └── index.tsx
│   │   ├── Logo/
│   │   │   └── index.tsx
│   │   └── Screen/
│   │       └── index.tsx
│   │
│   ├── assets/                      # Recursos estáticos
│   │   ├── fonts/                   # Fontes customizadas
│   │   ├── images/                  # Imagens gerais
│   │   ├── login/                   # Imagens da tela de login
│   │   ├── logo/                    # Logos do app
│   │   └── home/                    # Imagens da tela home
│   │
│   ├── theme/                       # Tema e design system
│   │   ├── index.ts                 # Exportações centralizadas
│   │   ├── colors.ts                # Paleta de cores
│   │   ├── typography.ts            # Tipografia
│   │   ├── spacing.ts               # Espaçamentos
│   │   ├── radius.ts                # Border radius
│   │   └── shadows.ts               # Sombras
│   │
│   ├── constants/                   # Constantes
│   │   ├── routes.ts                # Rotas da aplicação
│   │   └── storage.ts               # Chaves de storage
│   │
│   ├── services/                    # Serviços externos
│   │   ├── api/                     # Configuração de API
│   │   └── auth/                    # Serviços de autenticação
│   │
│   ├── hooks/                       # Custom hooks
│   ├── types/                       # Tipos globais
│   └── utils/                       # Utilitários
│       ├── formatCurrency.ts
│       ├── formatDate.ts
│       └── index.ts
│
└── assets/                          # Assets raiz (se necessário)
```

## Navegação

### Stack Navigator

O app utiliza **React Navigation v7** com **Native Stack Navigator**:

- **Rota inicial**: `Login`
- **Rotas disponíveis**:
  - `Login` - Tela de autenticação
  - `Home` - Tela principal pós-login

### Fluxo de Navegação

```
App (App.tsx)
└── NavigationContainer
    └── AppNavigator
        ├── Login Screen (features/login)
        │   └── Botão "Entrar" → navigation.replace('Home')
        │
        └── Home Screen (features/home)
            ├── Header (components/Header)
            ├── InfoCard (components/InfoCard)
            ├── ActionGrid (components/ActionGrid)
            │   ├── ActionItem: Nova Cotação (highlighted)
            │   ├── ActionItem: Minhas Cotações
            │   └── ActionItem: Suporte
            ├── LastQuote (components/LastQuote)
            └── TipCard (components/TipCard)
```

## Telas

### 1. Login Screen (`src/features/login/`)

**Funcionalidades**:
- Formulário de login com campos de usuário e senha
- Layout com header verde e elementos decorativos
- Botão "Entrar" que navega para Home

**Componentes utilizados**:
- `Button` - Botão de entrada
- `TextField` - Campos de entrada de texto

**Estilos**:
- Header com imagem de fundo e folhas decorativas
- Formulário centralizado
- Versão do app no rodapé

### 2. Home Screen (`src/features/home/`)

**Funcionalidades**:
- Exibição de informações do cliente
- Ações rápidas (Nova Cotação, Minhas Cotações, Suporte)
- Última cotação realizada
- Dica do dia

**Componentes**:

#### Header
- Fundo verde com curva de transição
- Imagem "home header.png" como background
- Texto: "Olá, Guilherme!" e "Bem-vindo ao SS Connect"
- Ícone de perfil circular no canto direito

#### InfoCard
- Card flutuante sobre o header (marginTop: -30)
- 3 colunas: Cliente | Representante | Data
- Ícones circulares em cada seção
- Fundo branco com sombra

#### ActionGrid
- Container dos cards de ação
- 3 cards: Nova Cotação, Minhas Cotações, Suporte

#### ActionItem
- Card com ícone, título, descrição e botão de seta
- Prop `highlighted` para destaque (Nova Cotação)
- Badge "PRINCIPAL" no card destacado
- Botão circular laranja com seta

#### LastQuote
- Exibe última cotação: código, volume, valor
- Data à direita em laranja

#### TipCard
- Card com fundo amarelo pastel (#FFF7E6)
- Ícone de lâmpada
- Texto de dica

## Design System

### Cores Principais

```typescript
primary: '#5E9F6B'        // Verde principal
primaryDark: '#4B8757'    // Verde escuro
primaryLight: '#E8F4EA'   // Verde pastel
secondary: '#F28C38'      // Laranja
secondaryLight: '#FCE6D5' // Laranja suave
background: '#FFFFFF'
surface: '#FFFFFF'
text: '#2D3748'
textSecondary: '#718096'
```

### Cores da Home

```typescript
// Header
headerBackground: '#E8F4EA'
greeting: '#2D5A3D'
welcome: '#5A6B5A'

// Accent
accent: '#FF8C00'         // Laranja

// Cards
infoCardBg: '#FFFFFF'
actionItemHighlighted: '#EAF4EA'
tipCardBg: '#FFF7E6'

// TipCard
tipTitle: '#7A4E00'
tipDescription: '#9A6B00'
```

### Tipografia

- **Títulos**: 18-24px, fontWeight: 700
- **Subtítulos**: 15-17px, fontWeight: 700
- **Corpo**: 13-14px, fontWeight: 400-600
- **Labels**: 11px, fontWeight: 400

### Espaçamento

- Padding horizontal padrão: 20px
- Margin entre cards: 16px
- Border radius padrão: 16-20px

### Sombras

```typescript
sm: {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
}

md: {
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
}
```

## Assets

### Login
- `assets/login/header-background.png` - Background do header
- `assets/login/footer-leaves.png` - Folhas decorativas do rodapé
- `assets/logo/logo.png` - Logo do app
- `assets/images/folha header.png` - Folha decorativa do header
- `assets/images/folha centralizada - footer.png` - Folha centralizada

### Home
- `assets/home/home header.png` - Background do header home
- `assets/home/perfil.png` - Ícone de perfil
- `assets/home/fazenda.png` - Ícone de fazenda
- `assets/home/documento.png` - Ícone de documento
- `assets/home/documento cifrão.png` - Ícone de documento com cifrão
- `assets/home/planilha.png` - Ícone de planilha
- `assets/home/fone.png` - Ícone de fone/headset
- `assets/home/lampada.png` - Ícone de lâmpada
- `assets/home/planta1.png` - Elemento decorativo
- `assets/home/planta2.png` - Elemento decorativo
- `assets/home/planta footer.png` - Folhas decorativas do rodapé

## Dependências Principais

```json
{
  "dependencies": {
    "@react-navigation/native": "^7.3.16",
    "@react-navigation/native-stack": "^7.18.8",
    "expo": "~54.0.36",
    "expo-linear-gradient": "~15.0.8",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0"
  }
}
```

## Scripts Disponíveis

```bash
npm start          # Inicia o Expo dev server
npm run android    # Inicia no Android
npm run ios        # Inicia no iOS
npm run web        # Inicia na web
```

## Estado do Projeto

- ✅ Navegação implementada (Login → Home)
- ✅ Tela de login funcional com design original
- ✅ Tela Home reconstruída conforme design aprovado
- ✅ TypeScript sem erros
- ✅ Bundle Expo funcionando
- ✅ Assets corrigidos e caminhos atualizados

## Próximos Passos

- [ ] Implementar funcionalidade de Nova Cotação
- [ ] Implementar Minhas Cotações
- [ ] Implementar Suporte
- [ ] Integração com API backend
- [ ] Autenticação real
- [ ] Persistência de dados