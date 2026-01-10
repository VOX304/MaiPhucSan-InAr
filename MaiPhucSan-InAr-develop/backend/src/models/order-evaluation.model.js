/**
 * Sales orders evaluation record (COULD requirements).
 *
 * C_FR1/C_FR2/C_FR4: orders evaluation with computed per-order bonus.
 * Records are fetched from OpenCRX and cached, or created manually for demo/testing.
 */
const mongoose = require('mongoose');

const OrderEvaluationRecordSchema = new mongoose.Schema(
  {
    salesmanEmployeeId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },

    orderId: { type: String, required: true },
    productName: { type: String, default: '' },
    clientName: { type: String, default: '' },

    // Client ranking: 1=best .. 5=worst
    clientRanking: { type: Number, default: 3, min: 1, max: 5 },

    // Closing probability [0..1]
    closingProbability: { type: Number, default: 0.5, min: 0, max: 1 },

    itemsCount: { type: Number, default: 1, min: 0 },
    revenueEur: { type: Number, default: 0, min: 0 },

    computedBonusEur: { type: Number, default: 0 },
    remark: { type: String, default: '' },

    raw: { type: Object, default: null }
  },
  { timestamps: true }
);

OrderEvaluationRecordSchema.index(
  { salesmanEmployeeId: 1, year: 1, orderId: 1 },
  { unique: true }
);

const OrderEvaluationRecord = mongoose.model(
  'OrderEvaluationRecord',
  OrderEvaluationRecordSchema
);

module.exports = {
  OrderEvaluationRecord
};
