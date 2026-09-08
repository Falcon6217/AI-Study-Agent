/**
 * CogniStudy AI - Main Application Coordinator & Orchestrator
 */

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this._dropdownOpen = false;
    this._selectedSignupAvatar = '🧠';
    this._selectedProfileAvatar = null;

    this.initTheme();
    this.initAuth();
    this.initControllers();
    this.initNav();
    this.initModals();
    this.initKeyboardShortcuts();
    this.initGlobalClickHandler();
  }

  /* ============================================================
     THEME
     ============================================================ */
  initTheme() {
    const savedTheme = localStorage.getItem('cogni_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cogni_theme', next);
    this.showToast(`Switched to ${next} theme`, 'info');
  }

  /* ============================================================
     AUTH INITIALIZATION
     ============================================================ */
  initAuth() {
    // Instantiate the AuthManager
    window.authManager = new AuthManager();

    // Subscribe to auth state changes → update all UI elements
    window.authManager.subscribe((user) => {
      this.updateAuthUI(user);
    });
  }

  updateAuthUI(user) {
    if (!user) return;

    const av = user.avatar || '🎓';
    const bg = user.avatarBg || '#6366f1';
    const name = user.name || 'Scholar';
    const tier = user.tier || 'Level 1 Novice';

    // Sidebar
    this._setEl('sidebarAvatar', av, { style: `background:${bg};` });
    this._setEl('sidebarUserName', name);
    this._setEl('sidebarUserTier', `⚡ ${tier}`);

    // Header button
    this._setEl('headerUserAvatar', av, { style: `background:${bg};` });
    this._setEl('headerUserName', name);
    this._setEl('headerUserTier', tier);

    // Dropdown
    this._setEl('dropdownAvatar', av, { style: `background:${bg};` });
    this._setEl('dropdownName', name);
    this._setEl('dropdownEmail', user.email || '');
    this._setEl('dropdownTier', `⚡ ${tier}`);

    // Streak pill
    const streakEl = document.getElementById('globalStreakDisplay');
    if (streakEl) streakEl.textContent = `🔥 ${user.streak || 1} Day Streak`;
  }

  _setEl(id, content, attrs = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = content;
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'style') el.setAttribute('style', v);
      else el.setAttribute(k, v);
    });
  }

  /* ============================================================
     CONTROLLERS
     ============================================================ */
  initControllers() {
    window.tutorController = new window.TutorController();
    window.notesController = new window.NotesController();
    window.flashcardsController = new window.FlashcardsController();
    window.quizController = new window.QuizController();
    window.plannerController = new window.PlannerController();
    window.mindmapController = new window.MindmapController();
    window.analyticsEngine = new window.AnalyticsEngine();

    this.updateAIStatusBadge();
  }

  updateAIStatusBadge() {
    const badge = document.getElementById('globalAIStatusBadge');
    if (!badge) return;

    if (window.aiEngine.isLiveAPIActive()) {
      badge.innerHTML = `<span class="ai-status-dot" style="background:#06b6d4; box-shadow:0 0 8px #06b6d4;"></span> ${window.aiEngine.provider.toUpperCase()} Active`;
      badge.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    } else {
      badge.innerHTML = `<span class="ai-status-dot"></span> Built-in AI Engine`;
      badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.toggle('active', view.id === `view_${tabName}`);
    });

    const titleEl = document.getElementById('headerPageTitle');
    const subtitleEl = document.getElementById('headerPageSubtitle');

    const headers = {
      dashboard: { title: "Study Dashboard", sub: "Welcome back! Here is your daily learning momentum." },
      tutor: { title: "AI Omni-Tutor & Feynman Evaluator", sub: "Deep pedagogical learning, Socratic inquiry & Feynman comprehension analysis." },
      notes: { title: "Smart Notes & Document Knowledge", sub: "Synthesize lecture notes, extract core concepts & auto-generate study assets." },
      flashcards: { title: "Spaced Repetition Flashcards (SRS)", sub: "Leitner 3D flip card memory retention system with adaptive intervals." },
      quiz: { title: "AI Quiz & Exam Simulator", sub: "Timed interactive multiple choice & short answer mock assessments." },
      mindmap: { title: "Interactive Concept Mind Map", sub: "Visual knowledge tree and relational concept explorer." },
      planner: { title: "Study Planner & Pomodoro Suite", sub: "Custom AI study roadmap with ambient focus sound generator." },
      analytics: { title: "Mastery Analytics & Performance", sub: "Track your study streaks, daily focus time, and subject proficiencies." }
    };

    if (headers[tabName] && titleEl && subtitleEl) {
      titleEl.textContent = headers[tabName].title;
      subtitleEl.textContent = headers[tabName].sub;
    }

    if (tabName === 'mindmap' && window.mindmapController) {
      setTimeout(() => window.mindmapController.resizeCanvas(), 50);
    }
  }

  /* ============================================================
     MODALS (generic)
     ============================================================ */
  initModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });

    const providerSelect = document.getElementById('settingsAIProvider');
    const geminiKeyInput = document.getElementById('settingsGeminiKey');
    const openaiKeyInput = document.getElementById('settingsOpenAIKey');
    const modelInput = document.getElementById('settingsModelSelect');

    if (providerSelect) providerSelect.value = window.aiEngine.provider;
    if (geminiKeyInput) geminiKeyInput.value = window.aiEngine.geminiKey;
    if (openaiKeyInput) openaiKeyInput.value = window.aiEngine.openaiKey;
    if (modelInput) modelInput.value = window.aiEngine.customModel;
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active');
  }

  saveSettings() {
    const provider = document.getElementById('settingsAIProvider').value;
    const geminiKey = document.getElementById('settingsGeminiKey').value;
    const openaiKey = document.getElementById('settingsOpenAIKey').value;
    const model = document.getElementById('settingsModelSelect').value;

    window.aiEngine.setProviderConfig(provider, geminiKey, openaiKey, model);
    this.updateAIStatusBadge();
    this.closeModal('settingsModal');
    this.showToast('AI Settings updated successfully!', 'success');
  }

  openAddCardModal() {
    const modal = document.getElementById('addCardModal');
    if (modal) modal.classList.add('active');
  }

  submitNewCard() {
    const front = document.getElementById('newCardFront').value;
    const back = document.getElementById('newCardBack').value;
    const hint = document.getElementById('newCardHint').value;

    if (!front || !back) {
      this.showToast('Please fill in both Question/Front and Answer/Back fields.', 'warning');
      return;
    }

    window.flashcardsController.addNewCard(front, back, hint);
    document.getElementById('newCardFront').value = '';
    document.getElementById('newCardBack').value = '';
    document.getElementById('newCardHint').value = '';
    this.closeModal('addCardModal');
  }

  openResultsModal(results) {
    const modal = document.getElementById('quizResultsModal');
    const scoreVal = document.getElementById('resultsScoreText');
    const scorePct = document.getElementById('resultsPercentText');
    const advice = document.getElementById('resultsAdviceText');

    if (scoreVal) scoreVal.textContent = `${results.score} / ${results.total}`;
    if (scorePct) scorePct.textContent = `${results.percentage}%`;
    if (advice) {
      if (results.percentage >= 80) {
        advice.textContent = "🌟 Outstanding Mastery! You have demonstrated a strong conceptual grasp of this domain.";
      } else if (results.percentage >= 60) {
        advice.textContent = "👍 Solid foundation! Review the missed questions and try the Feynman technique on the tougher topics.";
      } else {
        advice.textContent = "💡 Knowledge gaps detected. Consider using the AI Omni-Tutor to review the core formulas and principles.";
      }
    }

    if (modal) modal.classList.add('active');
  }

  /* ============================================================
     USER DROPDOWN
     ============================================================ */
  toggleUserDropdown() {
    const dd = document.getElementById('userDropdown');
    if (!dd) return;
    this._dropdownOpen = !this._dropdownOpen;
    dd.classList.toggle('open', this._dropdownOpen);
  }

  closeUserDropdown() {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('open');
    this._dropdownOpen = false;
  }

  initGlobalClickHandler() {
    document.addEventListener('click', (e) => {
      const btn = document.getElementById('headerUserBtn');
      const dd = document.getElementById('userDropdown');
      if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
        this.closeUserDropdown();
        this._dropdownOpen = false;
      }
    });
  }

  /* ============================================================
     AUTH MODAL
     ============================================================ */
  openAuthModal(tab = 'signin') {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
    this.switchAuthTab(tab);
  }

  switchAuthTab(tab) {
    const tabs = { signin: 'authTabSignIn', signup: 'authTabSignUp', forgot: 'authTabForgot' };
    const panels = { signin: 'authPanelSignin', signup: 'authPanelSignup', forgot: 'authPanelForgot' };

    Object.values(tabs).forEach(id => document.getElementById(id)?.classList.remove('active'));
    Object.values(panels).forEach(id => document.getElementById(id)?.classList.remove('active'));

    document.getElementById(tabs[tab])?.classList.add('active');
    document.getElementById(panels[tab])?.classList.add('active');
  }

  async handleSignIn() {
    const email = document.getElementById('signinEmail')?.value || '';
    const password = document.getElementById('signinPassword')?.value || '';
    const errEl = document.getElementById('signinError');

    this._clearMsg(errEl);
    try {
      const user = await window.authManager.login(email, password);
      this.closeModal('authModal');
      this.showToast(`Welcome back, ${user.name}! 🎉`, 'success');
    } catch (err) {
      this._showMsg(errEl, '⚠️ ' + err.message, 'error');
    }
  }

  async handleSignUp() {
    const name = document.getElementById('signupName')?.value || '';
    const email = document.getElementById('signupEmail')?.value || '';
    const password = document.getElementById('signupPassword')?.value || '';
    const focus = document.getElementById('signupFocus')?.value || '';
    const errEl = document.getElementById('signupError');

    this._clearMsg(errEl);
    try {
      const user = await window.authManager.register({
        name, email, password,
        academicFocus: focus,
        avatar: this._selectedSignupAvatar,
        avatarBg: '#6366f1'
      });
      this.closeModal('authModal');
      this.showToast(`Account created! Welcome, ${user.name}! 🚀`, 'success');
    } catch (err) {
      this._showMsg(errEl, '⚠️ ' + err.message, 'error');
    }
  }

  handleGuestLogin() {
    const user = window.authManager.loginAsGuest();
    this.closeModal('authModal');
    this.showToast(`Signed in as ${user.name} ⚡`, 'info');
  }

  handleForgotPassword() {
    const email = document.getElementById('forgotEmail')?.value?.trim().toLowerCase() || '';
    const errEl = document.getElementById('forgotError');
    const successEl = document.getElementById('forgotSuccess');

    this._clearMsg(errEl);
    this._clearMsg(successEl);

    const users = window.authManager.getAllUsers();
    const found = users.find(u => u.email.toLowerCase() === email);

    if (!found) {
      this._showMsg(errEl, '⚠️ No account found with that email address.', 'error');
    } else {
      this._showMsg(successEl, `✅ Account found: ${found.name}. Please sign in with your password.`, 'success');
    }
  }

  logoutUser() {
    const user = window.authManager.currentUser;
    window.authManager.logout();
    this.closeUserDropdown();
    this.showToast(`Signed out. See you soon! 👋`, 'info');
  }

  /* ============================================================
     PROFILE MODAL
     ============================================================ */
  openProfileModal() {
    const user = window.authManager.currentUser;
    if (!user) return;

    // Fill header card
    this._setEl('profileAvatarLarge', user.avatar, { style: `background:${user.avatarBg};` });
    this._setEl('profileDisplayName', user.name);
    this._setEl('profileDisplayTier', `⚡ ${user.tier}`);
    this._setEl('profileDisplayJoined', `📅 Member since ${user.joinedDate}`);

    // Stats
    this._setEl('profileStatStreak', user.streak || 1);
    this._setEl('profileStatHours', user.studyHours || 0);
    const focusShort = (user.academicFocus || 'General').split(' ').slice(0, 2).join(' ');
    this._setEl('profileStatFocus', focusShort);

    // Edit fields
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('profileEditName', user.name);
    setVal('profileEditEmail', user.email);
    setVal('profileEditFocus', user.academicFocus);
    setVal('profileEditBio', user.bio);

    // Avatar picker
    this._selectedProfileAvatar = user.avatar;
    document.querySelectorAll('#profileAvatarPicker .avatar-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.avatar === user.avatar);
    });

    // Reset password fields
    ['secOldPassword', 'secNewPassword', 'secConfirmPassword'].forEach(id => setVal(id, ''));

    // Reset messages
    ['profileEditError', 'profileEditSuccess', 'profileSecError', 'profileSecSuccess'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('visible'); el.textContent = ''; }
    });

    // Reset to edit tab
    this.switchProfileTab('edit', document.querySelector('.profile-tab-btn'));

    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('active');
  }

  switchProfileTab(tab, btn) {
    document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));

    const panelMap = { edit: 'profilePanelEdit', security: 'profilePanelSecurity' };
    document.getElementById(panelMap[tab])?.classList.add('active');
    if (btn) btn.classList.add('active');

    // Hide save button on security tab (has its own button)
    const saveBtn = document.getElementById('profileSaveBtn');
    if (saveBtn) saveBtn.style.display = tab === 'security' ? 'none' : '';
  }

  saveProfile() {
    const name = document.getElementById('profileEditName')?.value?.trim() || '';
    const email = document.getElementById('profileEditEmail')?.value?.trim() || '';
    const focus = document.getElementById('profileEditFocus')?.value?.trim() || '';
    const bio = document.getElementById('profileEditBio')?.value?.trim() || '';
    const errEl = document.getElementById('profileEditError');
    const successEl = document.getElementById('profileEditSuccess');

    this._clearMsg(errEl);
    this._clearMsg(successEl);

    if (!name) {
      this._showMsg(errEl, '⚠️ Display name cannot be empty.', 'error');
      return;
    }

    window.authManager.updateProfile({
      name, email, academicFocus: focus, bio,
      avatar: this._selectedProfileAvatar || window.authManager.currentUser?.avatar
    });

    this._showMsg(successEl, '✅ Profile updated successfully!', 'success');
    this.showToast('Profile saved!', 'success');
    setTimeout(() => this.closeModal('profileModal'), 1200);
  }

  handleChangePassword() {
    const oldPw = document.getElementById('secOldPassword')?.value || '';
    const newPw = document.getElementById('secNewPassword')?.value || '';
    const confirmPw = document.getElementById('secConfirmPassword')?.value || '';
    const errEl = document.getElementById('profileSecError');
    const successEl = document.getElementById('profileSecSuccess');

    this._clearMsg(errEl);
    this._clearMsg(successEl);

    if (newPw !== confirmPw) {
      this._showMsg(errEl, '⚠️ New passwords do not match.', 'error');
      return;
    }

    try {
      window.authManager.changePassword(oldPw, newPw);
      this._showMsg(successEl, '✅ Password changed successfully!', 'success');
      ['secOldPassword', 'secNewPassword', 'secConfirmPassword'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } catch (err) {
      this._showMsg(errEl, '⚠️ ' + err.message, 'error');
    }
  }

  /* ============================================================
     AVATAR PICKERS
     ============================================================ */
  selectAvatar(el) {
    document.querySelectorAll('#signupAvatarPicker .avatar-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    this._selectedSignupAvatar = el.dataset.avatar;
  }

  selectProfileAvatar(el) {
    document.querySelectorAll('#profileAvatarPicker .avatar-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    this._selectedProfileAvatar = el.dataset.avatar;

    // Live preview in profile modal header
    const large = document.getElementById('profileAvatarLarge');
    if (large) large.textContent = el.dataset.avatar;
  }

  /* ============================================================
     PASSWORD UTILITIES
     ============================================================ */
  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁️';
  }

  updatePasswordStrength(pw) {
    const bars = ['pwBar1', 'pwBar2', 'pwBar3', 'pwBar4'];
    const label = document.getElementById('pwStrengthLabel');
    let strength = 0;
    if (pw.length >= 6) strength++;
    if (pw.length >= 10) strength++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) strength++;
    if (/[^a-zA-Z0-9]/.test(pw)) strength++;

    const levels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const classes = ['', 'weak', 'fair', 'strong', 'strong'];

    bars.forEach((id, i) => {
      const bar = document.getElementById(id);
      if (!bar) return;
      bar.className = 'pw-bar';
      if (i < strength) bar.classList.add(classes[strength] || 'strong');
    });

    if (label) {
      label.textContent = pw.length === 0 ? '' : levels[strength] || 'Very Strong';
      label.style.color = strength <= 1 ? 'var(--accent-danger)' : strength === 2 ? 'var(--accent-warning)' : 'var(--accent-success)';
    }
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  _showMsg(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = type === 'error' ? 'auth-error visible' : 'auth-success visible';
  }

  _clearMsg(el) {
    if (!el) return;
    el.textContent = '';
    el.classList.remove('visible');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('globalToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    toast.innerHTML = `<span>${icons[type] || '📌'}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.currentTab === 'flashcards' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        window.flashcardsController?.flipCard();
      }
      if (e.key === 'Enter' && !e.shiftKey && document.activeElement.id === 'chatInput') {
        e.preventDefault();
        window.tutorController?.handleSendMessage();
      }
      // Escape closes any open dropdown
      if (e.key === 'Escape') {
        this.closeUserDropdown();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

