// routes/attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

router.post('/check-in', async (req, res) => {
    const { workerId, siteId } = req.body;
    try {
        const newRecord = new Attendance({
            workerId,
            siteId,
            checkIn: new Date(),
            status: 'Present'
        });
        await newRecord.save();
        res.status(201).json({ message: 'Checked in successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;