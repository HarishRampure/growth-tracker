// Savings Funds View Controller

class FundsView {
  constructor() {
    this.container = null;
    this.listenersBound = false;
    this.activeChart = null;
    
    // Theme details
    this.colors = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', fill: 'bg-emerald-500', border: 'border-emerald-200', hex: '#10b981' },
      sky: { bg: 'bg-sky-500/10', text: 'text-sky-600', fill: 'bg-sky-500', border: 'border-sky-200', hex: '#0ea5e9' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', fill: 'bg-indigo-500', border: 'border-indigo-200', hex: '#6366f1' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', fill: 'bg-amber-500', border: 'border-amber-200', hex: '#f59e0b' },
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', fill: 'bg-rose-500', border: 'border-rose-200', hex: '#f43f5e' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', fill: 'bg-purple-500', border: 'border-purple-200', hex: '#8b5cf6' }
    };
  }

  render(container) {
    if (!container) return;
    this.container = container;

    const state = window.stateEngine.data;
    const funds = state.funds || [];

    // Calculate totals
    const totalSaved = funds.reduce((sum, f) => sum + (f.current || 0), 0);
    const totalTarget = funds.reduce((sum, f) => sum + (f.target || 0), 0);
    const overallPercent = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

    // Render HTML canvas structure
    container.innerHTML = `
      <div class="space-y-6 animate-slide-up">
        
        <!-- 💡 HEADER BENTO BLOCK -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- SUMMARY OVERVIEW CARD -->
          <div class="glass-card rounded-fin p-6 lg:col-span-2 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-extrabold text-sm text-slate-800">Savings & Goal Allocations</h3>
                  <p class="text-[10px] text-slate-400">Consolidated progress across your customized investment pots.</p>
                </div>
                <button id="add-fund-btn" class="bg-finEmerald hover:bg-emerald-600 text-finSlate font-extrabold text-xs px-3.5 py-2 rounded-fin shadow-md transition-all flex items-center space-x-1.5">
                  <span class="material-symbols-outlined text-sm font-bold">add</span>
                  <span>Create Savings Goal</span>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-5">
                <div class="bg-slate-50 border border-slate-100 rounded-fin p-4">
                  <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Total Saved Portfolio</span>
                  <span class="text-2xl font-black text-slate-800">₹${totalSaved.toLocaleString('en-IN')}</span>
                </div>
                <div class="bg-slate-50 border border-slate-100 rounded-fin p-4">
                  <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Consolidated Goals Target</span>
                  <span class="text-2xl font-black text-slate-800">₹${totalTarget.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-xs font-bold text-slate-500">Overall Progress</span>
                <span class="text-xs font-extrabold text-finEmerald">${overallPercent.toFixed(1)}% Completed</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-finEmerald h-full transition-all duration-700" style="width: ${overallPercent}%"></div>
              </div>
            </div>
          </div>

          <!-- DOUGHNUT ALLOCATION GRAPH CARD -->
          <div class="glass-card rounded-fin p-6 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <h4 class="font-extrabold text-xs text-slate-800 uppercase tracking-widest mb-1.5">Allocation Spread</h4>
              <span class="text-[9px] text-slate-400 block mb-4">Relative weight distribution of total assets.</span>
            </div>

            <div class="grid grid-cols-5 gap-3 items-center">
              <div class="col-span-2 relative min-h-[110px] flex items-center justify-center" id="chart-parent-container">
                <canvas id="allocation-chart-canvas" class="w-full h-full max-w-[110px] max-h-[110px]"></canvas>
              </div>
              <div class="col-span-3 space-y-2 max-h-[120px] overflow-y-auto pr-1" id="chart-legend-container">
                <!-- Dynamic Legends -->
              </div>
            </div>
          </div>

        </div>

        <!-- 🚀 DYNAMIC FUNDS CARD GRID -->
        <h4 class="font-extrabold text-xs text-slate-500 uppercase tracking-widest pt-2">Active Savings Pots</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${funds.map(f => {
            const colorTheme = this.colors[f.color] || this.colors.emerald;
            const pct = f.target > 0 ? Math.min(100, (f.current / f.target) * 100) : 0;
            const remaining = Math.max(f.target - f.current, 0);

            return `
              <div class="glass-card rounded-fin p-5 flex flex-col justify-between min-h-[220px] hover:border-slate-300 group transition-all relative">
                
                <!-- Card Header -->
                <div>
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-fin flex items-center justify-center shadow-inner ${colorTheme.bg}">
                        <span class="material-symbols-outlined text-lg font-bold ${colorTheme.text}">
                          ${f.icon || 'savings'}
                        </span>
                      </div>
                      <div>
                        <h4 class="font-extrabold text-sm text-slate-800 leading-tight">${f.name}</h4>
                        <span class="text-[9px] text-slate-400 font-semibold uppercase">Target: ₹${f.target.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <!-- Settings Trigger -->
                    <button onclick="window.fundsView.openEditModal('${f._id}')" class="text-slate-300 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center">
                      <i class="fa-solid fa-gear text-xs"></i>
                    </button>
                  </div>

                  <!-- Balance Stats -->
                  <div class="flex justify-between items-baseline mb-2">
                    <span class="text-2xl font-black text-slate-800">₹${f.current.toLocaleString('en-IN')}</span>
                    <span class="text-xs font-bold text-slate-400">${pct.toFixed(0)}%</span>
                  </div>

                  <!-- Progress bar -->
                  <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                    <div class="h-full transition-all duration-500 ${colorTheme.fill}" style="width: ${pct}%"></div>
                  </div>
                </div>

                <!-- Footer & Transfer Buttons -->
                <div class="pt-3 border-t border-slate-50 flex items-center justify-between mt-2">
                  <span class="text-[9px] text-slate-400 font-semibold">
                    ${remaining > 0 ? `₹${remaining.toLocaleString('en-IN')} left` : `🎉 Goal Achieved!`}
                  </span>
                  
                  <div class="flex items-center space-x-2">
                    <button onclick="window.fundsView.openContributionModal('${f._id}', 'Withdrawal')" class="text-[10px] text-rose-500 hover:text-white border border-rose-200 hover:bg-rose-500 font-bold px-2.5 py-1.5 rounded-fin transition-all flex items-center space-x-1">
                      <i class="fa-solid fa-minus text-[8px]"></i>
                      <span>Withdraw</span>
                    </button>
                    <button onclick="window.fundsView.openContributionModal('${f._id}', 'Contribution')" class="text-[10px] text-emerald-600 hover:text-white border border-emerald-200 hover:bg-emerald-500 font-bold px-2.5 py-1.5 rounded-fin transition-all flex items-center space-x-1">
                      <i class="fa-solid fa-plus text-[8px]"></i>
                      <span>Contribute</span>
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- 📜 RECENT ACTIVITY LEDGER -->
        <div class="glass-card rounded-fin p-6 mt-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 class="font-extrabold text-sm text-slate-800">Savings Ledger History</h3>
              <p class="text-[10px] text-slate-400">Chronological records of savings movements</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-slate-400 font-bold border-b border-slate-100">
                  <th class="py-3 px-2">Date</th>
                  <th class="py-3 px-2">Goal Pot</th>
                  <th class="py-3 px-2">Action Type</th>
                  <th class="py-3 px-2">Description / Note</th>
                  <th class="py-3 px-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody id="savings-ledger-body">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Draw graph and log listings
    this.drawAllocationChart(funds, totalSaved);
    this.renderActivityLogs(funds);

    // Dynamic setups
    this.setupModalListeners();
  }

  drawAllocationChart(funds, totalSaved) {
    const canvas = document.getElementById('allocation-chart-canvas');
    const parent = document.getElementById('chart-parent-container');
    const legendContainer = document.getElementById('chart-legend-container');

    if (!canvas || !parent || !legendContainer) return;

    // Retrieve active theme colors dynamically
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#006c4a';
    const emeraldColor = getComputedStyle(document.documentElement).getPropertyValue('--color-fin-emerald').trim() || '#10b981';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#0f172a';

    // Map segments dynamically to theme styles
    this.colors.emerald.hex = emeraldColor;
    this.colors.sky.hex = secondaryColor;
    this.colors.indigo.hex = primaryColor;
    this.colors.purple.hex = emeraldColor;
    this.colors.rose.hex = emeraldColor;

    // Filter funds with active allocations
    const activeFunds = funds.filter(f => (f.current || 0) > 0);

    // Injected legends
    legendContainer.innerHTML = funds.map(f => {
      const colorTheme = this.colors[f.color] || this.colors.emerald;
      const pctOfTotalSaved = totalSaved > 0 ? ((f.current / totalSaved) * 100).toFixed(0) : 0;
      return `
        <div class="flex items-center justify-between text-[11px] leading-tight font-sans">
          <div class="flex items-center space-x-2 overflow-hidden">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${colorTheme.hex}"></span>
            <span class="font-semibold text-slate-700 truncate max-w-[100px]">${f.name}</span>
          </div>
          <div class="space-x-1 flex-shrink-0">
            <span class="font-black text-slate-800">₹${formatCompactValue(f.current)}</span>
            <span class="text-[9px] text-slate-400 font-medium">(${pctOfTotalSaved}%)</span>
          </div>
        </div>
      `;
    }).join('');

    // Safe disposal of active Chart.js instance to prevent canvas re-drawing conflicts
    if (this.activeChart) {
      this.activeChart.destroy();
      this.activeChart = null;
    }

    const isChartJsAvailable = (typeof Chart !== 'undefined');

    if (isChartJsAvailable && activeFunds.length > 0) {
      canvas.classList.remove('hidden');
      const ctx = canvas.getContext('2d');
      
      const labels = activeFunds.map(f => f.name);
      const data = activeFunds.map(f => f.current);
      const bgColors = activeFunds.map(f => (this.colors[f.color] || this.colors.emerald).hex);

      this.activeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  return ` ₹${val.toLocaleString('en-IN')}`;
                }
              }
            }
          }
        }
      });
    } else {
      // Offline fallback: Pure SVG Doughnut Chart
      canvas.classList.add('hidden');
      
      if (activeFunds.length === 0) {
        // Empty State SVG
        parent.innerHTML = `
          <svg viewBox="0 0 120 120" class="w-full h-full max-w-[110px]">
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f1f5f9" stroke-width="12" />
            <text x="60" y="60" text-anchor="middle" dominant-baseline="central" class="font-extrabold text-[10px] fill-slate-400 font-sans">
              No Funds
            </text>
          </svg>
        `;
      } else {
        // Segments math logic
        let currentOffset = 0;
        const circumference = 2 * Math.PI * 50; // 314.16

        const circlesSvg = activeFunds.map(f => {
          const colorTheme = this.colors[f.color] || this.colors.emerald;
          const pct = f.current / totalSaved;
          const strokeLength = pct * circumference;
          const strokeOffset = -currentOffset;
          currentOffset += strokeLength;

          return `
            <circle cx="60" cy="60" r="50"
              fill="transparent"
              stroke="${colorTheme.hex}"
              stroke-width="12"
              stroke-dasharray="${strokeLength} ${circumference}"
              stroke-dashoffset="${strokeOffset}"
              transform="rotate(-90 60 60)"
            />
          `;
        }).join('');

        parent.innerHTML = `
          <svg viewBox="0 0 120 120" class="w-full h-full max-w-[110px] transform hover:scale-105 transition-transform duration-300">
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f8fafc" stroke-width="12" />
            ${circlesSvg}
            <text x="60" y="65" text-anchor="middle" dominant-baseline="central" class="font-black text-[12px] fill-slate-800 font-sans">
              ₹${formatCompactValue(totalSaved)}
            </text>
          </svg>
        `;
      }
    }
  }

  // Mapped activity logs
  renderActivityLogs(funds) {
    const tbody = document.getElementById('savings-ledger-body');
    if (!tbody) return;

    const allLogs = [];
    funds.forEach(f => {
      if (f.contributions) {
        f.contributions.forEach(c => {
          allLogs.push({
            ...c,
            fundId: f._id,
            fundName: f.name,
            fundColor: f.color
          });
        });
      }
    });

    // Sort by date desc
    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allLogs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 font-medium italic">
            No savings deposits or withdrawals logged yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = allLogs.map(log => {
      const colorTheme = this.colors[log.fundColor] || this.colors.emerald;
      const logDate = new Date(log.date);
      const isContrib = log.type === 'Contribution';
      
      const badgeClass = isContrib 
        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
        : 'bg-rose-50 border-rose-100 text-rose-700';

      const amountText = isContrib 
        ? `+₹${log.amount.toLocaleString('en-IN')}` 
        : `-₹${log.amount.toLocaleString('en-IN')}`;

      const amountClass = isContrib ? 'text-emerald-600' : 'text-rose-600';

      return `
        <tr class="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
          <td class="py-3 px-2 text-slate-500 font-medium">
            ${logDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </td>
          <td class="py-3 px-2">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${colorTheme.hex}"></span>
              <span class="font-extrabold text-slate-800">${logNameTrim(log.fundName)}</span>
            </div>
          </td>
          <td class="py-3 px-2">
            <span class="text-[9px] font-bold px-2 py-0.5 rounded border ${badgeClass}">
              ${log.type}
            </span>
          </td>
          <td class="py-3 px-2 text-slate-500 max-w-[200px] truncate font-medium" title="${log.note || 'None'}">
            ${log.note || '<span class="text-slate-300">N/A</span>'}
          </td>
          <td class="py-3 px-2 text-right font-black ${amountClass}">
            ${amountText}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ===============================================
  // 🔓 MODALS & FORMS BINDING
  // ===============================================

  setupModalListeners() {
    // Dynamic element inside recreated DOM container must be bound every time
    const addBtn = document.getElementById('add-fund-btn');
    if (addBtn) addBtn.onclick = () => this.openCreateModal();

    if (this.listenersBound) return;

    // Modal overlay closures
    const closeFund = document.getElementById('close-fund-modal');
    if (closeFund) closeFund.onclick = () => this.closeFundModal();

    const closeContrib = document.getElementById('close-contribution-modal');
    if (closeContrib) closeContrib.onclick = () => this.closeContributionModal();

    const fundOverlay = document.getElementById('fund-modal-overlay');
    if (fundOverlay) {
      fundOverlay.onclick = (e) => {
        if (e.target === fundOverlay) this.closeFundModal();
      };
    }

    const contribOverlay = document.getElementById('contribution-modal-overlay');
    if (contribOverlay) {
      contribOverlay.onclick = (e) => {
        if (e.target === contribOverlay) this.closeContributionModal();
      };
    }

    // Forms submissions
    const fundForm = document.getElementById('fund-form');
    if (fundForm) fundForm.onsubmit = (e) => this.handleFundSubmit(e);

    const deleteBtn = document.getElementById('delete-fund-btn');
    if (deleteBtn) deleteBtn.onclick = () => this.handleFundDelete();

    const contribForm = document.getElementById('contribution-form');
    if (contribForm) contribForm.onsubmit = (e) => this.handleContributionSubmit(e);

    // Radio styles listeners in contribution modal
    const addRadio = document.querySelector('input[name="contribType"][value="Contribution"]');
    const withdrawRadio = document.querySelector('input[name="contribType"][value="Withdrawal"]');
    const syncCheckbox = document.getElementById('contribution-sync');
    const syncLabel = document.getElementById('sync-toggle-label');
    const syncHelp = document.getElementById('sync-toggle-help');

    const addLabel = document.getElementById('contrib-type-add-label');
    const withdrawLabel = document.getElementById('contrib-type-withdraw-label');

    const updateContribStyles = () => {
      if (addRadio && addRadio.checked) {
        if (addLabel) addLabel.className = 'border-2 border-emerald-400 bg-emerald-50/10 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-emerald-600 transition-all select-none';
        if (withdrawLabel) withdrawLabel.className = 'border border-slate-200 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all select-none';
        if (syncLabel) syncLabel.textContent = 'Deduct from Cash Balance';
        if (syncHelp) syncHelp.textContent = 'Automatically sync this with your main wallet balance and log a ledger record under Savings.';
      } else if (withdrawRadio && withdrawRadio.checked) {
        if (withdrawLabel) withdrawLabel.className = 'border-2 border-rose-400 bg-rose-50/10 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-rose-600 transition-all select-none';
        if (addLabel) addLabel.className = 'border border-slate-200 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all select-none';
        if (syncLabel) syncLabel.textContent = 'Add Back to Cash Balance';
        if (syncHelp) syncHelp.textContent = 'Automatically credit your main cash wallet and log an Income transaction under Savings.';
      }
    };

    if (addLabel && addRadio) {
      addLabel.onclick = () => {
        addRadio.checked = true;
        updateContribStyles();
      };
    }

    if (withdrawLabel && withdrawRadio) {
      withdrawLabel.onclick = () => {
        withdrawRadio.checked = true;
        updateContribStyles();
      };
    }

    this.listenersBound = true;
  }

  // Modals operations
  openCreateModal() {
    const overlay = document.getElementById('fund-modal-overlay');
    const title = document.getElementById('fund-modal-title');
    const form = document.getElementById('fund-form');
    const delBtn = document.getElementById('delete-fund-btn');
    const submitText = document.getElementById('fund-submit-text');

    if (!overlay || !form) return;

    form.reset();
    document.getElementById('fund-id').value = '';
    
    if (title) title.textContent = "Create Savings Goal";
    if (submitText) submitText.textContent = "Create Savings Goal";
    if (delBtn) delBtn.classList.add('hidden');

    overlay.classList.remove('hidden');
  }

  openEditModal(fundId) {
    const overlay = document.getElementById('fund-modal-overlay');
    const title = document.getElementById('fund-modal-title');
    const form = document.getElementById('fund-form');
    const delBtn = document.getElementById('delete-fund-btn');
    const submitText = document.getElementById('fund-submit-text');

    if (!overlay || !form) return;

    const fund = window.stateEngine.data.funds.find(f => f._id === fundId);
    if (!fund) return;

    document.getElementById('fund-id').value = fund._id;
    document.getElementById('fund-name').value = fund.name;
    document.getElementById('fund-target').value = fund.target;
    document.getElementById('fund-icon').value = fund.icon || 'savings';
    document.getElementById('fund-color').value = fund.color || 'emerald';

    if (title) title.textContent = `Edit Goal: ${fund.name}`;
    if (submitText) submitText.textContent = "Save Adjustments";
    if (delBtn) delBtn.classList.remove('hidden');

    overlay.classList.remove('hidden');
  }

  closeFundModal() {
    const overlay = document.getElementById('fund-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  openContributionModal(fundId, type = 'Contribution') {
    const overlay = document.getElementById('contribution-modal-overlay');
    const title = document.getElementById('contribution-modal-title');
    const form = document.getElementById('contribution-form');

    if (!overlay || !form) return;

    const fund = window.stateEngine.data.funds.find(f => f._id === fundId);
    if (!fund) return;

    form.reset();
    document.getElementById('contribution-fund-id').value = fund._id;
    
    // Set radio buttons
    const addRadio = document.querySelector('input[name="contribType"][value="Contribution"]');
    const withdrawRadio = document.querySelector('input[name="contribType"][value="Withdrawal"]');
    
    const addLabel = document.getElementById('contrib-type-add-label');
    const withdrawLabel = document.getElementById('contrib-type-withdraw-label');
    
    const syncLabel = document.getElementById('sync-toggle-label');
    const syncHelp = document.getElementById('sync-toggle-help');

    if (type === 'Contribution') {
      if (addRadio) addRadio.checked = true;
      if (addLabel) addLabel.className = 'border-2 border-emerald-400 bg-emerald-50/10 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-emerald-600 transition-all select-none';
      if (withdrawLabel) withdrawLabel.className = 'border border-slate-200 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all select-none';
      if (syncLabel) syncLabel.textContent = 'Deduct from Cash Balance';
      if (syncHelp) syncHelp.textContent = 'Automatically sync this with your main wallet balance and log a ledger record under Savings.';
    } else {
      if (withdrawRadio) withdrawRadio.checked = true;
      if (withdrawLabel) withdrawLabel.className = 'border-2 border-rose-400 bg-rose-50/10 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-rose-600 transition-all select-none';
      if (addLabel) addLabel.className = 'border border-slate-200 rounded-fin p-3 flex items-center justify-center space-x-2 cursor-pointer font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all select-none';
      if (syncLabel) syncLabel.textContent = 'Add Back to Cash Balance';
      if (syncHelp) syncHelp.textContent = 'Automatically credit your main cash wallet and log an Income transaction under Savings.';
    }

    if (title) title.textContent = `${type === 'Contribution' ? 'Deposit in' : 'Withdraw from'} ${fund.name}`;

    overlay.classList.remove('hidden');
  }

  closeContributionModal() {
    const overlay = document.getElementById('contribution-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // Handle submissions
  async handleFundSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('fund-id').value;
    const name = document.getElementById('fund-name').value;
    const target = Number(document.getElementById('fund-target').value);
    const icon = document.getElementById('fund-icon').value;
    const color = document.getElementById('fund-color').value;

    const data = { name, target, icon, color };

    if (id) {
      await window.stateEngine.updateFund(id, data);
      window.toastNotification(`Goal adjusted: ${name}`, 'success');
    } else {
      await window.stateEngine.addFund(data);
      window.toastNotification(`Goal created: ${name}`, 'success');
    }

    this.closeFundModal();
    this.render(this.container);
  }

  async handleFundDelete() {
    const id = document.getElementById('fund-id').value;
    if (!id) return;

    const fund = window.stateEngine.data.funds.find(f => f._id === id);
    if (!fund) return;

    if (confirm(`⚠️ DANGER: Are you sure you want to delete the savings goal "${fund.name}"? This removes the goal completely along with all of its logged history. This cannot be undone.`)) {
      await window.stateEngine.deleteFund(id);
      window.toastNotification(`Goal deleted: ${fund.name}`, 'info');
      this.closeFundModal();
      this.render(this.container);
    }
  }

  async handleContributionSubmit(e) {
    e.preventDefault();

    const fundId = document.getElementById('contribution-fund-id').value;
    const amount = Number(document.getElementById('contribution-amount').value);
    const type = document.querySelector('input[name="contribType"]:checked').value;
    const note = document.getElementById('contribution-note').value;
    const syncWithCash = document.getElementById('contribution-sync').checked;

    if (amount <= 0 || isNaN(amount)) {
      alert("Please enter a valid contribution amount.");
      return;
    }

    const fund = window.stateEngine.data.funds.find(f => f._id === fundId);
    if (!fund) return;

    // Check withdrawal ceiling
    if (type === 'Withdrawal' && amount > fund.current) {
      alert(`⚠️ Insufficient Funds: Cannot withdraw ₹${amount.toLocaleString('en-IN')} as there is only ₹${fund.current.toLocaleString('en-IN')} available in this goal pot.`);
      return;
    }

    const before = window.stateEngine.checkAchievements().active.length;
    const reaches100Percent = type === 'Contribution' && (fund.current < fund.target) && (fund.current + amount >= fund.target);
    await window.stateEngine.addFundContribution(fundId, amount, type, note, syncWithCash);
    const after = window.stateEngine.checkAchievements().active.length;

    if (window.soundEngine) {
      if (after > before || reaches100Percent) {
        window.soundEngine.playLevelUp();
        if (window.triggerConfetti) window.triggerConfetti();
      } else {
        window.soundEngine.playSuccessChime();
      }
    }
    
    window.toastNotification(
      `${type === 'Contribution' ? 'Deposited' : 'Withdrew'} ₹${amount.toLocaleString('en-IN')} ${type === 'Contribution' ? 'into' : 'from'} ${fund.name}!`,
      'success'
    );

    this.closeContributionModal();
    this.render(this.container);
  }
}

// Format compact numbers (thousands, lakhs, crores)
function formatCompactValue(value) {
  if (value >= 1e7) return (value / 1e7).toFixed(1) + 'Cr';
  if (value >= 1e5) return (value / 1e5).toFixed(1) + 'L';
  if (value >= 1e3) return (value / 1e3).toFixed(0) + 'k';
  return value.toString();
}

function logNameTrim(name) {
  if (name.length > 22) return name.slice(0, 20) + '...';
  return name;
}

// Instantiate View Controller
window.fundsView = new FundsView();
