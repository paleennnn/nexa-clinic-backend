const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const userSelect = { id: true, name: true, email: true, isActive: true };

const createDoctor = async (data) => {
  const { name, email, password, poliId, sipNumber, specialization } = data;

  return prisma.$transaction(async (tx) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: 'DOKTER' },
    });
    return tx.doctor.create({
      data: { userId: user.id, poliId, sipNumber, specialization },
      include: { user: { select: userSelect }, poli: true },
    });
  });
};

const listDoctors = async () =>
  prisma.doctor.findMany({
    where: { user: { isActive: true } },
    include: { user: { select: userSelect }, poli: true },
    orderBy: { user: { name: 'asc' } },
  });

const getDoctorById = async (id) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: { select: userSelect }, poli: true },
  });
  if (!doctor || !doctor.user.isActive) {
    throw new AppError('Dokter tidak ditemukan', 404);
  }
  return doctor;
};

const updateDoctor = async (id, data) => {
  const doctor = await getDoctorById(id);
  const { name, poliId, sipNumber, specialization } = data;

  return prisma.$transaction(async (tx) => {
    if (name) {
      await tx.user.update({ where: { id: doctor.userId }, data: { name } });
    }
    return tx.doctor.update({
      where: { id },
      data: { poliId, sipNumber, specialization },
      include: { user: { select: userSelect }, poli: true },
    });
  });
};

const deleteDoctor = async (id) => {
  const doctor = await getDoctorById(id);
  // Nonaktifkan akun, bukan hapus permanen, supaya histori registrasi/rekam medis tetap utuh
  await prisma.user.update({ where: { id: doctor.userId }, data: { isActive: false } });
};

module.exports = { createDoctor, listDoctors, getDoctorById, updateDoctor, deleteDoctor };
