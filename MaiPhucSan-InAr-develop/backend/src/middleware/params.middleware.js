const Joi = require('joi');

const employeeIdSchema = Joi.string().pattern(/^E\d+$/).required();
const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();
const nonEmptyIdSchema = Joi.string().min(1).required();

function validateEmployeeId(req, res, next, value) {
  const { error } = employeeIdSchema.validate(value);
  if (error) return res.status(400).json({ error: 'Invalid employeeId' });
  // keep as string (DB stores employeeId as string like 'E1001')
  return next();
}

function validateObjectId(req, res, next, value) {
  const { error } = objectIdSchema.validate(value);
  if (error) return res.status(400).json({ error: 'Invalid id' });
  return next();
}

function validateNonEmptyId(req, res, next, value) {
  const { error } = nonEmptyIdSchema.validate(value);
  if (error) return res.status(400).json({ error: 'Invalid id' });
  return next();
}

module.exports = {
  validateEmployeeId,
  validateObjectId,
  validateNonEmptyId
};
