import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function mask(value: string): string {
  return value.replace(/\/\/[^@]+@/, '//***@');
}

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  console.log('DATABASE_URL definida:', dbUrl ? 'sim' : 'não');
  console.log('URL mascarada:', mask(dbUrl));

  await prisma.$queryRaw`SELECT 1`;
  console.log('SELECT 1: ok\n');

  const users = await prisma.user.findMany({ select: { id: true, username: true } });
  const products = await prisma.product.findMany({ where: { active: true }, select: { id: true, name: true, code: true } });
  const packages = await prisma.package.findMany({ select: { id: true, name: true, type: true, capacityLiters: true, active: true } });
  const defaultPrices = await prisma.productPrice.findMany({ where: { active: true }, include: { package: true } });
  const clientPrices = await prisma.clientProductPrice.findMany({ where: { active: true }, include: { package: true, product: { select: { sachetBoxVolumeLiters: true } } } });

  const defaultByProductPackage = new Map<string, any>();
  for (const price of defaultPrices) {
    const key = `${price.productId}|${price.packageId}`;
    defaultByProductPackage.set(key, price);
  }

  const clientByUserProductPackage = new Map<string, any>();
  for (const price of clientPrices) {
    const key = `${price.userId}|${price.productId}|${price.packageId}`;
    clientByUserProductPackage.set(key, price);
  }

  for (const product of products) {
    const clientForProduct = clientPrices.filter((p) => p.productId === product.id);
    const packageIds = new Set([
      ...clientForProduct.map((p) => p.packageId),
      ...defaultPrices.filter((p) => p.productId === product.id).map((p) => p.packageId),
    ]);

    for (const userId of ['', users[0]?.id ?? '']) {
      const label = userId ? users.find((u) => u.id === userId)?.username ?? userId : 'default';
      const resolved: any[] = [];

      for (const packageId of packageIds) {
        const clientPrice = userId ? clientByUserProductPackage.get(`${userId}|${product.id}|${packageId}`) : null;
        const defaultPrice = defaultByProductPackage.get(`${product.id}|${packageId}`);

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

      const issues: string[] = [];
      const recognized = new Set(['IBC_1000L', 'BOMBONA_20L', 'SACHÊ']);
      for (const item of resolved) {
        const itemIssues: string[] = [];
        if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0) itemIssues.push('price inválido');
        if (!recognized.has(item.packageType)) itemIssues.push('packageType não reconhecido');
        if (typeof item.packageVolumeLiters !== 'number' || !Number.isFinite(item.packageVolumeLiters) || item.packageVolumeLiters <= 0) itemIssues.push('packageVolumeLiters inválido');
        if (typeof item.active !== 'boolean') itemIssues.push('active inválido');
        if (item.unit !== 'litro') itemIssues.push('unit inválido');
        if (itemIssues.length > 0) {
          issues.push(`${item.packageName} (${item.packageType}): ${itemIssues.join(', ')}`);
        }
      }

      if (issues.length > 0) {
        console.log(`PRODUTO: ${product.name} | ${label}`);
        for (const issue of issues) {
          console.log(`  ⚠️ ${issue}`);
        }
      }
    }
  }

  console.log('\nVerificação concluída.');
}

main()
  .catch((e) => {
    console.error('Erro:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });