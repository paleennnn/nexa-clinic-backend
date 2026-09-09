const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const createMedicalRecord = async (data, doctorUserId) => {
  const {
    registrationId,
    subjective,
    bloodPressure,
    temperature,
    weight,
    height,
    diagnosis,
    therapyPlan,
    actions,
    prescriptionItems,
  } = data;

  const doctorProfile = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
  if (!doctorProfile) throw new AppError('Akun ini tidak memiliki profil dokter', 403);

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { medicalRecord: true },
  });
  if (!registration) throw new AppError('Registrasi tidak ditemukan', 404);
  if (registration.doctorId !== doctorProfile.id) {
    throw new AppError('Anda tidak berwenang mengisi pemeriksaan untuk registrasi ini', 403);
  }
  if (registration.medicalRecord) {
    throw new AppError('Registrasi ini sudah memiliki rekam medis', 409);
  }
  if (registration.status !== 'PEMERIKSAAN') {
    throw new AppError('Registrasi belum berada pada tahap pemeriksaan', 400);
  }

  return prisma.$transaction(async (tx) => {
    const medicalRecord = await tx.medicalRecord.create({
      data: {
        registrationId,
        patientId: registration.patientId,
        doctorId: registration.doctorId,
        subjective,
        bloodPressure,
        temperature,
        weight,
        height,
        diagnosis,
        therapyPlan,
      },
    });

    if (actions.length) {
      await tx.medicalAction.createMany({
        data: actions.map((a) => ({ medicalRecordId: medicalRecord.id, actionName: a.actionName, notes: a.notes })),
      });
    }

    if (prescriptionItems.length) {
      const prescription = await tx.prescription.create({ data: { medicalRecordId: medicalRecord.id } });
      await tx.prescriptionItem.createMany({
        data: prescriptionItems.map((it) => ({
          prescriptionId: prescription.id,
          medicineName: it.medicineName,
          dosage: it.dosage,
          quantity: it.quantity,
          instructions: it.instructions,
        })),
      });
    }

    await tx.registration.update({ where: { id: registrationId }, data: { status: 'SELESAI' } });
    await tx.queue.update({ where: { registrationId }, data: { status: 'DONE' } });

    return tx.medicalRecord.findUnique({
      where: { id: medicalRecord.id },
      include: { actions: true, prescription: { include: { items: true } } },
    });
  });
};

const getMedicalRecordsByPatient = async (patientId) => {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new AppError('Pasien tidak ditemukan', 404);

  return prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      doctor: { include: { user: { select: { id: true, name: true } } } },
      actions: true,
      prescription: { include: { items: true } },
      registration: { select: { id: true, visitDate: true, chiefComplaint: true } },
    },
  });
};

const listMedicalRecords = async (query, user) => {
  const { search, date, poliId, page = 1, limit = 10 } = query;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where = {};

  // Role scoping: if user is DOKTER, limit to their own doctor profile
  if (user.role === 'DOKTER') {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
    if (!doctor) {
      throw new AppError('Profil dokter tidak ditemukan', 403);
    }
    where.doctorId = doctor.id;
  } else if (poliId) {
    where.doctor = { poliId };
  }

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
  }

  if (search) {
    where.OR = [
      { patient: { name: { contains: search, mode: 'insensitive' } } },
      { patient: { noRm: { contains: search, mode: 'insensitive' } } },
      { diagnosis: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.medicalRecord.count({ where }),
    prisma.medicalRecord.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { id: true, name: true } },
            poli: true,
          },
        },
        registration: {
          include: {
            poli: true,
            queue: true,
          },
        },
        actions: true,
        prescription: {
          include: { items: true },
        },
      },
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

module.exports = { createMedicalRecord, getMedicalRecordsByPatient, listMedicalRecords };
