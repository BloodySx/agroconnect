const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ssconnect.com';
  const password = '@ssconnect2026';
  
  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    // User exists, update password and ensure admin role
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: 'ADMIN',
        active: true,
      }
    });
    console.log(`✅ Updated existing admin user: ${user.id}`);
  } else {
    // User doesn't exist, create new admin user
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        name: 'Administrador SS Connect',
        email,
        passwordHash,
        role: 'ADMIN',
        active: true,
      }
    });
    console.log(`✅ Created admin user: ${user.id}`);
  }
  
  // Also check and handle the demo user if it exists
  const demoUser = await prisma.user.findUnique({ 
    where: { email: 'admin@demo.ssconnect' } 
  });
  
  if (demoUser) {
    // Check if demo user has any orders (to avoid deleting historical data)
    const orderCount = await prisma.order.count({
      where: { userId: demoUser.id }
    });
    
    if (orderCount === 0) {
      // No orders, safe to delete
      await prisma.user.delete({
        where: { id: demoUser.id }
      });
      console.log(`✅ Removed demo user (no historical data): ${demoUser.id}`);
    } else {
      // Has orders, just deactivate to preserve history
      await prisma.user.update({
        where: { id: demoUser.id },
        data: { active: false }
      });
      console.log(`⚠️  Demo user has ${orderCount} orders - deactivated instead of deleted`);
    }
  }
  
  await prisma.$disconnect();
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  });