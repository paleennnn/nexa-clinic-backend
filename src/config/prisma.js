const { PrismaClient } = require('@prisma/client');

// Singleton - semua service import dari sini, jangan `new PrismaClient()` di tempat lain.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
});

module.exports = prisma;
