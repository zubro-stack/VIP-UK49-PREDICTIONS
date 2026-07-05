const { AppError } = require('../utils/AppError');

const ROLE_RANK = { user: 1, manager: 2, admin: 3 };

/** Passes if req.user.role is `minRole` or higher in the admin > manager > user hierarchy. */
function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if ((ROLE_RANK[req.user.role] ?? 0) < ROLE_RANK[minRole]) {
      return next(AppError.forbidden(`Requires ${minRole} role or higher`));
    }
    return next();
  };
}

module.exports = { requireRole };
