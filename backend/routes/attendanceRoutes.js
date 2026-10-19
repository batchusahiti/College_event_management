const express = require("express");
const router = express.Router();

const {
    generateQRCode,
    markAttendance
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");

// Generate an event QR code
router.post(
    "/generate-qr",
    authMiddleware,
    generateQRCode
);

// Mark attendance using QR data
router.post(
    "/mark-attendance",
    authMiddleware,
    markAttendance
);

module.exports = router;