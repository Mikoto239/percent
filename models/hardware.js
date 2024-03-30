const mongoose = require('mongoose');

const hardwareSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Hardware = mongoose.model('Hardware', hardwareSchema);

module.exports = Hardware;
