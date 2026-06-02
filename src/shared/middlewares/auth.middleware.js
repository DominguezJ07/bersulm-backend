import JwtService from '../infrastructure/jwt/JwtService.js';

export const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' });

    const decoded = JwtService.verifyAccessToken(token);
    if (!decoded || !decoded.role) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }
    req.user = {
      id: decoded.id || decoded._id || decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
