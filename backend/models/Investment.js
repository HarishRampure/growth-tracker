const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  assetClass: {
    type: String,
    enum: ['Mutual Funds', 'Stocks', 'Gold', 'Fixed Deposits'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true,
    default: 0
  },
  sipAmount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Investment || mongoose.model('Investment', InvestmentSchema);
