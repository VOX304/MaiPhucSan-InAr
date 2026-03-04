/**
 * Bonus computation controller.
 *
 * - MVP_FR2: individual bonus per record
 * - M_FR1:   total bonus computed automatically
 * - M_FR2:   remarks stored
 * - M_FR4/C_FR5: CEO + HR approvals
 * - M_FR3/C_FR3: store total bonus in HR system
 * - C_FR6/C_FR7: salesman views historic computations
 * - N_FR4:   salesman confirms final computation
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
  const [social, orders] = await Promise.all([
    SocialPerformanceRecord.find({ salesmanEmployeeId: employeeId, year })
      .sort({ criterionKey: 1 }).lean().exec(),
    OrderEvaluationRecord.find({ salesmanEmployeeId: employeeId, year })
      .sort({ orderId: 1 }).lean().exec()
  ]);
  return { social, orders };
}

// ─── 2-1  Compute total bonus ────────────────────────────────────────────────
exports.compute = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const { social, orders } = await loadRecords(employeeId, year);
    const totals = await computeTotals(social, orders);

    const doc = await BonusComputation.findOneAndUpdate(
      { salesmanEmployeeId: employeeId, year },
      {
        $set: {
          salesmanEmployeeId: employeeId,
          year,
          socialTotalEur: totals.socialTotalEur,
          ordersTotalEur: totals.ordersTotalEur,
          totalBonusEur:  totals.totalBonusEur,
          status:         'COMPUTED',
          computedAt:     new Date(),
          computedBy:     req.user.username,
          details: { ...totals, computedAt: new Date().toISOString() }
        }
      },
      { upsert: true, new: true }
    ).lean();

    return res.json({
      employeeId,
      year,
      status:         doc.status,
      totalBonus:     doc.totalBonusEur,
      socialTotal:    doc.socialTotalEur,
      ordersTotal:    doc.ordersTotalEur,
      computedAt:     doc.computedAt,
      computedBy:     doc.computedBy
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 2-2  Get bonus computation ──────────────────────────────────────────────
exports.get = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    // Try requested year first, fall back to most recent computed doc
    let doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year })
      .lean().exec();

    if (!doc) {
      doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId })
        .sort({ year: -1 }).lean().exec();
    }

    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Run compute first.' });

    return res.json({
      employeeId,
      year:        doc.year,
      status:      doc.status,
      totalBonus:  doc.totalBonusEur,
      socialTotal: doc.socialTotalEur,
      ordersTotal: doc.ordersTotalEur,
      computedAt:  doc.computedAt,
      computedBy:  doc.computedBy,
      remarks:     doc.remarks || []
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 3-8  Bonus history ───────────────────────────────────────────────────────
exports.history = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const docs = await BonusComputation.find({ salesmanEmployeeId: employeeId })
      .sort({ year: -1 }).lean().exec();

    return res.json(docs.map(d => ({
      year:        d.year,
      status:      d.status,
      totalBonus:  d.totalBonusEur,
      socialTotal: d.socialTotalEur,
      ordersTotal: d.ordersTotalEur,
      computedAt:  d.computedAt
    })));
  } catch (err) {
    return next(err);
  }
};

// ─── 2-3  Add remark ─────────────────────────────────────────────────────────
exports.addRemark = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

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
            role:       req.user.role,
            text:       text.trim(),
            createdAt:  new Date()
          }
        }
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Run compute first.' });

    const saved = doc.remarks[doc.remarks.length - 1];
    return res.json({
      employeeId,
      year,
      remark:    saved.text,
      addedBy:   saved.byUsername,
      createdAt: saved.createdAt
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 2-4  CEO approves ───────────────────────────────────────────────────────
exports.approveCeo = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Run compute first.' });

    // Allow COMPUTED; also idempotent if already CEO_APPROVED or beyond
    const alreadyApproved = ['CEO_APPROVED', 'HR_APPROVED', 'STORED_IN_ORANGEHRM', 'RELEASED_TO_SALESMAN', 'SALESMAN_CONFIRMED'];
    if (!alreadyApproved.includes(doc.status)) {
      if (doc.status !== 'COMPUTED') {
        return res.status(409).json({ error: `Expected COMPUTED, got ${doc.status}` });
      }
      doc.status        = 'CEO_APPROVED';
      doc.ceoApprovedAt = new Date();
      doc.ceoApprovedBy = req.user.username;
      await doc.save();
    }

    return res.json({
      employeeId,
      year,
      status:      doc.status,
      approvedBy:  doc.ceoApprovedBy,
      approvedAt:  doc.ceoApprovedAt
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 2-5 / 3-6 / 3-11  HR approves ─────────────────────────────────────────
exports.approveHrAndStore = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found. Run compute first.' });

    const blockList = ['DRAFT'];
    if (blockList.includes(doc.status)) {
      return res.status(409).json({ error: `Cannot HR-approve from status ${doc.status}` });
    }

    // Idempotent — only transition if not already HR-approved or beyond
    const alreadyApproved = ['HR_APPROVED', 'STORED_IN_ORANGEHRM', 'RELEASED_TO_SALESMAN', 'SALESMAN_CONFIRMED'];
    if (!alreadyApproved.includes(doc.status)) {
      doc.status       = 'HR_APPROVED';
      doc.hrApprovedAt = new Date();
      doc.hrApprovedBy = req.user.username;
      doc.hrApproved   = true;
      await doc.save();
    }

    // Best-effort HR system store — non-fatal
    try {
      const orange = new OrangeHRMService();
      await orange.storeTotalBonus(employeeId, year, doc.totalBonusEur);
      doc.status = 'STORED_IN_ORANGEHRM';
      doc.storedInOrangeHrmAt = new Date();
      await doc.save();
    } catch (_) { /* HR system unavailable — status stays HR_APPROVED */ }

    return res.json({
      employeeId,
      year,
      status:     doc.status,
      hrApproved: true,
      approvedBy: doc.hrApprovedBy,
      approvedAt: doc.hrApprovedAt
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 3-7  Release to salesman ─────────────────────────────────────────────────
exports.releaseToSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found' });

    if (!['HR_APPROVED', 'STORED_IN_ORANGEHRM'].includes(doc.status)) {
      return res.status(409).json({ error: `Expected HR_APPROVED or STORED_IN_ORANGEHRM, got ${doc.status}` });
    }

    doc.status               = 'RELEASED_TO_SALESMAN';
    doc.releasedToSalesmanAt = new Date();
    await doc.save();

    return res.json({
      employeeId,
      year,
      status:     'released',
      released:   true,
      releasedAt: doc.releasedToSalesmanAt
    });
  } catch (err) {
    return next(err);
  }
};

// ─── 4-1  Salesman confirms ───────────────────────────────────────────────────
exports.confirmBySalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || nowYear());

    const doc = await BonusComputation.findOne({ salesmanEmployeeId: employeeId, year }).exec();
    if (!doc) return res.status(404).json({ error: 'Bonus computation not found' });

    const allowed = ['RELEASED_TO_SALESMAN', 'HR_APPROVED', 'STORED_IN_ORANGEHRM'];
    if (!allowed.includes(doc.status)) {
      return res.status(409).json({ error: `Expected one of ${allowed.join(' / ')}, got ${doc.status}` });
    }

    doc.status               = 'SALESMAN_CONFIRMED';
    doc.salesmanConfirmedAt  = new Date();
    await doc.save();

    return res.json({
      employeeId,
      year,
      status:      'confirmed',
      confirmed:   true,
      confirmedAt: doc.salesmanConfirmedAt
    });
  } catch (err) {
    return next(err);
  }
};
