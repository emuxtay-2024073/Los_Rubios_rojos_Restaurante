import jwt from "jsonwebtoken";
import { normalizeRoleName } from "../utils/roles.js";
import { getJwtSecret, getJwtVerifyOptions } from "../utils/authSecurity.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Token mal formado" });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
    return next();
  } catch (error) {
    const expired = error.name === "TokenExpiredError";
    return res.status(expired ? 401 : 403).json({
      success: false,
      message: "Token invalido",
      error: expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID"
    });
  }
};

export const verifyRole = (role) => {
  return (req, res, next) => {
    const requiredRole = normalizeRoleName(role);
    const userRole = normalizeRoleName(req.user?.role);

    if (!requiredRole || !userRole || userRole !== requiredRole) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    return next();
  };
};
