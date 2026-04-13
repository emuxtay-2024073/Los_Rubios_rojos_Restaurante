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

        res.status(201).json(menuItem);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMenuItems = async (req, res) => {
    const menuItems = await MenuItem.find({ isDeleted: false })
        .populate({
            path: "restaurant",
            match: { isDeleted: false }
        });

    res.json(menuItems);
};

export const deleteMenuItem = async (req, res) => {
    await MenuItem.findByIdAndUpdate(req.params.id, {
        isDeleted: true
    });

    res.json({ message: "MenuItem eliminado (soft delete)" });
};

