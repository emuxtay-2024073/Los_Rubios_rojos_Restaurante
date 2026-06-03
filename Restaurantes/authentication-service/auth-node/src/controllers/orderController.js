import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";


export const createOrder = async (req, res) => {
    try {
        const { table, items } = req.body;

        if (!table || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "La mesa y los productos son obligatorios" });
        }

        const existingTable = await Table.findOne({ _id: table, isDeleted: { $ne: true } });
        if (!existingTable) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        let total = 0;

        const detailedItems = await Promise.all(items.map(async (item) => {
            const menuItem = await MenuItem.findOne({ _id: item.menuItem, isDeleted: { $ne: true } });

            if (!menuItem) {
                throw new Error("Producto no encontrado");
            }

            const subtotal = menuItem.price * item.quantity;
            total += subtotal;

            return {
                menuItem: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price
            };
        }));

        const order = new Order({
            table,
            items: detailedItems,
            total
        });

        await order.save();
        await Table.findByIdAndUpdate(table, { status: "no disponible" });

        res.status(201).json(order);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener pedidos
export const getOrders = async (req, res) => {
    const orders = await Order.find().populate("table items.menuItem");
    res.json(orders);
};
