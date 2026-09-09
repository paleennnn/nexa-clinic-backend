const { z } = require('zod');

const paymentTypeEnum = z.enum(['UMUM', 'BPJS', 'ASURANSI'], {
  errorMap: () => ({ message: 'Jenis pembayaran harus UMUM, BPJS, atau ASURANSI' }),
});
const statusEnum = z.enum(['MENUNGGU', 'CHECK_IN', 'PEMERIKSAAN', 'SELESAI'], {
  errorMap: () => ({ message: 'Status registrasi tidak valid' }),
});

const createRegistrationSchema = z.object({
  patientId: z.string().uuid('patientId tidak valid'),
  doctorId: z.string().uuid('doctorId tidak valid'),
  poliId: z.string().uuid('poliId tidak valid'),
  visitDate: z.coerce.date({ errorMap: () => ({ message: 'Tanggal kunjungan tidak valid' }) }),
  paymentType: paymentTypeEnum,
  chiefComplaint: z.string().min(1, 'Keluhan awal wajib diisi'),
});

const updateRegistrationSchema = z.object({
  status: statusEnum.optional(),
  doctorId: z.string().uuid('doctorId tidak valid').optional(),
  poliId: z.string().uuid('poliId tidak valid').optional(),
  visitDate: z.coerce.date().optional(),
  paymentType: paymentTypeEnum.optional(),
  chiefComplaint: z.string().min(1).optional(),
});

const listRegistrationQuerySchema = z.object({
  date: z.string().optional(),
  status: statusEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

module.exports = {
  createRegistrationSchema,
  updateRegistrationSchema,
  listRegistrationQuerySchema,
  idParamSchema,
};
