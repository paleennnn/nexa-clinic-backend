const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const createPoli = async (data) => prisma.poli.create({ data });

const listPoli = async () => prisma.poli.findMany({ orderBy: { name: 'asc' } });

const getPoliById = async (id) => {
  const poli = await prisma.poli.findUnique({ where: { id } });
  if (!poli) throw new AppError('Poli tidak ditemukan', 404);
  return poli;
};

const updatePoli = async (id, data) => {
  await getPoliById(id);
  return prisma.poli.update({ where: { id }, data });
};

const deletePoli = async (id) => {
  await getPoliById(id);

  const [doctorCount, registrationCount] = await Promise.all([
    prisma.doctor.count({ where: { poliId: id } }),
    prisma.registration.count({ where: { poliId: id } }),
  ]);
  if (doctorCount > 0 || registrationCount > 0) {
    throw new AppError('Poli tidak bisa dihapus karena masih memiliki data terkait', 409);
  }

  return prisma.poli.delete({ where: { id } });
};

module.exports = { createPoli, listPoli, getPoliById, updatePoli, deletePoli };
