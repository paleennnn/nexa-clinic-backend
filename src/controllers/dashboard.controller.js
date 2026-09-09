const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');

const summary = async (req, res) => {
  const data = await dashboardService.getSummary();
  return success(res, data, 'OK');
};

module.exports = { summary };
