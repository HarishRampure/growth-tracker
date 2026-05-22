const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  payee: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Auto', 'Fixed', 'Manual'],
    default: 'Manual'
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true
  },
  verified: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
