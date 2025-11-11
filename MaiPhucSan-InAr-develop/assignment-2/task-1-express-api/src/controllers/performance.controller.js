
const { v4: uuid } = require('uuid');
let performance = require('../data/performance');

exports.list = (req, res) => {
  const { salesmanId, year } = req.query;
  let result = performance;
  if (salesmanId) result = result.filter(r => r.salesmanId === salesmanId);
  if (year) result = result.filter(r => r.year == year);
  res.json({ data: result, total: result.length });
};

exports.getBySalesman = (req, res) => {
  const { id } = req.params;
  const { year } = req.query;
  let result = performance.filter(r => r.salesmanId === id);
  if (year) result = result.filter(r => r.year == year);
  res.json({ data: result, total: result.length });
};

exports.create = (req, res) => {
  const payload = req.body || {};
  if (!payload.salesmanId || !payload.year) {
    return res.status(400).json({ error: 'salesmanId and year are required' });
  }
  // Ensure "one record per salesman + year"
  const exists = performance.find(r => r.salesmanId === payload.salesmanId && r.year == payload.year);
  if (exists) {
    return res.status(409).json({ error: 'A record for this salesman and year already exists' });
  }
  const record = {
    id: payload.id || `sp-${payload.salesmanId}-${payload.year}`,
    salesmanId: payload.salesmanId,
    year: payload.year,
    goals: payload.goals || [],
    remarks: payload.remarks || null
  };
  performance.push(record);
  res.status(201).json({ data: record });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const idx = performance.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  performance[idx] = { ...performance[idx], ...req.body, id };
  res.json({ data: performance[idx] });
};

exports.remove = (req, res) => {
  const { id } = req.params;
  const idx = performance.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  const removed = performance.splice(idx, 1)[0];
  res.json({ data: removed });
};
