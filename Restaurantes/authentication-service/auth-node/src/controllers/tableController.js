import Table from "../models/Table.js";

export const createTable = async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.status(201).json(table);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const getTables = async (req, res) => {
    const filter = {};
    if (req.query.restaurant) {
        filter.restaurant = req.query.restaurant;
    }
    const tables = await Table.find(filter).populate("restaurant");
    res.json(tables);
};