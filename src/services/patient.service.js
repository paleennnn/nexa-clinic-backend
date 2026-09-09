const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Generate No. RM berurutan: RM-000001, RM-000002, dst.
 * Dipanggil di dalam $transaction supaya konsisten dengan create-nya.
 * Catatan: untuk skala klinik kecil (sesuai studi kasus) pendekatan ini cukup;
 * di beban tinggi/concurrent-write besar sebaiknya pakai DB sequence.
 */
const generateNoRm = async (tx) => {
  const last = await tx.patient.findFirst({ orderBy: { noRm: 'desc' } });
  let next = 1;
  if (last) {
    const lastNumber = parseInt(last.noRm.split('-')[1], 10);
    next = lastNumber + 1;
  }
  return `RM-${String(next).padStart(6, '0')}`;
};

const createPatient = async (data) => {
  return prisma.$transaction(async (tx) => {
    const noRm = await generateNoRm(tx);
    return tx.patient.create({
      data: { ...data, noRm },
    });
  });
  // NIK unik ditegakkan oleh DB unique constraint -> P2002 ditangkap errorHandler global (409)
};

const listPatients = async ({ search, page = 1, limit = 10 }) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where = {
    isActive: true,
    ...(search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nik: { contains: search } },
          { noRm: { contains: search, mode: 'insensitive' } },
        ],
      }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(Math.ceil(total / limitNum), 1),
    },
  };
};

const getPatientById = async (id) => {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient || !patient.isActive) {
    throw new AppError('Pasien tidak ditemukan', 404);
  }
  return patient;
};

const updatePatient = async (id, data) => {
  await getPatientById(id); // mastikan ada & aktif, kalau tidak -> 404 pesan jelas
  return prisma.patient.update({ where: { id }, data });
};

const deletePatient = async (id) => {
  await getPatientById(id);
  // Soft delete: jaga relasi historis registrasi/rekam medis tetap utuh
  return prisma.patient.update({ where: { id }, data: { isActive: false } });
};

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
