/**
 * Orders evaluation controller.
 * C_FR1/C_FR2/C_FR4: orders evaluation with per-order bonus.
 */
const Joi = require('joi');
const { OrderEvaluationRecord } = require('../models/order-evaluation.model');
const { OpenCRXService } = require('../services/opencrx.service');
const { computeOrderRecordBonus } = require('../services/bonus.service');

const createSchema = Joi.object({
  salesmanEmployeeId: Joi.string().pattern(/^E\d+$/).required(),
  year:               Joi.number().integer().min(2000).max(2100).required(),
  orderId:            Joi.string().min(1).max(200).required(),
  productName:        Joi.string().allow('').optional(),
  clientName:         Joi.string().allow('').optional(),
  clientRanking:      Joi.number().min(1).max(5).optional(),
  closingProbability: Joi.number().min(0).max(1).optional(),
  itemsCount:         Joi.number().min(0).optional(),
  revenueEur:         Joi.number().min(0).optional(),
  remark:             Joi.string().allow('').optional()
});

// Map letter rankings A-E → numeric 1-5
function rankingToNumber(r) {
  if (typeof r === 'number') return r;
  return ({ A: 1, B: 2, C: 3, D: 4, E: 5 })[String(r).toUpperCase()] || 3;
}

function formatOrder(r) {
  return {
    _id:                r._id,
    orderId:            r.orderId,
    productName:        r.productName,
    clientName:         r.clientName,
    clientRanking:      r.clientRanking,
    closingProbability: r.closingProbability,
    itemsCount:         r.itemsCount,
    bonus:              r.computedBonusEur
  };
}

// ─── 3-2  List orders for salesman ───────────────────────────────────────────
exports.listForSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year    = Number(req.query.year || new Date().getFullYear());
    const refresh = String(req.query.refresh || 'false').toLowerCase() === 'true';

    if (refresh) {
      try {
        const opencrx = new OpenCRXService();
        const fetched = await opencrx.fetchOrders(employeeId, year);
        for (const o of fetched) {
          const { computedBonusEur } = computeOrderRecordBonus(o);
          await OrderEvaluationRecord.findOneAndUpdate(
            { salesmanEmployeeId: employeeId, year, orderId: o.orderId },
            { $set: { ...o, salesmanEmployeeId: employeeId, year, clientRanking: rankingToNumber(o.clientRanking), computedBonusEur } },
            { upsert: true, new: true }
          ).exec();
        }
      } catch (_) { /* OpenCRX unavailable — serve from cache */ }
    }

    const records = await OrderEvaluationRecord.find({ salesmanEmployeeId: employeeId, year })
      .sort({ orderId: 1 }).lean().exec();

    return res.json(records.map(formatOrder));
  } catch (err) {
    return next(err);
  }
};

// ─── 3-1  Create order evaluation ────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const body = req.body;

    // Postman format: { employeeId, year, orders: [{productName, clientName, ...}] }
    if (body.orders && Array.isArray(body.orders)) {
      const salesmanEmployeeId = body.employeeId || body.salesmanEmployeeId;
      const year = body.year;

      if (!salesmanEmployeeId || !year) {
        return res.status(400).json({ error: '"employeeId" and "year" are required' });
      }

      const created = [];
      for (let i = 0; i < body.orders.length; i++) {
        const o = body.orders[i];
        const record = {
          salesmanEmployeeId,
          year,
          orderId:            o.orderId || `order-${year}-${i + 1}`,
          productName:        o.productName || '',
          clientName:         o.clientName  || '',
          clientRanking:      rankingToNumber(o.clientRanking),
          closingProbability: o.closingProbability ?? 0.5,
          itemsCount:         o.numberOfItems ?? o.itemsCount ?? 0,
          revenueEur:         o.revenueEur ?? 0,
          remark:             o.remark || ''
        };
        const { computedBonusEur } = computeOrderRecordBonus(record);
        record.computedBonusEur = computedBonusEur;
        try {
          const doc = await OrderEvaluationRecord.create(record);
          created.push(doc);
        } catch (e) {
          if (e.code !== 11000) throw e;
        }
      }

      return res.status(201).json({
        employeeId: salesmanEmployeeId,
        year,
        bonus:   created.reduce((s, r) => s + (r.computedBonusEur || 0), 0),
        records: created.length
      });
    }

    // Flat-field format
    const { error, value } = createSchema.validate(body);
    if (error) return res.status(400).json({ error: error.message });

    const { computedBonusEur } = computeOrderRecordBonus(value);
    const created = await OrderEvaluationRecord.create({ ...value, computedBonusEur });
    return res.status(201).json({ bonus: computedBonusEur, id: created._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Order already exists' });
    return next(err);
  }
};
