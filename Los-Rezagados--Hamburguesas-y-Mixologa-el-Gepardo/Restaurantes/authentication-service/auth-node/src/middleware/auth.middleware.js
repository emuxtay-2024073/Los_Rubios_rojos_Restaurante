const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token mal formado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "restaurante_secreto");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido" });
    }
};

const verifyRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "No autorizado" });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };
