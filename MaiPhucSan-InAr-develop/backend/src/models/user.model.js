/**
 * User model (N_FR1 - secure login + role model).
 *
 * Uses:
 *  - bcrypt password hashes
 *  - JWT access tokens (see auth.service.js)
 *
 * Roles:
 *  - CEO
 *  - HR
 *  - SALESMAN
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const ROLE_VALUES = ['CEO', 'HR', 'SALESMAN'];

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, required: true, enum: ROLE_VALUES },

    // Link to Salesman by employeeId (for role SALESMAN)
    employeeId: { type: String, default: null }
  },
  { timestamps: true }
);

UserSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptSaltRounds);
};

const User = mongoose.model('User', UserSchema);

module.exports = {
  User,
  ROLE_VALUES
};
