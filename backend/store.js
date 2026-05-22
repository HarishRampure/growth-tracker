// In-memory data store fallback & seeding database template for new users

const defaultBankBalances = [
  { _id: "bal_hdfc", accountName: "HDFC Primary Salary Account", balance: 112000, accountNumber: "XXXX XXXX 4059" },
  { _id: "bal_icici", accountName: "ICICI Emergency & Liquid Account", balance: 38000, accountNumber: "XXXX XXXX 9821" }
];

const defaultBudgets = [
  { _id: "bud_food", category: "Food", limit: 15000 },
  { _id: "bud_transport", category: "Transport", limit: 8000 },
  { _id: "bud_shopping", category: "Shopping", limit: 20000 },
  { _id: "bud_subs", category: "Subscriptions", limit: 5000 }
];

const defaultInvestments = [
  { _id: "inv_mf", assetClass: "Mutual Funds", name: "HDFC Index Fund & SIPs", value: 350000, sipAmount: 15000 },
  { _id: "inv_stocks", assetClass: "Stocks", name: "Zerodha Demat (Nifty Bees, Bluechips)", value: 220000, sipAmount: 10000 },
  { _id: "inv_gold", assetClass: "Gold", name: "Sovereign Gold Bonds & Digital Gold", value: 75000, sipAmount: 0 },
  { _id: "inv_fds", assetClass: "Fixed Deposits", name: "SBI High Yield FD", value: 100000, sipAmount: 0 }
];

const defaultTransactions = [
  { _id: 'tx_seed_1', date: new Date("2026-05-20T09:00:00.000Z"), payee: "HDFC Salary Credit", category: "Salary", amount: 115000, status: "Auto", type: "Income", verified: true },
  { _id: 'tx_seed_2', date: new Date("2026-05-18T10:30:00.000Z"), payee: "Flat Rent payment", category: "Rent", amount: 30000, status: "Auto", type: "Expense", verified: true },
  { _id: 'tx_seed_3', date: new Date("2026-05-15T20:15:00.000Z"), payee: "Zomato Dineout", category: "Food", amount: 1200, status: "Manual", type: "Expense", verified: true },
  { _id: 'tx_seed_4', date: new Date("2026-05-10T18:45:00.000Z"), payee: "Uber Ride", category: "Transport", amount: 650, status: "Manual", type: "Expense", verified: true },
  { _id: 'tx_seed_5', date: new Date("2026-05-05T08:00:00.000Z"), payee: "Netflix India Premium", category: "Subscriptions", amount: 649, status: "Auto", type: "Expense", verified: true },
  { _id: 'tx_seed_6', date: new Date("2026-05-02T10:00:00.000Z"), payee: "Tata Mutual Fund SIP", category: "Investments", amount: 15000, status: "Auto", type: "Expense", verified: true },
  { _id: 'tx_seed_7', date: new Date("2026-04-28T14:30:00.000Z"), payee: "Swiggy Delivery", category: "Food", amount: 450, status: "Manual", type: "Expense", verified: true },
  { _id: 'tx_seed_8', date: new Date("2026-04-25T17:00:00.000Z"), payee: "Zara Shopping Mall", category: "Shopping", amount: 4999, status: "Manual", type: "Expense", verified: true },
  { _id: 'tx_seed_9', date: new Date("2026-04-20T09:00:00.000Z"), payee: "HDFC Salary Credit", category: "Salary", amount: 115000, status: "Auto", type: "Income", verified: true },
  { _id: 'tx_seed_10', date: new Date("2026-04-18T10:30:00.000Z"), payee: "Flat Rent payment", category: "Rent", amount: 30000, status: "Auto", type: "Expense", verified: true }
];

// Active in-memory state store
let state = {
  bankBalances: JSON.parse(JSON.stringify(defaultBankBalances)),
  budgets: JSON.parse(JSON.stringify(defaultBudgets)),
  investments: JSON.parse(JSON.stringify(defaultInvestments)),
  transactions: JSON.parse(JSON.stringify(defaultTransactions)),
  users: [] // In-memory auth user database
};

// Seed function for real MongoDB
const seedDatabase = async (models) => {
  try {
    const { BankBalance, Budget, Investment, Transaction } = models;

    const balanceCount = await BankBalance.countDocuments();
    if (balanceCount === 0) {
      const docs = defaultBankBalances.map(({ _id, ...rest }) => rest);
      await BankBalance.insertMany(docs);
      console.log('Seeded BankBalances into MongoDB Atlas.');
    }

    const budgetCount = await Budget.countDocuments();
    if (budgetCount === 0) {
      const docs = defaultBudgets.map(({ _id, ...rest }) => rest);
      await Budget.insertMany(docs);
      console.log('Seeded Budgets into MongoDB Atlas.');
    }

    const investmentCount = await Investment.countDocuments();
    if (investmentCount === 0) {
      const docs = defaultInvestments.map(({ _id, ...rest }) => rest);
      await Investment.insertMany(docs);
      console.log('Seeded Investments into MongoDB Atlas.');
    }

    const transactionCount = await Transaction.countDocuments();
    if (transactionCount === 0) {
      const docs = defaultTransactions.map(({ _id, ...rest }) => rest);
      await Transaction.insertMany(docs);
      console.log('Seeded Transactions into MongoDB Atlas.');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

module.exports = {
  state,
  seedDatabase,
  defaultBankBalances,
  defaultBudgets,
  defaultInvestments,
  defaultTransactions
};
