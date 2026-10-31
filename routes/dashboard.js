const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { ensureAuthenticated } = require('../middleware/auth');
const { renderDashboardPage } = require('../utils/dashboardhelper');
const dayjs = require('dayjs');

const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

// GET: Dashboard route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    await renderDashboardPage(req, res);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Server Error');
  }
});

// GET: Edit medicine form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).lean();
    if (!medicine) return res.status(404).send('Medicine not found');

    if (!medicine.userId.equals(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    res.render('pages/editmedicine', { medicine });
  } catch (err) {
    console.error('Edit GET error:', err);
    res.status(500).send('Server error');
  }
});

// POST: Add medicine



// POST: Add medicine
router.post('/add-medicine', ensureAuthenticated, async (req, res) => {
  try {
    const { name, dosage, times, startDate, endDate, expiryDate, stock, reminder } = req.body;
    const timesArray = times.split(',').map(t => t.trim());

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const parsedExpiryDate = new Date(expiryDate);

    // Prevent adding expired medicine
    if (parsedExpiryDate >= parsedStartDate && parsedExpiryDate <= parsedEndDate) {
      const flashError = 'MEDICINE IS GOING TO EXPIRE. CANNOT ADD.';
      return await renderDashboardPage(req, res, flashError, null);
    }

    const newMedicine = new Medicine({
      name,
      dosage,
      times: timesArray,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      expiryDate: parsedExpiryDate,
      stock: parseInt(stock),
      reminder: parseInt(reminder),
      userId: req.user._id
    });

    await newMedicine.save();
    console.log('✅ Medicine added to DB:', newMedicine);

    // Redirect with success flash
    req.flash('success_msg', 'Medicine added successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('❌ Add medicine error:', error);
    req.flash('error_msg', 'Server error while adding medicine.');
    res.redirect('/dashboard');
  }
});



// router.post('/add-medicine', ensureAuthenticated, async (req, res) => {
//   try {
//     const { name, dosage, times, startDate, endDate, expiryDate, stock, reminder } = req.body;
//     const timesArray = times.split(',').map(t => t.trim());

//     const parsedStartDate = new Date(startDate);
//     const parsedEndDate = new Date(endDate);
//     const parsedExpiryDate = new Date(expiryDate);

//     // Prevent adding expired medicine
//     // if (parsedExpiryDate >= parsedStartDate && parsedExpiryDate <= parsedEndDate) {
//     //   req.flash('error_msg', 'MEDICINE IS GOING TO EXPIRE. CANNOT ADD.');
//     //   return await renderDashboardPage(req, res, req.flash('error_msg')[0], null);
//     // }
//     if (parsedExpiryDate >= parsedStartDate && parsedExpiryDate <= parsedEndDate) {
//   const errorMsg = 'MEDICINE IS GOING TO EXPIRE. CANNOT ADD.';
//   req.flash('error_msg', errorMsg);
//   return await renderDashboardPage(req, res, errorMsg, null);
// }


//     const newMedicine = new Medicine({
//       name,
//       dosage,
//       times: timesArray,
//       startDate: parsedStartDate,
//       endDate: parsedEndDate,
//       expiryDate: parsedExpiryDate,
//       stock: parseInt(stock),
//       reminder: parseInt(reminder),
//       userId: req.user._id
//     });

//     await newMedicine.save();
//     console.log('✅ Medicine added to DB:', newMedicine);
//     res.redirect('/dashboard');
//   } catch (error) {
//     console.error('❌ Add medicine error:', error);
//     res.status(500).send('Server error');
//   }
// });

// POST: Edit medicine
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).send('Medicine not found');

    if (!medicine.userId.equals(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    const { name, dosage, times, startDate, endDate, expiryDate, stock, reminder } = req.body;

    const parsedTimes = times.split(',').map(t => t.trim());
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const parsedExpiryDate = new Date(expiryDate);
    const parsedStock = parseInt(stock);
    const parsedReminder = parseInt(reminder);

    if (isNaN(parsedStock) || isNaN(parsedReminder)) {
      return res.status(400).send('Stock and Reminder must be valid numbers');
    }

    if (isNaN(parsedExpiryDate.getTime())) {
      return res.status(400).send('Invalid expiry date');
    }

    medicine.name = name;
    medicine.dosage = dosage;
    medicine.times = parsedTimes;
    medicine.startDate = parsedStartDate;
    medicine.endDate = parsedEndDate;
    medicine.expiryDate = parsedExpiryDate;
    medicine.stock = parsedStock;
    medicine.reminder = parsedReminder;

    await medicine.save();
    console.log('✅ Medicine updated:', medicine);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Edit POST error:', err);
    res.status(500).send('Server error');
  }
});


// POST: Mark as taken
router.post('/mark-taken/:id', ensureAuthenticated, async (req, res) => {
  try {
    // Find medicine belonging to the logged-in user
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medicine) {
      return res.status(404).send('Medicine not found');
    }

    const today = dayjs();
    const todayDateStr = today.format('YYYY-MM-DD');

    // Validate medicine schedule
    const scheduledToday =
      !dayjs(medicine.startDate).isAfter(today, 'day') &&
      !dayjs(medicine.endDate).isBefore(today, 'day');

    if (!scheduledToday) {
      return res.status(400).send('Medicine is not scheduled for today');
    }

    if (!Array.isArray(medicine.times) || medicine.times.length === 0) {
      return res.status(400).send('No scheduled medicine times found');
    }

    // Parse both 24-hour and 12-hour time formats
    const scheduledTimes = medicine.times.map(time => {
      const formats = [
        'YYYY-MM-DD H:mm',
        'YYYY-MM-DD HH:mm',
        'YYYY-MM-DD h:mm A',
        'YYYY-MM-DD hh:mm A'
      ];

      return dayjs(
        `${todayDateStr} ${time}`,
        formats,
        true
      );
    });

    if (scheduledTimes.some(time => !time.isValid())) {
      return res.status(400).send('Invalid scheduled time format');
    }

    const latestTime = scheduledTimes.reduce((latest, current) =>
      current.isAfter(latest) ? current : latest
    );

    // Preserve the existing rule: all scheduled times must have passed
    if (today.isBefore(latestTime)) {
      return res.status(400).send(
        'Cannot mark as taken before the last scheduled time has passed'
      );
    }

    // Ensure takenLogs exists
    if (!Array.isArray(medicine.takenLogs)) {
      medicine.takenLogs = [];
    }

    // Store each scheduled intake against today's date
    for (const time of medicine.times) {
      const alreadyTaken = medicine.takenLogs.some(log =>
        log.date === todayDateStr && log.time === time
      );

      if (!alreadyTaken) {
        medicine.takenLogs.push({
          date: todayDateStr,
          time: time
        });
      }
    }

    // Persist changes in MongoDB
    await medicine.save();

    console.log(
      `Medicine ${medicine.name} marked as taken for ${todayDateStr}`
    );

    return res.status(200).json({
      success: true,
      message: 'Medicine marked as taken',
      date: todayDateStr
    });

  } catch (error) {
    console.error('Error marking medicine as taken:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// POST: Delete medicine
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).send('Medicine not found');
    }

    if (!medicine.userId.equals(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    await Medicine.deleteOne({ _id: req.params.id });
    console.log('✅ Medicine deleted:', req.params.id);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;