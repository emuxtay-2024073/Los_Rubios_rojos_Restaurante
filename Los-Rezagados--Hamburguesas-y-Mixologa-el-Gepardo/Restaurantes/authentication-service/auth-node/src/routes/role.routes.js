import { Router } from "express";
import { createRole, getRoles } from "../controllers/role.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles y permisos
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: ADMIN
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["create", "read", "update", "delete"]
 *     responses:
 *       201:
 *         description: Rol creado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", createRole);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                     example: ADMIN
 *                   permissions:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Error del servidor
 */
router.get("/", getRoles);

export default router;