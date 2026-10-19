const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        markedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Same student ki same event lo
// duplicate attendance allow cheyyadu.
attendanceSchema.index(
    { student: 1, eventId: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "Attendance",
    attendanceSchema
);