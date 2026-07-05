const authService = require('../services/auth.service');
const usersService = require('../services/users.service');
const usersRepository = require('../repositories/users.repository');
const { asyncHandler } = require('../utils/asyncHandler');
const { REFRESH_COOKIE_NAME, NODE_ENV } = require('../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
  res.json({ accessToken, user: usersService.sanitize(user) });
});

const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.refresh(req.cookies?.[REFRESH_COOKIE_NAME]);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
  res.json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const user = await usersRepository.findById(req.user.id);
  res.json(usersService.sanitize(user));
});

module.exports = { login, refresh, logout, me };
