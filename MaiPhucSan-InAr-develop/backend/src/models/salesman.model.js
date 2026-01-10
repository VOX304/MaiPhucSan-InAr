/**
 * Salesman master data model.
 *
 * MVP_FR1: Basic master data (name, employeeId, department, year) can be created and read.
 * M_FR5: Master data should be read from OrangeHRM (implemented via OrangeHRMService + sync endpoint).
 */
const mongoose = require('mongoose');

const SalesmanSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    performanceYear: { type: Number, required: true },

    // Optional external identifier if OrangeHRM uses a different internal id.
    orangeHrmId: { type: String, default: null }
  },
  { timestamps: true }
);

const Salesman = mongoose.model('Salesman', SalesmanSchema);

module.exports = {
  Salesman
};
