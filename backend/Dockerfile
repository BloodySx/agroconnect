# Stage 1: instala dependencias e compila o backend/Prisma para Linux
FROM node:22-slim AS build
WORKDIR /app

# Prisma 6 precisa de OpenSSL para selecionar e executar o engine correto.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

# Stage 2: dependencias de producao, sem TypeScript/CLI de desenvolvimento
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# Prisma CLI entra como peer/devOptional mesmo com --omit=dev/peer no npm.
# Apenas o client gerado na fase build e necessario em runtime.
RUN npm ci --omit=dev --omit=peer \
    && rm -rf node_modules/prisma node_modules/@prisma/config node_modules/deepmerge-ts \
    && test ! -e node_modules/prisma \
    && test ! -e node_modules/@prisma/config \
    && test ! -e node_modules/deepmerge-ts

# Stage 3: imagem de execucao
FROM node:22-slim AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
# O Cloud Run injeta PORT (8080 por padrao); o backend le process.env.PORT.
ENV PORT=8080

COPY --from=prod-deps /app/node_modules ./node_modules
# O Prisma Client gerado no Linux precisa acompanhar as dependencias de runtime.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

RUN node -e "const {PrismaClient}=require('@prisma/client'); if(typeof PrismaClient !== 'function') process.exit(1); console.log('Prisma Client carregado')"

USER node
EXPOSE 8080

# Util no Docker local; configurar probes do Cloud Run no proprio servico.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "const p=process.env.PORT||8080; fetch('http://127.0.0.1:'+p+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
