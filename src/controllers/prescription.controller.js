const prescriptionService = require('../services/prescription.service');
const { success } = require('../utils/response');

const create = async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.body);
  return success(res, prescription, 'Resep berhasil ditambahkan', 201);
};

const detail = async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);
  return success(res, prescription, 'OK');
};

module.exports = { create, detail };
