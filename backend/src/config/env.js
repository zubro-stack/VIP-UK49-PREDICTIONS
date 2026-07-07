require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// No fallback for these two: a JWT secret must come from the real
// environment, or the app would otherwise sign/verify tokens with a value
// that's public in this file - fail closed instead of fail open.
function requiredSecret(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (no default is provided for JWT secrets)`);
  }
  return value;
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  DATABASE_URL: required('DATABASE_URL', 'postgresql://localhost:5432/uk49s'),
  JWT_ACCESS_SECRET: requiredSecret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requiredSecret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',
  REFRESH_COOKIE_NAME: 'uk49s_refresh',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
