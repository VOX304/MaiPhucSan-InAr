/**
 * Social performance controller.
 *
 * MVP_FR2: create/read social performance evaluation records.
 * N_FR5: HR assistant can update target/actual values.
 */
const Joi = require('joi');
const { SocialPerformanceRecord } = require('../models/social-performance.model');
const { computeSocialRecordBonus, computeSocialTotal } = require('../services/bonus.service');

const createSchema = Joi.object({
  // Salesman employee IDs follow the 'E' + digits format (e.g. E1001)
  salesmanEmployeeId: Joi.string().pattern(/^E\d+$/).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  criterionKey: Joi.string().min(1).max(100).required(),
  criterionName: Joi.string().min(1).max(200).required(),
  targetValue: Joi.number().min(0).required(),
  actualValue: Joi.number().min(0).optional(),
  weight: Joi.number().min(0).max(1).required(),
  supervisorRating: Joi.number().min(1).max(5).optional(),
  peerRating: Joi.number().min(1).max(5).optional(),
  remark: Joi.string().allow('').optional()
});

const patchSchema = Joi.object({
  targetValue: Joi.number().min(0).optional(),
  actualValue: Joi.number().min(0).optional(),
  weight: Joi.number().min(0).max(1).optional(),
  supervisorRating: Joi.number().min(1).max(5).optional(),
  peerRating: Joi.number().min(1).max(5).optional(),
  remark: Joi.string().allow('').optional()
}).min(1);

exports.listForSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || new Date().getFullYear());

    const records = await SocialPerformanceRecord.find({
      salesmanEmployeeId: employeeId,
      year
    })
      .sort({ criterionKey: 1 })
      .lean()
      .exec();

    const total = computeSocialTotal(records).total;

    return res.json({ data: { records, socialTotalEur: total } });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { computedBonusEur } = computeSocialRecordBonus(value);

    const created = await SocialPerformanceRecord.create({
      ...value,
      computedBonusEur,
      createdBy: req.user.username
    });

    return res.status(201).json({ id: created._id, message: 'Record created', bonusEur: computedBonusEur });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: 'Record already exists for this criterion/year/salesman' });
    }
    return next(err);
  }
};

exports.patch = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { error, value } = patchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const existing = await SocialPerformanceRecord.findById(recordId).exec();
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    Object.assign(existing, value);
    existing.updatedBy = req.user.username;

    const { computedBonusEur } = computeSocialRecordBonus(existing.toObject());
    existing.computedBonusEur = computedBonusEur;

    await existing.save();

    return res.json({ data: existing.toObject() });
  } catch (err) {
    return next(err);
  }
};
