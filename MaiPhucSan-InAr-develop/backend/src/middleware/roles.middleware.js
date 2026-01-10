/**
 * Simple role-based access control.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden', required: roles });
    }
    return next();
  };
}

/**
 * Restrict access to a salesman resource: allow CEO/HR, or the salesman himself.
 */
function allowSelfOrRoles(employeeIdParamName, ...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });

    if (roles.includes(role)) return next();

    const empId = req.params[employeeIdParamName];
    if (role === 'SALESMAN' && req.user.employeeId && req.user.employeeId === empId) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = {
  requireRole,
  allowSelfOrRoles
};
