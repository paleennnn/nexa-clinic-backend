const { z } = require('zod');

const nikRegex = /^\d{16}$/;

const createPatientSchema = z.object({
  nik: z.string().regex(nikRegex, 'NIK harus berupa 16 digit angka'),
  name: z.string().min(1, 'Nama wajib diisi'),
  gender: z.enum(['L', 'P'], { errorMap: () => ({ message: "Jenis kelamin harus 'L' atau 'P'" }) }),
  birthDate: z.coerce.date({ errorMap: () => ({ message: 'Tanggal lahir tidak valid' }) }),
  phone: z.string().min(6, 'Nomor telepon tidak valid').max(20),
  address: z.string().min(1, 'Alamat wajib diisi'),
});

// Update: semua field opsional (partial update), NIK tetap divalidasi formatnya kalau dikirim
const updatePatientSchema = createPatientSchema.partial();

const listPatientQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  listPatientQuerySchema,
  idParamSchema,
};
