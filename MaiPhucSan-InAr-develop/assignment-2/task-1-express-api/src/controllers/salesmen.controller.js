
const { v4: uuid } = require('uuid');
let salesmen = require('../data/salesmen');

function findIndexById(id) {
  return salesmen.findIndex(s => s.id === id);
}

exports.list = (req, res) => {
  const { q } = req.query;
  let result = salesmen;
  if (q) {
    const qLower = q.toLowerCase();
    result = result.filter(s => 
      [s.firstName, s.middleName, s.lastName, s.email].filter(Boolean).some(v => v.toLowerCase().includes(qLower))
    );
  }
  res.json({ data: result, total: result.length });
};

exports.get = (req, res) => {
  const { id } = req.params;
  const s = salesmen.find(s => s.id === id);
  if (!s) return res.status(404).json({ error: 'Salesman not found' });
  res.json({ data: s });
};

exports.create = (req, res) => {
  const payload = req.body || {};
  if (!payload.firstName || !payload.lastName) {
    return res.status(400).json({ error: 'firstName and lastName are required' });
  }
  const newSalesman = {
    id: payload.id || uuid().slice(0, 8),
    firstName: payload.firstName,
    middleName: payload.middleName || null,
    lastName: payload.lastName,
    email: payload.email || null,
    hireDate: payload.hireDate || null,
    department: payload.department || 'Sales',
    supervisor: payload.supervisor || null
  };
  salesmen.push(newSalesman);
  res.status(201).json({ data: newSalesman });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const idx = findIndexById(id);
  if (idx === -1) return res.status(404).json({ error: 'Salesman not found' });
  const updated = { ...salesmen[idx], ...req.body, id };
  salesmen[idx] = updated;
  res.json({ data: updated });
};

exports.remove = (req, res) => {
  const { id } = req.params;
  const idx = findIndexById(id);
  if (idx === -1) return res.status(404).json({ error: 'Salesman not found' });
  const removed = salesmen.splice(idx, 1)[0];
  res.json({ data: removed });
};
