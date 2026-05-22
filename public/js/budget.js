// Budgets View Controller

class BudgetsView {
  render(container) {
    if (!container) return;

    this.container = container;
    const state = window.stateEngine.data;
    const budgets = state.budgets;

    // We will render cards for each configured budget category
    container.innerHTML = `
      <div class="space-y-6 animate-slide-up">
        
        <!-- 💡 BUDGET OVERVIEW INTRO -->
        <div class="glass-card rounded-fin p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 class="font-extrabold text-sm text-slate-800">Monthly Budgeting Suite</h3>
            <p class="text-[10px] text-slate-400">Set limits for discrete spending groups. Warning banners trigger automatically at 80% thresholds.</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-finEmerald bg-emerald-500/10 px-3 py-1.5 rounded">
              <i class="fa-solid fa-bell"></i>
              <span>Active Alerts Enabled</span>
            </div>
            <button onclick="window.budgetsView.openCreateModal()" class="flex items-center space-x-1.5 text-[10px] uppercase font-extrabold tracking-widest text-finSlate bg-finEmerald hover:bg-emerald-600 px-3.5 py-2 rounded shadow-md hover:scale-105 transition-all">
              <i class="fa-solid fa-plus-circle text-[11px]"></i>
              <span>Create Category</span>
            </button>
          </div>
        </div>

        <!-- 📊 PROGRESS CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${budgets.map(b => {
            const spent = window.stateEngine.getCategorySpentThisMonth(b.category);
            const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            const remaining = Math.max(b.limit - spent, 0);
            
            let colorClass = 'bg-finEmerald';
            let bgClass = 'bg-emerald-50 border-emerald-100 text-emerald-700';
            let percentText = 'Safe';
            
            if (percent >= 100) {
              colorClass = 'bg-rose-500';
              bgClass = 'bg-rose-50 border-rose-100 text-rose-700';
              percentText = 'OVER-LIMIT';
            } else if (percent >= 80) {
              colorClass = 'bg-amber-500';
              bgClass = 'bg-amber-50 border-amber-100 text-amber-700';
              percentText = 'NEAR LIMIT';
            }

            return `
              <div class="glass-card rounded-fin p-6 flex flex-col justify-between min-h-[180px] hover:border-slate-300 transition-all">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2.5">
                      <span class="w-8 h-8 rounded-fin bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold uppercase">
                        ${b.category.substring(0,2)}
                      </span>
                      <div>
                        <h4 class="font-extrabold text-sm text-slate-800">${b.category}</h4>
                        <span class="text-[9px] text-slate-400 font-semibold uppercase">Category Cap</span>
                      </div>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded border ${bgClass}">${percentText}</span>
                  </div>

                  <div class="flex items-baseline justify-between mb-2">
                    <div class="space-x-1">
                      <span class="text-xl font-extrabold text-slate-800">₹${spent.toLocaleString('en-IN')}</span>
                      <span class="text-xs text-slate-400">of ₹${b.limit.toLocaleString('en-IN')} limit</span>
                    </div>
                    <span class="text-xs font-bold text-slate-500">${percent.toFixed(0)}% Used</span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                    <div class="${colorClass} h-full transition-all duration-500" style="width: ${Math.min(percent, 100)}%"></div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                  <span class="text-[10px] text-slate-400 font-medium">Remaining balance: <b class="text-slate-600">₹${remaining.toLocaleString('en-IN')}</b></span>
                  <button onclick="window.budgetsView.editLimit('${b.category}', ${b.limit})" class="text-[10px] text-finEmerald hover:text-emerald-600 font-extrabold flex items-center space-x-1">
                    <i class="fa-solid fa-pen text-[9px]"></i>
                    <span>Modify Limit</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  editLimit(category, currentLimit) {
    const newLimitInput = prompt(`Modify monthly spending cap for "${category}":`, currentLimit);
    if (newLimitInput === null) return;
    
    const limitNum = Number(newLimitInput);
    if (isNaN(limitNum) || limitNum < 0) {
      alert("Invalid limit amount. Please enter a positive number.");
      return;
    }

    window.stateEngine.updateBudgetLimit(category, limitNum);
    window.toastNotification(`Monthly limit for ${category} adjusted to ₹${limitNum.toLocaleString('en-IN')}`, "success");
    this.render(this.container);
  }

  openCreateModal() {
    const overlay = document.getElementById('budget-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const form = document.getElementById('budget-form');
    const closeBtn = document.getElementById('close-budget-modal');

    const closeModal = () => {
      overlay.classList.add('hidden');
      form.reset();
    };

    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const category = document.getElementById('budget-category').value.trim();
      const limit = Number(document.getElementById('budget-limit').value);

      if (!category || isNaN(limit) || limit <= 0) {
        alert("Please enter valid details.");
        return;
      }

      await window.stateEngine.createBudgetCategory(category, limit);
      window.toastNotification(`Budget category "${category}" created successfully!`, "success");
      closeModal();
      this.render(this.container);
    };
  }
}

// Instantiate View globally
window.budgetsView = new BudgetsView();
