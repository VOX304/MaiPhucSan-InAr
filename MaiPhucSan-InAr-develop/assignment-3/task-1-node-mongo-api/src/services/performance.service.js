// src/services/performance.service.js
const SocialPerformanceRecord = require("../models/performance.model");

async function getAllRecords() {
  return await SocialPerformanceRecord.find();
}

async function addRecord(data) {
  const r = new SocialPerformanceRecord(data);
  return await r.save();
}

module.exports = { getAllRecords, addRecord };
