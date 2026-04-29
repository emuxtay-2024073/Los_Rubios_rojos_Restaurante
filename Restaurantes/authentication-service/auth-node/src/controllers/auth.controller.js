import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import {
  normalizeRoleName,
  isAdminSecretValid,
  ROLE_ADMIN,
  ROLE_CLIENTE
} from "../utils/roles.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role, secretKey } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email y contraseña son requeridos"
      });
    }

    const roleName = normalizeRoleName(role || ROLE_CLIENTE);

    if (!roleName) {
      return res.status(400).json({ success: false, message: "El rol solo puede ser cliente o admin" });
    }

    if (roleName === ROLE_ADMIN && !isAdminSecretValid(secretKey)) {
      return res.status(400).json({ success: false, message: "Se necesita la clave secreta para ser admin" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "El usuario ya existe" });
    }

    const roleDocument = await Role.findOneAndUpdate(
      { name: roleName },
      { name: roleName },
      { new: true, upsert: true }
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: roleDocument._id
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const roleName = normalizeRoleName(user.role?.name) || ROLE_CLIENTE;

    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_KEY || "E$3cr3tKyF0rKln4lSp0rts@In6am2024";
    const token = jwt.sign(
      { id: user._id, username: user.username, role: roleName },
      jwtSecret,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
