const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { checkDatabaseState } = require('./db');
const { verifyToken, JWT_SECRET } = require('./middleware/auth');
const store = require('./store');

// Models
const BankBalance = require('./models/BankBalance');
const Budget = require('./models/Budget');
const Investment = require('./models/Investment');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

// Utility: Check if we should use MongoDB or In-Memory
const isDbConnected = () => {
  return checkDatabaseState().connected;
};

// ==========================================
// 🔓 PUBLIC AUTH ROUTES
// ==========================================

// 1. GET /api/status - Public endpoint to read server sync stats
router.get('/status', (req, res) => {
  res.json({
    status: "online",
    database: checkDatabaseState(),
    mode: isDbConnected() ? "MongoDB Atlas" : "In-Memory Simulation Mode"
  });
});

// 2. POST /api/auth/register - Register a new account
router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required fields." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isDbConnected()) {
      // Check if user already exists
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "Username already taken." });
      }

      const newUser = new User({
        username: username.toLowerCase(),
        password: hashedPassword
      });
      await newUser.save();

      return res.json({ success: true, message: "User registered successfully! Proceed to login." });
    } else {
      // In-Memory
      const existing = store.state.users.some(u => u.username === username.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: "Username already taken." });
      }

      const newUser = {
        _id: Math.random().toString(36).substr(2, 9),
        username: username.toLowerCase(),
        password: hashedPassword,
        onboardingCompleted: false
      };
      store.state.users.push(newUser);

      return res.json({ success: true, message: "User registered successfully in-memory! Proceed to login." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/auth/login - Authenticate credentials and sign JWT token
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required fields." });
  }

  try {
    let user;
    if (isDbConnected()) {
      user = await User.findOne({ username: username.toLowerCase() });
    } else {
      user = store.state.users.find(u => u.username === username.toLowerCase());
    }

    if (!user) {
      return res.status(400).json({ error: "User not found with supplied credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password credentials." });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🔒 SECURED FINANCE ROUTES (JWT Verified)
// ==========================================

// Apply verifyToken middleware to all routes listed below
router.use(verifyToken);

// 4. GET /api/balances - Get bank balances
router.get('/balances', async (req, res) => {
  try {
    if (isDbConnected()) {
      const balances = await BankBalance.find();
      return res.json(balances);
    } else {
      return res.json(store.state.bankBalances);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PUT /api/balances/:id - Update bank balance
router.put('/balances/:id', async (req, res) => {
  const { balance } = req.body;
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const updated = await BankBalance.findByIdAndUpdate(
        id,
        { balance, lastUpdated: new Date() },
        { new: true }
      );
      return res.json(updated);
    } else {
      const balanceIdx = store.state.bankBalances.findIndex(b => b._id === id || b.accountName === id);
      if (balanceIdx !== -1) {
        store.state.bankBalances[balanceIdx].balance = Number(balance);
        store.state.bankBalances[balanceIdx].lastUpdated = new Date();
        return res.json(store.state.bankBalances[balanceIdx]);
      }
      return res.status(404).json({ error: "Bank account not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /api/budgets - Get budgets
router.get('/budgets', async (req, res) => {
  try {
    if (isDbConnected()) {
      const budgets = await Budget.find();
      return res.json(budgets);
    } else {
      return res.json(store.state.budgets);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. PUT /api/budgets - Create or update a budget limit
router.put('/budgets', async (req, res) => {
  const { category, limit } = req.body;

  try {
    if (isDbConnected()) {
      const updated = await Budget.findOneAndUpdate(
        { category },
        { limit: Number(limit) },
        { new: true, upsert: true }
      );
      return res.json(updated);
    } else {
      const budgetIdx = store.state.budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
      if (budgetIdx !== -1) {
        store.state.budgets[budgetIdx].limit = Number(limit);
        return res.json(store.state.budgets[budgetIdx]);
      } else {
        const newBudget = { _id: 'bud_local_' + Math.random().toString(36).substr(2, 9), category, limit: Number(limit) };
        store.state.budgets.push(newBudget);
        return res.json(newBudget);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. GET /api/investments - Get investments
router.get('/investments', async (req, res) => {
  try {
    if (isDbConnected()) {
      const investments = await Investment.find();
      return res.json(investments);
    } else {
      return res.json(store.state.investments);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. PUT /api/investments/:id - Update investment values
router.put('/investments/:id', async (req, res) => {
  const { value, sipAmount } = req.body;
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const updated = await Investment.findByIdAndUpdate(
        id,
        { value: Number(value), sipAmount: Number(sipAmount), lastUpdated: new Date() },
        { new: true }
      );
      return res.json(updated);
    } else {
      const investIdx = store.state.investments.findIndex(inv => inv._id === id || inv.name === id);
      if (investIdx !== -1) {
        if (value !== undefined) store.state.investments[investIdx].value = Number(value);
        if (sipAmount !== undefined) store.state.investments[investIdx].sipAmount = Number(sipAmount);
        store.state.investments[investIdx].lastUpdated = new Date();
        return res.json(store.state.investments[investIdx]);
      }
      return res.status(404).json({ error: "Investment not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. GET /api/transactions - Get transaction ledger with filters
router.get('/transactions', async (req, res) => {
  const { search, category, status, type } = req.query;

  try {
    let txs = [];
    if (isDbConnected()) {
      let query = {};
      if (search) {
        query.payee = { $regex: search, $options: 'i' };
      }
      if (category) {
        query.category = category;
      }
      if (status) {
        query.status = status;
      }
      if (type) {
        query.type = type;
      }
      txs = await Transaction.find(query).sort({ date: -1 });
      return res.json(txs);
    } else {
      txs = [...store.state.transactions];
      if (search) {
        txs = txs.filter(t => t.payee.toLowerCase().includes(search.toLowerCase()));
      }
      if (category) {
        txs = txs.filter(t => t.category === category);
      }
      if (status) {
        txs = txs.filter(t => t.status === status);
      }
      if (type) {
        txs = txs.filter(t => t.type === type);
      }
      txs.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.json(txs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. POST /api/transactions - Add a transaction
router.post('/transactions', async (req, res) => {
  const { payee, category, amount, status, type, date } = req.body;

  if (!payee || !category || !amount || !type) {
    return res.status(400).json({ error: "Payee, Category, Amount, and Type are required." });
  }

  const txAmount = Number(amount);
  const txDate = date ? new Date(date) : new Date();

  try {
    let newTx;
    if (isDbConnected()) {
      newTx = new Transaction({
        payee,
        category,
        amount: txAmount,
        status: status || 'Manual',
        type,
        date: txDate
      });
      await newTx.save();

      const primaryBal = await BankBalance.findOne({ accountName: "HDFC Primary Salary Account" });
      if (primaryBal) {
        const delta = type === 'Expense' ? -txAmount : txAmount;
        await BankBalance.findByIdAndUpdate(primaryBal._id, {
          $inc: { balance: delta },
          lastUpdated: new Date()
        });
      }
    } else {
      newTx = {
        _id: 'tx_local_' + Math.random().toString(36).substr(2, 9),
        payee,
        category,
        amount: txAmount,
        status: status || 'Manual',
        type,
        date: txDate,
        verified: true
      };
      store.state.transactions.unshift(newTx);

      const balanceIdx = store.state.bankBalances.findIndex(b => b.accountName === "HDFC Primary Salary Account");
      if (balanceIdx !== -1) {
        const delta = type === 'Expense' ? -txAmount : txAmount;
        store.state.bankBalances[balanceIdx].balance += delta;
        store.state.bankBalances[balanceIdx].lastUpdated = new Date();
      }
    }

    return res.json(newTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. DELETE /api/transactions/:id - Delete transaction
router.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const tx = await Transaction.findById(id);
      if (!tx) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const primaryBal = await BankBalance.findOne({ accountName: "HDFC Primary Salary Account" });
      if (primaryBal) {
        const delta = tx.type === 'Expense' ? tx.amount : -tx.amount;
        await BankBalance.findByIdAndUpdate(primaryBal._id, {
          $inc: { balance: delta },
          lastUpdated: new Date()
        });
      }

      await Transaction.findByIdAndDelete(id);
      return res.json({ success: true, message: "Transaction deleted successfully." });
    } else {
      const txIdx = store.state.transactions.findIndex(t => t._id === id);
      if (txIdx !== -1) {
        const tx = store.state.transactions[txIdx];

        const balanceIdx = store.state.bankBalances.findIndex(b => b.accountName === "HDFC Primary Salary Account");
        if (balanceIdx !== -1) {
          const delta = tx.type === 'Expense' ? tx.amount : -tx.amount;
          store.state.bankBalances[balanceIdx].balance += delta;
          store.state.bankBalances[balanceIdx].lastUpdated = new Date();
        }

        store.state.transactions.splice(txIdx, 1);
        return res.json({ success: true, message: "Transaction deleted in-memory." });
      }
      return res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. POST /api/onboard/reset - Reset data
router.post('/onboard/reset', async (req, res) => {
  try {
    if (isDbConnected()) {
      await BankBalance.deleteMany({});
      await Budget.deleteMany({});
      await Investment.deleteMany({});
      await Transaction.deleteMany({});

      await BankBalance.insertMany(store.defaultBankBalances);
      await Budget.insertMany(store.defaultBudgets);
      await Investment.insertMany(store.defaultInvestments);
      await Transaction.insertMany(store.defaultTransactions);

      // Reset user onboarding status
      await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: false });

      return res.json({ success: true, message: "Data reset to seed values." });
    } else {
      store.state.bankBalances = JSON.parse(JSON.stringify(store.defaultBankBalances));
      store.state.budgets = JSON.parse(JSON.stringify(store.defaultBudgets));
      store.state.investments = JSON.parse(JSON.stringify(store.defaultInvestments));
      store.state.transactions = JSON.parse(JSON.stringify(store.defaultTransactions));

      const uIdx = store.state.users.findIndex(u => u._id === req.user.id);
      if (uIdx !== -1) store.state.users[uIdx].onboardingCompleted = false;

      return res.json({ success: true, message: "In-memory values reset to default seeds." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. PUT /api/auth/onboarding - Complete onboarding step
router.put('/auth/onboarding', async (req, res) => {
  try {
    if (isDbConnected()) {
      await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });
    } else {
      const uIdx = store.state.users.findIndex(u => u._id === req.user.id);
      if (uIdx !== -1) store.state.users[uIdx].onboardingCompleted = true;
    }
    res.json({ success: true, message: "Onboarding status marked completed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
