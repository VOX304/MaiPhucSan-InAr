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
const { computeOrderRecordBonus, computeOrdersTotal } = require('../services/bonus.service');

const createSchema = Joi.object({
  salesmanEmployeeId: Joi.string().min(1).max(50).required(),
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

exports.listForSalesman = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || new Date().getFullYear());
    const refresh = String(req.query.refresh || 'false').toLowerCase() === 'true';

    if (refresh) {
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
              clientRanking: o.clientRanking,
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
    }

    const records = await OrderEvaluationRecord.find({
      salesmanEmployeeId: employeeId,
      year
    })
      .sort({ orderId: 1 })
      .lean()
      .exec();

    const ordersTotalEur = computeOrdersTotal(records).total;
    return res.json({ data: { records, ordersTotalEur } });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { computedBonusEur } = computeOrderRecordBonus(value);

    const created = await OrderEvaluationRecord.create({
      ...value,
      computedBonusEur
    });
    return res.status(201).json({ data: created });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Order already exists' });
    return next(err);
  }
};
