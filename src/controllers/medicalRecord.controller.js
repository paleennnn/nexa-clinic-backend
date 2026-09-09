const medicalRecordService = require('../services/medicalRecord.service');
const { success } = require('../utils/response');

const create = async (req, res) => {
  const record = await medicalRecordService.createMedicalRecord(req.body, req.user.id);
  return success(res, record, 'Pemeriksaan berhasil disimpan', 201);
};

const historyByPatient = async (req, res) => {
  const records = await medicalRecordService.getMedicalRecordsByPatient(req.params.patientId);
  return success(res, records, 'OK');
};

const list = async (req, res) => {
  const result = await medicalRecordService.listMedicalRecords(req.query, req.user);
  return success(res, result, 'OK');
};

module.exports = { create, historyByPatient, list };
