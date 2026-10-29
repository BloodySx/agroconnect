# AgroConnect

Aplicativo móvel e painel administrativo para consulta de produtos agrícolas, cotações e acompanhamento de pedidos.

## Estrutura do Projeto

```
agroconnect/
├── mobile/          # Aplicativo React Native + Expo SDK 58 + TypeScript
├── api/             # API Fastify + TypeScript + Prisma ORM + PostgreSQL
├── admin/           # Painel React + Vite + TypeScript
├── .gitignore
└── README.md
```

## Tecnologias

- **Mobile**: React Native, Expo SDK 58, TypeScript, React Navigation
- **Backend**: Node.js, Fastify, TypeScript, Prisma ORM, PostgreSQL
- **Admin**: React, Vite, TypeScript, React Router

## Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (local ou container Docker)
- npm ou yarn
- Expo CLI
- Git

## Configuração do Banco de Dados

O projeto utiliza PostgreSQL com banco `agroconnect_db`.

1. Instale o PostgreSQL e crie o banco de dados:
   ```bash
   createdb agroconnect_db
   ```

2. As strings de conexão esperadas no arquivo `.env` do backend:
   ```
   DATABASE_URL="postgresql://agroconnect_app:agro1234@127.0.0.1:5432/agroconnect_db?schema=public"
   DIRECT_URL="postgresql://agroconnect_app:agro1234@127.0.0.1:5432/agroconnect_db?schema=public"
   ```

3. Execute as migrations e seed:
   ```bash
   cd api
   npx prisma migrate dev --initial
   npx prisma generate
   npx prisma db seed
   ```

## Iniciando a API

```bash
# Instalar dependências
cd api
npm install

# Iniciar o servidor (porta 3333)
npm run dev

# Ou builds
npm run build    # TypeScript compilation
npm start        # Node production
```

## Iniciando o Aplicativo Mobile

```bash
# Instalar dependências
cd mobile
npm install

# Configurar variáveis de ambiente
# Copie .env.example para .env e ajuste a URL da API
# Em desenvolvimento Android: EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
# Em desenvolvimento iOS: EXPO_PUBLIC_API_URL=http://localhost:3333
# Ou execute "npx expo start --lan" para detectar o IP

# Iniciar o Expo
npm start

# Para Android: aperte 'a' ou selecione dispositivo
# Para iOS: aperte 'i' ou use o app Expo Go
```

## Iniciando o Painel Administrativo

```bash
# Instalar dependências
cd admin
npm install

# Iniciar o painel (porta 5173)
npm run dev

# Acesse: http://localhost:5173
# O painel proxyará requisições /api para http://localhost:3333
```

## Funcionalidades do MVP

### Aplicativo Mobile

1. **Login / Registro** - Autenticação de usuários
2. **Ecrã Inicial** - Visão geral com ações rápidas
3. **Seleção de Produto** - Lista de produtos agrícolas
4. **Seleção de Embalagem** - Tipos de embalagem (SACHÊ, BOMBONA_20L, IBC_1000L)
5. **Inserção de Quantidade** - Quantidade em litros
6. **Condição de Pagamento** - Até/28, 2x, 3x, 1x60, à vista
7. **Resumo da Cotação** - Valor total estimado
8. **Criar Pedido** - Finalização do pedido
9. **Meus Pedidos** - Histórico de pedidos realizados
10. **Detalhes do Pedido** - Visualizar e cancelar pedidos (quando permitido)

### Painel Administrativo

1. **Login Admin** - Acesso administrativo
2. **Listar Produtos** - Visualizar todos os produtos
3. **Cadastrar Produto** - Novo produto no catálogo
4. **Editar Produto** - Atualizar informações do produto
5. **Listar Embalagens** - Gerenciar tipos de embalagem
6. **Gerenciar Preços** - Preços por produto/embalagem
7. **Preços por Cliente** - Tabela de preços específicas por usuário
8. **Listar Pedidos** - Histórico de todos os pedidos
9. **Alterar Status** - Confirmar, cancelar, completar pedidos
10. **Gerenciar Usuários** - Criar, ativar, desativar usuários

## Variáveis de Ambiente

### API (.env)

```
DATABASE_URL="postgresql://agroconnect_app:agro1234@127.0.0.1:5432/agroconnect_db?schema=public"
DIRECT_URL="postgresql://agroconnect_app:agro1234@127.0.0.1:5432/agroconnect_db?schema=public"
JWT_SECRET="sua-chave-secreta-aqui-mínimo-32-caracteres"
JWT_EXPIRES_IN=7d
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Mobile (.env)

```
# Desenvolvimento
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
# Ou para iOS: EXPO_PUBLIC_API_URL=http://localhost:3333
# Ou execute "npx expo start --lan" para IP automático

# Produção
EXPO_PUBLIC_API_URL=https://sua-api.com
```

### Admin (.env)

O painel lê `VITE_API_URL` do Vite. O arquivo `admin/vite-env.d.ts` já configura o tipo.

## Observações Importantes

1. **127.0.0.1 no celular**: Quando testar em celular físico, use o IP da sua rede local em vez de `127.0.0.1`, pois este último representa o próprio celular, não o computador.

2. **Backend porta 3333**: A API escuta na porta 3333.

3. **Painel porta 5173**: O painel Vite roda na porta 5173 e faz proxy para a API.

4. **Dados fictícios**: O banco foi populado com dados de demonstração acadêmica.

5. **Não publicar credenciais**: Nunca faça push de arquivos `.env` para o GitHub.

## Testes Executados

- ✅ TypeScript check mobile (erros: 0)
- ✅ TypeScript check backend (erros: 0)
- ✅ TypeScript check admin (erros: 0)
- ✅ Correções de encoding (Sachê, — (em dash), inválida)
- ✅ Branding: SS Connect → AgroConnect
- ✅ Branding: Solo Sagrado → AgroConnect
- ✅ Removido placeholder ssconnect_jwt_secret do backend

## Limitações Conhecidas

- A autenticação completa requer backend fully configurado
- O painel admin ainda não tem persistência completa de todas as operações
- Alguns fluxos de navegação estão em versão demo
- Builds de produção ainda não foram gerados

## Status Atual

Versão MVP funcional com navegação completa entre as telas principais,
autenticação básica e cotação de produtos agrícolas.