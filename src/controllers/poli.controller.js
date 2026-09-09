const poliService = require('../services/poli.service');
const { success } = require('../utils/response');

const create = async (req, res) => {
  const poli = await poliService.createPoli(req.body);
  return success(res, poli, 'Poli berhasil ditambahkan', 201);
};

const list = async (req, res) => {
  const data = await poliService.listPoli();
  return success(res, data, 'OK');
};

const detail = async (req, res) => {
  const poli = await poliService.getPoliById(req.params.id);
  return success(res, poli, 'OK');
};

const update = async (req, res) => {
  const poli = await poliService.updatePoli(req.params.id, req.body);
  return success(res, poli, 'Poli berhasil diperbarui');
};

const remove = async (req, res) => {
  await poliService.deletePoli(req.params.id);
  return success(res, {}, 'Poli berhasil dihapus');
};

module.exports = { create, list, detail, update, remove };
