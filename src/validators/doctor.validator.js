const { z } = require('zod');

const createDoctorSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  poliId: z.string().uuid('poliId tidak valid'),
  sipNumber: z.string().optional(),
  specialization: z.string().optional(),
});

const updateDoctorSchema = z.object({
  name: z.string().min(1).optional(),
  poliId: z.string().uuid('poliId tidak valid').optional(),
  sipNumber: z.string().optional(),
  specialization: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

module.exports = { createDoctorSchema, updateDoctorSchema, idParamSchema };
