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
    // Invalid credentials should be 401, not 500
    if (err.message && err.message.toLowerCase().includes('invalid credentials')) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    return next(err);
  }
};

exports.me = async (req, res) => {
  // Postman 1-4 checks top-level j.username — return flat object (also include data wrapper for compatibility)
  return res.json({
    username:   req.user.username,
    role:       req.user.role,
    employeeId: req.user.employeeId
  });
};
