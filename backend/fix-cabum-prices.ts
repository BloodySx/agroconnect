import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { code: 'cabum' },
  });

  if (!product) {
    console.error('Produto Cabum não encontrado.');
    process.exit(1);
  }

  const packages = await prisma.package.findMany({
    where: { type: { in: ['SACHÊ', 'BOMBONA_20L', 'IBC_1000L'] } },
  });

  const packageMap = new Map(packages.map((p) => [p.type, p]));

  const pricesToUpsert = [
    { packageType: 'IBC_1000L', price: 12.0 },
    { packageType: 'BOMBONA_20L', price: 14.0 },
    { packageType: 'SACHÊ', price: 9.0 },
  ] as const;

  for (const entry of pricesToUpsert) {
    const pkg = packageMap.get(entry.packageType);
    if (!pkg) {
      console.error(`Embalagem ${entry.packageType} não encontrada.`);
      continue;
    }

    const existing = await prisma.productPrice.findUnique({
      where: {
        productId_packageId: {
          productId: product.id,
          packageId: pkg.id,
        },
      },
    });

    if (existing) {
      await prisma.productPrice.update({
        where: { id: existing.id },
        data: { price: entry.price, active: true },
      });
      console.log(`Atualizado: ${product.name} + ${pkg.name} = ${entry.price}`);
    } else {
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          packageId: pkg.id,
          price: entry.price,
          unit: 'litro',
          active: true,
        },
      });
      console.log(`Criado: ${product.name} + ${pkg.name} = ${entry.price}`);
    }
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