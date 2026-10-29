import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function mask(value: string): string {
  return value.replace(/\/\/[^@]+@/, '//***@');
}

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  const directUrl = process.env.DIRECT_URL ?? '';

  console.log('=== CONEXÃO ===');
  console.log(`DATABASE_URL definida: ${dbUrl ? 'sim' : 'não'}`);
  console.log(`DIRECT_URL definida: ${directUrl ? 'sim' : 'não'}`);
  console.log(`URL mascarada: ${mask(dbUrl)}`);

  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log(`SELECT 1: ${JSON.stringify(result)}`);
  } catch (err) {
    console.error('Erro na conexão:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({
    where: { username: { equals: 'admingui', mode: 'insensitive' } },
    select: { id: true, name: true, username: true },
  });

  if (!admin) {
    console.error('Usuário admingui não encontrado.');
    process.exit(1);
  }

  const cabum = await prisma.product.findFirst({
    where: { code: { equals: 'cabum', mode: 'insensitive' } },
  });

  if (!cabum) {
    console.error('Produto cabum não encontrado.');
    process.exit(1);
  }

  console.log(`\nUsuário: ${admin.name} (${admin.username}) -> ${admin.id}`);
  console.log(`Produto: ${cabum.name} (${cabum.code}) -> ${cabum.id}`);

  const [clientPrices, defaultPrices] = await Promise.all([
    prisma.clientProductPrice.findMany({
      where: { userId: admin.id, productId: cabum.id, active: true },
      include: {
        package: true,
        product: { select: { sachetBoxVolumeLiters: true } },
      },
    }),
    prisma.productPrice.findMany({
      where: { productId: cabum.id, active: true },
      include: {
        package: true,
        product: { select: { sachetBoxVolumeLiters: true } },
      },
    }),
  ]);

  const clientMap = new Map(clientPrices.map((p) => [p.packageId, p]));
  const defaultMap = new Map(defaultPrices.map((p) => [p.packageId, p]));
  const packageIds = new Set([
    ...clientPrices.map((p) => p.packageId),
    ...defaultPrices.map((p) => p.packageId),
  ]);

  const resolved: any[] = [];

  for (const packageId of packageIds) {
    const clientPrice = clientMap.get(packageId);
    const defaultPrice = defaultMap.get(packageId);

    if (clientPrice && clientPrice.active) {
      resolved.push({
        productId: clientPrice.productId,
        packageId: clientPrice.packageId,
        price: clientPrice.price,
        unit: clientPrice.unit,
        priceSource: 'client',
        priceId: clientPrice.id,
        updatedAt: clientPrice.updatedAt.toISOString(),
        packageName: clientPrice.package.name,
        packageType: clientPrice.package.type,
        packageVolumeLiters: clientPrice.package.capacityLiters ?? (clientPrice as any).product?.sachetBoxVolumeLiters ?? null,
        active: true,
      });
    } else if (defaultPrice && defaultPrice.active) {
      resolved.push({
        productId: defaultPrice.productId,
        packageId: defaultPrice.packageId,
        price: defaultPrice.price,
        unit: defaultPrice.unit,
        priceSource: 'default',
        priceId: defaultPrice.id,
        updatedAt: defaultPrice.updatedAt.toISOString(),
        packageName: defaultPrice.package.name,
        packageType: defaultPrice.package.type,
        packageVolumeLiters: defaultPrice.package.capacityLiters ?? (defaultPrice as any).product?.sachetBoxVolumeLiters ?? null,
        active: true,
      });
    }
  }

  console.log('\n=== RESPOSTA /client-product-prices?productId=' + cabum.id + ' ===');
  console.log(JSON.stringify({ data: resolved }, null, 2));

  console.log('\n=== VALIDAÇÃO DO PARSER DO MOBILE ===');
  const recognized = new Set(['IBC_1000L', 'BOMBONA_20L', 'SACHÊ']);
  for (const item of resolved) {
    const issues: string[] = [];
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0) issues.push('price inválido');
    if (!['IBC_1000L', 'BOMBONA_20L', 'SACHÊ'].includes(item.packageType)) issues.push('packageType não reconhecido');
    if (typeof item.packageVolumeLiters !== 'number' || !Number.isFinite(item.packageVolumeLiters) || item.packageVolumeLiters <= 0) issues.push('packageVolumeLiters inválido');
    if (typeof item.active !== 'boolean') issues.push('active inválido');
    if (item.unit !== 'litro') issues.push('unit inválido');
    console.log(`- ${item.packageName} (${item.packageType}): ${issues.length === 0 ? 'OK' : issues.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error('Erro:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });