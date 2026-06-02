export const adminMiddleware = (req, res, next) => {
  const user = req.user;
  console.log('User from token:', req.user);
  console.log('User role:', req.user?.role);

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};
