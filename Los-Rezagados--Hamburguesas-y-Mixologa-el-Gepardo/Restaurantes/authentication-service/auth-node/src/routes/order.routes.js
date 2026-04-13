const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

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
router.post("/", controller.createOrder);

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
router.get("/", controller.getOrders);

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
router.put("/:id/status", controller.updateStatus);

module.exports = router;