const registrationService = require('../services/registration.service');
const { success } = require('../utils/response');

const create = async (req, res) => {
  const registration = await registrationService.createRegistration(req.body, req.user.id);
  return success(res, registration, 'Registrasi berhasil dibuat', 201);
};

const list = async (req, res) => {
  const result = await registrationService.listRegistrations(req.query);
  return success(res, result, 'OK');
};

const detail = async (req, res) => {
  const registration = await registrationService.getRegistrationById(req.params.id);
  return success(res, registration, 'OK');
};

const update = async (req, res) => {
  const registration = await registrationService.updateRegistration(req.params.id, req.body, req.user.role);
  return success(res, registration, 'Registrasi berhasil diperbarui');
};

module.exports = { create, list, detail, update };
