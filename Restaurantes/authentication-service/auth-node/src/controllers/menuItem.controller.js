import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";

export const createMenuItem = async (req, res) => {
    try {
        const { restaurant } = req.body;

        const existingRestaurant = await Restaurant.findById(restaurant);
        if (!existingRestaurant) {
            return res.status(404).json({
                message: "El restaurante no existe"
            });
        }

        const menuItem = await MenuItem.create(req.body);

        res.status(201).json({
            message: "Platillo creado correctamente",
            menuItem
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ isDeleted: false })
            .populate({
                path: "restaurant",
                match: { isDeleted: false }
            });

        res.json({
            message: "Platillos obtenidos correctamente",
            menuItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMenuItemsByRestaurant = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId, isDeleted: false });
        res.json({
            message: "Platillos del restaurante obtenidos correctamente",
            menuItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!menuItem) {
            return res.status(404).json({ message: "Platillo no encontrado" });
        }
        res.json({
            message: "Platillo actualizado correctamente",
            menuItem
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        await MenuItem.findByIdAndUpdate(req.params.id, {
            isDeleted: true
        });
        res.json({ message: "Platillo eliminado correctamente (soft delete)" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

