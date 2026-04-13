const Order = require("../models/Order");
const Menu = require("../models/Menu");


exports.createOrder = async (req, res) => {
    try {
        const { table, items } = req.body;

        let total = 0;

        const detailedItems = await Promise.all(items.map(async (item) => {
            const menuItem = await Menu.findById(item.menuItem);

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

        res.status(201).json(order);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.updateStatus = async (req, res) => {
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
exports.getOrders = async (req, res) => {
    const orders = await Order.find().populate("table items.menuItem");
    res.json(orders);
};