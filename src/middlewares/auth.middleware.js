const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const prisma = require('../config/prisma');

/**
 * Verifikasi JWT dari header Authorization: Bearer <token>.
 * Sukses -> attach req.user = { id, role, name, email }.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Token tidak ditemukan, silakan login', 401);
  }

  const token = header.split(' ')[1];
  // jwt.verify melempar JsonWebTokenError / TokenExpiredError -> ditangkap errorHandler global
  const decoded = verifyToken(token);

  // Cek ulang ke DB: antisipasi user dinonaktifkan setelah token terbit
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.isActive) {
    throw new AppError('User tidak ditemukan atau nonaktif', 401);
  }

  req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
  next();
};

/**
 * Role guard. Pakai setelah `authenticate`.
 * Pemakaian: router.get('/x', authenticate, authorize('ADMIN', 'DOKTER'), controller.x)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new AppError('Belum terautentikasi', 401);
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw new AppError('Anda tidak memiliki akses untuk aksi ini', 403);
  }
  next();
};

module.exports = { authenticate, authorize };
