import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: String,
    email: String,
    capacity: Number,
    openingHours: String,
    manager: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Restaurant", restaurantSchema);
