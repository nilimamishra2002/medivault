const Medicine = require('../models/Medicine');
const dayjs = require('dayjs');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Generates alerts for low stock and upcoming expiry
 */
function generateAlerts(meds) {
  const alerts = [];
  const today = dayjs();

  meds.forEach(med => {
    if (med.stock <= 5) {
      alerts.push(`${med.name} stock is low! Only ${med.stock} left.`);
    }

    if (
      med.expiryDate &&
      dayjs(med.expiryDate).isValid() &&
      dayjs(med.expiryDate).diff(today, 'day') <= med.reminder
    ) {
      alerts.push(`${med.name} is expiring soon on ${dayjs(med.expiryDate).format('MMM D, YYYY')}`);
    }
  });

  return alerts;
}

/**
 * Renders the dashboard page with all required data
 */

async function renderDashboardPage(req, res, flashError = null, flashSuccess = null) {
  try {
    const userId = req.user._id;
    const userName = req.user.username || 'John Doe';

    const today = dayjs().startOf('day');
    const todayDate = today.format('YYYY-MM-DD');
    const now = dayjs();

    const allMeds = await Medicine.find({ userId }).lean();

    // Filter medicines scheduled for today
    const medicines = allMeds.filter(med => {
      const start = dayjs(med.startDate).startOf('day');
      const end = dayjs(med.endDate).endOf('day');

      return today.isSameOrAfter(start) &&
             today.isSameOrBefore(end);
    });

    // Calculate medicine-taking status using takenLogs
    const medicinesWithStatus = medicines.map(med => {

      const takenLogs = med.takenLogs || [];
      const times = med.times || [];

      const isTakenToday = times.length > 0 &&
        times.every(time =>
          takenLogs.some(log =>
            log.date === todayDate &&
            log.time === time
          )
        );

      return {
        ...med,
        isTakenToday,
        taken: isTakenToday
      };
    });

    // Prepare today's medicine schedule
    const todayMeds = medicinesWithStatus.map(med => {

      const timeStatus = (med.times || []).map(time => {

        const formats = [
          'YYYY-MM-DD H:mm',
          'YYYY-MM-DD HH:mm',
          'YYYY-MM-DD h:mm A',
          'YYYY-MM-DD hh:mm A'
        ];

        const timeMoment = dayjs(
          `${todayDate} ${time}`,
          formats,
          true
        );

        return {
          time,
          isTimePassed:
            timeMoment.isValid() &&
            now.isSameOrAfter(timeMoment)
        };
      });

      return {
        ...med,
        timeStatus
      };
    });

    res.render('pages/dashboard', {
      userName,
      todayMeds,
      dayjs,
      medicines: medicinesWithStatus,
      alerts: generateAlerts(medicinesWithStatus),
      error_msg: flashError || req.flash('error_msg')[0] || null,
      success_msg: flashSuccess || req.flash('success_msg')[0] || null
    });

  } catch (error) {
    console.error('renderDashboardPage error:', error);
    res.status(500).send('Server error');
  }
}


module.exports = {
  renderDashboardPage,
  generateAlerts
};