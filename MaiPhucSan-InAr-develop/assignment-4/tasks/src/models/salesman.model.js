const mongoose = require('mongoose');

const salesmanSchema = new mongoose.Schema({
  sid: { type: Number, required: true, unique: true }, // salesman ID from Java world
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String },
  hireDate: { type: String },
  department: { type: String, default: 'Sales' },
  supervisor: { type: String }
}, { collection: 'salesmen' });

module.exports = mongoose.model('SalesMan', salesmanSchema);
