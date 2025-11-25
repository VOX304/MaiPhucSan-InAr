const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  salesmanSid: { type: Number, required: true },   // link to SalesMan.sid
  description: { type: String, required: true },
  date: { type: String, required: true },          // ISO date string "2024-05-01"
  score: { type: Number, required: true }
}, { collection: 'socialPerformanceRecords' });

module.exports = mongoose.model('SocialPerformanceRecord', performanceSchema);
