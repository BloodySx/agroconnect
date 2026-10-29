import prisma from './database/prisma';

async function main() {
  const packages = await prisma.package.findMany({
    select: { id: true, name: true, type: true, capacity: true, active: true }
  });
  console.log(JSON.stringify(packages, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });