// Ledger View Controller

class LedgerView {
  constructor() {
    this.filters = {
      search: '',
      category: '',
      status: '',
      type: ''
    };
  }

  render(container) {
    if (!container) return;

    this.container = container;
    const state = window.stateEngine.data;

    // Apply filters in-memory on our local state copy for instantaneous responsiveness
    let filteredTxs = [...state.transactions];

    if (this.filters.search) {
      filteredTxs = filteredTxs.filter(t => t.payee.toLowerCase().includes(this.filters.search.toLowerCase()));
    }
    if (this.filters.category) {
      filteredTxs = filteredTxs.filter(t => t.category === this.filters.category);
    }
    if (this.filters.status) {
      filteredTxs = filteredTxs.filter(t => t.status === this.filters.status);
    }
    if (this.filters.type) {
      filteredTxs = filteredTxs.filter(t => t.type === this.filters.type);
    }

    // Get list of unique categories in dataset for dynamic dropdown populating
    const categories = ['Salary', 'Bills', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Groceries', 'Others'];

    container.innerHTML = `
      <div class="space-y-5 animate-slide-up">
        
        <!-- 🎛️ CONTROL & FILTER BAR PANEL -->
        <div class="glass-card rounded-fin p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            
            <!-- Category Filter -->
            <div>
              <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filter Category</label>
              <select id="filter-category" class="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-finEmerald/50 focus:bg-white transition-all font-semibold">
                <option value="">All Categories</option>
                ${categories.map(c => `<option value="${c}" ${this.filters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transaction Type</label>
              <select id="filter-type" class="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-finEmerald/50 focus:bg-white transition-all font-semibold">
                <option value="">All Types</option>
                <option value="Expense" ${this.filters.type === 'Expense' ? 'selected' : ''}>Expense</option>
                <option value="Income" ${this.filters.type === 'Income' ? 'selected' : ''}>Income</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</label>
              <select id="filter-status" class="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-finEmerald/50 focus:bg-white transition-all font-semibold">
                <option value="">All Methods</option>
                <option value="Manual" ${this.filters.status === 'Manual' ? 'selected' : ''}>Manual Entry</option>
                <option value="Auto" ${this.filters.status === 'Auto' ? 'selected' : ''}>Auto-Debited</option>
                <option value="Fixed" ${this.filters.status === 'Fixed' ? 'selected' : ''}>Fixed Recurring</option>
              </select>
            </div>

            <!-- Local Search Filter -->
            <div>
              <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Search Vendor</label>
              <input type="text" id="filter-search" value="${this.filters.search}" placeholder="Search vendor name..." class="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-finEmerald/50 focus:bg-white transition-all font-semibold">
            </div>

          </div>

          <!-- Clear CTA -->
          <div class="flex-shrink-0 flex items-end">
            <button id="clear-filters" class="w-full md:w-auto text-xs font-bold text-slate-400 hover:text-red-500 py-2 px-4 border border-slate-200 hover:border-red-500/20 rounded transition-all bg-white flex items-center justify-center space-x-1.5">
              <i class="fa-solid fa-filter-circle-xmark"></i>
              <span>Clear</span>
            </button>
          </div>
        </div>

        <!-- 📜 DATA SHEET LEDGER TABLE -->
        <div class="glass-card rounded-fin p-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 class="font-extrabold text-sm text-slate-800">Financial Ledger Accounts</h3>
              <p class="text-[10px] text-slate-400">Isolated details for ${filteredTxs.length} mapped records</p>
            </div>
            <!-- Sync indicator -->
            <span class="text-[9px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Atlas Connected</span>
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 pb-2">
                  <th class="py-2.5">Date</th>
                  <th>Payee / Vendor</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Payment Status</th>
                  <th class="text-right">Amount</th>
                  <th class="text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50" id="ledger-table-body">
                ${filteredTxs.length === 0 ? `
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400">
                      <i class="fa-solid fa-ban text-3xl mb-2.5 block text-slate-300"></i>
                      <span class="font-semibold">No records found matching active filter subsets</span>
                    </td>
                  </tr>
                ` : filteredTxs.map(tx => {
                  const txDate = new Date(tx.date).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric'
                  });
                  const isIncome = tx.type === 'Income';

                  let badgeClass = 'badge-manual';
                  if (tx.status === 'Auto') badgeClass = 'badge-auto';
                  else if (tx.status === 'Fixed') badgeClass = 'badge-fixed';

                  return `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-3.5 text-slate-400 font-semibold">${txDate}</td>
                      <td class="font-bold text-slate-700">${tx.payee}</td>
                      <td>
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold">${tx.category}</span>
                      </td>
                      <td class="font-bold">
                        <span class="${isIncome ? 'text-emerald-500' : 'text-rose-500'} flex items-center space-x-1">
                          <i class="fa-solid ${isIncome ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]"></i>
                          <span>${tx.type}</span>
                        </span>
                      </td>
                      <td>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${tx.status}</span>
                      </td>
                      <td class="text-right font-extrabold text-slate-800 ${isIncome ? 'text-emerald-600' : ''}">
                        ${isIncome ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td class="text-center">
                        <button onclick="window.ledgerView.deleteTx('${tx._id}')" class="text-slate-400 hover:text-red-500 transition-colors w-8 h-8 rounded-full hover:bg-red-50 inline-flex items-center justify-center mx-auto">
                          <i class="fa-solid fa-trash-can text-[11px]"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Hook listeners
    this.setupListeners();
  }

  setupListeners() {
    const catSelect = document.getElementById('filter-category');
    const typeSelect = document.getElementById('filter-type');
    const statusSelect = document.getElementById('filter-status');
    const searchInput = document.getElementById('filter-search');
    const clearBtn = document.getElementById('clear-filters');

    if (catSelect) {
      catSelect.onchange = (e) => {
        this.filters.category = e.target.value;
        this.render(this.container);
      };
    }
    if (typeSelect) {
      typeSelect.onchange = (e) => {
        this.filters.type = e.target.value;
        this.render(this.container);
      };
    }
    if (statusSelect) {
      statusSelect.onchange = (e) => {
        this.filters.status = e.target.value;
        this.render(this.container);
      };
    }
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.filters.search = e.target.value;
        this.render(this.container);
      };
    }
    if (clearBtn) {
      clearBtn.onclick = () => {
        this.filters = { search: '', category: '', status: '', type: '' };
        this.render(this.container);
      };
    }
  }

  async deleteTx(id) {
    if (confirm("Are you sure you want to delete this transaction record? This will revert the bank balance adjustment.")) {
      await window.stateEngine.deleteTransaction(id);
      window.toastNotification("Transaction record deleted and cash balance restored.", "info");
      this.render(this.container);
    }
  }
}

// Instantiate View globally
window.ledgerView = new LedgerView();
