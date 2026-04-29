import Role from "../models/Role.js";


export const createRole = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ 
                message: "El nombre del rol es obligatorio" 
            });
        }

        const roleName = name.trim().toUpperCase();

        const existing = await Role.findOne({ name: roleName });
        if (existing) {
            return res.status(400).json({ 
                message: "El rol ya existe" 
            });
        }

        const role = new Role({ name: roleName });
        await role.save();

        res.status(201).json(role);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Error al crear el rol", 
            error: error.message 
        });
    }
};


export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Error al obtener roles", 
            error: error.message 
        });
    }
};
