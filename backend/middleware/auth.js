const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

function adminOnly(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ message: 'Admin access required' });
  next();
}

module.exports = { auth, adminOnly };