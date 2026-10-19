const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

// Get all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({
            createdAt: -1
        });

        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch events"
        });
    }
});

// Create a new event
router.post("/", authMiddleware, async (req, res) => {
    try {
        if (!["organizer", "admin"].includes(req.user.role)) {
            return res.status(403).json({
                message: "Only organizers or admins can create events"
            });
        }

        const { name, date, venue, department } = req.body;

        if (
            !name?.trim() ||
            !date?.trim() ||
            !venue?.trim()
        ) {
            return res.status(400).json({
                message: "Event name, date and venue are required"
            });
        }

        const event = await Event.create({
            name: name.trim(),
            date: date.trim(),
            venue: venue.trim(),
            department: department?.trim() || "General"
        });

        return res.status(201).json({
            message: "Event created successfully",
            event
        });
    } catch (error) {
        console.error("Create event error:", error.message);

        return res.status(500).json({
            message: "Unable to create event"
        });
    }
});

module.exports = router;