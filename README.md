# AgroConnect

Aplicativo móvel e painel administrativo acadêmico para consulta de insumos agrícolas, cotações e acompanhamento de pedidos.

## Estrutura

- `mobile/`: React Native + Expo SDK 58 + TypeScript
- `api/`: Fastify + TypeScript + Prisma + PostgreSQL
- `admin/`: React + Vite + TypeScript

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL
- npm
- Expo Go compatível com o SDK do projeto ou emulador Android/iOS

## Banco de dados

Crie um banco PostgreSQL chamado `agroconnect_db` e um usuário próprio para o projeto. Não reutilize credenciais de outros projetos.

Configure `api/.env` com valores locais, por exemplo:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@127.0.0.1:5432/agroconnect_db?schema=public"
DIRECT_URL="postgresql://SEU_USUARIO:SUA_SENHA@127.0.0.1:5432/agroconnect_db?schema=public"
JWT_SECRET="GERE_UM_SEGREDO_ALEATORIO_COM_PELO_MENOS_32_CARACTERES"
JWT_EXPIRES_IN=7d
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Nunca publique o arquivo `.env`, senhas reais ou segredos JWT no Git.

A partir da pasta `api`, instale as dependências e aplique as migrations:

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

A migration `20261103000000_anonymize_demo_catalog` padroniza nomes e códigos dos produtos demonstrativos, preservando os IDs e os relacionamentos com preços e pedidos.

> O repositório ainda não contém um script de seed funcional. Não execute `prisma db seed` até que um seed seja implementado.

## Executar a API

Na pasta `api`:

```bash
npm install
npm run dev
```

A API usa a porta `3333` por padrão. Para validar a compilação:

```bash
npm run build
```

## Executar o painel administrativo

Na pasta `admin`:

```bash
npm install
npm run dev
```

O Vite inicia o painel em `http://localhost:5173`. O proxy de desenvolvimento encaminha as chamadas `/api` para a API local.

Para validar o painel:

```bash
npm run typecheck
npm run build
```

## Executar o aplicativo mobile

Na pasta `mobile`:

```bash
npm install
npx expo start
```

Configure `EXPO_PUBLIC_API_URL` para apontar para a API. Em emulador Android, normalmente use `http://10.0.2.2:3333`; em dispositivo físico, use o endereço IP local do computador. Não use `localhost` no celular físico.

## Escopo acadêmico

O catálogo deve usar nomes, imagens e dados fictícios/genéricos. Não inclua marcas, produtos comerciais, logotipos, contatos ou dados de clientes de empresas reais.

## Estado da validação

A aplicação das migrations no banco local foi confirmada durante o desenvolvimento. Builds completos da API, do painel e do aplicativo ainda precisam ser executados no ambiente local antes de considerar esta versão validada.
