const logger = require('../utils/logger');
const ErrorResponse = require('../utils/errorResponse');

// Final error middleware. Formats ErrorResponse (and unexpected errors) as JSON.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Prisma known errors -> friendlier messages
  if (err.code === 'P2002') {
    status = 409;
    message = 'A record with that value already exists';
  }
  if (err.code === 'P2025') {
    status = 404;
    message = 'Record not found';
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} ->`, err.message, err.stack);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${status}`, message);
  }

  res.status(status).json({
    error: { message, ...(details ? { details } : {}) },
  });
};

module.exports.ErrorResponse = ErrorResponse;
