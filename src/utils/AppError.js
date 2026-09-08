/**
 * AppError - error terkontrol yang sengaja dilempar dari service/controller.
 * Dibedakan dari error tak terduga (bug/exception) lewat flag isOperational.
 *
 * Contoh pemakaian:
 *   throw new AppError('NIK sudah terdaftar', 409, { nik: 'Sudah digunakan' });
 */
class AppError extends Error {
  constructor(message = 'Error', statusCode = 400, errors = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
