// Growth Tracker SPA Main Coordinator

// ================= AUTH CONTROLLER =================
class AuthController {
  constructor() {
    this.overlay = document.getElementById('auth-overlay');
    this.card    = document.getElementById('auth-card');
    this.alert   = document.getElementById('auth-alert');

    this.loginForm    = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');

    this.tabLogin    = document.getElementById('tab-login');
    this.tabRegister = document.getElementById('tab-register');
  }

  init() {
    if (this.loginForm) {
      this.loginForm.onsubmit = (e) => this._handleLogin(e);
    }
    if (this.registerForm) {
      this.registerForm.onsubmit = (e) => this._handleRegister(e);
    }
  }

  // Show the auth screen (hides main app)
  show() {
    if (!this.overlay) return;
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    // Animate card in
    setTimeout(() => {
      if (this.card) {
        this.card.classList.remove('scale-95', 'opacity-0');
        this.card.classList.add('scale-100', 'opacity-100');
      }
    }, 80);
  }

  // Hide auth screen (show main app)
  hide() {
    if (!this.overlay) return;
    if (this.card) {
      this.card.classList.add('scale-95', 'opacity-0');
    }
    setTimeout(() => {
      this.overlay.classList.add('hidden');
      this.overlay.classList.remove('flex');
    }, 300);
  }

  showTab(tab) {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin     = document.getElementById('tab-login');
    const tabRegister  = document.getElementById('tab-register');

    this._clearAlert();

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      tabLogin.className    = 'auth-tab-active flex-1 py-4 text-sm font-bold text-white border-b-2 border-emerald-400 transition-all duration-200';
      tabRegister.className = 'auth-tab-inactive flex-1 py-4 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-300 transition-all duration-200';
    } else {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      tabRegister.className = 'auth-tab-active flex-1 py-4 text-sm font-bold text-white border-b-2 border-emerald-400 transition-all duration-200';
      tabLogin.className    = 'auth-tab-inactive flex-1 py-4 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-300 transition-all duration-200';
    }
  }

  togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isHidden ? 'fa-solid fa-eye-slash text-xs' : 'fa-solid fa-eye text-xs';
    }
  }

  async _handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-submit-btn');

    if (!username || !password) {
      return this._showAlert('Please enter both username and password.', 'error');
    }

    this._setLoading(btn, true, 'Signing in...');
    this._clearAlert();

    try {
      await window.stateEngine.login(username, password);
      this._showAlert('Welcome back! Loading your dashboard...', 'success');
      setTimeout(async () => {
        this.hide();
        window.appBoot.onAuthSuccess();
      }, 800);
    } catch (err) {
      this._showAlert(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      this._setLoading(btn, false, 'Sign In to Dashboard');
    }
  }

  async _handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm  = document.getElementById('register-confirm').value;
    const btn      = document.getElementById('register-submit-btn');

    if (!username || !password) {
      return this._showAlert('Username and password are required.', 'error');
    }
    if (password.length < 6) {
      return this._showAlert('Password must be at least 6 characters.', 'error');
    }
    if (password !== confirm) {
      return this._showAlert('Passwords do not match.', 'error');
    }

    this._setLoading(btn, true, 'Creating account...');
    this._clearAlert();

    try {
      const msg = await window.stateEngine.register(username, password);
      this._showAlert(msg + ' Please sign in.', 'success');
      // Switch to login tab after 1.5s
      setTimeout(() => this.showTab('login'), 1500);
    } catch (err) {
      this._showAlert(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      this._setLoading(btn, false, 'Create Account & Start Tracking');
    }
  }

  async demoLogin() {
    this._clearAlert();
    this._showAlert('Loading demo mode...', 'success');

    // Force offline demo without server
    window.stateEngine.token = 'demo_mode_token';
    window.stateEngine.user  = { id: 'demo', username: 'demo', onboardingCompleted: false };
    window.stateEngine.onboardingCompleted = false;
    localStorage.setItem('growth_token', window.stateEngine.token);
    localStorage.setItem('growth_user', JSON.stringify(window.stateEngine.user));
    window.stateEngine.loadLocalCache();
    await window.stateEngine.checkSyncStatus();
    window.stateEngine.notify();

    setTimeout(() => {
      this.hide();
      window.appBoot.onAuthSuccess();
    }, 700);
  }

  _setLoading(btn, isLoading, defaultText) {
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin-custom mr-2"></i>${defaultText}`;
    } else {
      btn.disabled = false;
      btn.textContent = defaultText;
    }
  }

  _showAlert(message, type) {
    if (!this.alert) return;
    this.alert.classList.remove('hidden');

    if (type === 'error') {
      this.alert.className = 'mb-5 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400';
      this.alert.innerHTML = `<i class="fa-solid fa-circle-xmark flex-shrink-0"></i><span>${message}</span>`;
    } else {
      this.alert.className = 'mb-5 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
      this.alert.innerHTML = `<i class="fa-solid fa-circle-check flex-shrink-0"></i><span>${message}</span>`;
    }
  }

  _clearAlert() {
    if (!this.alert) return;
    this.alert.classList.add('hidden');
    this.alert.innerHTML = '';
  }
}

