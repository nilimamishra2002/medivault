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
    const today = dayjs().startOf('day');
    const now = dayjs();

    // Fetch ALL saved medicines belonging to this user
    const allMeds = await Medicine.find({ userId }).lean();

    // Filter medicines scheduled for today
    const activeMedicines = allMeds.filter(med => {
      const start = dayjs(med.startDate).startOf('day');
      const end = dayjs(med.endDate).endOf('day');

      return today.isSameOrAfter(start) &&
             today.isSameOrBefore(end);
    });

    // Build today's medicine status
    const todayMeds = activeMedicines.map(med => {
      const todayDate = today.format('YYYY-MM-DD');

      const timeStatus = med.times.map(time => {
        const timeMoment = dayjs(
          `${todayDate} ${time}`,
          'YYYY-MM-DD HH:mm'
        );

        return {
          time,
          isTimePassed: now.isSameOrAfter(timeMoment)
        };
      });

      // Existing takenDates logic
      const isTakenToday = med.takenDates?.some(d =>
        dayjs(d).isSame(today, 'day')
      ) || false;

      return {
        ...med,
        isTakenToday,
        timeStatus
      };
    });

    res.render('pages/dashboard', {
      userName: req.user.username,
      todayMeds,
      medicines: allMeds,
      dayjs,

      // Alerts based on medicines currently active
      alerts: generateAlerts(activeMedicines),

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