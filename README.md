# 🌱 AgroConnect

**Plataforma acadêmica para cotação de insumos agrícolas e gestão de pedidos.**

O AgroConnect reúne um aplicativo para clientes, um painel administrativo e uma API centralizada. O objetivo é simplificar a montagem de cotações, o envio de pedidos e o acompanhamento das solicitações em um único fluxo.

> Projeto desenvolvido como MVP acadêmico. Os dados do catálogo são demonstrativos.

---

## 📌 Visão geral

| Módulo | Tecnologia | Responsabilidade |
|---|---|---|
| **Aplicativo mobile** | React Native · Expo · TypeScript | Experiência do cliente: catálogo, cotação e pedidos |
| **API / Backend** | Node.js · Fastify · TypeScript | Autenticação, validações e regras de negócio |
| **Painel administrativo** | React · Vite · TypeScript | Gestão de pedidos, catálogo, preços e usuários |
| **Persistência** | PostgreSQL · Prisma ORM | Armazenamento e consulta dos dados |

## 🧭 Fluxo da aplicação

```text
┌─────────────────────┐       ┌──────────────────────┐
│   App AgroConnect   │       │ Painel Administrativo│
│   React Native      │       │   React + Vite        │
└──────────┬──────────┘       └───────────┬──────────┘
           │                              │
           └──────────────┬───────────────┘
                          ▼
                 ┌────────────────┐
                 │  API Fastify   │
                 │  Node.js       │
                 └───────┬────────┘
                         ▼
                 ┌────────────────┐
                 │  Prisma ORM    │
                 └───────┬────────┘
                         ▼
                 ┌────────────────┐
                 │  PostgreSQL    │
                 └────────────────┘
```

O mobile e o painel utilizam a mesma API. O backend centraliza as regras e o acesso aos dados, evitando que cada interface implemente sua própria lógica de negócio.

## ✨ Funcionalidades do MVP

### Aplicativo mobile
- Autenticação de usuários.
- Consulta de produtos e embalagens disponíveis.
- Montagem guiada de cotação com quantidade e condição de pagamento.
- Consulta de preços aplicáveis ao cliente ou preço padrão.
- Envio de pedidos e consulta do histórico.
- Visualização dos detalhes e cancelamento conforme o status permitido.

### Painel administrativo
- Visão geral e consulta de pedidos.
- Gestão de produtos e embalagens.
- Gestão de preços padrão e preços específicos por cliente.
- Administração de usuários e permissões.
- Acompanhamento e atualização do status dos pedidos.

### Regras importantes
- A API valida os dados recebidos antes de persistir um pedido.
- Os preços são consultados novamente no servidor no momento do envio.
- O total do pedido é calculado no backend.
- Pedido e itens são registrados em uma transação no PostgreSQL.

## 🧰 Tecnologias utilizadas

**Mobile**
- React Native
- Expo SDK 58
- TypeScript
- React Navigation
- AsyncStorage para persistência do token de autenticação

**Backend**
- Node.js
- Fastify 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT e bcrypt
- Zod para validação
- Helmet, CORS e Rate Limit

**Admin**
- React
- Vite
- TypeScript
- React Router

## 📁 Organização do repositório

```text
agroconnect/
├── mobile/       # Aplicativo React Native + Expo
├── api/          # API Fastify + Prisma
├── admin/        # Painel administrativo React + Vite
├── README.md
└── .gitignore
```

## 🚀 Como executar localmente

### 1. Pré-requisitos
- Node.js 18 ou superior
- npm
- PostgreSQL em execução
- Expo Go compatível com o SDK do projeto ou emulador

### 2. Configurar a API

Crie o arquivo `api/.env` com as configurações locais:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@127.0.0.1:5432/agroconnect_db?schema=public"
DIRECT_URL="postgresql://USUARIO:SENHA@127.0.0.1:5432/agroconnect_db?schema=public"
JWT_SECRET="GERE_UM_SEGREDO_ALEATORIO_COM_PELO_MENOS_32_CARACTERES"
JWT_EXPIRES_IN=7d
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:5180
```

Instale dependências, gere o Prisma Client e aplique as migrations:

```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

A API ficará disponível em `http://localhost:3333`.

### 3. Executar o aplicativo mobile

Em outro terminal:

```bash
cd mobile
npm install
npx expo start --lan
```

Escaneie o QR Code com o Expo Go. Em dispositivo físico, o telefone e o computador precisam estar na mesma rede. A URL da API deve apontar para o endereço de rede do computador, não para `localhost` do celular.

### 4. Executar o painel administrativo

Em outro terminal:

```bash
cd admin
npm install
npm run dev -- --port 5180
```

Acesse `http://localhost:5180`.

### 5. Visualizar os dados

Em outro terminal, a partir da pasta `api`:

```bash
cd api
npx prisma studio
```

O Prisma Studio abre normalmente em `http://localhost:5555` e permite inspecionar os registros do PostgreSQL.

## 🧪 Validação e estado do projeto

O repositório contém o MVP e seus módulos principais. Antes de considerar uma implantação de produção, ainda devem ser concluídos e documentados os testes integrados, de usabilidade, segurança, desempenho e o processo de publicação.

O repositório não possui atualmente um seed funcional confirmado. Não execute `prisma db seed` até que esse fluxo esteja implementado e revisado.

## 🔐 Segurança e dados

- Não envie arquivos `.env`, senhas, tokens ou chaves privadas ao Git.
- Use credenciais locais próprias para desenvolvimento.
- O catálogo e os dados de apresentação devem permanecer fictícios ou genéricos.
- Não inclua informações pessoais ou comerciais reais de clientes.

## 🎓 Contexto acadêmico

O AgroConnect demonstra a integração entre aplicativo mobile, painel administrativo, API e banco relacional. O foco do MVP está na jornada de cotação e pedido, com regras centralizadas no backend e persistência estruturada.

---

**AgroConnect** · Aplicativo mobile + gestão administrativa de pedidos.
