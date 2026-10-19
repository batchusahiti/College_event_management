const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: String,
            required: true,
            trim: true
        },
        venue: {
            type: String,
            required: true,
            trim: true
        },
        department: {
            type: String,
            required: true,
            trim: true,
            default: "General"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Event", eventSchema);