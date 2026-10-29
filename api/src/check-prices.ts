import prisma from './database/prisma';

async function main() {
  const prices = await prisma.productPrice.findMany({
    include: {
      package: { select: { id: true, name: true, type: true, capacity: true } }
    }
  });
  console.log(JSON.stringify(prices, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });