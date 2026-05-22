// Onboarding Wizard Flow Manager (2-Step Clean Map for Spends & Bills)

class OnboardingWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 2; // Reduced to 2 steps: 1. Starting Cash, 2. Monthly Bills
    this.tempData = {
      startingCash: 50000,
      bills: [
        { _id: "bill_rent", name: "House Rent", amount: 15000, day: 5, paid: false },
        { _id: "bill_wifi", name: "Wifi Broadband", amount: 800, day: 10, paid: false },
        { _id: "bill_netflix", name: "Netflix Premium", amount: 649, day: 15, paid: false },
        { _id: "bill_gym", name: "Gym Membership", amount: 1500, day: 1, paid: false }
      ]
    };
  }

  init() {
    const prevBtn = document.getElementById('onboard-prev');
    const nextBtn = document.getElementById('onboard-next');

    if (prevBtn) prevBtn.onclick = () => this.handlePrev();
    if (nextBtn) nextBtn.onclick = () => this.handleNext();

    this.renderStep();
  }

  renderStep() {
    const container = document.getElementById('onboarding-step-content');
    const indicator = document.getElementById('onboarding-step-indicator');
    const prevBtn = document.getElementById('onboard-prev');
    const nextBtn = document.getElementById('onboard-next');

    if (!container) return;

    // Update step numbers
    if (indicator) indicator.textContent = this.currentStep;
    if (prevBtn) prevBtn.disabled = this.currentStep === 1;
    
    if (nextBtn) {
      if (this.currentStep === this.totalSteps) {
        nextBtn.innerHTML = `<span>Complete Onboarding</span> <i class="fa-solid fa-flag-checkered"></i>`;
      } else {
        nextBtn.innerHTML = `<span>Continue</span> <i class="fa-solid fa-arrow-right"></i>`;
      }
    }

    // Step HTML generation
    if (this.currentStep === 1) {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h4 class="text-slate-800 font-extrabold text-base mb-1">🏦 How much money do you have?</h4>
            <p class="text-xs text-slate-400">Enter your starting cash/bank money. We will use this wallet balance to automatically deduct your daily spends and bills.</p>
          </div>
          
          <div class="max-w-md mx-auto">
            <div class="border border-slate-200 rounded-fin p-6 bg-slate-50/50 shadow-xs">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">My Available Money</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-lg font-bold">₹</span>
                <input type="number" id="onboard-starting-cash" value="${this.tempData.startingCash}" class="w-full text-base bg-white border border-slate-200 rounded-fin pl-8 pr-4 py-3 font-extrabold focus:outline-none focus:border-finEmerald/50 focus:ring-1 focus:ring-finEmerald/20 text-slate-800">
              </div>
              <span class="text-[10px] text-slate-400 mt-2 block">Includes cash in hand, digital wallets, and bank accounts.</span>
            </div>
          </div>
        </div>
      `;
    } 
    else if (this.currentStep === 2) {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h4 class="text-slate-800 font-extrabold text-base mb-1">📌 Specify Your Monthly Fixed Bills</h4>
            <p class="text-xs text-slate-400">Set the amounts and due days for your fixed recurring bills. You can check them off on your home screen when paid.</p>
          </div>
          
          <div class="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            ${this.tempData.bills.map((bill, index) => `
              <div class="border border-slate-200 rounded-fin p-4 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">${bill.name}</span>
                  </div>
                  <input type="text" id="bill-name-${index}" value="${bill.name}" class="hidden">
                  <p class="text-[10px] text-slate-400 mt-1">Due around day ${bill.day} of the month</p>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-28">
                    <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Due Day</label>
                    <input type="number" id="bill-day-${index}" value="${bill.day}" min="1" max="31" class="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 font-semibold text-slate-700">
                  </div>
                  <div class="w-36">
                    <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Amount (₹)</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs font-semibold">₹</span>
                      <input type="number" id="bill-amount-${index}" value="${bill.amount}" min="0" class="w-full text-xs border border-slate-200 rounded pl-5 pr-2 py-1.5 font-semibold text-slate-800">
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  saveFormInputs() {
    if (this.currentStep === 1) {
      const cashInput = document.getElementById('onboard-starting-cash');
      if (cashInput) this.tempData.startingCash = Number(cashInput.value);
    } 
    else if (this.currentStep === 2) {
      this.tempData.bills.forEach((bill, index) => {
        const amtInput = document.getElementById(`bill-amount-${index}`);
        const dayInput = document.getElementById(`bill-day-${index}`);
        if (amtInput) bill.amount = Number(amtInput.value);
        if (dayInput) bill.day = Number(dayInput.value);
      });
    }
  }

  handlePrev() {
    this.saveFormInputs();
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep();
    }
  }

  async handleNext() {
    this.saveFormInputs();

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.renderStep();
    } else {
      // Finalize Onboarding
      await this.finalizeOnboarding();
    }
  }

  async finalizeOnboarding() {
    // 1. Write starting cash balance to stateEngine
    const balances = window.stateEngine.data.bankBalances;
    if (balances && balances.length > 0) {
      // Update first balance (primary cash account)
      await window.stateEngine.updateBalance(balances[0]._id, this.tempData.startingCash);
      
      // Zero out other accounts to ensure standard single balance
      for (let i = 1; i < balances.length; i++) {
        await window.stateEngine.updateBalance(balances[i]._id, 0);
      }
    }

    // 2. Save custom bills list to local storage and memory
    const key = window.stateEngine.user ? window.stateEngine.user.username : 'global';
    localStorage.setItem(`growth_cache_bills_${key}`, JSON.stringify(this.tempData.bills));
    window.stateEngine.data.bills = this.tempData.bills;

    // 3. Mark user onboarding completed
    await window.stateEngine.completeUserOnboarding();
    
    // Close overlay
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.classList.add('hidden');

    if (window.toastNotification) {
      window.toastNotification("Setup complete! Welcome to Spends & Bills Tracker.", "success");
    }

    // Reload UI
    if (window.routingEngine) {
      window.routingEngine.navigate('dashboard');
    }
  }
}

// Instantiate Wizard Globally
window.onboardingWizard = new OnboardingWizard();
