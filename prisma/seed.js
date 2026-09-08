const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  // 1. Poli default (dibutuhkan sebagai referensi wajib untuk Doctor)
  const poliUmum = await prisma.poli.upsert({
    where: { code: 'UMUM' },
    update: {},
    create: { name: 'Poli Umum', code: 'UMUM' },
  });

  // 2. Admin
  await prisma.user.upsert({
    where: { email: 'admin@clinic.test' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@clinic.test',
      passwordHash: await bcrypt.hash('Admin123!', SALT_ROUNDS),
      role: 'ADMIN',
    },
  });

  // 3. Petugas Pendaftaran
  await prisma.user.upsert({
    where: { email: 'petugas@clinic.test' },
    update: {},
    create: {
      name: 'Petugas Pendaftaran',
      email: 'petugas@clinic.test',
      passwordHash: await bcrypt.hash('Petugas123!', SALT_ROUNDS),
      role: 'PETUGAS_PENDAFTARAN',
    },
  });

  // 4. Dokter (create User dulu, lalu profil Doctor terhubung ke Poli Umum)
  const dokterUser = await prisma.user.upsert({
    where: { email: 'dokter@clinic.test' },
    update: {},
    create: {
      name: 'Dr. Contoh',
      email: 'dokter@clinic.test',
      passwordHash: await bcrypt.hash('Dokter123!', SALT_ROUNDS),
      role: 'DOKTER',
    },
  });

  await prisma.doctor.upsert({
    where: { userId: dokterUser.id },
    update: {},
    create: {
      userId: dokterUser.id,
      poliId: poliUmum.id,
      specialization: 'Dokter Umum',
    },
  });

  console.log('✅ Seed selesai. Akun default:');
  console.log('  Admin    : admin@clinic.test   / Admin123!');
  console.log('  Dokter   : dokter@clinic.test  / Dokter123!');
  console.log('  Petugas  : petugas@clinic.test / Petugas123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
