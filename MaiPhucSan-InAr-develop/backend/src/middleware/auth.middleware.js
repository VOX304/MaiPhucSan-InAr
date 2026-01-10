/**
 * JWT authentication middleware.
 *
 * Adds `req.user` with `{username, role, employeeId}` if token is valid.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }

  try {
    const payload = jwt.verify(match[1], env.jwtSecret);
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      employeeId: payload.employeeId || null
    };
    return next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authRequired
};
