import express from "express";
import {
    createRestaurant,
    getRestaurants,
    deleteRestaurant
} from "../controllers/restaurant.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Gestión de restaurantes
 */

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Crear un nuevo restaurante
 *     tags: [Restaurants]
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
 *                 example: Restaurante El Buen Sabor
 *               address:
 *                 type: string
 *                 example: Zona 1, Ciudad de Guatemala
 *     responses:
 *       201:
 *         description: Restaurante creado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", createRestaurant);

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Obtener todos los restaurantes
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: Lista de restaurantes
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
 *                     example: Restaurante El Buen Sabor
 *                   address:
 *                     type: string
 *                     example: Zona 1, Ciudad de Guatemala
 *       500:
 *         description: Error del servidor
 */
router.get("/", getRestaurants);

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Eliminar un restaurante
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Restaurante eliminado correctamente
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", deleteRestaurant);

export default router;