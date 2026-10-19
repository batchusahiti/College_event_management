const QRCode = require("qrcode");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const Attendance = require("../models/Attendance");

// Generate QR code for an event
const generateQRCode = async (req, res) => {
    try {
        // Only organizers and admins can generate QR codes
        if (!["organizer", "admin"].includes(req.user.role)) {
            return res.status(403).json({
                message: "Only organizers or admins can generate QR codes"
            });
        }

        const { eventId } = req.body;

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                message: "Valid Event ID is required"
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const qrData = JSON.stringify({
            eventId: event._id.toString()
        });

        const qrCodeImage = await QRCode.toDataURL(qrData);

        return res.status(200).json({
            message: "QR code generated successfully",
            eventId: event._id,
            qrCode: qrCodeImage
        });
    } catch (error) {
        console.error("QR generation error:", error.message);

        return res.status(500).json({
            message: "Failed to generate QR code"
        });
    }
};

// Mark attendance after scanning the event QR code
const markAttendance = async (req, res) => {
    try {
        // Only students can mark their own attendance
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can mark attendance"
            });
        }

        let { eventId, qrData } = req.body;

        // QR scanners usually return the QR contents as a string
        if (!eventId && typeof qrData === "string") {
            try {
                const parsedData = JSON.parse(qrData);
                eventId = parsedData.eventId;
            } catch {
                return res.status(400).json({
                    message: "Invalid QR code data"
                });
            }
        }

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                message: "Valid Event ID or QR data is required"
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const attendance = await Attendance.create({
            student: req.user.id,
            eventId: event._id
        });

        return res.status(201).json({
            message: "Attendance marked successfully",
            attendance
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Attendance already marked for this event"
            });
        }

        console.error("Attendance marking error:", error.message);

        return res.status(500).json({
            message: "Failed to mark attendance"
        });
    }
};

module.exports = {
    generateQRCode,
    markAttendance
};