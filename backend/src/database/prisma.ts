import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient({
  log: config.isProduction ? ['error'] : ['query', 'error', 'warn'],
});

export default prisma;
