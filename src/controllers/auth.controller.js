const authService = require('../services/auth.service');
const { success } = require('../utils/response');

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return success(res, result, 'Login berhasil');
};

const logout = async (req, res) => {
  // Stateless JWT (sesuai PRD §6.1): tidak ada state di server, client cukup hapus token.
  return success(res, {}, 'Logout berhasil');
};

const me = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return success(res, user, 'OK');
};

module.exports = { login, logout, me };
