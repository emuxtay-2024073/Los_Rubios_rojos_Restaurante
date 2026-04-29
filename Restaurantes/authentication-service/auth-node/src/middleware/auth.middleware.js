import {
    normalizeRoleName
} from "../utils/roles.js";

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token mal formado" });
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_KEY || "E$3cr3tKyF0rKln4lSp0rts@In6am2024";
    const verifyOptions = {};
    if (process.env.JWT_ISSUER) {
        verifyOptions.issuer = process.env.JWT_ISSUER;
    }
    if (process.env.JWT_AUDIENCE) {
        verifyOptions.audience = process.env.JWT_AUDIENCE;
    }

    try {
        const decoded = jwt.verify(token, secret, verifyOptions);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido" });
    }
};

export const verifyRole = (role) => {
    return (req, res, next) => {
        const requiredRole = normalizeRoleName(role);
        const userRole = normalizeRoleName(req.user?.role);

        if (!requiredRole || !userRole || userRole !== requiredRole) {
            return res.status(403).json({ message: "No autorizado" });
        }
        next();
    };
};
