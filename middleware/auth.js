const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    // Hanya verify jika token ada dan tidak kosong
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

module.exports = auth;