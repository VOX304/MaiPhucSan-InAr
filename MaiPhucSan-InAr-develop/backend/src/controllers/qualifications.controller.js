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
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').optional(),
  storeInOrangeHrm: Joi.boolean().default(false)
});

exports.list = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const year = req.query.year ? Number(req.query.year) : undefined;
    const q = { salesmanEmployeeId: employeeId };
    if (year) q.year = year;

    const items = await Qualification.find(q).sort({ year: -1, title: 1 }).lean().exec();
    return res.json({ data: items });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const created = await Qualification.create({
      salesmanEmployeeId: employeeId,
      year: value.year,
      title: value.title,
      description: value.description || '',
      createdBy: req.user.username
    });

    if (value.storeInOrangeHrm) {
      try {
        const orange = new OrangeHRMService();
        await orange.storeQualification(employeeId, value.year, {
          title: value.title,
          description: value.description || ''
        });

        await Qualification.findByIdAndUpdate(created._id, {
          $set: { storedInOrangeHrmAt: new Date() }
        }).exec();
      } catch (_err) {
        return res.status(201).json({
          id: created._id,
          message: 'Qualification created locally, but could not be stored in OrangeHRM.'
        });
      }
    }

    return res.status(201).json({ id: created._id, message: 'Qualification created' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Qualification already exists' });
    return next(err);
  }
};
