import { verifyToken } from '../helper/jwtHelper.js';

export const isLogin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('token', token);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

export const isLogout = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      verifyToken(token);
      return res.redirect('/');
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};
