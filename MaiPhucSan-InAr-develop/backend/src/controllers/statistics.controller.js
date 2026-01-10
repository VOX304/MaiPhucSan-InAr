/**
 * Statistics controller (N_FR3 - charts).
 */
const { BonusComputation } = require('../models/bonus-computation.model');

exports.bonusTotals = async (req, res, next) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());

    const docs = await BonusComputation.find({ year })
      .select({ salesmanEmployeeId: 1, totalBonusEur: 1, socialTotalEur: 1, ordersTotalEur: 1 })
      .lean()
      .exec();

    const items = docs
      .map((d) => ({
        employeeId: d.salesmanEmployeeId,
        totalBonusEur: d.totalBonusEur,
        socialTotalEur: d.socialTotalEur,
        ordersTotalEur: d.ordersTotalEur
      }))
      .sort((a, b) => a.employeeId.localeCompare(b.employeeId));

    return res.json({ data: { year, items } });
  } catch (err) {
    return next(err);
  }
};
