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

  const frasco = await prisma.package.findFirst({
    where: { type: { equals: 'frasco - 1l', mode: 'insensitive' } },
  });

  if (!frasco) {
    console.log('Frasco 1L não encontrado.');
    return;
  }

  const updated = await prisma.package.update({
    where: { id: frasco.id },
    data: { active: false },
  });

  console.log(`Frasco 1L desativado: ${updated.id} | ${updated.name} | ${updated.type} | ativo: ${updated.active}`);
}

main()
  .catch((e) => {
    console.error('Erro:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });