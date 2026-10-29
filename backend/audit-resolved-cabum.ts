import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { clientProductPriceService } from './src/modules/product-prices/client-product-price.service';

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

  const user = await prisma.user.findFirst({ where: { username: { equals: 'admingui', mode: 'insensitive' } } });
  const cabum = await prisma.product.findFirst({ where: { code: { equals: 'cabum', mode: 'insensitive' } } });
  if (!user || !cabum) {
    console.error('Usuário ou produto não encontrado.');
    process.exit(1);
  }

  const resolved = await clientProductPriceService.listResolvedPricesForUser(user.id, cabum.id);
  console.log('=== RESPOSTA DO RESOLVER PARA AdminGui + CABUM ===');
  console.log(JSON.stringify(resolved, null, 2));

  const recognized = new Set(['IBC_1000L', 'BOMBONA_20L', 'SACHÊ']);
  let malformed = 0;
  for (const item of resolved) {
    const issues: string[] = [];
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0) issues.push('price inválido');
    if (!recognized.has(item.packageType)) issues.push('packageType não reconhecido');
    if (typeof item.packageVolumeLiters !== 'number' || !Number.isFinite(item.packageVolumeLiters) || item.packageVolumeLiters <= 0) issues.push('packageVolumeLiters inválido');
    if (typeof item.active !== 'boolean') issues.push('active inválido');
    if (item.unit !== 'litro') issues.push('unit inválido');
    console.log(`- ${item.packageName} (${item.packageType}): ${issues.length === 0 ? 'OK' : issues.join(', ')}`);
    if (issues.length > 0) malformed += 1;
  }
  console.log(`\nTotal ofertas: ${resolved.length}`);
  console.log(`Ofertas malformadas: ${malformed}`);
}

main()
  .catch((e) => {
    console.error('Erro:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });