// Dashboard View Controller (Simplified Spends & Bills Manager)

class DashboardView {
  constructor() {
    this.activeTrendsChart = null;
    this.activeBreakdownChart = null;
    this.selectedTimeframe = '30';
  }
  // Helper to map category names to gorgeous Material Symbols Outlined icons
  _getBillIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('rent') || n.includes('estates') || n.includes('house')) return 'home_work';
    if (n.includes('netflix') || n.includes('prime') || n.includes('spotify') || n.includes('youtube') || n.includes('entertainment') || n.includes('smart_display') || n.includes('disney')) return 'smart_display';
    if (n.includes('gym') || n.includes('cult.fit') || n.includes('fitness') || n.includes('health') || n.includes('workout')) return 'fitness_center';
    if (n.includes('wifi') || n.includes('internet') || n.includes('broadband') || n.includes('act')) return 'wifi';
    if (n.includes('swim') || n.includes('pool')) return 'pool';
    if (n.includes('insurance') || n.includes('security') || n.includes('life')) return 'security';
    if (n.includes('electric') || n.includes('power') || n.includes('gas') || n.includes('water') || n.includes('bill')) return 'bolt';
    return 'receipt';
  }

  // Helper to map categories to premium, styled background classes
  _getBillIconBgClass(name) {
    const n = name.toLowerCase();
    if (n.includes('rent') || n.includes('estates') || n.includes('house')) return 'bg-slate-100 text-slate-700';
    if (n.includes('netflix') || n.includes('prime') || n.includes('spotify') || n.includes('smart_display') || n.includes('disney')) return 'bg-rose-100 text-rose-700 border border-rose-200';
    if (n.includes('gym') || n.includes('cult.fit') || n.includes('fitness') || n.includes('health')) return 'bg-violet-100 text-violet-700 border border-violet-200';
    if (n.includes('wifi') || n.includes('internet') || n.includes('broadband') || n.includes('act')) return 'bg-sky-100 text-sky-700 border border-sky-200';
    if (n.includes('swim') || n.includes('pool')) return 'bg-teal-100 text-teal-700 border border-teal-200';
    if (n.includes('insurance') || n.includes('security') || n.includes('life')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  }

  rotateQuote() {
    const textEl = document.getElementById('dashboard-wisdom-text');
    if (!textEl) return;
    
    if (window.soundEngine) {
      window.soundEngine.playSuccessChime();
    }

    const tips = [
      "Rule of 72: Divide 72 by your interest rate to see when your money doubles.",
      "Pay yourself first: Automate a portion of your income straight to savings goals on payday.",
      "Keep 6 months of basic expenses in an Emergency Fund (Shield Bearer style) before heavy equity investing.",
      "Unspent budgets are investments in your future self. What you don't buy pays you dividends.",
      "Track your subscriptions monthly. A tiny leak can sink a big ship over time.",
      "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
      "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
      "An investment in knowledge pays the best interest. — Benjamin Franklin",
      "Beware of little expenses; a small leak will sink a great ship. — Benjamin Franklin"
    ];
    
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * tips.length);
    } while (newIdx === this.currentTipIndex && tips.length > 1);

    this.currentTipIndex = newIdx;
    const nextTip = tips[newIdx];

    // Animate text transition using simple CSS opacity + scale
    textEl.style.opacity = '0';
    textEl.style.transform = 'scale(0.98)';
    setTimeout(() => {
      textEl.textContent = nextTip;
      textEl.style.opacity = '1';
      textEl.style.transform = 'scale(1)';
    }, 200);
  }

  render(container) {
    if (!container) return;

    const state = window.stateEngine.data;
    const totalCash = window.stateEngine.getTotalCash();
    const streakCount = state.streak ? state.streak.count : 1;
    const achievements = window.stateEngine.checkAchievements();
    
    // Calculate daily spends this month (excluding Bills and Salary income)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const dailySpends = state.transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'Expense' && 
               t.category !== 'Bills' && 
               t.category !== 'Salary' &&
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Fixed monthly bills tracking
    const totalBills = state.bills.reduce((sum, b) => sum + b.amount, 0);
    const paidBillsCount = state.bills.filter(b => b.paid).length;
    const totalBillsCount = state.bills.length;
    const pendingBillsAmount = state.bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0);

    // Seeding some simple everyday categories for our quick adder
    const categories = ["Food", "Transport", "Shopping", "Entertainment", "Groceries", "Others"];

    const tips = [
      "Rule of 72: Divide 72 by your interest rate to see when your money doubles.",
      "Pay yourself first: Automate a portion of your income straight to savings goals on payday.",
      "Keep 6 months of basic expenses in an Emergency Fund (Shield Bearer style) before heavy equity investing.",
      "Unspent budgets are investments in your future self. What you don't buy pays you dividends.",
      "Track your subscriptions monthly. A tiny leak can sink a big ship over time.",
      "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
      "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
      "An investment in knowledge pays the best interest. — Benjamin Franklin",
      "Beware of little expenses; a small leak will sink a great ship. — Benjamin Franklin"
    ];
    this.currentTipIndex = this.currentTipIndex ?? Math.floor(Math.random() * tips.length);
    const currentTip = tips[this.currentTipIndex];

    container.innerHTML = `
      <div class="space-y-6 animate-slide-up">
        
        <!-- 🔥 STREAK & WISDOM BENTO HEADER -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- 🔥 Streak Card (4 cols) -->
          <div class="md:col-span-4 bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 streak-glow flex-shrink-0">
                <span class="material-symbols-outlined text-3xl animate-pulse">local_fire_department</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-0.5">Daily Streak</span>
                <h3 class="text-2xl font-black text-slate-800 leading-tight">${streakCount} Days Active</h3>
                <p class="text-[10.5px] text-slate-450 mt-0.5">Keep tracking daily to grow your streak!</p>
              </div>
            </div>
          </div>

          <!-- 💡 Wisdom Tip Bento (8 cols) -->
          <div class="md:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div class="flex items-start justify-between border-b border-slate-50 pb-3 mb-2 flex-shrink-0">
              <div class="flex items-center space-x-2">
                <span class="material-symbols-outlined text-emerald-500 text-lg">lightbulb</span>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Wisdom & Tip</span>
              </div>
              <button id="rotate-tip-btn" class="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50 text-slate-450 hover:text-emerald-600 transition-all flex items-center justify-center shadow-xs" title="New Tip">
                <span class="material-symbols-outlined text-xs leading-none">refresh</span>
              </button>
            </div>
            <div class="flex-1 flex items-center min-h-[44px]">
              <p id="dashboard-wisdom-text" class="text-xs font-semibold text-slate-650 leading-relaxed transition-all duration-300 transform scale-100 opacity-100">
                ${currentTip}
              </p>
            </div>
          </div>
        </div>

        <!-- 💰 STYLISH PREMIUM STATS BENTO GRID -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Available Money -->
          <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px] relative overflow-hidden group">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">💸 Money I Have</span>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-secondary flex items-center justify-center font-bold shadow-xs">
                <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
              </div>
            </div>
            <div class="space-y-1">
              <span class="text-3xl font-extrabold font-display text-primary leading-none">₹${totalCash.toLocaleString('en-IN')}</span>
              <div class="text-[10px] text-slate-400 flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                <span>Available Cash reserves & bank balances</span>
              </div>
            </div>
          </div>

          <!-- Spent on Daily Items -->
          <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px] relative overflow-hidden group">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">🛍️ Spent This Month</span>
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                <span class="material-symbols-outlined text-lg">shopping_bag</span>
              </div>
            </div>
            <div class="space-y-1">
              <span class="text-3xl font-extrabold font-display text-primary leading-none">₹${dailySpends.toLocaleString('en-IN')}</span>
              <div class="text-[10px] text-slate-400 flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Excludes recurring fixed bills</span>
              </div>
            </div>
          </div>

          <!-- Recurring Fixed Bills -->
          <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px] relative overflow-hidden group">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">📌 Fixed Monthly Bills</span>
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                <span class="material-symbols-outlined text-lg">receipt_long</span>
              </div>
            </div>
            <div class="space-y-1">
              <div class="flex justify-between items-baseline">
                <span class="text-3xl font-extrabold font-display text-primary leading-none">₹${totalBills.toLocaleString('en-IN')}</span>
                ${pendingBillsAmount > 0 ? `<span class="text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">₹${pendingBillsAmount.toLocaleString('en-IN')} due</span>` : '<span class="text-[11px] font-bold text-secondary bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>'}
              </div>
              <div class="text-[10px] text-slate-400 flex items-center justify-between">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full ${pendingBillsAmount > 0 ? 'bg-rose-500' : 'bg-secondary'}"></span>
                  <span>${paidBillsCount} of ${totalBillsCount} paid</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 📊 PREMIUM INTERACTIVE GRAPHS -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Spending Trends Chart (8 cols) -->
          <div class="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[360px] hover:border-slate-350 transition-all duration-300">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <h3 class="font-extrabold text-sm text-primary">Spending Trends</h3>
                <p class="text-[11px] text-slate-400">Daily cash flow details over selected period</p>
              </div>
              <div class="relative">
                <select id="trends-timeframe" class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-secondary font-semibold text-slate-700 cursor-pointer">
                  <option value="30">Last 30 Days</option>
                  <option value="7">Last 7 Days</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            
            <div class="flex-1 relative min-h-[240px] flex items-center justify-center bg-emerald-50/5 rounded-xl border border-emerald-50/20 p-2" id="trends-chart-parent">
              <canvas id="trends-chart-canvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Expense Breakdown Chart (4 cols) -->
          <div class="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[360px] hover:border-slate-350 transition-all duration-300">
            <div class="border-b border-slate-100 pb-3.5 mb-4">
              <h3 class="font-extrabold text-sm text-primary">Expense Breakdown</h3>
              <p class="text-[11px] text-slate-400">Monthly category outlays weightage</p>
            </div>
            
            <div class="flex items-center justify-center relative min-h-[150px] mb-4" id="breakdown-chart-parent">
              <canvas id="breakdown-chart-canvas" class="w-full h-full max-w-[130px] max-h-[130px]"></canvas>
              <!-- Center Absolute overlay for the dominant category/percentage text -->
              <div id="breakdown-center-text" class="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
                <!-- Injected dynamically -->
              </div>
            </div>
            
            <div class="space-y-2.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar" id="breakdown-legend-container">
              <!-- Injected dynamically -->
            </div>
          </div>

        </div>

        <!-- ⚡ INTERACTIVE DASHBOARD PANELS -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- LEFT PANEL: QUICK DAILY SPEND ADDER (5 cols) -->
          <div class="lg:col-span-5 bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div class="border-b border-slate-100 pb-3.5 mb-4">
              <h3 class="font-extrabold text-sm text-primary">Log Daily Spend</h3>
              <p class="text-[11px] text-slate-400">Instantly record any daily cash outlay</p>
            </div>
            
            <form id="quick-spend-form" class="space-y-4 flex-1 flex flex-col justify-center">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Spent Amount (₹)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">₹</span>
                  <input type="number" id="quick-amount" placeholder="0.00" required min="1"
                    class="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary-container/20 focus:border-secondary focus:bg-white transition-all font-semibold text-slate-800">
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Where / What?</label>
                  <input type="text" id="quick-payee" placeholder="e.g. Swiggy, Uber" required
                    class="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary-container/20 focus:border-secondary focus:bg-white transition-all font-semibold font-sans">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select id="quick-category"
                    class="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary-container/20 focus:border-secondary focus:bg-white transition-all font-semibold">
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="pt-3">
                <button type="submit" class="w-full bg-primary hover:bg-slate-900 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center space-x-2">
                  <span class="material-symbols-outlined text-sm font-semibold">send</span>
                  <span>Record Cash Spent</span>
                </button>
              </div>
            </form>
          </div>

          <!-- RIGHT PANEL: FIXED MONTHLY BILLS CHECKLIST (7 cols) -->
          <div class="lg:col-span-7 bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <h3 class="font-extrabold text-sm text-primary">Detected Subscriptions & Bills</h3>
                <p class="text-[11px] text-slate-400">Toggle bills to automatically check them off and log spends</p>
              </div>
              <button onclick="window.dashboardView.openBillsModal()" class="text-xs text-secondary hover:text-emerald-700 font-bold transition-all flex items-center space-x-1 bg-secondary-container/20 border border-secondary-container/30 px-3 py-2 rounded-xl hover:shadow-xs">
                <span class="material-symbols-outlined text-sm font-bold">settings</span>
                <span>Manage</span>
              </button>
            </div>
            
            <div class="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 flex-1 py-1 custom-scrollbar">
              ${state.bills.length === 0 ? `
                <div class="p-6 text-center text-slate-455 text-xs">
                  <span class="material-symbols-outlined text-3xl mb-2 text-slate-350 block">receipt_long</span>
                  No recurring bills setup. Use the "Manage" gear button to define your fixed monthly bills.
                </div>
              ` : state.bills.map(bill => {
                const billIcon = this._getBillIcon(bill.name);
                const bgIconClass = this._getBillIconBgClass(bill.name);
                return `
                  <div class="border ${bill.paid ? 'border-emerald-150 bg-emerald-50/10 opacity-75' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'} rounded-xl p-3.5 flex items-center justify-between transition-all group">
                    <div class="flex items-center space-x-3.5 flex-1 min-w-0">
                      <!-- Checked/Unchecked Trigger -->
                      <button onclick="window.dashboardView.toggleBill('${bill._id}')" 
                        class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${bill.paid ? 'bg-secondary border-secondary text-white shadow-sm' : 'border-slate-300 hover:border-slate-400 text-transparent'}">
                        <span class="material-symbols-outlined text-xs font-bold leading-none">check</span>
                      </button>
                      
                      <!-- Icon Box representation from stitch design -->
                      <div class="w-11 h-11 rounded-lg ${bgIconClass} flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-xl">${billIcon}</span>
                      </div>
                      
                      <div class="truncate">
                        <span class="text-xs font-bold text-slate-800 block truncate ${bill.paid ? 'line-through text-slate-450' : ''}">${bill.name}</span>
                        <p class="text-[10px] text-slate-400">Due day ${bill.day} of the month</p>
                      </div>
                    </div>
                    <div class="text-right flex items-center space-x-3.5 flex-shrink-0 ml-4">
                      <span class="text-sm font-bold font-display text-slate-800">₹${bill.amount.toLocaleString('en-IN')}</span>
                      ${!bill.paid ? `
                        <button onclick="window.dashboardView.toggleBill('${bill._id}')" 
                          class="text-[10px] font-bold bg-primary hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95">
                          Pay Bill
                        </button>
                      ` : `
                        <span class="text-[10px] font-bold text-secondary bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full uppercase tracking-wider scale-95">Paid</span>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- 📜 HISTORICAL QUICK LIST & ACHIEVEMENTS TROPHY ROOM ROW -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Recent Spends Table (8 cols) -->
          <div class="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all duration-300">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <h3 class="font-extrabold text-sm text-slate-800">Recent Daily Spends</h3>
                <p class="text-[10px] text-slate-400">Last registered everyday spends</p>
              </div>
              <a href="#" onclick="window.routingEngine.navigate('ledger')" class="text-xs font-bold text-secondary hover:text-emerald-700 transition-colors flex items-center space-x-1">
                <span>View spend history</span>
                <span class="material-symbols-outlined text-[14px] font-bold">arrow_forward</span>
              </a>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 pb-2">
                    <th class="py-2.5">Date</th>
                    <th>Where / What</th>
                    <th>Category</th>
                    <th class="text-right">Amount</th>
                    <th class="text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  ${state.transactions
                    .filter(tx => tx.type === 'Expense' && tx.category !== 'Salary')
                    .slice(0, 5)
                    .map(tx => {
                      const txDate = new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                      return `
                        <tr class="hover:bg-slate-50/50 transition-colors">
                          <td class="py-3.5 text-slate-400 font-semibold">${txDate}</td>
                          <td class="font-bold text-slate-700">${tx.payee}</td>
                          <td>
                            <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold">${tx.category}</span>
                          </td>
                          <td class="text-right font-extrabold text-slate-800">
                            -₹${tx.amount.toLocaleString('en-IN')}
                          </td>
                          <td class="text-center">
                            <button onclick="window.dashboardView.deleteTx('${tx._id}')" class="text-slate-400 hover:text-red-500 transition-colors w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center">
                              <span class="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Achievements Trophy Room Card (4 cols) -->
          <div class="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-350 transition-all duration-300">
            <div class="border-b border-slate-100 pb-3.5 mb-4">
              <h3 class="font-extrabold text-sm text-slate-800">Financial Trophies</h3>
              <p class="text-[11px] text-slate-400">Unlock dynamic medals for smart habits</p>
            </div>
            
            <div class="flex-1 flex flex-col justify-center space-y-4">
              ${achievements.active.length === 0 ? `
                <div class="text-center p-4">
                  <span class="material-symbols-outlined text-3xl text-slate-300 mb-2">workspace_premium</span>
                  <p class="text-xs font-semibold text-slate-450 leading-relaxed">No badges unlocked yet. Pay all monthly bills, save for a goal, or log manual spends to unlock your first trophy!</p>
                </div>
              ` : `
                <div class="grid grid-cols-2 gap-3">
                  ${achievements.active.map(b => `
                    <div class="border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-slate-50/20 hover:bg-slate-50 hover:shadow-xs transition-all relative group/badge cursor-help" title="${b.title}: ${b.desc}">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-tr ${b.color} text-slate-950 flex items-center justify-center shadow-md shadow-slate-100 border border-white badge-glow mb-2 transition-transform duration-300 group-hover/badge:scale-110">
                        <span class="material-symbols-outlined text-2xl font-bold leading-none">${b.icon}</span>
                      </div>
                      <span class="text-[11px] font-extrabold text-slate-700 leading-tight">${b.title}</span>
                      <span class="text-[8.5px] font-bold text-slate-400 mt-0.5 leading-tight">${b.desc.split('!')[0]}</span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
            
            <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Level Status</span>
              <div class="flex items-center space-x-1.5 font-bold ${achievements.tierColor} px-2.5 py-1 rounded-md text-[10px] border">
                <span class="material-symbols-outlined text-[12px] leading-none">${achievements.tierIcon}</span>
                <span>${achievements.tier}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    // Render Premium Charts
    const trendsData = this._getSpendingTrendsData(this.selectedTimeframe);
    this._drawTrendsChart(trendsData.labels, trendsData.data);

    const breakdownData = this._getExpenseBreakdownData();
    this._drawBreakdownChart(breakdownData.totalSpend, breakdownData.shares);

    // Bind tip rotation
    const rotateBtn = document.getElementById('rotate-tip-btn');
    if (rotateBtn) {
      rotateBtn.onclick = () => this.rotateQuote();
    }

    // Bind Timeframe dropdown filter
    const tfSelect = document.getElementById('trends-timeframe');
    if (tfSelect) {
      tfSelect.value = this.selectedTimeframe;
      tfSelect.onchange = (e) => {
        this.selectedTimeframe = e.target.value;
        const freshTrends = this._getSpendingTrendsData(this.selectedTimeframe);
        this._drawTrendsChart(freshTrends.labels, freshTrends.data);
      };
    }

    // Bind Quick Log Spend Form Submit
    const form = document.getElementById('quick-spend-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const amount = Number(document.getElementById('quick-amount').value);
        const payee = document.getElementById('quick-payee').value;
        const category = document.getElementById('quick-category').value;
        
        if (!amount || !payee) {
          window.toastNotification("Please fill in all inputs.", "warning");
          return;
        }

        const tx = {
          payee,
          category,
          amount,
          status: 'Manual',
          type: 'Expense',
          date: new Date()
        };

        try {
          const before = window.stateEngine.checkAchievements().active.length;
          await window.stateEngine.addTransaction(tx);
          const after = window.stateEngine.checkAchievements().active.length;

          if (window.soundEngine) {
            if (after > before) {
              window.soundEngine.playLevelUp();
              if (window.triggerConfetti) window.triggerConfetti();
            } else {
              window.soundEngine.playCashRegister();
            }
          }

          window.toastNotification(`Logged ₹${amount} spent at ${payee}!`, "success");
          this.render(container); // Re-render dashboard
        } catch (err) {
          window.toastNotification("Failed to add transaction.", "error");
        }
      };
    }
  }

  async toggleBill(id) {
    try {
      const before = window.stateEngine.checkAchievements().active.length;
      await window.stateEngine.toggleBillPaid(id);
      const after = window.stateEngine.checkAchievements().active.length;

      const bill = window.stateEngine.data.bills.find(b => b._id === id);
      const status = bill.paid ? "Paid & Logged!" : "Pending & Reverted!";
      
      if (window.soundEngine && bill.paid) {
        if (after > before) {
          window.soundEngine.playLevelUp();
          if (window.triggerConfetti) window.triggerConfetti();
        } else {
          window.soundEngine.playSuccessChime();
        }
      }

      window.toastNotification(`Bill ${bill.name} is ${status}`, "success");
      // Re-render dashboard
      window.routingEngine.navigate('dashboard');
    } catch (err) {
      window.toastNotification("Failed to toggle bill status.", "error");
    }
  }

  async deleteTx(id) {
    if (confirm("Delete this spend entry? This will revert the amount back to your balance.")) {
      await window.stateEngine.deleteTransaction(id);
      window.toastNotification("Spend entry removed, balance reverted.", "info");
      // Re-render dashboard
      window.routingEngine.navigate('dashboard');
    }
  }

  // ==========================================
  // 📌 BILLS CRUD MODAL INTEGRATION
  // ==========================================

  openBillsModal() {
    const overlay = document.getElementById('bills-modal-overlay');
    const closeBtn = document.getElementById('close-bills-modal');

    if (overlay) {
      overlay.classList.remove('hidden');
      this.renderBillsList();

      if (closeBtn) {
        closeBtn.onclick = () => this.closeBillsModal();
      }

      overlay.onclick = (e) => {
        if (e.target === overlay) this.closeBillsModal();
      };
    }
  }

  closeBillsModal() {
    const overlay = document.getElementById('bills-modal-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  renderBillsList() {
    const body = document.getElementById('bills-modal-body');
    const title = document.getElementById('bills-modal-title');
    if (!body || !title) return;

    title.textContent = "Manage Recurring Monthly Bills";
    const bills = window.stateEngine.data.bills;

    body.innerHTML = `
      <div class="space-y-4">
        <p class="text-[11px] text-slate-400">Manage your active fixed monthly bills here. You can add new ones (e.g. Swimming membership) or delete them when expired.</p>
        
        <div class="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
          ${bills.length === 0 ? `
            <div class="p-6 text-center text-slate-400 text-xs">
              <span class="material-symbols-outlined text-3xl mb-2 text-slate-350 block">receipt_long</span>
              No active recurring bills defined. Add one below!
            </div>
          ` : bills.map(bill => {
            const billIcon = this._getBillIcon(bill.name);
            const bgIconClass = this._getBillIconBgClass(bill.name);
            return `
              <div class="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg ${bgIconClass} flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-lg">${billIcon}</span>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-700 block">${bill.name}</span>
                    <span class="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                      <span>Due Day ${bill.day}</span>
                      <span>&bull;</span>
                      ${bill.paid ? '<span class="text-secondary font-bold uppercase text-[8px]">Paid</span>' : '<span class="text-rose-500 font-semibold text-[8px]">Pending</span>'}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-3.5">
                  <span class="text-xs font-bold font-display text-slate-800">₹${bill.amount.toLocaleString('en-IN')}</span>
                  <div class="flex items-center space-x-1">
                    <button onclick="window.dashboardView.renderBillForm('${bill._id}')" class="w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-all flex items-center justify-center">
                      <span class="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button onclick="window.dashboardView.handleDeleteBill('${bill._id}')" class="w-8 h-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                      <span class="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button onclick="window.dashboardView.renderBillForm()" class="w-full bg-secondary hover:bg-secondary/90 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 mt-2 active:scale-99">
          <span class="material-symbols-outlined text-sm font-semibold">add</span>
          <span>Add New Monthly Bill</span>
        </button>
      </div>
    `;
  }

  renderBillForm(billId = null) {
    const body = document.getElementById('bills-modal-body');
    const title = document.getElementById('bills-modal-title');
    if (!body || !title) return;

    const isEdit = !!billId;
    let bill = { name: '', amount: '', day: 5 };
    
    if (isEdit) {
      title.textContent = "Edit Recurring Monthly Bill";
      const found = window.stateEngine.data.bills.find(b => b._id === billId);
      if (found) bill = found;
    } else {
      title.textContent = "Add New Monthly Recurring Bill";
    }

    body.innerHTML = `
      <form id="bill-edit-form" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bill Name</label>
          <input type="text" id="bill-form-name" value="${bill.name}" placeholder="e.g. Swimming Club, Netflix" required
            class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary-container/20 focus:border-secondary focus:bg-white transition-all font-semibold text-slate-800">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Monthly Amount (₹)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-semibold">₹</span>
              <input type="number" id="bill-form-amount" value="${bill.amount}" placeholder="0.00" required min="1"
                class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary-container/20 focus:border-secondary focus:bg-white transition-all font-semibold text-slate-800">
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Day of Month</label>
            <input type="number" id="bill-form-day" value="${bill.day}" placeholder="e.g. 5" required min="1" max="31"
              class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary-container/20 focus:border-secondary focus:bg-white transition-all font-semibold text-slate-750">
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
          <button type="button" onclick="window.dashboardView.renderBillsList()" class="text-xs font-bold text-slate-400 hover:text-slate-600 px-4 py-2 transition-all">
            Cancel
          </button>
          <button type="submit" class="bg-primary hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 active:scale-95">
            <span class="material-symbols-outlined text-xs">check_circle</span>
            <span>${isEdit ? 'Save Changes' : 'Create Bill'}</span>
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById('bill-edit-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('bill-form-name').value.trim();
        const amount = Number(document.getElementById('bill-form-amount').value);
        const day = Number(document.getElementById('bill-form-day').value);

        if (!name || !amount || !day) {
          window.toastNotification("Please fill in all input boxes.", "warning");
          return;
        }

        try {
          if (isEdit) {
            await window.stateEngine.updateBill(billId, { name, amount, day });
            window.toastNotification(`Updated monthly bill: ${name}!`, "success");
          } else {
            await window.stateEngine.addBill({ name, amount, day });
            window.toastNotification(`Added recurring bill for ${name}!`, "success");
          }
          this.renderBillsList();
        } catch (err) {
          window.toastNotification("Failed to save bill.", "error");
        }
      };
    }
  }

  async handleDeleteBill(id) {
    const bill = window.stateEngine.data.bills.find(b => b._id === id);
    if (!bill) return;

    if (confirm(`Are you sure you want to delete the "${bill.name}" bill subscription?`)) {
      try {
        await window.stateEngine.deleteBill(id);
        window.toastNotification(`Deleted monthly bill: ${bill.name}`, "info");
        this.renderBillsList();
      } catch (err) {
        window.toastNotification("Failed to delete bill.", "error");
      }
    }
  }

  // ==========================================
  // 📊 INTERACTIVE GRAPH HELPERS & DRAW ROUTINES
  // ==========================================

  // Helper to format date into "1st Jul" format
  _formatTrendDate(date) {
    const d = date.getDate();
    const m = date.toLocaleString('en-IN', { month: 'short' });
    let suffix = 'th';
    if (d === 1 || d === 21 || d === 31) suffix = 'st';
    else if (d === 2 || d === 22) suffix = 'nd';
    else if (d === 3 || d === 23) suffix = 'rd';
    return `${d}${suffix} ${m}`;
  }

  // Aggregate spending trends based on selected timeframe
  _getSpendingTrendsData(timeframe) {
    const now = new Date();
    let startDate;
    let daysCount = 30;

    if (timeframe === '7') {
      daysCount = 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (timeframe === 'month') {
      daysCount = now.getDate();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      daysCount = 30;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    }

    startDate.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate.getTime());
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }

    const state = window.stateEngine.data;
    const expenses = state.transactions.filter(t => t.type === 'Expense');

    const labels = [];
    const data = [];

    dates.forEach(date => {
      labels.push(this._formatTrendDate(date));

      const daySum = expenses
        .filter(t => {
          const txDate = new Date(t.date);
          return txDate.getFullYear() === date.getFullYear() &&
                 txDate.getMonth() === date.getMonth() &&
                 txDate.getDate() === date.getDate();
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push(daySum);
    });

    return { labels, data };
  }

  // Aggregate monthly expenses by category and map to custom colors
  _getExpenseBreakdownData() {
    const state = window.stateEngine.data;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = state.transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'Expense' && 
             d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear;
    });

    const categorySums = {};
    let totalSpend = 0;

    monthlyExpenses.forEach(t => {
      let cat = t.category;

      // Grouping logic to match user sketch
      if (cat === 'Savings') {
        cat = 'SIP/Invest';
      } else if (cat === 'Bills') {
        const payeeLower = t.payee.toLowerCase();
        if (payeeLower.includes('rent') || payeeLower.includes('estate') || payeeLower.includes('house')) {
          cat = 'Rent';
        } else {
          cat = 'Bills & Utilities';
        }
      } else if (cat === 'Food' || cat === 'Groceries') {
        cat = 'Food & Dining';
      } else if (cat === 'Others' || !cat) {
        cat = 'Miscellaneous';
      }

      categorySums[cat] = (categorySums[cat] || 0) + t.amount;
      totalSpend += t.amount;
    });

    const categories = Object.keys(categorySums);
    const shares = categories.map(cat => {
      const amount = categorySums[cat];
      const percent = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
      return {
        category: cat,
        amount: amount,
        percent: percent
      };
    });

    shares.sort((a, b) => b.amount - a.amount);

    return { totalSpend, shares };
  }

  // Draw smooth area spline line chart with Chart.js or SVG fallback
  _drawTrendsChart(labels, data) {
    const canvas = document.getElementById('trends-chart-canvas');
    const parent = document.getElementById('trends-chart-parent');
    if (!canvas || !parent) return;

    if (this.activeTrendsChart) {
      this.activeTrendsChart.destroy();
      this.activeTrendsChart = null;
    }

    const isChartJsAvailable = (typeof Chart !== 'undefined');

    if (isChartJsAvailable) {
      canvas.classList.remove('hidden');
      const ctx = canvas.getContext('2d');

      const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#006c4a';
      const secondaryRGBA = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-rgba').trim() || '0, 108, 74';

      const fillGradient = ctx.createLinearGradient(0, 0, 0, 240);
      fillGradient.addColorStop(0, `rgba(${secondaryRGBA}, 0.16)`);
      fillGradient.addColorStop(1, `rgba(${secondaryRGBA}, 0.00)`);

      this.activeTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Daily Outlays',
            data: data,
            borderColor: secondaryColor,
            borderWidth: 4.5,
            tension: 0.4,
            pointBackgroundColor: secondaryColor,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: fillGradient
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e293b',
              titleFont: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
              bodyFont: { family: 'Inter', size: 12, weight: 'bold' },
              padding: 10,
              cornerRadius: 12,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return ` ₹${context.raw.toLocaleString('en-IN')}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { family: 'Plus Jakarta Sans', size: 9, weight: '600' },
                color: '#94a3b8',
                maxTicksLimit: 5
              }
            },
            y: {
              grid: {
                color: '#f1f5f9',
                drawBorder: false
              },
              ticks: {
                font: { family: 'Plus Jakarta Sans', size: 9, weight: '600' },
                color: '#94a3b8',
                callback: function(value) {
                  return '₹' + formatCompactValue(value);
                }
              }
            }
          }
        }
      });
    } else {
      canvas.classList.add('hidden');
      
      const width = parent.clientWidth || 500;
      const height = 240;
      const paddingLeft = 45;
      const paddingRight = 15;
      const paddingTop = 20;
      const paddingBottom = 30;

      const chartW = width - paddingLeft - paddingRight;
      const chartH = height - paddingTop - paddingBottom;

      const maxVal = Math.max(...data, 1000);
      const minVal = 0;

      const points = data.map((val, idx) => {
        const x = paddingLeft + (idx / (data.length - 1)) * chartW;
        const y = paddingTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
        return { x, y, val, label: labels[idx] };
      });

      let pathD = '';
      if (points.length > 0) {
        pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i+1];
          const cpX1 = curr.x + (next.x - curr.x) / 3;
          const cpY1 = curr.y;
          const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
          const cpY2 = next.y;
          pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
        }
      }

      const areaD = points.length > 0 
        ? `${pathD} L ${points[points.length-1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`
        : '';

      const ticksCount = 3;
      const yTicks = [];
      for (let i = 0; i < ticksCount; i++) {
        const val = minVal + (i / (ticksCount - 1)) * (maxVal - minVal);
        const y = paddingTop + chartH - (i / (ticksCount - 1)) * chartH;
        yTicks.push({ val, y });
      }

      const xTicks = [];
      const interval = Math.max(1, Math.floor(points.length / 4));
      for (let i = 0; i < points.length; i += interval) {
        xTicks.push(points[i]);
      }
      if (points.length > 0 && !xTicks.includes(points[points.length-1])) {
        xTicks.push(points[points.length-1]);
      }

      const gridLines = yTicks.map(tick => `
        <line x1="${paddingLeft}" y1="${tick.y}" x2="${width - paddingRight}" y2="${tick.y}" stroke="#f1f5f9" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${paddingLeft - 8}" y="${tick.y}" text-anchor="end" dominant-baseline="central" fill="#94a3b8" class="text-[9px] font-extrabold font-sans">
          ₹${formatCompactValue(tick.val)}
        </text>
      `).join('');

      const xTickText = xTicks.map(pt => `
        <text x="${pt.x}" y="${height - 12}" text-anchor="middle" fill="#94a3b8" class="text-[9px] font-extrabold font-sans">
          ${pt.label.split(' ')[0]}
        </text>
      `).join('');

      const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#006c4a';

      const hoverCircles = points.map(pt => `
        <g class="group/point cursor-pointer">
          <circle cx="${pt.x}" cy="${pt.y}" r="8" fill="transparent" />
          <circle cx="${pt.x}" cy="${pt.y}" r="3" fill="${secondaryColor}" class="opacity-0 group-hover/point:opacity-100 transition-opacity duration-150" />
          <title>${pt.label}: ₹${pt.val.toLocaleString('en-IN')}</title>
        </g>
      `).join('');

      parent.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-full">
          <defs>
            <linearGradient id="trends-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${secondaryColor}" stop-opacity="0.08" />
              <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.00" />
            </linearGradient>
          </defs>
          ${gridLines}
          ${areaD ? `<path d="${areaD}" fill="url(#trends-area-grad)" />` : ''}
          ${pathD ? `<path d="${pathD}" fill="none" stroke="${secondaryColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />` : ''}
          ${xTickText}
          ${hoverCircles}
        </svg>
      `;
    }
  }

  // Draw circular doughnut breakdown chart with dynamic center-text and custom legends
  _drawBreakdownChart(totalSpend, shares) {
    const canvas = document.getElementById('breakdown-chart-canvas');
    const parent = document.getElementById('breakdown-chart-parent');
    const legendContainer = document.getElementById('breakdown-legend-container');
    const centerTextEl = document.getElementById('breakdown-center-text');
    if (!canvas || !parent || !legendContainer) return;

    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#006c4a';
    const emeraldColor = getComputedStyle(document.documentElement).getPropertyValue('--color-fin-emerald').trim() || '#10b981';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1e293b';

    const categoryColors = {
      "Rent": secondaryColor,
      "SIP/Invest": emeraldColor,
      "Food & Dining": primaryColor,
      "Bills & Utilities": "#6366f1",
      "Shopping": "#f59e0b",
      "Transport": "#0ea5e9",
      "Entertainment": "#8b5cf6",
      "Miscellaneous": "#991b1b"
    };

    // Render Center text absolute overlays
    if (centerTextEl) {
      if (shares.length > 0) {
        centerTextEl.innerHTML = `
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">${shares[0].category}</span>
          <span class="text-xl font-black text-slate-800 leading-none">${shares[0].percent.toFixed(0)}%</span>
        `;
      } else {
        centerTextEl.innerHTML = `
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Spends</span>
          <span class="text-xl font-black text-slate-800 leading-none">0%</span>
        `;
      }
    }

    // Render bullet legends list
    if (shares.length === 0) {
      legendContainer.innerHTML = `
        <div class="p-4 text-center text-slate-400 text-xs italic">
          No monthly spends recorded yet.
        </div>
      `;
    } else {
      legendContainer.innerHTML = shares.map(s => {
        const color = categoryColors[s.category] || "#94a3b8";
        return `
          <div class="flex items-center justify-between text-[11px] font-sans font-semibold leading-tight">
            <div class="flex items-center space-x-2 overflow-hidden">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
              <span class="text-slate-650 truncate max-w-[120px]">${s.category}</span>
            </div>
            <div class="space-x-1 flex-shrink-0 text-right">
              <span class="font-extrabold text-slate-800">₹${s.amount.toLocaleString('en-IN')}</span>
              <span class="text-[9.5px] text-slate-400 font-bold">(${s.percent.toFixed(0)}%)</span>
            </div>
          </div>
        `;
      }).join('');
    }

    if (this.activeBreakdownChart) {
      this.activeBreakdownChart.destroy();
      this.activeBreakdownChart = null;
    }

    const isChartJsAvailable = (typeof Chart !== 'undefined');

    if (isChartJsAvailable && shares.length > 0) {
      canvas.classList.remove('hidden');
      const ctx = canvas.getContext('2d');
      
      const labels = shares.map(s => s.category);
      const data = shares.map(s => s.amount);
      const bgColors = shares.map(s => categoryColors[s.category] || "#94a3b8");

      this.activeBreakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: bgColors,
            borderWidth: 2.5,
            borderColor: '#ffffff',
            hoverOffset: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e293b',
              titleFont: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
              bodyFont: { family: 'Inter', size: 11, weight: 'bold' },
              padding: 8,
              cornerRadius: 10,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return ` ₹${context.raw.toLocaleString('en-IN')}`;
                }
              }
            }
          },
          onHover: (event, activeElements) => {
            if (activeElements && activeElements.length > 0) {
              const index = activeElements[0].index;
              const hoveredShare = shares[index];
              if (centerTextEl) {
                centerTextEl.innerHTML = `
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">${hoveredShare.category}</span>
                  <span class="text-xl font-black text-slate-800 leading-none">${hoveredShare.percent.toFixed(0)}%</span>
                `;
              }
            } else {
              const dominant = shares[0];
              if (centerTextEl && dominant) {
                centerTextEl.innerHTML = `
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">${dominant.category}</span>
                  <span class="text-xl font-black text-slate-800 leading-none">${dominant.percent.toFixed(0)}%</span>
                `;
              }
            }
          }
        }
      });
    } else {
      canvas.classList.add('hidden');
      
      if (shares.length > 0) {
        let currentOffset = 0;
        const circumference = 2 * Math.PI * 50;

        const circlesSvg = shares.map(s => {
          const color = categoryColors[s.category] || "#94a3b8";
          const pct = s.percent / 100;
          const strokeLength = pct * circumference;
          const strokeOffset = -currentOffset;
          currentOffset += strokeLength;

          return `
            <circle cx="60" cy="60" r="50"
              fill="transparent"
              stroke="${color}"
              stroke-width="11"
              stroke-dasharray="${strokeLength} ${circumference}"
              stroke-dashoffset="${strokeOffset}"
              transform="rotate(-90 60 60)"
            >
              <title>${s.category}: ₹${s.amount.toLocaleString('en-IN')} (${s.percent.toFixed(0)}%)</title>
            </circle>
          `;
        }).join('');

        const existingSvg = parent.querySelector('svg');
        if (existingSvg) existingSvg.remove();

        parent.insertAdjacentHTML('afterbegin', `
          <svg viewBox="0 0 120 120" class="w-full h-full max-w-[130px] transform hover:scale-102 transition-transform duration-300">
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f8fafc" stroke-width="11" />
            ${circlesSvg}
          </svg>
        `);
      }
    }
  }
}

// Standalone Helper to format compact numbers (thousands, lakhs, crores)
function formatCompactValue(value) {
  if (value >= 1e7) return (value / 1e7).toFixed(1) + 'Cr';
  if (value >= 1e5) return (value / 1e5).toFixed(1) + 'L';
  if (value >= 1e3) return (value / 1e3).toFixed(0) + 'k';
  return value.toString();
}

// Instantiate View globally
window.dashboardView = new DashboardView();
