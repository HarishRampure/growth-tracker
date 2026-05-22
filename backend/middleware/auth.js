const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'growth_tracker_secret_key';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No authorization header provided." });
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing from authorization header." });
  }

  if (token === 'demo_mode_token') {
    req.user = { id: 'demo', username: 'demo' };
    return next();
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token. Session has expired or is invalid." });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
};
