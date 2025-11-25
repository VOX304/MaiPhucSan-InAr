
const SalesMan = require('../models/salesman.model');

exports.list = async (req, res, next) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      filter = {
        $or: [
          { firstName: regex },
          { middleName: regex },
          { lastName: regex },
          { email: regex }
        ]
      };
    }

    const result = await SalesMan.find(filter).lean();
    res.json({ data: result, total: result.length });
  } catch (err) {
    next(err);
  }
};


exports.get = async (req, res, next) => {
  try {
    const sid = parseInt(req.params.id, 10);
    const s = await SalesMan.findOne({ sid }).lean();
    if (!s) return res.status(404).json({ error: 'Salesman not found' });
    res.json({ data: s });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = req.body || {};
    if (payload.sid == null || !payload.firstName || !payload.lastName) {
      return res.status(400).json({ error: 'sid, firstName and lastName are required' });
    }

    const newSalesman = await SalesMan.create({
      sid: payload.sid,
      firstName: payload.firstName,
      middleName: payload.middleName || null,
      lastName: payload.lastName,
      email: payload.email || null,
      hireDate: payload.hireDate || null,
      department: payload.department || 'Sales',
      supervisor: payload.supervisor || null
    });

    res.status(201).json({ data: newSalesman });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const sid = parseInt(req.params.id, 10);
    const updated = await SalesMan.findOneAndUpdate(
      { sid },
      req.body,
      { new: true, lean: true }
    );
    if (!updated) return res.status(404).json({ error: 'Salesman not found' });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const sid = parseInt(req.params.id, 10);
    const removed = await SalesMan.findOneAndDelete({ sid }).lean();
    if (!removed) return res.status(404).json({ error: 'Salesman not found' });
    res.json({ data: removed });
  } catch (err) {
    next(err);
  }
};
