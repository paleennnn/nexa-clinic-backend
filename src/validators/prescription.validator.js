const { z } = require('zod');

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, 'Nama obat wajib diisi'),
  dosage: z.string().min(1, 'Dosis wajib diisi'),
  quantity: z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  instructions: z.string().optional(),
});

const createPrescriptionSchema = z.object({
  medicalRecordId: z.string().uuid('medicalRecordId tidak valid'),
  items: z.array(prescriptionItemSchema).min(1, 'Minimal 1 item resep'),
});

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

module.exports = { createPrescriptionSchema, idParamSchema };
