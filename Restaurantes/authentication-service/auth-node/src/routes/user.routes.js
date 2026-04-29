import { Router } from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: juan123
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: admin
 *               secretKey:
 *                 type: string
 *                 example: string
 *                 description: Requerida sólo si el rol es admin. Si es cliente, se ignora.
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                     example: juan123
 *                   email:
 *                     type: string
 *                     example: juan@gmail.com
 *                   role:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get("/", getUsers);

export default router;