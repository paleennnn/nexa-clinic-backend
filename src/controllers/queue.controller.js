const queueService = require('../services/queue.service');
const { success } = require('../utils/response');

const list = async (req, res) => {
  const data = await queueService.listQueues(req.query);
  return success(res, data, 'OK');
};

const create = async (req, res) => {
  const queue = await queueService.createManualQueue(req.body.registrationId);
  return success(res, queue, 'Antrean berhasil dibuat', 201);
};

const call = async (req, res) => {
  const queue = await queueService.callQueue(req.params.id);
  return success(res, queue, 'Antrean berhasil dipanggil');
};

const updateStatus = async (req, res) => {
  const queue = await queueService.updateQueueStatus(req.params.id, req.body.status);
  return success(res, queue, 'Status antrean berhasil diperbarui');
};

module.exports = { list, create, call, updateStatus };
