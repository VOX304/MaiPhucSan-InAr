/**
 * Auth service.
 *
 * Implements JWT based login for the semester project (N_FR1).
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models/user.model');

function signToken(user) {
  const payload = {
    sub: String(user._id),
    username: user.username,
    role: user.role,
    employeeId: user.employeeId || null
  };

  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/**
 * Authenticate user by username/password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token:string, user:{username:string, role:string, employeeId?:string|null}}>}
 */
async function login(username, password) {
  const user = await User.findOne({ username }).exec();
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await user.verifyPassword(password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  return {
    token,
    user: { username: user.username, role: user.role, employeeId: user.employeeId }
  };
}

module.exports = {
  login,
  signToken
};
