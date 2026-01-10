/**
 * Salesmen controller (MongoDB-backed).
 *
 * MVP_FR1: create/read master data.
 * M_FR5: can sync / read from OrangeHRM.
 *
 * Additionally:
 * - consolidated views (salesman + records + computed totals) used by the cockpit UI.
 */
const Joi = require('joi');
const { Salesman } = require('../models/salesman.model');
const { SocialPerformanceRecord } = require('../models/social-performance.model');
const { OrderEvaluationRecord } = require('../models/order-evaluation.model');
const { computeTotals } = require('../services/bonus.service');
const { OrangeHRMService } = require('../services/orangehrm.service');

const createSchema = Joi.object({
  employeeId: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(200).required(),
  department: Joi.string().min(1).max(200).required(),
  performanceYear: Joi.number().integer().min(2000).max(2100).required(),
  orangeHrmId: Joi.string().allow(null, '').optional()
});

const patchSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  department: Joi.string().min(1).max(200).optional(),
  performanceYear: Joi.number().integer().min(2000).max(2100).optional()
}).min(1);

function nowYear() {
  return new Date().getFullYear();
}

exports.list = async (_req, res, next) => {
  try {
    const items = await Salesman.find().sort({ employeeId: 1 }).lean().exec();
    return res.json({ data: items });
  } catch (err) {
    return next(err);
  }
};

exports.getByEmployeeId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const item = await Salesman.findOne({ employeeId }).lean().exec();
    if (!item) return res.status(404).json({ error: 'Salesman not found' });
    return res.json({ data: item });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const created = await Salesman.create(value);
    return res.status(201).json({ data: created });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'EmployeeId already exists' });
    return next(err);
  }
};

exports.patch = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { error, value } = patchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const updated = await Salesman.findOneAndUpdate({ employeeId }, { $set: value }, { new: true })
      .lean()
      .exec();

    if (!updated) return res.status(404).json({ error: 'Salesman not found' });

    return res.json({ data: updated });
  } catch (err) {
    return next(err);
  }
};

/**
 * Fetch master data from OrangeHRM and upsert into Mongo.
 */
exports.syncFromOrangeHrm = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const orange = new OrangeHRMService();
    const master = await orange.fetchSalesmanMasterData(employeeId);

    const upsert = await Salesman.findOneAndUpdate(
      { employeeId },
      {
        $set: {
          employeeId,
          name: master.name,
          department: master.department,
          performanceYear: year,
          orangeHrmId: master.orangeHrmId || null
        }
      },
      { upsert: true, new: true }
    ).lean();

    return res.json({ data: upsert, source: 'orangehrm' });
  } catch (err) {
    return next(err);
  }
};

/**
 * Consolidated view for all salesmen (salesman + records + computed totals).
 */
exports.listConsolidated = async (req, res, next) => {
  try {
    const year = Number(req.query.year || nowYear());

    const salesmen = await Salesman.find().sort({ employeeId: 1 }).lean().exec();

    const items = [];
    for (const s of salesmen) {
      const social = await SocialPerformanceRecord.find({
        salesmanEmployeeId: s.employeeId,
        year
      })
        .lean()
        .exec();

      const orders = await OrderEvaluationRecord.find({
        salesmanEmployeeId: s.employeeId,
        year
      })
        .lean()
        .exec();

      const totals = computeTotals(social, orders);

      items.push({
        salesman: s,
        year,
        socialRecords: totals.socialRecords,
        orderRecords: totals.orderRecords,
        socialTotalEur: totals.socialTotalEur,
        ordersTotalEur: totals.ordersTotalEur,
        totalBonusEur: totals.totalBonusEur
      });
    }

    return res.json({ data: items });
  } catch (err) {
    return next(err);
  }
};

/**
 * Consolidated view for one salesman.
 */
exports.getConsolidated = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const s = await Salesman.findOne({ employeeId }).lean().exec();
    if (!s) return res.status(404).json({ error: 'Salesman not found' });

    const social = await SocialPerformanceRecord.find({
      salesmanEmployeeId: employeeId,
      year
    })
      .lean()
      .exec();

    const orders = await OrderEvaluationRecord.find({
      salesmanEmployeeId: employeeId,
      year
    })
      .lean()
      .exec();

    const totals = computeTotals(social, orders);

    return res.json({
      data: {
        salesman: s,
        year,
        socialRecords: totals.socialRecords,
        orderRecords: totals.orderRecords,
        socialTotalEur: totals.socialTotalEur,
        ordersTotalEur: totals.ordersTotalEur,
        totalBonusEur: totals.totalBonusEur
      }
    });
  } catch (err) {
    return next(err);
  }
};