// ================= ROUTING ENGINE =================
class RoutingEngine {
  constructor() {
    this.currentView = 'dashboard';
    this.canvas = document.getElementById('content-canvas');
    this.viewTitle = document.getElementById('view-title');
    this.sidebarLinks = {
      dashboard: document.getElementById('nav-dashboard'),
      ledger:    document.getElementById('nav-ledger'),
      budgets:   document.getElementById('nav-budgets'),
      portfolio: document.getElementById('nav-portfolio'),
      funds:     document.getElementById('nav-funds')
    };
  }

  init() {
    Object.keys(this.sidebarLinks).forEach(view => {
      const link = this.sidebarLinks[view];
      if (link) {
        link.onclick = (e) => {
          e.preventDefault();
          this.navigate(view);
        };
      }
    });
    this.navigate('dashboard');
  }

  navigate(view) {
    this.currentView = view;

    // Trigger visual slide-up / fade transition keyframe on view load
    if (this.canvas) {
      this.canvas.classList.remove('view-transition-active');
      void this.canvas.offsetWidth; // Force Reflow
      this.canvas.classList.add('view-transition-active');
    }

    Object.keys(this.sidebarLinks).forEach(v => {
      const link = this.sidebarLinks[v];
      if (!link) return;
      if (v === view) {
        link.className = "flex items-center space-x-3.5 px-4 py-3 rounded-fin text-sm font-semibold transition-all duration-200 bg-emerald-500/10 text-finEmerald border-l-4 border-finEmerald";
      } else {
        link.className = "flex items-center space-x-3.5 px-4 py-3 rounded-fin text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent transition-all duration-200";
      }
    });

    if (view === 'dashboard') {
      if (this.viewTitle) this.viewTitle.textContent = "Financial Overview";
      window.dashboardView.render(this.canvas);
    } else if (view === 'ledger') {
      if (this.viewTitle) this.viewTitle.textContent = "Financial Ledger Accounts";
      window.ledgerView.render(this.canvas);
    } else if (view === 'budgets') {
      if (this.viewTitle) this.viewTitle.textContent = "Monthly Budgeting Suite";
      window.budgetsView.render(this.canvas);
    } else if (view === 'portfolio') {
      if (this.viewTitle) this.viewTitle.textContent = "Wealth & Asset Allocation";
      window.portfolioView.render(this.canvas);
    } else if (view === 'funds') {
      if (this.viewTitle) this.viewTitle.textContent = "Savings Goals & Visual Funds";
      window.fundsView.render(this.canvas);
    }
  }
}
// ================= NATIVE CONFETTI CELEBRATION ENGINE =================
window.triggerConfetti = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const colors = [
    '#10b981', // Emerald Green
    '#0ea5e9', // Sky Blue
    '#6366f1', // Indigo Blue
    '#f59e0b', // Amber Orange
    '#f43f5e', // Rose Red
    '#8b5cf6'  // Vibrant Violet
  ];

  const particles = [];
  const particleCount = 120;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 5 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  function update() {
    ctx.clearRect(0, 0, width, height);

    let active = false;

    particles.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(p.wobble) * 1.5;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      
      // Draw rectangular confetti particles
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.y < height) {
        active = true;
      }
    });

    if (active && Date.now() - startTime < 4500) {
      animationFrameId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.remove();
    }
  }

  update();
};

