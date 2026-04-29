import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";
import {
    normalizeRoleName,
    isAdminSecretValid,
    ROLE_ADMIN,
    ROLE_CLIENTE
} from "../utils/roles.js";

export const createUser = async (req, res) => {
    try {
        const { username, email, password, role, secretKey } = req.body;

        const roleName = normalizeRoleName(role || ROLE_CLIENTE);

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, correo y contraseña son obligatorios"
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                message: "El username debe tener al menos 3 caracteres"
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

        if (!roleName) {
            return res.status(400).json({
                message: "El rol solo puede ser cliente o admin"
            });
        }

        if (roleName === ROLE_ADMIN && !isAdminSecretValid(secretKey)) {
            return res.status(400).json({
                message: "Se necesita la clave secreta para ser admin"
            });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                message: "El usuario ya existe"
            });
        }

        const roleExists = await Role.findOneAndUpdate(
            { name: roleName },
            { name: roleName },
            { new: true, upsert: true }
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: roleExists._id
        });

        await user.save();

        res.status(201).json({
            message: "Usuario creado correctamente",
            user: {
                _id: user._id,
                username: user.username,
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

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json({
            message: "Usuarios obtenidos correctamente",
            users: users.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role ? user.role.name : null
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener usuarios",
            error: error.message
        });
    }
};
