const prisma = require('../config/prisma');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const getSummary = async () => {
  const range = { gte: startOfToday(), lte: endOfToday() };

  const [totalPatients, newPatientsToday, totalQueuesToday, waitingToday, doneToday] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.patient.count({ where: { isActive: true, createdAt: range } }),
    prisma.queue.count({ where: { queueDate: range } }),
    prisma.queue.count({ where: { status: 'WAITING', queueDate: range } }),
    prisma.queue.count({ where: { status: 'DONE', queueDate: range } }),
  ]);

  return { totalPatients, newPatientsToday, totalQueuesToday, waitingToday, doneToday };
};

module.exports = { getSummary };
