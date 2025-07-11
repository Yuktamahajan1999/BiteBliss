const checkRole = (allowedRoles) => (req, res, next) => {
  const role = req.user?.role;

  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: "Access denied: insufficient permissions" });
  }

  next();
};

export default checkRole;
