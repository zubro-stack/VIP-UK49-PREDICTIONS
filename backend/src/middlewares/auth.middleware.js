const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');
const { JWT_ACCESS_SECRET } = require('../config/env');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing bearer token'));
  }
  try {
    const payload = jwt.verify(header.slice('Bearer '.length), JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(AppError.unauthorized('Invalid or expired token'));
  }
}

module.exports = { requireAuth };
