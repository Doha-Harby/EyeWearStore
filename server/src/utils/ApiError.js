/**
 * An error we throw on purpose (bad input, not found, forbidden...). The error handler turns it
 * into a clean JSON response. Anything that is NOT an ApiError is treated as an unexpected bug.
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message Safe, user-facing message
   * @param {Record<string,string>} [errors] Optional field-level errors
   */
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.isOperational = true;
  }
  static badRequest = (m = 'Bad request', e) => new ApiError(400, m, e);
  static unauthorized = (m = 'Please sign in to continue') => new ApiError(401, m);
  static forbidden = (m = 'You do not have access to this resource') => new ApiError(403, m);
  static notFound = (m = 'Resource not found') => new ApiError(404, m);
  static conflict = (m = 'Conflict') => new ApiError(409, m);
}