// ================= TOAST FLOATING ALERTS =================
window.toastNotification = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');

  let bgClass = 'bg-slate-900 border-slate-800 text-white';
  let icon    = '<i class="fa-solid fa-circle-info text-sky-400"></i>';

  if (type === 'success') {
    bgClass = 'bg-white border-emerald-100 text-slate-700 shadow-lg';
    icon    = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
  } else if (type === 'warning') {
    bgClass = 'bg-white border-amber-100 text-slate-700 shadow-lg';
    icon    = '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i>';
  } else if (type === 'info') {
    bgClass = 'bg-white border-slate-200 text-slate-700 shadow-lg';
    icon    = '<i class="fa-solid fa-circle-info text-indigo-500"></i>';
  }

  toast.className = `flex items-center space-x-3 px-4 py-3 rounded-fin border text-xs font-semibold animate-slide-up pointer-events-auto max-w-sm ${bgClass}`;
  toast.innerHTML = `
    <span class="text-base flex-shrink-0">${icon}</span>
    <span class="flex-1 leading-normal">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.className += ' transition-all duration-300 opacity-0 translate-y-2';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// ================= MODAL & FORMS MANAGER =================
class UIModalController {
  constructor() {
    this.addBtn  = document.getElementById('quick-add-btn');
    this.txModal = document.getElementById('tx-modal-overlay');
    this.closeBtn = document.getElementById('close-tx-modal');
    this.txForm  = document.getElementById('tx-form');

    this.onboardOverlay = document.getElementById('onboarding-overlay');
    this.onboardCard    = document.getElementById('onboarding-modal-card');

    this.resetBtn     = document.getElementById('reset-system-btn');
    this.logoutBtn    = document.getElementById('logout-btn');
    this.globalSearch = document.getElementById('global-search');
  }

  init() {
    if (this.addBtn)   this.addBtn.onclick   = () => this.openTxModal();
    if (this.closeBtn) this.closeBtn.onclick = () => this.closeTxModal();
    if (this.txForm)   this.txForm.onsubmit  = (e) => this.handleTxSubmit(e);

    if (this.txModal) {
      this.txModal.onclick = (e) => {
        if (e.target === this.txModal) this.closeTxModal();
      };
    }

    const dateInput = document.getElementById('tx-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    if (this.resetBtn) {
      this.resetBtn.onclick = async () => {
        if (confirm("⚠️ CAUTION: Reset all financial data back to seeded defaults?")) {
          await window.stateEngine.resetAllData();
          window.toastNotification("Financial environment reset to defaults.", "info");
          window.routingEngine.navigate('dashboard');
        }
      };
    }

    if (this.logoutBtn) {
      this.logoutBtn.onclick = () => {
        if (confirm("Sign out of Growth Tracker?")) {
          window.stateEngine.logout();
          window.toastNotification("Signed out successfully.", "info");
          // Show auth screen
          window.authController.showTab('login');
          window.authController.show();
        }
      };
    }

    if (this.globalSearch) {
      this.globalSearch.oninput = (e) => {
        const term = e.target.value;
        if (window.routingEngine.currentView !== 'ledger') {
          window.routingEngine.navigate('ledger');
        }
        window.ledgerView.filters.search = term;
        const ledInput = document.getElementById('filter-search');
        if (ledInput) ledInput.value = term;
        window.ledgerView.render(window.routingEngine.canvas);
      };
    }
  }

  openTxModal() {
    if (this.txModal) this.txModal.classList.remove('hidden');
  }

  closeTxModal() {
    if (this.txModal) this.txModal.classList.add('hidden');
    if (this.txForm)  this.txForm.reset();
    const dateInput = document.getElementById('tx-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  }

  async handleTxSubmit(e) {
    e.preventDefault();

    const type     = this.txForm.querySelector('input[name="type"]:checked').value;
    const payee    = document.getElementById('tx-payee').value;
    const category = document.getElementById('tx-category').value;
    const amount   = Number(document.getElementById('tx-amount').value);
    const status   = document.getElementById('tx-status').value;
    const date     = document.getElementById('tx-date').value;

    const before = window.stateEngine.checkAchievements().active.length;
    await window.stateEngine.addTransaction(tx);
    const after = window.stateEngine.checkAchievements().active.length;

    window.toastNotification(`Transaction logged: ₹${amount.toLocaleString('en-IN')} for ${payee}`, 'success');

    if (window.soundEngine) {
      if (after > before) {
        window.soundEngine.playLevelUp();
        if (window.triggerConfetti) window.triggerConfetti();
      } else if (type === 'Expense') {
        window.soundEngine.playCashRegister();
      } else {
        window.soundEngine.playSuccessChime();
      }
    }

    if (type === 'Expense') {
      const budget = window.stateEngine.data.budgets.find(b => b.category === category);
      if (budget) {
        const spent   = window.stateEngine.getCategorySpentThisMonth(category);
        const percent = (spent / budget.limit) * 100;
        if (spent >= budget.limit) {
          window.toastNotification(`🚨 BUDGET EXCEEDED: ${category} has overshot its ₹${budget.limit.toLocaleString('en-IN')} limit!`, 'warning');
        } else if (percent >= 80) {
          window.toastNotification(`⚠️ NEAR LIMIT: ${category} has consumed ${percent.toFixed(0)}% of budget!`, 'warning');
        }
      }
    }

    this.closeTxModal();
    window.routingEngine.navigate(window.routingEngine.currentView);
  }

  checkOnboarding() {
    if (!window.stateEngine.onboardingCompleted) {
      if (this.onboardOverlay) {
        this.onboardOverlay.classList.remove('hidden');
        setTimeout(() => {
          if (this.onboardCard) {
            this.onboardCard.classList.remove('scale-95', 'opacity-0');
            this.onboardCard.classList.add('scale-100', 'opacity-100');
          }
        }, 100);
      }
      window.onboardingWizard.init();
    }
  }
}

// ================= SIDEBAR USER UPDATER =================
function updateSidebarUser() {
  const user           = window.stateEngine.user;
  const avatarEl       = document.getElementById('sidebar-avatar');
  const usernameEl     = document.getElementById('sidebar-username');
  const modeEl         = document.getElementById('sidebar-mode');
  const showcaseEl     = document.getElementById('sidebar-badge-showcase');

  if (!user) return;

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  if (avatarEl)   avatarEl.textContent   = initials;
  if (usernameEl) usernameEl.textContent = user.username || 'User';

  const achievements = window.stateEngine.checkAchievements();
  if (modeEl) {
    modeEl.className = `text-[9px] px-2 py-0.5 mt-0.5 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${achievements.tierColor}`;
    modeEl.innerHTML = `
      <span class="material-symbols-outlined text-[11px] leading-none">${achievements.tierIcon}</span>
      <span>${achievements.tier}</span>
    `;
  }

  if (showcaseEl) {
    if (achievements.active.length === 0) {
      showcaseEl.innerHTML = `<span class="text-[9px] text-slate-550 font-bold uppercase tracking-wider">Level 1 Saver</span>`;
    } else {
      showcaseEl.innerHTML = achievements.active.map(b => `
        <span class="w-5 h-5 rounded-full bg-gradient-to-tr ${b.color} text-slate-950 flex items-center justify-center cursor-help border border-slate-900 shadow-sm transition-transform hover:scale-110" 
              title="${b.title}: ${b.desc}">
          <span class="material-symbols-outlined text-[11px] font-bold leading-none">${b.icon}</span>
        </span>
      `).join('');
    }
  }

  if (window.appBoot && window.appBoot.updateMuteIcon) {
    window.appBoot.updateMuteIcon();
  }
}

// ================= APP BOOT CONTROLLER =================
window.appBoot = {
  updateMuteIcon() {
    const btn = document.getElementById('sidebar-mute-btn');
    if (!btn) return;
    const isMuted = window.soundEngine.muted;
    btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${isMuted ? 'volume_off' : 'volume_up'}</span>`;
    btn.className = isMuted ? 'text-rose-500 hover:text-rose-400 sound-toggle-btn p-0.5' : 'text-slate-400 hover:text-emerald-400 sound-toggle-btn p-0.5';
  },

  async onAuthSuccess() {
    // Update sidebar to show logged-in user
    updateSidebarUser();

    // Subscribe so sidebar mode label stays fresh after sync check
    window.stateEngine.subscribe(() => updateSidebarUser());

    // Init routing + modal controllers
    window.routingEngine.init();
    window.modalController.init();

    // Hook state change → refresh current view
    window.stateEngine.subscribe(() => {
      if (window.routingEngine.canvas) {
        window.routingEngine.navigate(window.routingEngine.currentView);
      }
    });

    // Check onboarding
    window.modalController.checkOnboarding();
  }
};

