const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ================= MONGODB CONNECTION =================

mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/college_event_management"
  )
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) =>
    console.error("MongoDB Connection Error:", error.message)
  );

// ================= EVENT SCHEMA =================

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
      default: "General",
    },
  },
  { timestamps: true }
);

const Event =
  mongoose.models.Event ||
  mongoose.model("Event", eventSchema);

// ================= REGISTRATION SCHEMA =================

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Keep these fields for compatibility with
    // the existing admin dashboard.
    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true }
);

// A student can register only once for a particular event.
registrationSchema.index(
  { student: 1, event: 1 },
  { unique: true }
);

const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);

// ================= HOME =================

app.get("/", (req, res) => {
  res.status(200).send(
    "College Event Management Backend is running!"
  );
});

// ================= ADMIN LOGIN =================

app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const adminUsername = process.env.ADMIN_USERNAME?.trim();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const jwtSecret = process.env.JWT_SECRET?.trim();

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    if (!adminUsername || !passwordHash || !jwtSecret) {
      console.error("Admin environment configuration missing");

      return res.status(500).json({
        error: "Admin login is not configured",
      });
    }

    const usernameMatches =
      username.trim() === adminUsername;

    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        username: adminUsername,
        role: "admin",
      },
      jwtSecret,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      username: adminUsername,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// ================= ADMIN AUTHENTICATION =================

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Admin login required",
    });
  }

  if (!jwtSecret) {
    return res.status(500).json({
      error: "Server authentication is not configured",
    });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token. Please log in again.",
    });
  }
}

// ================= CREATE STUDENT =================

app.post("/students", async (req, res) => {
  try {
    const {
      studentName,
      email,
      rollNumber,
      department,
    } = req.body || {};

    if (
      typeof studentName !== "string" ||
      !studentName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof rollNumber !== "string" ||
      !rollNumber.trim() ||
      typeof department !== "string" ||
      !department.trim()
    ) {
      return res.status(400).json({
        error: "All student details are required",
      });
    }

    const cleanName = studentName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRollNumber = rollNumber.trim().toUpperCase();
    const cleanDepartment = department.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    // Check whether email or roll number already exists.
    const existingStudent = await Student.findOne({
      $or: [
        { email: cleanEmail },
        { rollNumber: cleanRollNumber },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        error: "Email or roll number already exists",
      });
    }

    const student = await Student.create({
      studentName: cleanName,
      email: cleanEmail,
      rollNumber: cleanRollNumber,
      department: cleanDepartment,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Email or roll number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Student creation error:", error.message);

    return res.status(500).json({
      error: "Unable to save student",
    });
  }
});

// ================= GET STUDENTS =================

app.get("/students", verifyAdmin, async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error.message);

    return res.status(500).json({
      error: "Unable to load students",
    });
  }
});

// ================= GET EVENTS =================
// Optional filter: GET /events?department=CSE

app.get("/events", async (req, res) => {
  try {
    const filter = {};

    if (
      typeof req.query.department === "string" &&
      req.query.department.trim()
    ) {
      const department = req.query.department
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.department = {
        $regex: "^" + department + "$",
        $options: "i",
      };
    }

    const events = await Event.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Get events error:", error.message);

    return res.status(500).json({
      error: "Unable to load events",
    });
  }
});

// ================= ADD EVENT =================

app.post("/events", verifyAdmin, async (req, res) => {
  try {
    const { name, date, venue, department } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof date !== "string" ||
      !date.trim() ||
      typeof venue !== "string" ||
      !venue.trim()
    ) {
      return res.status(400).json({
        error: "Event name, date and venue are required",
      });
    }

    const event = await Event.create({
      name: name.trim(),
      date: date.trim(),
      venue: venue.trim(),

      department:
        typeof department === "string" && department.trim()
          ? department.trim()
          : "General",
    });

    return res.status(201).json({
      message: "Event added successfully",
      event,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Add event error:", error.message);

    return res.status(500).json({
      error: "Unable to add event",
    });
  }
});

// ================= UPDATE EVENT =================

app.put("/events/:id", verifyAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid event ID",
      });
    }

    const allowedFields = [
      "name",
      "date",
      "venue",
      "department",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          !req.body[field].trim()
        ) {
          return res.status(400).json({
            error: `Valid ${field} is required`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Provide at least one field to update",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    // Keep saved registration display names synchronized.
    if (updates.name) {
      await Registration.updateMany(
        { event: event._id },
        { $set: { eventName: event.name } }
      );
    }

    return res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error.message);

    return res.status(500).json({
      error: "Unable to update event",
    });
  }
});

// ================= DELETE EVENT =================

app.delete("/events/:id", verifyAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    // Delete registrations associated with this event.
    await Registration.deleteMany({
      event: event._id,
    });

    await Event.findByIdAndDelete(event._id);

    return res.status(200).json({
      message: "Event and associated registrations deleted successfully",
      event,
    });
  } catch (error) {
    console.error("Delete event error:", error.message);

    return res.status(500).json({
      error: "Unable to delete event",
    });
  }
});

// ================= GET REGISTRATIONS =================

app.get("/registrations", verifyAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student")
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      registrations.map((registration) => ({
        _id: registration._id,

        event: registration.event?._id || registration.event,
        student: registration.student?._id || registration.student,

        eventName:
          registration.event?.name ||
          registration.eventName,

        studentName:
          registration.student?.studentName ||
          registration.studentName,

        email:
          registration.student?.email ||
          registration.email,

        rollNumber:
          registration.student?.rollNumber ||
          registration.rollNumber,

        department:
          registration.student?.department || "",

        createdAt: registration.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get registrations error:", error.message);

    return res.status(500).json({
      error: "Unable to load registrations",
    });
  }
});

// ================= STUDENT EVENT REGISTRATION =================
// Accepts studentId + eventId.
// The student must already exist in the Students collection.

app.post("/registrations", async (req, res) => {
  try {
    const { studentId, eventId } = req.body || {};

    if (
      typeof studentId !== "string" ||
      !mongoose.isValidObjectId(studentId) ||
      typeof eventId !== "string" ||
      !mongoose.isValidObjectId(eventId)
    ) {
      return res.status(400).json({
        error: "Valid studentId and eventId are required",
      });
    }

    const student = await Student.findById(studentId);
    const event = await Event.findById(eventId);

    if (!student) {
      return res.status(404).json({
        error: "Student not found. Register the student first.",
      });
    }

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    const existingRegistration = await Registration.findOne({
      student: student._id,
      event: event._id,
    });

    if (existingRegistration) {
      return res.status(409).json({
        error: "This student is already registered for this event",
      });
    }

    const registration = await Registration.create({
      student: student._id,
      event: event._id,

      eventName: event.name,
      studentName: student.studentName,
      email: student.email,
      rollNumber: student.rollNumber,
    });

    return res.status(201).json({
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "This student is already registered for this event",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      error: "Unable to save registration",
    });
  }
});

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});