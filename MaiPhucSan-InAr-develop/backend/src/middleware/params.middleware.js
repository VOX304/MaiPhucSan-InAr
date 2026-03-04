const Joi = require('joi');

const employeeIdSchema = Joi.string().pattern(/^E\d+$/).required();
const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();
const nonEmptyIdSchema = Joi.string().min(1).required();

function validateEmployeeId(req, res, next, value) {
  const { error } = employeeIdSchema.validate(value);
  // Return 404 for invalid format — from the client's perspective the resource simply doesn't exist
  if (error) return res.status(404).json({ error: 'Salesman not found' });
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
