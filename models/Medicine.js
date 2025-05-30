// // const mongoose = require('mongoose');

// // const medicineSchema = new mongoose.Schema({
// //   name: String,
// //   dosage: String,
// //   times: [String],
// //   startDate: Date,
// //   endDate: Date,
// //   expiryDate: Date,
// //   stock: Number,
// //   reminder: Number,
// //   takenDates: [String], // array of dates like "2025-05-18"

// //   taken: { type: Boolean, default: false },
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true }
// // });

// // module.exports = mongoose.model('Medicine', medicineSchema);


// const mongoose = require('mongoose');

// const medicineSchema = new mongoose.Schema({
//   name: String,
//   dosage: String,
//   times: [String], // e.g., ["8:00 AM", "2:00 PM"]
//   startDate: Date,
//   endDate: Date,
//   expiryDate: Date,
//   stock: Number,
//   reminder: Number,

//   // Track per time slot taken
//   takenLogs: [
//     {
//       date: String, // "2025-05-26"
//       time: String  // "8:00 AM"
//     }
//   ],

//   taken: { type: Boolean, default: false }, // optional
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// });

// module.exports = mongoose.model('Medicine', medicineSchema);


const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: String,
  times: [String], // e.g., ["8:00 AM", "2:00 PM"]
  startDate: Date,
  endDate: Date,
  expiryDate: Date,
  stock: Number,
  reminder: Number,

  takenLogs: [
    {
      date: String, // "2025-05-26"
      time: String  // "8:00 AM"
    }
  ],

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Optional: a virtual to check if medicine is fully taken today
medicineSchema.virtual('takenToday').get(function() {
  const today = new Date().toISOString().slice(0,10);
  return this.times.every(time =>
    this.takenLogs.some(log => log.date === today && log.time === time)
  );
});

module.exports = mongoose.model('Medicine', medicineSchema);
