/**
 * Helper response format standar - WAJIB dipakai di semua controller
 * agar seluruh endpoint konsisten sesuai kontrak di TECHNICAL_ASSIGNMENT & PRD §7.1
 */

const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const error = (res, message = 'Error', errors = {}, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { success, error };
