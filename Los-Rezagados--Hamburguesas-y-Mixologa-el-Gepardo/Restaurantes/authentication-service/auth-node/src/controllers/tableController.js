const Table = require("../models/Table");

exports.createTable = async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.status(201).json(table);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getTables = async (req, res) => {
    const tables = await Table.find();
    res.json(tables);
};