// src/controllers/external.controller.js
const salesmanService = require("../services/salesman.service");
const { listAccounts } = require("../integrations/opencrx.client");

exports.getOrangeSalesmen = async (req, res, next) => {
  try {
    const result = await salesmanService.getSalesmenFromOrangeHRM();
    res.json({ count: result.length, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getOpencrxAccounts = async (req, res, next) => {
  try {
    const result = await listAccounts();
    res.json({ count: result.length, data: result });
  } catch (err) {
    next(err);
  }
};
