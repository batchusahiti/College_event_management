
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authroutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/events", eventRoutes);

// Home route
app.get("/", (req, res) => {
    res.status(200).send(
        "College Event Management Backend is running!"
    );
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(
            "Failed to start server:",
            error.message
        );
    }
};

startServer();
