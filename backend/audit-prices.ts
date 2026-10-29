import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  const directUrl = process.env.DIRECT_URL ?? '';

  console.log('=== CONEXÃO ===');
  console.log(`DATABASE_URL definida: ${dbUrl ? 'sim' : 'não'}`);
  console.log(`DIRECT_URL definida: ${directUrl ? 'sim' : 'não'}`);

  const masked = dbUrl.replace(/\/\/[^@]+@/, '//***@');
  console.log(`URL mascarada: ${masked}`);

  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log(`SELECT 1: ${JSON.stringify(result)}`);
  } catch (err) {
    console.error('Erro na conexão:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  console.log('\n=== AUDITORIA DE PRODUTOS, EMBALAGENS E PREÇOS ===\n');

  // 1. Listar todas as embalagens
  const packages = await prisma.package.findMany({ orderBy: { type: 'asc' } });
  console.log('--- EMBALAGENS ---');
  for (const pkg of packages) {
    console.log(`ID: ${pkg.id} | Tipo: ${pkg.type} | Nome: ${pkg.name} | Capacidade: ${pkg.capacity} | Litros: ${pkg.capacityLiters ?? 'null'} | Ativa: ${pkg.active}`);
  }

  // 2. Listar todos os produtos
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  console.log('\n--- PRODUTOS ---');
  for (const product of products) {
    console.log(`ID: ${product.id} | Nome: ${product.name} | Código: ${product.code} | Ativo: ${product.active} | Caixa Sachê: ${product.sachetBoxVolumeLiters}L`);
  }

  // 3. Preços padrão por produto
  console.log('\n--- PREÇOS PADRÃO ---');
  const defaultPrices = await prisma.productPrice.findMany({
    include: { product: true, package: true },
    orderBy: { productId: 'asc' },
  });
  for (const price of defaultPrices) {
    console.log(`${price.product.name} + ${price.package.name} (${price.package.type}) = R$ ${price.price} | Ativo: ${price.active}`);
  }

  // 4. Preços específicos por cliente
  console.log('\n--- PREÇOS ESPECÍFICOS POR CLIENTE ---');
  const clientPrices = await prisma.clientProductPrice.findMany({
    include: { user: true, product: true, package: true },
    orderBy: { userId: 'asc' },
  });
  for (const price of clientPrices) {
    console.log(`${price.user.name} (${price.user.username}) + ${price.product.name} + ${price.package.name} (${price.package.type}) = R$ ${price.price} | Ativo: ${price.active}`);
  }

  // 5. Embalagens ativas sem nenhum preço ativo
  console.log('\n--- EMBALAGENS ATIVAS SEM PREÇO ATIVO ---');
  const activePackages = packages.filter((p) => p.active);
  for (const pkg of activePackages) {
    const hasDefaultPrice = defaultPrices.some(
      (p) => p.packageId === pkg.id && p.active
    );
    const hasClientPrice = clientPrices.some(
      (p) => p.packageId === pkg.id && p.active
    );
    if (!hasDefaultPrice && !hasClientPrice) {
      console.log(`⚠️  ${pkg.name} (${pkg.type}) - ID: ${pkg.id}`);
    }
  }

  // 6. Verificar tipos de embalagem não reconhecidos pelo mobile
  console.log('\n--- TIPOS NÃO RECONHECIDOS PELO MOBILE ---');
  const recognizedTypes = new Set(['IBC_1000L', 'BOMBONA_20L', 'SACHÊ']);
  for (const pkg of packages) {
    if (!recognizedTypes.has(pkg.type)) {
      console.log(`⚠️  Tipo não reconhecido: ${pkg.type} (${pkg.name}) - ID: ${pkg.id}`);
    }
  }

  // 7. Produtos ativos sem embalagem comercializável
  console.log('\n--- PRODUTOS ATIVOS SEM EMBALAGEM COMERCIALIZÁVEL ---');
  const activeProducts = products.filter((p) => p.active);
  for (const product of activeProducts) {
    const productDefaultPrices = defaultPrices.filter(
      (p) => p.productId === product.id && p.active
    );
    const productClientPrices = clientPrices.filter(
      (p) => p.productId === product.id && p.active
    );
    if (productDefaultPrices.length === 0 && productClientPrices.length === 0) {
      console.log(`⚠️  ${product.name} (${product.code}) - sem preços ativos`);
    }
  }

  // 8. Preços com valores inválidos
  console.log('\n--- PREÇOS COM VALORES INVÁLIDOS ---');
  for (const price of defaultPrices) {
    if (!Number.isFinite(price.price) || price.price <= 0) {
      console.log(`⚠️  Preço inválido: ${price.product.name} + ${price.package.name} = ${price.price}`);
    }
  }
  for (const price of clientPrices) {
    if (!Number.isFinite(price.price) || price.price <= 0) {
      console.log(`⚠️  Preço cliente inválido: ${price.user.name} + ${price.product.name} + ${price.package.name} = ${price.price}`);
    }
  }

  // 9. Duplicidade produto + embalagem
  console.log('\n--- DUPLICIDADES PRODUTO + EMBALAGEM (PREÇO PADRÃO) ---');
  const seen = new Map<string, string>();
  for (const price of defaultPrices) {
    const key = `${price.productId}|${price.packageId}`;
    if (seen.has(key)) {
      console.log(`⚠️  Duplicado: ${price.product.name} + ${price.package.name} (IDs: ${seen.get(key)}, ${price.id})`);
    } else {
      seen.set(key, price.id);
    }
  }

  // 10. Duplicidade cliente + produto + embalagem
  console.log('\n--- DUPLICIDADES CLIENTE + PRODUTO + EMBALAGEM ---');
  const clientSeen = new Map<string, string>();
  for (const price of clientPrices) {
    const key = `${price.userId}|${price.productId}|${price.packageId}`;
    if (clientSeen.has(key)) {
      console.log(`⚠️  Duplicado: ${price.user.name} + ${price.product.name} + ${price.package.name} (IDs: ${clientSeen.get(key)}, ${price.id})`);
    } else {
      clientSeen.set(key, price.id);
    }
  }

  // 11. Situação específica do Cabum
  console.log('\n--- SITUAÇÃO DO CABUM ---');
  const cabum = products.find((p) => p.code === 'cabum');
  if (cabum) {
    const cabumDefaultPrices = defaultPrices.filter((p) => p.productId === cabum.id);
    const cabumClientPrices = clientPrices.filter((p) => p.productId === cabum.id);
    console.log('Preços padrão:');
    for (const price of cabumDefaultPrices) {
      console.log(`  ${price.package.name} (${price.package.type}) = R$ ${price.price} | Ativo: ${price.active}`);
    }
    console.log('Preços específicos:');
    for (const price of cabumClientPrices) {
      console.log(`  ${price.user.name} + ${price.package.name} (${price.package.type}) = R$ ${price.price} | Ativo: ${price.active}`);
    }
  } else {
    console.log('Produto Cabum não encontrado.');
  }
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });