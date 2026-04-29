import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: String
});

export default mongoose.model("Review", reviewSchema);