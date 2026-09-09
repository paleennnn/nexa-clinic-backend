const { z } = require('zod');

const actionSchema = z.object({
  actionName: z.string().min(1, 'Nama tindakan wajib diisi'),
  notes: z.string().optional(),
});

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, 'Nama obat wajib diisi'),
  dosage: z.string().min(1, 'Dosis wajib diisi'),
  quantity: z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  instructions: z.string().optional(),
});

const createMedicalRecordSchema = z.object({
  registrationId: z.string().uuid('registrationId tidak valid'),
  subjective: z.string().min(1, 'Keluhan pasien wajib diisi'),
  bloodPressure: z.string().min(1, 'Tekanan darah wajib diisi'),
  temperature: z.coerce.number().positive('Suhu tubuh tidak valid'),
  weight: z.coerce.number().positive('Berat badan tidak valid'),
  height: z.coerce.number().positive('Tinggi badan tidak valid'),
  diagnosis: z.string().min(1, 'Diagnosa wajib diisi'),
  therapyPlan: z.string().min(1, 'Rencana terapi wajib diisi'),
  actions: z.array(actionSchema).optional().default([]),
  prescriptionItems: z.array(prescriptionItemSchema).optional().default([]),
});

const patientIdParamSchema = z.object({
  patientId: z.string().uuid('patientId tidak valid'),
});

module.exports = { createMedicalRecordSchema, patientIdParamSchema };
