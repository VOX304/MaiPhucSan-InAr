/**
 * Bonus computation (persisted).
 *
 * MUST:
 * - M_FR1 total bonus computed automatically and displayed
 * - M_FR2 remarks stored
 * - M_FR4 CEO involved for fetching + approving
 *
 * COULD:
 * - C_FR5 CEO + HR approvals
 * - C_FR6 salesman sees final computation
 * - C_FR7 computations persistently stored
 *
 * NICE:
 * - N_FR4 salesman confirms final computation
 */
const mongoose = require('mongoose');

const STATUS_VALUES = [
  'DRAFT',
  'COMPUTED',
  'CEO_APPROVED',
  'HR_APPROVED',
  'STORED_IN_ORANGEHRM',
  'RELEASED_TO_SALESMAN',
  'SALESMAN_CONFIRMED'
];

const RemarkSchema = new mongoose.Schema(
  {
    byUsername: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const BonusComputationSchema = new mongoose.Schema(
  {
    salesmanEmployeeId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },

    socialTotalEur: { type: Number, default: 0 },
    ordersTotalEur: { type: Number, default: 0 },
    totalBonusEur: { type: Number, default: 0 },

    status: { type: String, required: true, enum: STATUS_VALUES, default: 'DRAFT' },

    remarks: { type: [RemarkSchema], default: [] },

    computedAt: { type: Date, default: null },
    computedBy: { type: String, default: null },

    ceoApprovedAt: { type: Date, default: null },
    ceoApprovedBy: { type: String, default: null },

    hrApprovedAt: { type: Date, default: null },
    hrApprovedBy: { type: String, default: null },

    storedInOrangeHrmAt: { type: Date, default: null },
    releasedToSalesmanAt: { type: Date, default: null },
    salesmanConfirmedAt: { type: Date, default: null },

    // Optional snapshot details (audit)
    details: { type: Object, default: null }
  },
  { timestamps: true }
);

BonusComputationSchema.index({ salesmanEmployeeId: 1, year: 1 }, { unique: true });

const BonusComputation = mongoose.model('BonusComputation', BonusComputationSchema);

module.exports = {
  BonusComputation,
  STATUS_VALUES
};
