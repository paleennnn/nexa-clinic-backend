const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const createPrescription = async (data) => {
  const { medicalRecordId, items } = data;

  const medicalRecord = await prisma.medicalRecord.findUnique({
    where: { id: medicalRecordId },
    include: { prescription: true },
  });
  if (!medicalRecord) throw new AppError('Rekam medis tidak ditemukan', 404);
  if (medicalRecord.prescription) throw new AppError('Rekam medis ini sudah memiliki resep', 409);

  return prisma.$transaction(async (tx) => {
    const prescription = await tx.prescription.create({ data: { medicalRecordId } });
    await tx.prescriptionItem.createMany({
      data: items.map((it) => ({ prescriptionId: prescription.id, ...it })),
    });
    return tx.prescription.findUnique({ where: { id: prescription.id }, include: { items: true } });
  });
};

const getPrescriptionById = async (id) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      items: true,
      medicalRecord: {
        include: { patient: true, doctor: { include: { user: { select: { id: true, name: true } } } } },
      },
    },
  });
  if (!prescription) throw new AppError('Resep tidak ditemukan', 404);
  return prescription;
};

module.exports = { createPrescription, getPrescriptionById };
