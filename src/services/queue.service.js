const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const startOfDay = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Nomor antrean format A001, A002, ... reset tiap hari, urutan global.
 */
const generateQueueNumber = async (tx) => {
  const client = tx || prisma;
  const lastQueue = await client.queue.findFirst({
    where: { queueDate: { gte: startOfDay(), lte: endOfDay() } },
    orderBy: { queueNumber: 'desc' },
  });
  let next = 1;
  if (lastQueue) next = parseInt(lastQueue.queueNumber.slice(1), 10) + 1;
  return `A${String(next).padStart(3, '0')}`;
};

const createQueueForRegistration = async (registrationId, tx) => {
  const client = tx || prisma;
  const queueNumber = await generateQueueNumber(tx);
  return client.queue.create({ data: { registrationId, queueNumber } });
};

const createManualQueue = async (registrationId) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { queue: true },
  });
  if (!registration) throw new AppError('Registrasi tidak ditemukan', 404);
  if (registration.queue) throw new AppError('Registrasi ini sudah memiliki antrean', 409);
  return createQueueForRegistration(registrationId);
};

const listQueues = async ({ date, poliId, status }) => {
  const where = {
    queueDate: { gte: startOfDay(date), lte: endOfDay(date) },
  };
  if (status) where.status = status;
  if (poliId) where.registration = { poliId };

  return prisma.queue.findMany({
    where,
    include: {
      registration: {
        include: {
          patient: true,
          doctor: { include: { user: { select: { id: true, name: true } } } },
          poli: true,
        },
      },
    },
    orderBy: { queueNumber: 'asc' },
  });
};

const getQueueById = async (id) => {
  const queue = await prisma.queue.findUnique({
    where: { id },
    include: { registration: { include: { patient: true, doctor: true, poli: true } } },
  });
  if (!queue) throw new AppError('Antrean tidak ditemukan', 404);
  return queue;
};

const callQueue = async (id) => {
  const queue = await getQueueById(id);
  const poliId = queue.registration.poliId;

  const alreadyCalled = await prisma.queue.findFirst({
    where: { status: 'CALLED', registration: { poliId }, id: { not: id } },
  });
  if (alreadyCalled) {
    throw new AppError('Masih ada antrean lain yang sedang dipanggil di poli ini', 409);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.queue.update({
      where: { id },
      data: { status: 'CALLED', calledAt: new Date() },
    });

    if (queue.registration && queue.registration.status === 'MENUNGGU') {
      await tx.registration.update({
        where: { id: queue.registrationId },
        data: { status: 'CHECK_IN' },
      });
    }

    return updated;
  });
};

const updateQueueStatus = async (id, status) => {
  const queue = await getQueueById(id);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.queue.update({ where: { id }, data: { status } });

    if (queue.registration) {
      if (status === 'IN_PROGRESS' && ['MENUNGGU', 'CHECK_IN'].includes(queue.registration.status)) {
        await tx.registration.update({
          where: { id: queue.registrationId },
          data: { status: 'PEMERIKSAAN' },
        });
      } else if (status === 'DONE' && queue.registration.status !== 'SELESAI') {
        await tx.registration.update({
          where: { id: queue.registrationId },
          data: { status: 'SELESAI' },
        });
      }
    }

    return updated;
  });
};

module.exports = {
  generateQueueNumber,
  createQueueForRegistration,
  createManualQueue,
  listQueues,
  getQueueById,
  callQueue,
  updateQueueStatus,
};
