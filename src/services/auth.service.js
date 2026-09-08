const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Pesan generik untuk email tidak ada maupun password salah -> tidak bocorkan mana yang salah
  if (!user || !user.isActive) {
    throw new AppError('Email atau password salah', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Email atau password salah', 401);
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      doctor: { select: { id: true, poliId: true, sipNumber: true, specialization: true } },
    },
  });
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
};

module.exports = { login, getMe };
