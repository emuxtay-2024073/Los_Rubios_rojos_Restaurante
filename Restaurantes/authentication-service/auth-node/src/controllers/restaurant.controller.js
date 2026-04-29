import Restaurant from "../models/Restaurant.js";

export const createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json({
            message: "Restaurante creado correctamente",
            restaurant
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isDeleted: false });
        res.json({
            message: "Restaurantes obtenidos correctamente",
            restaurants
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }
        res.json({
            message: "Restaurante obtenido correctamente",
            restaurant
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }
        res.json({
            message: "Restaurante actualizado correctamente",
            restaurant
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.findByIdAndUpdate(req.params.id, {
            isDeleted: true
        });
        res.json({ message: "Restaurante eliminado correctamente (soft delete)" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

