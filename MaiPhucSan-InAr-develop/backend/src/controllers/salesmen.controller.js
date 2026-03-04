/**
 * Salesmen controller.
 * MVP_FR1: create/read master data.
 * M_FR5:   sync from HR system.
 */
const Joi = require('joi');
const { Salesman } = require('../models/salesman.model');
const { SocialPerformanceRecord } = require('../models/social-performance.model');
const { OrderEvaluationRecord } = require('../models/order-evaluation.model');
const { computeTotalsAsync } = require('../services/bonus.service');
const { OrangeHRMService } = require('../services/orangehrm.service');

const createSchema = Joi.object({
  employeeId:       Joi.string().min(1).max(50).required(),  // relaxed — duplicate check returns 409
  name:             Joi.string().min(1).max(200).required(),
  department:       Joi.string().min(1).max(200).required(),
  performanceYear:  Joi.number().integer().min(2000).max(2100).optional(),
  yearOfPerformance:Joi.number().integer().min(2000).max(2100).optional(), // Postman alias
  orangeHrmId:      Joi.string().allow(null, '').optional()
});

const patchSchema = Joi.object({
  name:            Joi.string().min(1).max(200).optional(),
  department:      Joi.string().min(1).max(200).optional(),
  performanceYear: Joi.number().integer().min(2000).max(2100).optional()
}).min(1);

function nowYear() { return new Date().getFullYear(); }

// ─── 1-6  List all salesmen ───────────────────────────────────────────────────
exports.list = async (_req, res, next) => {
  try {
    const items = await Salesman.find().sort({ employeeId: 1 }).lean().exec();
    return res.json(items);
  } catch (err) {
    return next(err);
  }
};

// ─── 1-7  Get single salesman ─────────────────────────────────────────────────
exports.getByEmployeeId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const item = await Salesman.findOne({ employeeId }).lean().exec();
    if (!item) return res.status(404).json({ error: 'Salesman not found' });
    return res.json(item);
  } catch (err) {
    return next(err);
  }
};

// ─── 1-5  Create salesman ─────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Normalize yearOfPerformance -> performanceYear
    if (!value.performanceYear && value.yearOfPerformance) {
      value.performanceYear = value.yearOfPerformance;
    }
    if (!value.performanceYear) {
      value.performanceYear = new Date().getFullYear();
    }
    delete value.yearOfPerformance;

    const created = await Salesman.create(value);
    return res.status(201).json(created.toObject());
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'EmployeeId already exists' });
    return next(err);
  }
};

// ─── 3-12  Patch salesman ─────────────────────────────────────────────────────
exports.patch = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { error, value } = patchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const updated = await Salesman.findOneAndUpdate({ employeeId }, { $set: value }, { new: true })
      .lean().exec();

    if (!updated) return res.status(404).json({ error: 'Salesman not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// ─── 2-6  Sync from HR system ─────────────────────────────────────────────────
exports.syncFromOrangeHrm = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    let upsert;
    try {
      const orange = new OrangeHRMService();
      const master = await orange.fetchSalesmanMasterData(employeeId);
      upsert = await Salesman.findOneAndUpdate(
        { employeeId },
        { $set: { employeeId, name: master.name, department: master.department, performanceYear: year, orangeHrmId: master.orangeHrmId || null } },
        { upsert: true, new: true }
      ).lean();
    } catch (_) {
      // HR system unavailable — return existing local record if present
      upsert = await Salesman.findOne({ employeeId }).lean().exec();
      if (!upsert) return res.status(503).json({ error: 'HR system unavailable and no local record found' });
    }

    return res.json({
      employeeId:      upsert.employeeId,
      name:            upsert.name,
      department:      upsert.department,
      performanceYear: upsert.performanceYear,
      source:          'hr-system'
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 3-5  Consolidated — all salesmen ────────────────────────────────────────
exports.listConsolidated = async (req, res, next) => {
  try {
    const year = Number(req.query.year || nowYear());
    const salesmen = await Salesman.find().sort({ employeeId: 1 }).lean().exec();

    const items = await Promise.all(salesmen.map(async s => {
      const [social, orders] = await Promise.all([
        SocialPerformanceRecord.find({ salesmanEmployeeId: s.employeeId, year }).lean().exec(),
        OrderEvaluationRecord.find({ salesmanEmployeeId: s.employeeId, year }).lean().exec()
      ]);
      const totals = await computeTotalsAsync(social, orders);
      return {
        employeeId:  s.employeeId,
        name:        s.name,
        department:  s.department,
        year,
        socialTotal: totals.socialTotalEur,
        ordersTotal: totals.ordersTotalEur,
        totalBonus:  totals.totalBonusEur
      };
    }));

    return res.json(items);
  } catch (err) {
    return next(err);
  }
};

// ─── 3-4  Consolidated — single salesman ─────────────────────────────────────
exports.getConsolidated = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const s = await Salesman.findOne({ employeeId }).lean().exec();
    if (!s) return res.status(404).json({ error: 'Salesman not found' });

    const [social, orders] = await Promise.all([
      SocialPerformanceRecord.find({ salesmanEmployeeId: employeeId, year }).lean().exec(),
      OrderEvaluationRecord.find({ salesmanEmployeeId: employeeId, year }).lean().exec()
    ]);
    const totals = await computeTotalsAsync(social, orders);

    return res.json({
      employeeId:  s.employeeId,
      name:        s.name,
      department:  s.department,
      year,
      socialTotal: totals.socialTotalEur,
      ordersTotal: totals.ordersTotalEur,
      totalBonus:  totals.totalBonusEur
    });
  } catch (err) {
    return next(err);
  }
};
