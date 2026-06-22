const ErrorResponse = require('../utils/errorResponse');

// validate(schema, source) -> middleware that parses req[source] with a Zod schema.
// On success replaces req[source] with the parsed value; on failure throws 422.
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(new ErrorResponse('Validation failed', 422, details));
  }
  req[source] = result.data;
  return next();
};
