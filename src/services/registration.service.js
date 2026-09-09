const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const queueService = require('./queue.service');

const STATUS_ORDER = ['MENUNGGU', 'CHECK_IN', 'PEMERIKSAAN', 'SELESAI'];

const registrationInclude = {
  patient: true,
  doctor: { include: { user: { select: { id: true, name: true } } } },
  poli: true,
  queue: true,
};

const createRegistration = async (data, userId) => {
  const { patientId, doctorId, poliId, visitDate, paymentType, chiefComplaint } = data;

  const [patient, doctor, poli] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.doctor.findUnique({ where: { id: doctorId } }),
    prisma.poli.findUnique({ where: { id: poliId } }),
  ]);
  if (!patient || !patient.isActive) throw new AppError('Pasien tidak ditemukan', 404);
  if (!doctor) throw new AppError('Dokter tidak ditemukan', 404);
  if (!poli) throw new AppError('Poli tidak ditemukan', 404);
  if (doctor.poliId !== poliId) {
    throw new AppError('Dokter yang dipilih tidak terdaftar di poli tersebut', 400);
  }

  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.create({
      data: { patientId, doctorId, poliId, visitDate, paymentType, chiefComplaint, createdBy: userId },
    });
    const queue = await queueService.createQueueForRegistration(registration.id, tx);
    return { ...registration, queue };
  });
};

const listRegistrations = async ({ date, status, page = 1, limit = 10 }) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (status) where.status = status;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.visitDate = { gte: start, lte: end };
  }

  const [total, items] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: registrationInclude,
    }),
  ]);

  return {
    items,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.max(Math.ceil(total / limitNum), 1) },
  };
};

const getRegistrationById = async (id) => {
  const registration = await prisma.registration.findUnique({ where: { id }, include: registrationInclude });
  if (!registration) throw new AppError('Registrasi tidak ditemukan', 404);
  return registration;
};

const updateRegistration = async (id, data, actingRole) => {
  const registration = await getRegistrationById(id);

  if (data.status && data.status !== registration.status && actingRole !== 'ADMIN') {
    const currentIdx = STATUS_ORDER.indexOf(registration.status);
    const nextIdx = STATUS_ORDER.indexOf(data.status);
    if (nextIdx < currentIdx) {
      throw new AppError('Status registrasi tidak boleh mundur', 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.registration.update({ where: { id }, data, include: registrationInclude });

    if (data.status && registration.queue) {
      if (data.status === 'PEMERIKSAAN' && ['WAITING', 'CALLED'].includes(registration.queue.status)) {
        await tx.queue.update({
          where: { id: registration.queue.id },
          data: { status: 'IN_PROGRESS' },
        });
      } else if (data.status === 'SELESAI' && registration.queue.status !== 'DONE') {
        await tx.queue.update({
          where: { id: registration.queue.id },
          data: { status: 'DONE' },
        });
      }
    }

    return updated;
  });
};

module.exports = { createRegistration, listRegistrations, getRegistrationById, updateRegistration };