// ================= THEME CONTROLLER & COORDINATOR =================
class ThemeController {
  constructor() {
    this.selector = null;
    this.currentTheme = 'classic-emerald';
  }

  init() {
    this.selector = document.getElementById('theme-selector');
    // 1. Read from localStorage
    const savedTheme = localStorage.getItem('growth_theme') || 'royal-rose';
    this.applyTheme(savedTheme);

    // 2. Bind change listener on selector dropdown
    if (this.selector) {
      this.selector.value = savedTheme;
      this.selector.onchange = (e) => {
        const selected = e.target.value;
        this.applyTheme(selected);
        
        // Visual Confetti Celebration on selection swap
        if (window.triggerConfetti) {
          window.triggerConfetti();
        }
        
        // Re-navigate to the current view to force chart repaint
        if (window.routingEngine && window.routingEngine.canvas) {
          window.routingEngine.navigate(window.routingEngine.currentView);
        }
        
        window.toastNotification(`Theme swapped to ${e.target.options[e.target.selectedIndex].text}!`, 'info');
      };
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    // Set attribute on HTML element
    document.documentElement.setAttribute('data-theme', theme);
    // Save to localStorage
    localStorage.setItem('growth_theme', theme);
    // Synchronize select value
    if (this.selector) {
      this.selector.value = theme;
    }
  }
}

// ================= BOOTSTRAP INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Initialize theme setting
  window.themeController = new ThemeController();
  window.themeController.init();

  // 1. Create global instances
  window.authController  = new AuthController();
  window.routingEngine   = new RoutingEngine();
  window.modalController = new UIModalController();

  // 2. Init auth form handlers
  window.authController.init();

  // Run initial sync status check on boot
  await window.stateEngine.checkSyncStatus();

  // 3. Check if user is already logged in (has stored token)
  const hasToken = !!window.stateEngine.token;

  if (hasToken) {
    // Try to load data with existing token
    try {
      await window.stateEngine.loadAllData();
      // Token valid — go straight to app
      window.appBoot.onAuthSuccess();
    } catch (err) {
      // Token expired or invalid — force login
      window.stateEngine.logout();
      window.authController.show();
    }
  } else {
    // No token — show auth screen
    window.authController.show();
  }
});
