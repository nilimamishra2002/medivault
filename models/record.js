// models/record.js
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  doctor: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    trim: true
  },
  prescriptionImage: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Record', recordSchema);