import mongoose from "mongoose";

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
                    ref: "MenuItem",
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

export default mongoose.model("Order", orderSchema);
