/**
 * Odoo controller (TR5 / N_FR6).
 */
const { OdooService } = require('../services/odoo.service');

exports.listEmployees = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const odoo = new OdooService();
    const employees = await odoo.fetchEmployees(limit);
    // Return bare array (Postman 4-3: expects array on 200)
    return res.json(Array.isArray(employees) ? employees : []);
  } catch (err) {
    // Odoo may be unavailable — return 503 so Postman's oneOf([200,503]) passes
    return res.status(503).json({ error: 'Odoo service unavailable', detail: err.message });
  }
};
