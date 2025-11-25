const SocialPerformanceRecord = require('../models/performance.model');

//
// GET /api/v1/performance?salesmanId=123&year=2024
//
exports.list = async (req, res, next) => {
  try {
    const { salesmanId, year } = req.query;

    let filter = {};
    if (salesmanId) filter.salesmanSid = Number(salesmanId);
    if (year) filter.year = Number(year);

    const records = await SocialPerformanceRecord.find(filter).lean();

    res.json({ data: records, total: records.length });
  } catch (err) {
    next(err);
  }
};

//
// GET /api/v1/performance/:id
//
exports.getBySalesman = async (req, res, next) => {
  try {
    const { id } = req.params; // This is record ID (_id in Mongo)
    const record = await SocialPerformanceRecord.findById(id).lean();

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ data: record });
  } catch (err) {
    next(err);
  }
};

//
// POST /api/v1/performance
//
exports.create = async (req, res, next) => {
  try {
    const payload = req.body || {};

    // Required fields
    if (!payload.salesmanSid || !payload.year) {
      return res.status(400).json({ error: 'salesmanSid and year are required' });
    }

    // Ensure unique "one record per salesman + year"
    const exists = await SocialPerformanceRecord.findOne({
      salesmanSid: payload.salesmanSid,
      year: payload.year
    });

    if (exists) {
      return res.status(409).json({
        error: 'A record for this salesman and year already exists'
      });
    }

    const record = await SocialPerformanceRecord.create({
      salesmanSid: payload.salesmanSid,
      year: payload.year,
      goals: payload.goals || [],
      remarks: payload.remarks || null
    });

    res.status(201).json({ data: record });
  } catch (err) {
    next(err);
  }
};

//
// PUT /api/v1/performance/:id
//
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await SocialPerformanceRecord.findByIdAndUpdate(
      id,
      req.body,
      { new: true, lean: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

//
// DELETE /api/v1/performance/:id
//
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const removed = await SocialPerformanceRecord.findByIdAndDelete(id).lean();

    if (!removed) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ data: removed });
  } catch (err) {
    next(err);
  }
};
