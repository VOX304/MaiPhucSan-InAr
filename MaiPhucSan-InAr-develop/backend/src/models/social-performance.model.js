/**
 * Social performance evaluation record.
 *
 * MVP_FR2: Social performance records can be created/read.
 * M_FR1: Total bonus is computed automatically from all records.
 * N_FR5: HR can alter target/actual values of a record.
 */
const mongoose = require('mongoose');

const SocialPerformanceRecordSchema = new mongoose.Schema(
  {
    salesmanEmployeeId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },

    criterionKey: { type: String, required: true },
    criterionName: { type: String, required: true },

    targetValue: { type: Number, required: true, min: 0 },
    actualValue: { type: Number, required: true, min: 0 },

    // Weight in range [0..1] (normalized in bonus service if needed)
    weight: { type: Number, required: true, min: 0, max: 1 },

    supervisorRating: { type: Number, default: 5, min: 1, max: 5 },
    peerRating: { type: Number, default: 5, min: 1, max: 5 },

    // Persist for transparency & historic retrieval (C_FR7)
    computedBonusEur: { type: Number, default: 0 },

    remark: { type: String, default: '' },

    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null }
  },
  { timestamps: true }
);

SocialPerformanceRecordSchema.index(
  { salesmanEmployeeId: 1, year: 1, criterionKey: 1 },
  { unique: true }
);

const SocialPerformanceRecord = mongoose.model(
  'SocialPerformanceRecord',
  SocialPerformanceRecordSchema
);

module.exports = {
  SocialPerformanceRecord
};
