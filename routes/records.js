const express = require('express');
const router = express.Router();
const multer = require('multer');
const Record = require('../models/record');
const { ensureAuthenticated } = require('../middleware/auth');

// Multer config: memory storage, 100KB limit, image only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 },  // 100KB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedTypes.test(file.mimetype);
    cb(isValid ? null : new Error('Only image files are allowed!'), isValid);
  }
});

// Helper: combine date+time and check if appointment is in future
// function isFutureAppointment(dateStr, timeStr) {
//   if (!dateStr || !timeStr) return false;
//   const dateTime = new Date(`${dateStr}T${timeStr}:00`);
//   return dateTime >= new Date();
// }
function isFutureAppointment(dateStr, timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  const appointmentDateTime = new Date(dateStr);
  appointmentDateTime.setHours(hour, minute, 0, 0);

  return appointmentDateTime > new Date();
}


// GET all records with nextAppointment
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const records = await Record.find({}).sort({ date: -1, time: -1 });

    // Find next upcoming appointment by date+time
    const nextAppointment = records.find(r => isFutureAppointment(r.date.toISOString().slice(0,10), r.time));

    res.render('pages/records', {
      records,
      userName:req.user.username,
      nextAppointment: nextAppointment || null,
      
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load records.');
    res.redirect('/');
  }
});

router.post('/add', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const { doctor, date, timeHour, timeMinute, timeAmPm, purpose } = req.body;

    // Convert hour to 24-hour format
    let hour24 = parseInt(timeHour);
    if (timeAmPm === 'PM' && hour24 < 12) hour24 += 12;
    if (timeAmPm === 'AM' && hour24 === 12) hour24 = 0;

    const minute = parseInt(timeMinute); // Make sure this is a number

    const formattedTime = `${hour24.toString().padStart(2, '0')}:${timeMinute.padStart(2, '0')}`;

    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hour24, minute, 0, 0);

    if (appointmentDateTime <= new Date()) {
      req.flash('error', 'Appointment time must be in the future.');
      return res.redirect('/records');
    }

    const newRecord = new Record({
      doctor,
      date,
      time: formattedTime,
      purpose,
      prescriptionImage: imageBase64 || '',
    });

    await newRecord.save();
    req.flash('success', 'Record added successfully.');
    res.redirect('/records');
  } catch (err) {
    console.error('Error saving record:', err);
    req.flash('error', `Failed to save record: ${err.message}`);
    res.redirect('/records');
  }
});

// POST Edit existing record
router.post('/edit/:id', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { doctor, date, time, purpose } = req.body;
    const updateData = { doctor, date, time, purpose };

    if (req.file) {
      updateData.prescriptionImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await Record.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Record updated successfully.');
    res.redirect('/records');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update record.');
    res.redirect('/records');
  }
});

// POST Delete record
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);
    req.flash('success', 'Record deleted successfully.');
    res.redirect('/records');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete record.');
    res.redirect('/records');
  }
});

module.exports = router;
