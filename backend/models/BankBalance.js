const mongoose = require('mongoose');

const BankBalanceSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  accountNumber: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.BankBalance || mongoose.model('BankBalance', BankBalanceSchema);
