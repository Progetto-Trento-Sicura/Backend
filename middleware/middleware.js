import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  let token = req.cookies.token;

  // Se non c'è token nei cookies, controlla l'header Authorization
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      username: decoded.username,
      accountType: decoded.accountType
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireOrg = (req, res, next) => {
  if (req.user?.accountType !== 'org') {
    return res.status(403).json({ error: 'Access denied: organization only' });
  }
  next();
};