const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/users.repository');
const { AppError } = require('../utils/AppError');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_TTL,
  JWT_REFRESH_TTL,
} = require('../config/env');

function issueTokens(user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_TTL });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_TTL });
  return { accessToken, refreshToken };
}

// Compared against on every login attempt for an email that doesn't match a
// real account, so a missing account takes the same bcrypt-cost time as a
// wrong password on a real one - otherwise the two cases are distinguishable
// by response time alone, letting an attacker enumerate valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

async function login(email, password) {
  const user = await usersRepository.findByEmail(email);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.isActive || !valid) throw AppError.unauthorized('Invalid email or password');
  return { user, ...issueTokens(user) };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw AppError.unauthorized('Missing refresh token');
  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
  const user = await usersRepository.findById(payload.sub);
  if (!user || !user.isActive) throw AppError.unauthorized('Account no longer active');
  return issueTokens(user);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

module.exports = { login, refresh, issueTokens, hashPassword };
