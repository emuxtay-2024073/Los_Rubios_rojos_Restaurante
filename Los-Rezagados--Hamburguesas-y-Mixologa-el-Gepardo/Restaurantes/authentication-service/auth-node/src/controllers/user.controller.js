import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

      
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Nombre, correo, contraseña y rol son obligatorios"
            });
        }

        if (name.length < 3) {
            return res.status(400).json({
                message: "El nombre debe tener al menos 3 caracteres"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "El formato del correo electrónico no es válido"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres"
            });
        }

       
        if (!mongoose.Types.ObjectId.isValid(role)) {
            return res.status(400).json({
                message: "El ID del rol no es válido"
            });
        }

        
        const roleExists = await Role.findById(role);
        if (!roleExists) {
            return res.status(400).json({
                message: "El rol no existe"
            });
        }

        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "El usuario ya existe"
            });
        }

        
        const user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        res.status(201).json({
            message: "Usuario creado correctamente",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: roleExists.name
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al crear usuario",
            error: error.message
        });
    }
};
