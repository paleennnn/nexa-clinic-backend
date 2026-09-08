/**
 * Middleware validasi generik pakai Zod.
 * Default validasi req.body; bisa dipakai untuk query/params juga.
 *
 * Pemakaian: router.post('/x', validate(createXSchema), controller.create)
 *            router.get('/x', validate(listXQuerySchema, 'query'), controller.list)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    // result.error adalah instance ZodError -> ditangkap errorHandler global
    return next(result.error);
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
