/**
 * Orders evaluation controller (COULD requirements).
 *
 * Supports:
 * - Fetch from OpenCRX and cache in MongoDB
 * - Read cached records and computed per-order bonus
 */
const Joi = require('joi');
const { OrderEvaluationRecord } = require('../models/order-evaluation.model');
const { OpenCRXService } = require('../services/opencrx.service');
const { computeOrderRecordBonus } = require('../services/bonus.service');

const createSchema = Joi.object({
  salesmanEmployeeId: Joi.string().pattern(/^E\d+$/).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  orderId: Joi.string().min(1).max(200).required(),
  productName: Joi.string().allow('').optional(),
  clientName: Joi.string().allow('').optional(),
  clientRanking: Joi.number().min(1).max(5).optional(),
  closingProbability: Joi.number().min(0).max(1).optional(),
  itemsCount: Joi.number().min(0).optional(),
  revenueEur: Joi.number().min(0).optional(),
  remark: Joi.string().allow('').optional()
});

// Map letter rankings (A/B/C/D/E) -> numeric 1-5
function rankingToNumber(r) {
  if (typeof r === 'number') return r;
  const map = { A: 1, B: 2, C: 3, D: 4, E: 5 };
  return map[String(r).toUpperCase()] || 3;
}

exports.listForSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || new Date().getFullYear());
    const refresh = String(req.query.refresh || 'false').toLowerCase() === 'true';

    if (refresh) {
      try {
        const opencrx = new OpenCRXService();
        const orders = await opencrx.fetchOrders(employeeId, year);

        for (const o of orders) {
          const { computedBonusEur } = computeOrderRecordBonus(o);
          await OrderEvaluationRecord.findOneAndUpdate(
            { salesmanEmployeeId: employeeId, year, orderId: o.orderId },
            {
              $set: {
                salesmanEmployeeId: employeeId,
                year,
                orderId: o.orderId,
                productName: o.productName,
                clientName: o.clientName,
                clientRanking: rankingToNumber(o.clientRanking),
                closingProbability: o.closingProbability,
                itemsCount: o.itemsCount,
                revenueEur: o.revenueEur,
                computedBonusEur,
                raw: o.raw || null
              }
            },
            { upsert: true, new: true }
          ).exec();
        }
      } catch (_) {
        // OpenCRX unavailable — serve from cache
      }
    }

    const records = await OrderEvaluationRecord.find({ salesmanEmployeeId: employeeId, year })
      .sort({ orderId: 1 })
      .lean()
      .exec();

    // Return flat array with bonus alias for Postman compatibility
    const result = records.map(r => ({ ...r, bonus: r.computedBonusEur }));
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = req.body;

    // Support Postman format: { employeeId, year, orders: [{productName, clientName, clientRanking, closingProbability, numberOfItems}] }
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
          orderId: o.orderId || `order-${year}-${i + 1}`,
          productName: o.productName || '',
          clientName: o.clientName || '',
          clientRanking: rankingToNumber(o.clientRanking),
          closingProbability: o.closingProbability ?? 0.5,
          itemsCount: o.numberOfItems ?? o.itemsCount ?? 0,
          revenueEur: o.revenueEur ?? 0,
          remark: o.remark || ''
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

      const totalBonus = created.reduce((s, r) => s + (r.computedBonusEur || 0), 0);
      return res.status(201).json({
        bonus: totalBonus,
        records: created.length,
        employeeId: salesmanEmployeeId,
        year
      });
    }

    // Original flat-field format
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
