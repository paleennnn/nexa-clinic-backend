const { z } = require('zod');

const statusEnum = z.enum(['WAITING', 'CALLED', 'IN_PROGRESS', 'DONE', 'SKIPPED'], {
  errorMap: () => ({ message: 'Status antrean tidak valid' }),
});

const listQueueQuerySchema = z.object({
  date: z.string().optional(),
  poliId: z.string().uuid('poliId tidak valid').optional(),
  status: statusEnum.optional(),
});

const createQueueSchema = z.object({
  registrationId: z.string().uuid('registrationId tidak valid'),
});

const updateStatusSchema = z.object({
  status: statusEnum,
});

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

module.exports = { listQueueQuerySchema, createQueueSchema, updateStatusSchema, idParamSchema };
