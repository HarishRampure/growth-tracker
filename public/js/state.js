// Global Client-Side State Controller with JWT Authentication

class GrowthState {
  constructor() {
    this.API_BASE = '/api';
    this.token = localStorage.getItem('growth_token') || null;
    this.user = JSON.parse(localStorage.getItem('growth_user')) || null;
    
    this.data = {
      bankBalances: [],
      budgets: [],
      investments: [],
      transactions: [],
      bills: [],
      funds: []
    };
    this.connection = {
      online: false,
      dbConnected: false,
      mode: 'Locally Persisted'
    };
    
    this.onboardingCompleted = this.user ? this.user.onboardingCompleted : false;
    this.listeners = [];
  }

  // Subscribe to changes
  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.data, this.connection));
  }

  // Generate request headers (injects active JWT)
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Server & Database connectivity checks
  async checkSyncStatus() {
    try {
      const res = await fetch(`${this.API_BASE}/status`);
      if (res.ok) {
        const statusData = await res.json();
        this.connection.online = true;
        this.connection.dbConnected = statusData.database.connected;
        this.connection.mode = statusData.mode;
      } else {
        throw new Error("Server check failed");
      }
    } catch (err) {
      console.warn("⚠️ Switching to HTML5 LocalStorage Offline Mode.");
      this.connection.online = false;
      this.connection.dbConnected = false;
      this.connection.mode = "Offline (Demo Mode)";
    }
    this.updateSyncBadge();
  }

  updateSyncBadge() {
    const syncBadge = document.getElementById('sync-status');
    if (!syncBadge) return;

    if (this.connection.online && this.connection.dbConnected) {
      syncBadge.className = "hidden sm:flex flex-shrink-0 items-center space-x-2 px-2.5 md:px-3 py-1.5 rounded-full text-[11px] font-bold bg-secondary-container/20 text-secondary border border-secondary-container/30";
      syncBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse flex-shrink-0"></span>
        <span class="hidden sm:inline">Atlas Active Sync</span>
      `;
    } else if (this.connection.online) {
      syncBadge.className = "hidden sm:flex flex-shrink-0 items-center space-x-2 px-2.5 md:px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200";
      syncBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
        <span class="hidden sm:inline">Sync Fallback: In-Memory</span>
      `;
    } else {
      syncBadge.className = "hidden sm:flex flex-shrink-0 items-center space-x-2 px-2.5 md:px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200";
      syncBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
        <span class="hidden sm:inline">Offline Mode (Local)</span>
      `;
    }
  }

  // ==========================================
  // 🔓 AUTH OPERATIONS
  // ==========================================

  async register(username, password) {
    await this.checkSyncStatus();
    if (this.connection.online) {
      const res = await fetch(`${this.API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      return data.message;
    } else {
      // Offline local registration
      const users = JSON.parse(localStorage.getItem('growth_users_offline')) || [];
      if (users.some(u => u.username === username.toLowerCase())) {
        throw new Error("Username already taken in local cache.");
      }
      users.push({ username: username.toLowerCase(), password });
      localStorage.setItem('growth_users_offline', JSON.stringify(users));
      return "Registered successfully in Offline local environment! Proceed to Login.";
    }
  }

  async login(username, password) {
    await this.checkSyncStatus();
    if (this.connection.online) {
      const res = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      this.token = data.token;
      this.user = data.user;
      this.onboardingCompleted = data.user.onboardingCompleted;

      localStorage.setItem('growth_token', this.token);
      localStorage.setItem('growth_user', JSON.stringify(this.user));
      
      // Load user accounts
      await this.loadAllData();
      return data;
    } else {
      // Offline auth check
      const users = JSON.parse(localStorage.getItem('growth_users_offline')) || [];
      const user = users.find(u => u.username === username.toLowerCase() && u.password === password);
      
      if (!user && username === 'admin' && password === 'admin') {
        // Provide built-in backup
        this.token = "mock_jwt_token_offline";
        this.user = { id: "offline_admin", username: "admin", onboardingCompleted: false };
        this.onboardingCompleted = false;
      } else if (user) {
        this.token = "mock_jwt_token_offline";
        this.user = { id: user.username, username: user.username, onboardingCompleted: localStorage.getItem('growth_onboarded_' + user.username) === 'true' };
        this.onboardingCompleted = this.user.onboardingCompleted;
      } else {
        throw new Error("Invalid credentials or account does not exist.");
      }

      localStorage.setItem('growth_token', this.token);
      localStorage.setItem('growth_user', JSON.stringify(this.user));
      
      await this.loadAllData();
      return { success: true, user: this.user };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    this.onboardingCompleted = false;
    
    localStorage.removeItem('growth_token');
    localStorage.removeItem('growth_user');
    
    this.data = { bankBalances: [], budgets: [], investments: [], transactions: [] };
    this.notify();
  }

  async completeUserOnboarding() {
    this.onboardingCompleted = true;
    if (this.user) {
      this.user.onboardingCompleted = true;
      localStorage.setItem('growth_user', JSON.stringify(this.user));
      localStorage.setItem('growth_onboarded_' + this.user.username, 'true');
    }

    if (this.connection.online && this.token) {
      try {
        await fetch(`${this.API_BASE}/auth/onboarding`, {
          method: 'PUT',
          headers: this.getHeaders()
        });
      } catch (err) {
        console.warn("Failed to notify server of onboarding completion.");
      }
    }
  }

  // ==========================================
  // 🔒 REST CORE ENDPOINTS
  // ==========================================

  async loadAllData() {
    if (!this.token) return; // Secure Guard
    
    await this.checkSyncStatus();

    if (this.connection.online) {
      try {
        const [balRes, budRes, invRes, txRes] = await Promise.all([
          fetch(`${this.API_BASE}/balances`, { headers: this.getHeaders() }),
          fetch(`${this.API_BASE}/budgets`, { headers: this.getHeaders() }),
          fetch(`${this.API_BASE}/investments`, { headers: this.getHeaders() }),
          fetch(`${this.API_BASE}/transactions`, { headers: this.getHeaders() })
        ]);

        if (balRes.status === 401 || balRes.status === 403) {
          // Token expired
          this.logout();
          throw new Error("JWT Session expired");
        }

        this.data.bankBalances = await balRes.json();
        this.data.budgets = await budRes.json();
        this.data.investments = await invRes.json();
        this.data.transactions = await txRes.json();

        // Load bills from local storage since the backend doesn't support them
        const key = this.user ? this.user.username : 'global';
        this.data.bills = JSON.parse(localStorage.getItem(`growth_cache_bills_${key}`)) || [
          { _id: "bill_rent", name: "House Rent", amount: 15000, day: 5, paid: false },
          { _id: "bill_wifi", name: "Wifi Broadband", amount: 800, day: 10, paid: false },
          { _id: "bill_netflix", name: "Netflix Premium", amount: 649, day: 15, paid: false },
          { _id: "bill_gym", name: "Gym Membership", amount: 1500, day: 1, paid: false }
        ];

        // Load savings funds
        this.data.funds = JSON.parse(localStorage.getItem(`growth_cache_funds_${key}`)) || [
          { _id: "fund_emergency", name: "Emergency Fund", current: 30000, target: 100000, icon: "shield", color: "emerald", contributions: [
            { _id: "c_1", amount: 20000, date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "Starting reserve" },
            { _id: "c_2", amount: 10000, date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "May cash contribution" }
          ] },
          { _id: "fund_car", name: "Car Fund", current: 50000, target: 300000, icon: "directions_car", color: "sky", contributions: [
            { _id: "c_3", amount: 50000, date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "Initial seed" }
          ] },
          { _id: "fund_home", name: "House Fund", current: 150000, target: 1000000, icon: "home", color: "indigo", contributions: [
            { _id: "c_4", amount: 150000, date: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "Property token deposit" }
          ] }
        ];

        // Backup locally keyed to this user
        localStorage.setItem(`growth_cache_balances_${key}`, JSON.stringify(this.data.bankBalances));
        localStorage.setItem(`growth_cache_budgets_${key}`, JSON.stringify(this.data.budgets));
        localStorage.setItem(`growth_cache_investments_${key}`, JSON.stringify(this.data.investments));
        localStorage.setItem(`growth_cache_transactions_${key}`, JSON.stringify(this.data.transactions));
        localStorage.setItem(`growth_cache_bills_${key}`, JSON.stringify(this.data.bills));
        localStorage.setItem(`growth_cache_funds_${key}`, JSON.stringify(this.data.funds));
      } catch (err) {
        console.error("Failed to load server data, loading cache", err);
        this.loadLocalCache();
      }
    } else {
      this.loadLocalCache();
    }
    this.updateStreak();
    this.notify();
  }

  loadLocalCache() {
    const key = this.user ? this.user.username : 'global';
    
    const streakStr = localStorage.getItem(`growth_cache_streak_${key}`);
    this.data.streak = streakStr ? JSON.parse(streakStr) : { count: 1, lastActiveDate: new Date().toISOString() };

    this.data.bankBalances = JSON.parse(localStorage.getItem(`growth_cache_balances_${key}`)) || [
      { _id: "bal_cash", accountName: "Cash Balance", balance: 50000, accountNumber: "XXXX XXXX 4059", lastUpdated: new Date() }
    ];
    this.data.budgets = JSON.parse(localStorage.getItem(`growth_cache_budgets_${key}`)) || [
      { _id: "bud_food", category: "Food", limit: 15000 },
      { _id: "bud_transport", category: "Transport", limit: 5000 },
      { _id: "bud_shopping", category: "Shopping", limit: 10000 },
      { _id: "bud_others", category: "Others", limit: 5000 }
    ];
    this.data.investments = JSON.parse(localStorage.getItem(`growth_cache_investments_${key}`)) || [
      { _id: "inv_seed_1", name: "Nifty 50 Index Mutual Fund", assetClass: "Stocks", value: 120000, sipAmount: 5000, lastUpdated: new Date().toISOString() },
      { _id: "inv_seed_2", name: "Sovereign Gold Bonds (SGB)", assetClass: "Gold", value: 45000, sipAmount: 0, lastUpdated: new Date().toISOString() },
      { _id: "inv_seed_3", name: "SBI High-Yield Fixed Deposit", assetClass: "Fixed Deposits", value: 40000, sipAmount: 2000, lastUpdated: new Date().toISOString() }
    ];
    this.data.bills = JSON.parse(localStorage.getItem(`growth_cache_bills_${key}`)) || [
      { _id: "bill_rent", name: "House Rent", amount: 15000, day: 5, paid: false },
      { _id: "bill_wifi", name: "Wifi Broadband", amount: 800, day: 10, paid: true },
      { _id: "bill_netflix", name: "Netflix Premium", amount: 649, day: 15, paid: true },
      { _id: "bill_gym", name: "Gym Membership", amount: 1500, day: 1, paid: false }
    ];
    this.data.transactions = JSON.parse(localStorage.getItem(`growth_cache_transactions_${key}`)) || [
      { _id: 'tx_seed_1', date: new Date("2026-05-20T09:00:00.000Z"), payee: "Salary Paycheck", category: "Salary", amount: 60000, status: "Auto", type: "Income", verified: true },
      { _id: 'tx_seed_2', date: new Date("2026-05-15T20:15:00.000Z"), payee: "Zomato Food Delivery", category: "Food", amount: 650, status: "Manual", type: "Expense", verified: true },
      { _id: 'tx_seed_3', date: new Date("2026-05-10T18:45:00.000Z"), payee: "Uber Cab Ride", category: "Transport", amount: 350, status: "Manual", type: "Expense", verified: true },
      { _id: 'tx_seed_4', date: new Date("2026-05-08T15:00:00.000Z"), payee: "Starbucks Coffee", category: "Food", amount: 280, status: "Manual", type: "Expense", verified: true },
      { _id: 'tx_seed_5', date: new Date("2026-05-02T10:00:00.000Z"), payee: "Shopping Mall Clothes", category: "Shopping", amount: 2400, status: "Manual", type: "Expense", verified: true }
    ];
    this.data.funds = JSON.parse(localStorage.getItem(`growth_cache_funds_${key}`)) || [
      { _id: "fund_emergency", name: "Emergency Fund", current: 30000, target: 100000, icon: "shield", color: "emerald", contributions: [
        { _id: "c_1", amount: 20000, date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "Starting reserve" },
        { _id: "c_2", amount: 10000, date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "May cash contribution" }
      ] },
      { _id: "fund_car", name: "Car Fund", current: 50000, target: 300000, icon: "directions_car", color: "sky", contributions: [
        { _id: "c_3", amount: 50000, date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "Initial seed" }
      ] },
      { _id: "fund_home", name: "House Fund", current: 150000, target: 1000000, icon: "home", color: "indigo", contributions: [
        { _id: "c_4", amount: 150000, date: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(), type: "Contribution", note: "Property token deposit" }
      ] }
    ];
  }

  saveLocalCache() {
    const key = this.user ? this.user.username : 'global';
    localStorage.setItem(`growth_cache_balances_${key}`, JSON.stringify(this.data.bankBalances));
    localStorage.setItem(`growth_cache_budgets_${key}`, JSON.stringify(this.data.budgets));
    localStorage.setItem(`growth_cache_investments_${key}`, JSON.stringify(this.data.investments));
    localStorage.setItem(`growth_cache_transactions_${key}`, JSON.stringify(this.data.transactions));
    localStorage.setItem(`growth_cache_bills_${key}`, JSON.stringify(this.data.bills));
    localStorage.setItem(`growth_cache_funds_${key}`, JSON.stringify(this.data.funds));
  }

  // Update bank balances
  async updateBalance(id, newBalance) {
    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/balances/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ balance: newBalance })
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error || "Failed to update balance");
        const idx = this.data.bankBalances.findIndex(b => b._id === id || b.accountName === id);
        if (idx !== -1) this.data.bankBalances[idx] = updated;
      } catch (err) {
        this.updateBalanceLocal(id, newBalance);
      }
    } else {
      this.updateBalanceLocal(id, newBalance);
    }
    this.notify();
  }

  updateBalanceLocal(id, newBalance) {
    const idx = this.data.bankBalances.findIndex(b => b._id === id || b.accountName === id);
    if (idx !== -1) {
      this.data.bankBalances[idx].balance = Number(newBalance);
      this.data.bankBalances[idx].lastUpdated = new Date();
      this.saveLocalCache();
    }
  }

  // Save budget limits
  async updateBudgetLimit(category, limit) {
    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/budgets`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ category, limit })
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error || "Failed to update budget");
        const idx = this.data.budgets.findIndex(b => b.category === category);
        if (idx !== -1) this.data.budgets[idx] = updated;
        else this.data.budgets.push(updated);
      } catch (err) {
        this.updateBudgetLocal(category, limit);
      }
    } else {
      this.updateBudgetLocal(category, limit);
    }
    this.notify();
  }

  updateBudgetLocal(category, limit) {
    const idx = this.data.budgets.findIndex(b => b.category === category);
    if (idx !== -1) {
      this.data.budgets[idx].limit = Number(limit);
    } else {
      this.data.budgets.push({ _id: 'bud_local_' + Math.random().toString(36).substr(2, 9), category, limit: Number(limit) });
    }
    this.saveLocalCache();
  }

  // Update investments values/SIPs
  async updateInvestment(id, value, sipAmount) {
    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/investments/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ value, sipAmount })
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error || "Failed to update investment");
        const idx = this.data.investments.findIndex(i => i._id === id || i.name === id);
        if (idx !== -1) this.data.investments[idx] = updated;
      } catch (err) {
        this.updateInvestmentLocal(id, value, sipAmount);
      }
    } else {
      this.updateInvestmentLocal(id, value, sipAmount);
    }
    this.notify();
  }

  updateInvestmentLocal(id, value, sipAmount) {
    const idx = this.data.investments.findIndex(i => i._id === id || i.name === id);
    if (idx !== -1) {
      if (value !== undefined) this.data.investments[idx].value = Number(value);
      if (sipAmount !== undefined) this.data.investments[idx].sipAmount = Number(sipAmount);
      this.data.investments[idx].lastUpdated = new Date();
      this.saveLocalCache();
    }
  }

  async addInvestment(asset) {
    const newAsset = {
      _id: 'inv_local_' + Math.random().toString(36).substr(2, 9),
      name: asset.name,
      assetClass: asset.assetClass || 'Stocks',
      value: Number(asset.value) || 0,
      sipAmount: Number(asset.sipAmount) || 0,
      lastUpdated: new Date().toISOString()
    };
    
    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/investments`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(newAsset)
        });
        const saved = await res.json();
        if (!res.ok) throw new Error(saved.error || "Failed to add investment");
        this.data.investments.push(saved);
      } catch (err) {
        this.data.investments.push(newAsset);
      }
    } else {
      this.data.investments.push(newAsset);
    }
    this.saveLocalCache();
    this.notify();
    return newAsset;
  }

  async addInvestmentAsset(asset) {
    return this.addInvestment(asset);
  }

  async createBudgetCategory(category, limit) {
    return this.updateBudgetLimit(category, limit);
  }

  // Add a new transaction
  async addTransaction(tx) {
    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/transactions`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(tx)
        });
        const newTx = await res.json();
        if (!res.ok) throw new Error(newTx.error || "Failed to add transaction");
        this.data.transactions.unshift(newTx);

        const delta = tx.type === 'Expense' ? -tx.amount : tx.amount;
        if (this.data.bankBalances.length > 0) this.data.bankBalances[0].balance += delta;

        this.saveLocalCache();
      } catch (err) {
        this.addTransactionLocal(tx);
      }
    } else {
      this.addTransactionLocal(tx);
    }
    this.notify();
  }

  addTransactionLocal(tx) {
    const newTx = {
      _id: 'tx_local_' + Math.random().toString(36).substr(2, 9),
      date: tx.date ? new Date(tx.date) : new Date(),
      payee: tx.payee,
      category: tx.category,
      amount: Number(tx.amount),
      status: tx.status || 'Manual',
      type: tx.type,
      verified: true
    };
    this.data.transactions.unshift(newTx);

    const delta = tx.type === 'Expense' ? -Number(tx.amount) : Number(tx.amount);
    if (this.data.bankBalances.length > 0) {
      this.data.bankBalances[0].balance += delta;
      this.data.bankBalances[0].lastUpdated = new Date();
    }

    this.saveLocalCache();
  }

  // Delete transaction
  async deleteTransaction(id) {
    const tx = this.data.transactions.find(t => t._id === id);
    if (!tx) return;

    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/transactions/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders()
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to delete transaction");
        }
        this.data.transactions = this.data.transactions.filter(t => t._id !== id);

        const delta = tx.type === 'Expense' ? tx.amount : -tx.amount;
        if (this.data.bankBalances.length > 0) this.data.bankBalances[0].balance += delta;

        this.saveLocalCache();
      } catch (err) {
        this.deleteTransactionLocal(id, tx);
      }
    } else {
      this.deleteTransactionLocal(id, tx);
    }
    this.notify();
  }

  deleteTransactionLocal(id, tx) {
    this.data.transactions = this.data.transactions.filter(t => t._id !== id);
    const delta = tx.type === 'Expense' ? tx.amount : -tx.amount;
    if (this.data.bankBalances.length > 0) {
      this.data.bankBalances[0].balance += delta;
      this.data.bankBalances[0].lastUpdated = new Date();
    }
    this.saveLocalCache();
  }

  // Toggle paid/pending status for a fixed monthly bill
  async toggleBillPaid(billId) {
    const bill = this.data.bills.find(b => b._id === billId);
    if (!bill) return;

    bill.paid = !bill.paid;

    if (bill.paid) {
      const tx = {
        payee: bill.name,
        category: "Bills",
        amount: bill.amount,
        status: "Fixed",
        type: "Expense",
        date: new Date()
      };
      await this.addTransaction(tx);
    } else {
      // Find and delete the logged bill transaction for the current month
      const now = new Date();
      const existingTx = this.data.transactions.find(t => 
        t.payee === bill.name && 
        t.category === "Bills" && 
        t.amount === bill.amount && 
        t.type === "Expense" && 
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
      );
      if (existingTx) {
        await this.deleteTransaction(existingTx._id);
      }
    }
    
    this.saveLocalCache();
    this.notify();
  }

  // Add a new monthly bill
  async addBill(bill) {
    const newBill = {
      _id: 'bill_' + Math.random().toString(36).substr(2, 9),
      name: bill.name,
      amount: Number(bill.amount),
      day: Number(bill.day),
      paid: false
    };
    this.data.bills.push(newBill);
    this.saveLocalCache();
    this.notify();
  }

  // Edit an existing monthly bill
  async updateBill(id, updatedData) {
    const idx = this.data.bills.findIndex(b => b._id === id);
    if (idx !== -1) {
      this.data.bills[idx] = {
        ...this.data.bills[idx],
        name: updatedData.name,
        amount: Number(updatedData.amount),
        day: Number(updatedData.day)
      };
      this.saveLocalCache();
      this.notify();
    }
  }

  // Delete a monthly bill
  async deleteBill(id) {
    this.data.bills = this.data.bills.filter(b => b._id !== id);
    this.saveLocalCache();
    this.notify();
  }

  // Add a new savings fund
  async addFund(fund) {
    const newFund = {
      _id: 'fund_' + Math.random().toString(36).substr(2, 9),
      name: fund.name,
      current: 0,
      target: Number(fund.target),
      icon: fund.icon || 'savings',
      color: fund.color || 'emerald',
      contributions: []
    };
    this.data.funds.push(newFund);
    this.saveLocalCache();
    this.notify();
  }

  // Update an existing savings fund
  async updateFund(id, updatedData) {
    const idx = this.data.funds.findIndex(f => f._id === id);
    if (idx !== -1) {
      this.data.funds[idx] = {
        ...this.data.funds[idx],
        name: updatedData.name,
        target: Number(updatedData.target),
        icon: updatedData.icon || this.data.funds[idx].icon,
        color: updatedData.color || this.data.funds[idx].color
      };
      this.saveLocalCache();
      this.notify();
    }
  }

  // Delete a savings fund
  async deleteFund(id) {
    this.data.funds = this.data.funds.filter(f => f._id !== id);
    this.saveLocalCache();
    this.notify();
  }

  // Add a contribution or withdrawal to a fund
  async addFundContribution(fundId, amount, type, note, syncWithCash) {
    const fund = this.data.funds.find(f => f._id === fundId);
    if (!fund) return;

    const amt = Number(amount);
    if (type === 'Contribution') {
      fund.current += amt;
    } else if (type === 'Withdrawal') {
      fund.current -= amt;
    }

    const contribution = {
      _id: 'c_' + Math.random().toString(36).substr(2, 9),
      amount: amt,
      date: new Date().toISOString(),
      type: type, // 'Contribution' or 'Withdrawal'
      note: note || ''
    };

    if (!fund.contributions) fund.contributions = [];
    fund.contributions.unshift(contribution);

    this.saveLocalCache();

    if (syncWithCash) {
      const tx = {
        payee: type === 'Contribution' ? `Transfer to ${fund.name}` : `Withdrawal from ${fund.name}`,
        category: "Savings",
        amount: amt,
        status: "Manual",
        type: type === 'Contribution' ? "Expense" : "Income",
        date: new Date()
      };
      await this.addTransaction(tx);
    } else {
      this.notify();
    }
  }

  // Reset data
  async resetAllData() {
    if (this.connection.online) {
      try {
        const res = await fetch(`${this.API_BASE}/onboard/reset`, {
          method: 'POST',
          headers: this.getHeaders()
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Reset failed");
        }
        await this.completeUserOnboarding(); // Reset onboarding completes local flag, let's load
        await this.loadAllData();
      } catch (err) {
        this.resetAllDataLocal();
      }
    } else {
      this.resetAllDataLocal();
    }
    this.notify();
  }

  resetAllDataLocal() {
    const key = this.user ? this.user.username : 'global';
    localStorage.removeItem(`growth_cache_balances_${key}`);
    localStorage.removeItem(`growth_cache_budgets_${key}`);
    localStorage.removeItem(`growth_cache_investments_${key}`);
    localStorage.removeItem(`growth_cache_transactions_${key}`);
    localStorage.removeItem(`growth_cache_bills_${key}`);
    localStorage.removeItem(`growth_cache_funds_${key}`);
    localStorage.removeItem('growth_onboarded_' + key);
    this.onboardingCompleted = false;
    this.loadLocalCache();
  }

  // AGGREGATORS & HELPERS
  getNetWorth() {
    return this.getTotalCash() + this.getTotalInvestments();
  }

  getTotalCash() {
    return this.data.bankBalances.reduce((sum, item) => sum + item.balance, 0);
  }

  getTotalInvestments() {
    return this.data.investments.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }

  getSpentThisMonth() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.data.transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'Expense' && 
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear &&
               t.category !== 'Investments';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getCategorySpentThisMonth(category) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.data.transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'Expense' && 
               t.category.toLowerCase() === category.toLowerCase() &&
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // ==========================================
  // 🏆 INTERACTIVE GAMIFICATION ENGINE
  // ==========================================

  updateStreak() {
    if (!this.user) return;
    const key = this.user.username;
    const streakStr = localStorage.getItem(`growth_cache_streak_${key}`);
    let streak = { count: 1, lastActiveDate: null };
    
    if (streakStr) {
      streak = JSON.parse(streakStr);
    }
    
    const now = new Date();
    const todayStr = now.toDateString();
    
    if (streak.lastActiveDate) {
      const lastDate = new Date(streak.lastActiveDate);
      const diffTime = Math.abs(now - lastDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (lastDate.toDateString() === todayStr) {
        // Already logged in today, do nothing
      } else if (diffDays === 1 || (diffDays === 0 && lastDate.getDate() !== now.getDate())) {
        // Active consecutive day!
        streak.count += 1;
        streak.lastActiveDate = now.toISOString();
        // Play level up sound if streak passes a multiple of 5
        if (streak.count % 5 === 0 && window.soundEngine) {
          setTimeout(() => window.soundEngine.playLevelUp(), 1000);
        }
      } else {
        // Streak broken
        streak.count = 1;
        streak.lastActiveDate = now.toISOString();
      }
    } else {
      // First recorded day
      streak.count = 1;
      streak.lastActiveDate = now.toISOString();
    }
    
    localStorage.setItem(`growth_cache_streak_${key}`, JSON.stringify(streak));
    this.data.streak = streak;
  }

  checkAchievements() {
    const achievements = [];
    const state = this.data;
    
    // 1. Frugal Sensei: Logged 3+ manual everyday spends
    const manualSpends = state.transactions.filter(t => t.type === 'Expense' && t.category !== 'Bills' && t.category !== 'Salary' && t.status === 'Manual');
    if (manualSpends.length >= 3) {
      achievements.push({
        id: 'frugal_sensei',
        title: 'Frugal Sensei',
        desc: 'Logged 3+ everyday spends!',
        icon: 'savings',
        color: 'from-amber-400 to-amber-600',
        textColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      });
    }
    
    // 2. Shield Bearer: Emergency fund balance has deposits > 0
    const emergencyFund = state.funds.find(f => f.name.toLowerCase().includes('emergency') || f._id === 'fund_emergency');
    if (emergencyFund && emergencyFund.current > 0) {
      achievements.push({
        id: 'shield_bearer',
        title: 'Shield Bearer',
        desc: 'Started an Emergency Fund reserve!',
        icon: 'shield',
        color: 'from-emerald-400 to-emerald-600',
        textColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      });
    }
    
    // 3. Bill Slayer: Paid off all active monthly recurring bills
    if (state.bills.length > 0 && state.bills.every(b => b.paid)) {
      achievements.push({
        id: 'bill_slayer',
        title: 'Bill Slayer',
        desc: 'All monthly bills fully paid!',
        icon: 'bolt',
        color: 'from-indigo-400 to-indigo-600',
        textColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
      });
    }
    
    // 4. Goal Achiever: Reached 100% of any active savings target
    const fullySavedFund = state.funds.some(f => f.current >= f.target && f.target > 0);
    if (fullySavedFund) {
      achievements.push({
        id: 'goal_achiever',
        title: 'Goal Achiever',
        desc: 'Reached 100% of a savings target!',
        icon: 'stars',
        color: 'from-purple-400 to-purple-600',
        textColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      });
    }
    
    // Calculate overall investor tier based on achievements
    let score = achievements.length;
    let tier = 'Bronze Saver';
    let tierColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    let tierIcon = 'workspace_premium';
    
    if (score >= 4) {
      tier = 'Gold Wealth Maker';
      tierColor = 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      tierIcon = 'military_tech';
    } else if (score >= 2) {
      tier = 'Silver Investor';
      tierColor = 'text-sky-600 bg-sky-500/10 border-sky-500/20';
      tierIcon = 'stars';
    }
    
    return {
      active: achievements,
      tier,
      tierColor,
      tierIcon,
      score
    };
  }
}

// Instantiate state globally
window.stateEngine = new GrowthState();
