/**
 * Social performance controller.
 * MVP_FR2: create/read social performance evaluation records.
 * N_FR5:   HR can update target/actual values.
 */
const Joi = require('joi');
const { SocialPerformanceRecord } = require('../models/social-performance.model');
const { computeSocialRecordBonus } = require('../services/bonus.service');

const createSchema = Joi.object({
  salesmanEmployeeId: Joi.string().pattern(/^E\d+$/).required(),
  year:               Joi.number().integer().min(2000).max(2100).required(),
  criterionKey:       Joi.string().min(1).max(100).required(),
  criterionName:      Joi.string().min(1).max(200).required(),
  targetValue:        Joi.number().min(0).required(),
  actualValue:        Joi.number().min(0).optional(),
  weight:             Joi.number().min(0).max(1).required(),
  supervisorRating:   Joi.number().min(1).max(5).optional(),
  peerRating:         Joi.number().min(1).max(5).optional(),
  remark:             Joi.string().allow('').optional()
});

const patchSchema = Joi.object({
  targetValue:      Joi.number().min(0).optional(),
  actualValue:      Joi.number().min(0).optional(),
  weight:           Joi.number().min(0).max(1).optional(),
  supervisorRating: Joi.number().min(1).max(5).optional(),
  peerRating:       Joi.number().min(1).max(5).optional(),
  remark:           Joi.string().allow('').optional()
}).min(1);

function formatRecord(r) {
  return {
    _id:          r._id,
    criterion:    r.criterionName || r.criterionKey,
    targetValue:  r.targetValue,
    actualValue:  r.actualValue,
    bonus:        r.computedBonusEur,
    remark:       r.remark || ''
  };
}

// ─── 1-9  List social performance records ────────────────────────────────────
exports.listForSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || new Date().getFullYear());

    const records = await SocialPerformanceRecord.find({ salesmanEmployeeId: employeeId, year })
      .sort({ criterionKey: 1 }).lean().exec();

    // Fall back to most recent year with data if this year has none
    if (records.length === 0) {
      const latest = await SocialPerformanceRecord.find({ salesmanEmployeeId: employeeId })
        .sort({ year: -1, criterionKey: 1 }).limit(20).lean().exec();
      return res.json(latest.map(formatRecord));
    }

    return res.json(records.map(formatRecord));
  } catch (err) {
    return next(err);
  }
};

// ─── 1-8  Create social performance record ───────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const body = req.body;

    // Postman format: { employeeId, year, criteria: [{name, targetValue, actualValue}] }
    if (body.criteria && Array.isArray(body.criteria)) {
      const salesmanEmployeeId = body.employeeId || body.salesmanEmployeeId;
      const year = body.year;

      if (!salesmanEmployeeId || !year) {
        return res.status(400).json({ error: '"employeeId" and "year" are required' });
      }

      const created = [];
      for (const c of body.criteria) {
        const record = {
          salesmanEmployeeId,
          year,
          criterionKey:     c.name,
          criterionName:    c.name,
          targetValue:      c.targetValue,
          actualValue:      c.actualValue ?? c.targetValue,
          weight:           c.weight ?? 1,
          supervisorRating: c.supervisorRating ?? 5,
          peerRating:       c.peerRating ?? 5,
          remark:           c.remark ?? '',
          createdBy:        req.user.username
        };
        const { computedBonusEur } = computeSocialRecordBonus(record);
        record.computedBonusEur = computedBonusEur;
        try {
          const doc = await SocialPerformanceRecord.create(record);
          created.push(doc);
        } catch (e) {
          if (e.code !== 11000) throw e;
        }
      }

      const totalBonus = created.reduce((sum, r) => sum + (r.computedBonusEur || 0), 0);

      // If every criterion was a duplicate, surface a 409
      if (created.length === 0) {
        return res.status(409).json({ error: 'All records already exist for this salesman/year' });
      }

      return res.status(201).json({
        _id:        created[0]._id,
        employeeId: salesmanEmployeeId,
        year,
        bonus:      totalBonus,
        records:    created.length
      });
    }

    // Flat-field format
    const { error, value } = createSchema.validate(body);
    if (error) return res.status(400).json({ error: error.message });

    const { computedBonusEur } = computeSocialRecordBonus(value);
    const created = await SocialPerformanceRecord.create({ ...value, computedBonusEur, createdBy: req.user.username });

    return res.status(201).json({ _id: created._id, bonus: computedBonusEur });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Record already exists for this criterion/year/salesman' });
    return next(err);
  }
};

// ─── 2-7  Update social performance record ───────────────────────────────────
exports.patch = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const body = req.body;

    // Postman 2-7 sends criteria array — find the record and apply the matching entry
    if (body.criteria && Array.isArray(body.criteria)) {
      const existing = await SocialPerformanceRecord.findById(recordId).exec();
      if (!existing) return res.status(404).json({ error: 'Record not found' });

      // Find the matching criterion by name, or use the first one
      const match = body.criteria.find(c => c.name === existing.criterionName) || body.criteria[0];
      if (match) {
        if (match.targetValue !== undefined) existing.targetValue = match.targetValue;
        if (match.actualValue !== undefined) existing.actualValue = match.actualValue;
      }
      existing.updatedBy = req.user.username;
      const { computedBonusEur } = computeSocialRecordBonus(existing.toObject());
      existing.computedBonusEur = computedBonusEur;
      await existing.save();
      return res.json(formatRecord(existing.toObject()));
    }

    // Flat-field format
    const { error, value } = patchSchema.validate(body);
    if (error) return res.status(400).json({ error: error.message });

    const existing = await SocialPerformanceRecord.findById(recordId).exec();
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    Object.assign(existing, value);
    existing.updatedBy = req.user.username;

    const { computedBonusEur } = computeSocialRecordBonus(existing.toObject());
    existing.computedBonusEur = computedBonusEur;
    await existing.save();

    return res.json(formatRecord(existing.toObject()));
  } catch (err) {
    return next(err);
  }
};
