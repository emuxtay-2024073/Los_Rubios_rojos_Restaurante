import express from "express";
import {
    createMenuItem,
    getMenuItems,
    deleteMenuItem
} from "../controllers/menuItem.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MenuItems
 *   description: Gestión del menú del restaurante
 */

/**
 * @swagger
 * /menu-items:
 *   post:
 *     summary: Crear un nuevo item del menú
 *     tags: [MenuItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - restaurant
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hamburguesa Clásica
 *               price:
 *                 type: number
 *                 example: 45.50
 *               restaurant:
 *                 type: string
 *                 example: 64f123abc
 *     responses:
 *       201:
 *         description: Item creado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", createMenuItem);

/**
 * @swagger
 * /menu-items:
 *   get:
 *     summary: Obtener todos los items del menú
 *     tags: [MenuItems]
 *     responses:
 *       200:
 *         description: Lista de items del menú
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
 *                     example: Hamburguesa Clásica
 *                   price:
 *                     type: number
 *                     example: 45.50
 *                   restaurant:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get("/", getMenuItems);

/**
 * @swagger
 * /menu-items/{id}:
 *   delete:
 *     summary: Eliminar un item del menú
 *     tags: [MenuItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item del menú
 *     responses:
 *       200:
 *         description: Item eliminado correctamente
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", deleteMenuItem);

export default router;