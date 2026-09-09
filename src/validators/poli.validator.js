const { z } = require('zod');

const createPoliSchema = z.object({
  name: z.string().min(1, 'Nama poli wajib diisi'),
  code: z.string().min(1, 'Kode poli wajib diisi').max(20),
});

const updatePoliSchema = createPoliSchema.partial();

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

module.exports = { createPoliSchema, updatePoliSchema, idParamSchema };
