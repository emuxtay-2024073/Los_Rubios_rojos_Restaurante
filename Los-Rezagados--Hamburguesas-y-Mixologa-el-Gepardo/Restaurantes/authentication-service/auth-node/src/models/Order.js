const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true,
        },
        items: [
            {
                menuItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        total: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["pendiente", "preparacion", "entregado"],
            default: "pendiente",
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
