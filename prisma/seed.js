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

  // 5. Data Pasien (15 Data Pasien Demo)
  const demoPatients = [
    {
      noRm: 'RM-000001',
      nik: '3201011504850001',
      name: 'Budi Santoso',
      gender: 'L',
      birthDate: new Date('1985-04-15'),
      phone: '081234567801',
      address: 'Jl. Merdeka No. 12, Jakarta Pusat',
    },
    {
      noRm: 'RM-000002',
      nik: '3201015208900002',
      name: 'Siti Aminah',
      gender: 'P',
      birthDate: new Date('1990-08-12'),
      phone: '081234567802',
      address: 'Jl. Melati Indah No. 45, Jakarta Selatan',
    },
    {
      noRm: 'RM-000003',
      nik: '3201012301780003',
      name: 'Ahmad Fauzi',
      gender: 'L',
      birthDate: new Date('1978-01-23'),
      phone: '081234567803',
      address: 'Jl. Cempaka Putih No. 8, Jakarta Pusat',
    },
    {
      noRm: 'RM-000004',
      nik: '3201016511950004',
      name: 'Dewi Lestari',
      gender: 'P',
      birthDate: new Date('1995-11-25'),
      phone: '081234567804',
      address: 'Jl. Kebon Jeruk No. 19, Jakarta Barat',
    },
    {
      noRm: 'RM-000005',
      nik: '3201010706880005',
      name: 'Hendra Gunawan',
      gender: 'L',
      birthDate: new Date('1988-06-07'),
      phone: '081234567805',
      address: 'Jl. Tebet Barat Dalam No. 3, Jakarta Selatan',
    },
    {
      noRm: 'RM-000006',
      nik: '3201014903920006',
      name: 'Rina Marlina',
      gender: 'P',
      birthDate: new Date('1992-03-09'),
      phone: '081234567806',
      address: 'Jl. Rawamangun Muka No. 27, Jakarta Timur',
    },
    {
      noRm: 'RM-000007',
      nik: '3201011812820007',
      name: 'Bambang Sudibyo',
      gender: 'L',
      birthDate: new Date('1982-12-18'),
      phone: '081234567807',
      address: 'Jl. Tanjung Duren Raya No. 14, Jakarta Barat',
    },
    {
      noRm: 'RM-000008',
      nik: '3201015607990008',
      name: 'Nurul Hidayah',
      gender: 'P',
      birthDate: new Date('1999-07-16'),
      phone: '081234567808',
      address: 'Jl. Matraman Raya No. 88, Jakarta Timur',
    },
    {
      noRm: 'RM-000009',
      nik: '3201012905750009',
      name: 'Joko Prasetyo',
      gender: 'L',
      birthDate: new Date('1975-05-29'),
      phone: '081234567809',
      address: 'Jl. Sudirman Kav. 50, Jakarta Pusat',
    },
    {
      noRm: 'RM-000010',
      nik: '3201014310010010',
      name: 'Putri Wulandari',
      gender: 'P',
      birthDate: new Date('2001-10-03'),
      phone: '081234567810',
      address: 'Jl. Kemang Raya No. 7, Jakarta Selatan',
    },
    {
      noRm: 'RM-000011',
      nik: '3201011102870011',
      name: 'Rizky Pratama',
      gender: 'L',
      birthDate: new Date('1987-02-11'),
      phone: '081234567811',
      address: 'Jl. Kelapa Gading Boulevard No. 21, Jakarta Utara',
    },
    {
      noRm: 'RM-000012',
      nik: '3201016109930012',
      name: 'Sri Wahyuni',
      gender: 'P',
      birthDate: new Date('1993-09-21'),
      phone: '081234567812',
      address: 'Jl. Danau Sunter Utara No. 15, Jakarta Utara',
    },
    {
      noRm: 'RM-000013',
      nik: '3201012508800013',
      name: 'Dedi Kurniawan',
      gender: 'L',
      birthDate: new Date('1980-08-25'),
      phone: '081234567813',
      address: 'Jl. Daan Mogot Km. 11, Jakarta Barat',
    },
    {
      noRm: 'RM-000014',
      nik: '3201015804970014',
      name: 'Maya Indah',
      gender: 'P',
      birthDate: new Date('1997-04-18'),
      phone: '081234567814',
      address: 'Jl. Boulevard Bintaro No. 9, Jakarta Selatan',
    },
    {
      noRm: 'RM-000015',
      nik: '3201010311910015',
      name: 'Eko Wahyudi',
      gender: 'L',
      birthDate: new Date('1991-11-03'),
      phone: '081234567815',
      address: 'Jl. Pahlawan Revolusi No. 33, Jakarta Timur',
    },
  ];

  for (const patient of demoPatients) {
    await prisma.patient.upsert({
      where: { nik: patient.nik },
      update: {},
      create: patient,
    });
  }

  console.log('✅ Seed selesai. Akun default:');
  console.log('  Admin    : admin@clinic.test   / Admin123!');
  console.log('  Dokter   : dokter@clinic.test  / Dokter123!');
  console.log('  Petugas  : petugas@clinic.test / Petugas123!');
  console.log(`  Pasien   : Berhasil menambahkan ${demoPatients.length} data pasien demo.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
