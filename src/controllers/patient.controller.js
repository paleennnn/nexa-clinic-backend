const patientService = require('../services/patient.service');
const { success } = require('../utils/response');

const create = async (req, res) => {
  const patient = await patientService.createPatient(req.body);
  return success(res, patient, 'Pasien berhasil ditambahkan', 201);
};

const list = async (req, res) => {
  const result = await patientService.listPatients(req.query);
  return success(res, result, 'OK');
};

const detail = async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);
  return success(res, patient, 'OK');
};

const update = async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  return success(res, patient, 'Pasien berhasil diperbarui');
};

const remove = async (req, res) => {
  await patientService.deletePatient(req.params.id);
  return success(res, {}, 'Pasien berhasil dihapus');
};

module.exports = { create, list, detail, update, remove };
