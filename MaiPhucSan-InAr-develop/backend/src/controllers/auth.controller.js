/**
 * Auth endpoints.
 *
 * POST /auth/login
 * GET  /auth/me
 */
const Joi = require('joi');
const { login } = require('../services/auth.service');

const loginSchema = Joi.object({
  username: Joi.string().min(1).max(100).required(),
  password: Joi.string().min(1).max(200).required()
});

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const result = await login(value.username, value.password);
    return res.json({ data: result });
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res) => {
  return res.json({
    data: {
      username: req.user.username,
      role: req.user.role,
      employeeId: req.user.employeeId
    }
  });
};
