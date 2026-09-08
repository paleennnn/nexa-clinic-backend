const AppError = require('../utils/AppError');
const { error } = require('../utils/response');

/**
 * Dipasang PALING TERAKHIR (setelah semua route) di app.js.
 * Menangkap route yang tidak match sama sekali -> 404.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route tidak ditemukan: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Global error handler (4 argumen wajib agar dikenali Express sebagai error middleware).
 * Dipasang PALING TERAKHIR, setelah `notFound`.
 */
const errorHandler = (err, req, res, next) => {
  // 1) Error terkontrol yang sengaja dilempar dari service/controller
  if (err instanceof AppError) {
    return error(res, err.message, err.errors, err.statusCode);
  }

  // 2) Validasi Zod (dari middleware validate)
  if (err.name === 'ZodError') {
    const formatted = err.errors.reduce((acc, curr) => {
      const key = curr.path.join('.') || 'value';
      acc[key] = curr.message;
      return acc;
    }, {});
    return error(res, 'Validation Error', formatted, 400);
  }

  // 3) Error dari Prisma (deteksi via err.code, tanpa perlu import class Prisma)
  if (err.code === 'P2002') {
    // Unique constraint violation, mis. NIK/email/no_rm/code duplikat
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : (err.meta?.target || 'field');
    return error(res, `Data duplikat pada field: ${target}`, { [target]: 'Sudah digunakan' }, 409);
  }
  if (err.code === 'P2025') {
    // Record yang mau diupdate/delete/relasikan tidak ditemukan
    return error(res, 'Data tidak ditemukan', {}, 404);
  }
  if (err.code === 'P2003') {
    // Foreign key constraint gagal, mis. poliId/doctorId yang direferensikan tidak ada
    return error(res, 'Referensi data tidak valid', {}, 400);
  }

  // 4) Error JWT
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Token tidak valid', {}, 401);
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 'Sesi sudah kadaluarsa, silakan login kembali', {}, 401);
  }

  // 5) Fallback: error tak terduga -> log detail di server, jangan bocorkan ke client
  console.error('[UNEXPECTED ERROR]', err);
  return error(res, 'Terjadi kesalahan pada server', {}, 500);
};

module.exports = { notFound, errorHandler };
