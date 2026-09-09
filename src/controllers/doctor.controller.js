const doctorService = require('../services/doctor.service');
const { success } = require('../utils/response');

const create = async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  return success(res, doctor, 'Dokter berhasil ditambahkan', 201);
};

const list = async (req, res) => {
  const data = await doctorService.listDoctors();
  return success(res, data, 'OK');
};

const detail = async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  return success(res, doctor, 'OK');
};

const update = async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  return success(res, doctor, 'Dokter berhasil diperbarui');
};

const remove = async (req, res) => {
  await doctorService.deleteDoctor(req.params.id);
  return success(res, {}, 'Dokter berhasil dinonaktifkan');
};

module.exports = { create, list, detail, update, remove };
