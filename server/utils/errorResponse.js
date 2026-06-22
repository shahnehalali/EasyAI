// Throw `new ErrorResponse(message, status)` anywhere; errorHandler formats the reply.
class ErrorResponse extends Error {
  constructor(message, status = 500, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ErrorResponse';
  }
}

module.exports = ErrorResponse;
