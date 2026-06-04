export const ROLE_CLIENTE = "CLIENTE";
export const ROLE_ADMIN = "ADMIN";

export const normalizeRoleName = (value) => {
    if (!value || typeof value !== "string") {
        return null;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === "cliente") {
        return ROLE_CLIENTE;
    }
    if (normalized === "user" || normalized === "user_role") {
        return ROLE_CLIENTE;
    }

    if (normalized === "admin" || normalized === "adminrestaurante") {
        return ROLE_ADMIN;
    }

    return null;
};
