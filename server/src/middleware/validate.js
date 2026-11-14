/**
 * Validates req.body / req.query / req.params against Zod schemas and replaces them with the
 * parsed (trimmed, coerced, unknown-keys-stripped) values. Controllers can then trust their input.
 * Usage: router.post('/', validate({ body: createProductSchema }), controller)
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) req[key] = schemas[key].parse(req[key]);
    }
    next();
  } catch (err) {
    next(err); // ZodError is formatted by errorHandler
  }
};
