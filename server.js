const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB, checkDatabaseState } = require('./backend/db');
const { seedDatabase } = require('./backend/store');

// Load environment variables
dotenv.config();

// Mongoose Models for Seeding
const BankBalance = require('./backend/models/BankBalance');
const Budget = require('./backend/models/Budget');
const Investment = require('./backend/models/Investment');
const Transaction = require('./backend/models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', require('./backend/routes'));

// Catch-all route to serve the Single Page Application index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Database and Start Server
const startServer = async () => {
  console.log('\x1b[36m%s\x1b[0m', '🚀 Initializing Growth Tracker Server...');

  // Try to connect to Database
  const connected = await connectDB();

  if (connected) {
    // Seed initial values if Mongo collections are empty
    await seedDatabase({ BankBalance, Budget, Investment, Transaction });
  }

  app.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', `✨ Server is running on port ${PORT}!`);
    console.log('\x1b[36m%s\x1b[0m', `👉 Local URL: http://localhost:${PORT}`);
    if (!connected) {
      console.log('\x1b[33m%s\x1b[0m', `💡 Running in High-Fidelity IN-MEMORY SIMULATION MODE.`);
      console.log('\x1b[33m%s\x1b[0m', `   You can set MONGODB_URI in your .env file to sync with MongoDB Atlas anytime!`);
    }
  });
};

startServer();
