export const ROLE_CLIENTE = "CLIENTE";
export const ROLE_ADMIN = "ADMIN";
export const DEFAULT_ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "CLAVE_ADMIN";

export const normalizeRoleName = (value) => {
    if (!value || typeof value !== "string") {
        return null;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === "cliente") {
        return ROLE_CLIENTE;
    }

    if (normalized === "user" || normalized === "user_role" || normalized === "cliente") {
        return ROLE_CLIENTE;
    }

    if (normalized === "admin" || normalized === "adminrestaurante") {
        return ROLE_ADMIN;
    }

    return null;
};

export const isAdminSecretValid = (value) => {
    if (typeof value !== "string") {
        return false;
    }

    return value.trim() === DEFAULT_ADMIN_SECRET;
};