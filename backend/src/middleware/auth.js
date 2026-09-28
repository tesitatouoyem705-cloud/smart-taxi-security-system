const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_jwt_key_12345");
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User account no longer exists" });
    }
    if (user.status === "BLOCKED" || user.status === "SUSPENDED") {
      return res.status(403).json({ message: `Account is ${user.status.toLowerCase()}` });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authenticateToken: authenticate,
  requireRole
};