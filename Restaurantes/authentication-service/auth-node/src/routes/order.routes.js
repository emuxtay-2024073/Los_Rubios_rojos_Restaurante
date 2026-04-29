import express from "express";
import * as controller from "../controllers/orderController.js";
import { verifyToken, verifyRole } from "../middleware/auth.middleware.js";
import { ROLE_ADMIN } from "../utils/roles.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestión de órdenes del restaurante
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table
 *               - items
 *             properties:
 *               table:
 *                 type: string
 *                 example: 64f123abc
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItem
 *                     - quantity
 *                   properties:
 *                     menuItem:
 *                       type: string
 *                       example: 64f456def
 *                     quantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Orden creada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", verifyToken, controller.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener todas las órdenes
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   table:
 *                     type: string
 *                   items:
 *                     type: array
 *                   total:
 *                     type: number
 *                   status:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get("/", verifyToken, controller.getOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Actualizar el estado de una orden
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: completado
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/:id/status", verifyToken, verifyRole(ROLE_ADMIN), controller.updateStatus);

export default router;