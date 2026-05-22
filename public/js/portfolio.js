// Portfolio View Controller

class PortfolioView {
  render(container) {
    if (!container) return;

    this.container = container;
    const state = window.stateEngine.data;
    const investments = state.investments;
    const totalInvestments = window.stateEngine.getTotalInvestments();

    container.innerHTML = `
      <div class="space-y-6 animate-slide-up">
        
        <!-- 💡 PORTFOLIO HEADER BANNER -->
        <div class="glass-card rounded-fin p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center justify-between md:justify-start md:space-x-4 mb-2">
              <h3 class="font-extrabold text-sm text-slate-800">Portfolio Wealth Manager</h3>
              <button onclick="window.portfolioView.openCreateModal()" class="flex items-center space-x-1.5 text-[9px] uppercase font-extrabold tracking-widest text-finSlate bg-finEmerald hover:bg-emerald-600 px-3 py-1.5 rounded shadow-md hover:scale-105 transition-all">
                <i class="fa-solid fa-plus-circle text-[10px]"></i>
                <span>Add Asset</span>
              </button>
            </div>
            <p class="text-[10px] text-slate-400">Index equities, mutual funds, gold bonds, and recurring high-yield fixed deposits in one dashboard.</p>
          </div>
          <div class="text-right">
            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">CONSOLIDATED PORTFOLIO VALUE</span>
            <span class="text-2xl font-extrabold text-finEmerald leading-none">₹${totalInvestments.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- 📂 PORTFOLIO DETAIL TILES -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${investments.map(item => {
            const share = totalInvestments > 0 ? ((item.value / totalInvestments) * 100).toFixed(1) : 0;
            
            let iconClass = 'fa-chart-pie text-indigo-500';
            let bgClass = 'bg-indigo-50/50';
            if (item.assetClass === 'Stocks') {
              iconClass = 'fa-arrow-trend-up text-cyan-500';
              bgClass = 'bg-cyan-50/50';
            } else if (item.assetClass === 'Gold') {
              iconClass = 'fa-coins text-amber-600';
              bgClass = 'bg-amber-50/50';
            } else if (item.assetClass === 'Fixed Deposits') {
              iconClass = 'fa-vault text-slate-600';
              bgClass = 'bg-slate-100/50';
            }

            return `
              <div class="glass-card rounded-fin p-6 hover:border-slate-300 transition-all flex flex-col justify-between min-h-[220px]">
                <div>
                  <div class="flex items-start justify-between border-b border-slate-50 pb-3 mb-3">
                    <div class="flex items-center space-x-2.5">
                      <div class="w-10 h-10 rounded-fin ${bgClass} flex items-center justify-center text-base">
                        <i class="fa-solid ${iconClass}"></i>
                      </div>
                      <div>
                        <h4 class="font-extrabold text-sm text-slate-800">${item.name}</h4>
                        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">${item.assetClass}</span>
                      </div>
                    </div>
                    <span class="text-[9px] font-bold px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-slate-500">${share}% Allocation</span>
                  </div>

                  <div class="grid grid-cols-2 gap-4 py-2">
                    <div>
                      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">CURRENT MARKET VALUE</span>
                      <span class="text-xl font-extrabold text-slate-800">₹${item.value.toLocaleString('en-IN')}</span>
                    </div>
                    ${item.sipAmount > 0 ? `
                      <div>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">ACTIVE MONTHLY SIP</span>
                        <span class="text-xl font-extrabold text-slate-800">₹${item.sipAmount.toLocaleString('en-IN')}</span>
                      </div>
                    ` : `
                      <div>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">SIP status</span>
                        <span class="text-xs font-bold text-slate-400 uppercase block mt-1">One-Time Asset</span>
                      </div>
                    `}
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-slate-50 mt-4 text-[10px]">
                  <span class="text-slate-400 font-medium">Updated: <b class="text-slate-500">${new Date(item.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</b></span>
                  <button onclick="window.portfolioView.editAsset('${item._id}', '${item.name}', ${item.value}, ${item.sipAmount})" class="text-finEmerald hover:text-emerald-600 font-extrabold flex items-center space-x-1">
                    <i class="fa-solid fa-arrows-spin text-[9px]"></i>
                    <span>Adjust Valuations</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  editAsset(id, name, currentValue, currentSip) {
    const valInput = prompt(`Update Current Valuation for "${name}":`, currentValue);
    if (valInput === null) return;
    const value = Number(valInput);
    if (isNaN(value) || value < 0) {
      alert("Invalid valuation number.");
      return;
    }

    let sip = currentSip;
    if (currentSip > 0) {
      const sipInput = prompt(`Update Monthly SIP Commitment for "${name}":`, currentSip);
      if (sipInput !== null) {
        const sipNum = Number(sipInput);
        if (!isNaN(sipNum) && sipNum >= 0) {
          sip = sipNum;
        }
      }
    }

    window.stateEngine.updateInvestment(id, value, sip);
    window.toastNotification(`Valuation parameter updated for ${name}`, "success");
    this.render(this.container);
  }

  openCreateModal() {
    const overlay = document.getElementById('investment-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const form = document.getElementById('investment-form');
    const closeBtn = document.getElementById('close-investment-modal');

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
      const name = document.getElementById('investment-name').value.trim();
      const assetClass = document.getElementById('investment-class').value;
      const value = Number(document.getElementById('investment-value').value);
      const sipAmount = Number(document.getElementById('investment-sip').value) || 0;

      if (!name || isNaN(value) || value < 0) {
        alert("Please enter valid details.");
        return;
      }

      await window.stateEngine.addInvestmentAsset({
        name,
        assetClass,
        value,
        sipAmount
      });

      window.toastNotification(`Asset "${name}" added to wealth portfolio successfully!`, "success");
      closeModal();
      this.render(this.container);
    };
  }
}

// Instantiate View globally
window.portfolioView = new PortfolioView();
