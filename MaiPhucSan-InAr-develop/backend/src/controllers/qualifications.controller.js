/**
 * Qualifications controller.
 *
 * C_FR8: CEO creates qualifications.
 * C_FR9: Salesman sees qualifications.
 */
const Joi = require('joi');
const { Qualification } = require('../models/qualification.model');
const { OrangeHRMService } = require('../services/orangehrm.service');

const createSchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required(),
  // Accept both 'name' (Postman) and 'title' (internal)
  name: Joi.string().min(1).max(200).optional(),
  title: Joi.string().min(1).max(200).optional(),
  issuedBy: Joi.string().allow('').optional(),
  level: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  storeInOrangeHrm: Joi.boolean().default(false)
}).or('name', 'title');

exports.list = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const year = req.query.year ? Number(req.query.year) : undefined;
    const q = { salesmanEmployeeId: employeeId };
    if (year) q.year = year;

    const items = await Qualification.find(q).sort({ year: -1, title: 1 }).lean().exec();
    // Return flat array (Postman 3-10 expects bare array)
    return res.json(items);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Normalize: accept 'name' or 'title'
    const title = value.title || value.name;

    const created = await Qualification.create({
      salesmanEmployeeId: employeeId,
      year: value.year,
      title,
      description: value.description || value.issuedBy || value.level || '',
      createdBy: req.user.username
    });

    // Best-effort HR system store (non-fatal)
    try {
      const orange = new OrangeHRMService();
      await orange.storeQualification(employeeId, value.year, { title, description: created.description });
      await Qualification.findByIdAndUpdate(created._id, { $set: { storedInOrangeHrmAt: new Date() } }).exec();
    } catch (_) { /* HR system unavailable — qualification saved locally */ }

    return res.status(201).json({ id: created._id, name: title, title, year: value.year, message: 'Qualification created' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Qualification already exists' });
    return next(err);
  }
};
