/**
 * Bonus computation controller.
 *
 * Implements core requirements:
 * - MVP_FR2: individual bonus per record (stored on records)
 * - M_FR1: total bonus computed automatically
 * - M_FR2: remarks stored
 * - M_FR4/C_FR5: CEO + HR approvals
 * - M_FR3/C_FR3: store total bonus in OrangeHRM
 * - C_FR6/C_FR7: salesman can view historic computations
 * - N_FR4: salesman confirms final computation
 */
const { BonusComputation } = require('../models/bonus-computation.model');
const { SocialPerformanceRecord } = require('../models/social-performance.model');
const { OrderEvaluationRecord } = require('../models/order-evaluation.model');
const { computeTotals } = require('../services/bonus.service');
const { OrangeHRMService } = require('../services/orangehrm.service');

function nowYear() {
  return new Date().getFullYear();
}

async function loadRecords(employeeId, year) {
  const social = await SocialPerformanceRecord.find({
    salesmanEmployeeId: employeeId,
    year
  })
    .sort({ criterionKey: 1 })
    .lean()
    .exec();

  const orders = await OrderEvaluationRecord.find({
    salesmanEmployeeId: employeeId,
    year
  })
    .sort({ orderId: 1 })
    .lean()
    .exec();

  return { social, orders };
}

exports.compute = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const { social, orders } = await loadRecords(employeeId, year);

    // Use async cached compute (uses Redis when enabled)
    const totals = await computeTotals(social, orders);

    const details = {
      ...totals,
      computedAt: new Date().toISOString()
    };

    const doc = await BonusComputation.findOneAndUpdate(
      { salesmanEmployeeId: employeeId, year },
      {
        $set: {
          salesmanEmployeeId: employeeId,
          year,
          socialTotalEur: totals.socialTotalEur,
          ordersTotalEur: totals.ordersTotalEur,
          totalBonusEur: totals.totalBonusEur,
          status: 'COMPUTED',
          computedAt: new Date(),
          computedBy: req.user.username,
          details
        }
      },
      { upsert: true, new: true }
    ).lean();

    return res.json({ data: doc, totalBonus: doc.totalBonusEur, status: doc.status });
  } catch (err) {
    return next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year })
      .lean()
      .exec();

    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Compute first.' });

    return res.json({ ...doc, totalBonus: doc.totalBonusEur, status: doc.status });
  } catch (err) {
    return next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const docs = await BonusComputation.find({ salesmanEmployeeId: employeeId })
      .sort({ year: -1 })
      .lean()
      .exec();

    return res.json(docs);
  } catch (err) {
    return next(err);
  }
};

exports.addRemark = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    // Accept both 'remark' (Postman) and 'text' (internal schema)
    const text = req.body.remark || req.body.text;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: '"remark" or "text" field is required' });
    }

    const doc = await BonusComputation.findOneAndUpdate(
      { salesmanEmployeeId: employeeId, year },
      {
        $push: {
          remarks: {
            byUsername: req.user.username,
            role: req.user.role,
            text: text.trim(),
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Compute first.' });

    const lastRemark = doc.remarks[doc.remarks.length - 1];
    return res.json({ remark: lastRemark.text, data: doc });
  } catch (err) {
    return next(err);
  }
};

exports.approveCeo = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Compute first.' });
    if (doc.status !== 'COMPUTED') {
      return res.status(409).json({ error: `Invalid state. Expected COMPUTED, got ${doc.status}` });
    }

    doc.status = 'CEO_APPROVED';
    doc.ceoApprovedAt = new Date();
    doc.ceoApprovedBy = req.user.username;

    await doc.save();

    return res.json({ id: doc._id, message: 'Approved by CEO', status: doc.status });
  } catch (err) {
    return next(err);
  }
};

exports.approveHrAndStore = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Compute first.' });
    if (!['CEO_APPROVED', 'COMPUTED'].includes(doc.status)) {
      return res
        .status(409)
        .json({ error: `Invalid state. Expected CEO_APPROVED or COMPUTED, got ${doc.status}` });
    }

    doc.status = 'HR_APPROVED';
    doc.hrApprovedAt = new Date();
    doc.hrApprovedBy = req.user.username;
    doc.hrApproved = true;

    await doc.save();

    // Best-effort store in HR system (M_FR3) — status stays HR_APPROVED regardless
    try {
      const orange = new OrangeHRMService();
      await orange.storeTotalBonus(employeeId, year, doc.totalBonusEur);
      doc.storedInOrangeHrmAt = new Date();
      await doc.save();
    } catch (_) {
      // Non-fatal: HR system may be unavailable
    }

    return res.json({ id: doc._id, message: 'Approved by HR', status: doc.status, hrApproved: true });
  } catch (err) {
    return next(err);
  }
};

exports.releaseToSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found' });

    if (!['STORED_IN_ORANGEHRM', 'HR_APPROVED'].includes(doc.status)) {
      return res.status(409).json({
        error: `Invalid state. Expected STORED_IN_ORANGEHRM/HR_APPROVED, got ${doc.status}`
      });
    }

    doc.status = 'RELEASED_TO_SALESMAN';
    doc.releasedToSalesmanAt = new Date();
    await doc.save();

    return res.json({ id: doc._id, message: 'Released to salesman', status: 'released', released: true });
  } catch (err) {
    return next(err);
  }
};

exports.confirmBySalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found' });

    const allowedStates = ['RELEASED_TO_SALESMAN', 'HR_APPROVED', 'STORED_IN_ORANGEHRM'];
    if (!allowedStates.includes(doc.status)) {
      return res.status(409).json({
        error: `Invalid state. Expected one of ${allowedStates.join('/')}, got ${doc.status}`
      });
    }

    doc.status = 'SALESMAN_CONFIRMED';
    doc.salesmanConfirmedAt = new Date();
    await doc.save();

    return res.json({ id: doc._id, message: 'Confirmed by salesman', status: 'confirmed', confirmed: true });
  } catch (err) {
    return next(err);
  }
};
