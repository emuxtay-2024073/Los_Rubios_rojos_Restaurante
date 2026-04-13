const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["disponible", "ocupada"],
        default: "disponible"
    }
});

module.exports = mongoose.model("Table", tableSchema);