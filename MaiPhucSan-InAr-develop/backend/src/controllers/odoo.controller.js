/**
 * Odoo controller (TR5 / N_FR6).
 */
const { OdooService } = require('../services/odoo.service');

exports.listEmployees = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const odoo = new OdooService();
    const employees = await odoo.fetchEmployees(limit);
    return res.json({ data: employees });
  } catch (err) {
    return next(err);
  }
};
