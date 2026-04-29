import Restaurant from "../models/Restaurant.js";

export const createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json(restaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getRestaurants = async (req, res) => {
    const restaurants = await Restaurant.find({ isDeleted: false });
    res.json(restaurants);
};

export const deleteRestaurant = async (req, res) => {
    await Restaurant.findByIdAndUpdate(req.params.id, {
        isDeleted: true
    });

    res.json({ message: "Restaurant eliminado (soft delete)" });
};

