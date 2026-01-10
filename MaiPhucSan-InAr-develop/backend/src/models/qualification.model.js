/**
 * Qualification model.
 *
 * C_FR8/C_FR9: qualifications created by CEO, shown to salesman.
 * Optionally stored in OrangeHRM (best-effort).
 */
const mongoose = require('mongoose');

const QualificationSchema = new mongoose.Schema(
  {
    salesmanEmployeeId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    createdBy: { type: String, required: true },
    storedInOrangeHrmAt: { type: Date, default: null }
  },
  { timestamps: true }
);

QualificationSchema.index({ salesmanEmployeeId: 1, year: 1, title: 1 }, { unique: true });

const Qualification = mongoose.model('Qualification', QualificationSchema);

module.exports = {
  Qualification
};
