
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
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

// ------------------------------------
// 2. Registration Schema
// ------------------------------------
const registrationSchema = new mongoose.Schema({
    eventName: String,
    studentName: String,
    email: String,
    rollNumber: String,
});

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

// ------------------------------------
// 3. Verify Admin Token
// ------------------------------------
function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Please login as admin first."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                error: "Admin access required."
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired login. Please login again."
        });
    }
}

// ------------------------------------
// 4. Home Route
// ------------------------------------
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