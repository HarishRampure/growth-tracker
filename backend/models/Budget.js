const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  limit: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
