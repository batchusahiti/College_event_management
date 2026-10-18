const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/college_event_management")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Error:", err));

// Event Schema
const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
});

const Event = mongoose.model("Event", eventSchema);

// Home route
app.get("/", (req, res) => {
  res.send("College Event Management Backend Running");
});

// Test events route
app.get("/events", (req, res) => {
  res.send("Events route is working!");
});

// Create event
app.post("/events", async (req, res) => {
  try {
    const { name, date, venue } = req.body;

    if (!name || !date || !venue) {
      return res.status(400).json({
        message: "Please provide name, date, and venue",
      });
    }

    const event = await Event.create({
      name,
      date,
      venue,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating event",
      error: err.message,
    });
  }
});

// Get all events
app.get("/all-events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});