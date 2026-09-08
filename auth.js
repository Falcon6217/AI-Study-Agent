/**
 * CogniStudy AI - Authentication & Profile Manager
 * Handles offline-first user accounts, session state, profile settings,
 * per-user data scoping, and hybrid backend sync.
 */

class AuthManager {
  constructor() {
    this.storageKeyUsers = 'cogni_auth_users';
    this.storageKeySession = 'cogni_auth_session';
    this.currentUser = null;
    this.listeners = [];

    this.init();
  }

  init() {
    this.seedDefaultUsers();
    this.loadSession();
  }

  /**
   * Seed a pre-configured demo scholar account for instant 1-click testing
   */
  seedDefaultUsers() {
    const existing = this.getAllUsers();
    if (existing.length === 0) {
      const defaultUser = {
        id: 'user_demo_01',
        name: 'Alex Chen',
        email: 'alex.scholar@cogni.ai',
        passwordHash: this.hashPassword('Scholar2026!'),
        academicFocus: 'Cognitive AI & Computer Science',
        bio: 'Passionate researcher exploring neural architectures and spaced repetition learning.',
        avatar: '🧠',
        avatarBg: '#6366f1',
        tier: 'Level 4 Scholar',
        streak: 7,
        studyHours: 28.5,
        joinedDate: new Date('2026-01-15').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
      this.saveUsers([defaultUser]);
    }
  }

  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeyUsers)) || [];
    } catch (e) {
      console.error('Failed to parse users:', e);
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.storageKeyUsers, JSON.stringify(users));
  }

  loadSession() {
    try {
      const sessionData = localStorage.getItem(this.storageKeySession);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const users = this.getAllUsers();
        const found = users.find(u => u.id === session.userId);
        if (found) {
          this.currentUser = found;
          return;
        }
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }

    // Default to the first user or null
    const users = this.getAllUsers();
    if (users.length > 0) {
      this.currentUser = users[0];
      this.saveSession(this.currentUser.id);
    } else {
      this.currentUser = null;
    }
  }

  saveSession(userId) {
    localStorage.setItem(this.storageKeySession, JSON.stringify({
      userId,
      token: 'cogni_jwt_' + btoa(userId + ':' + Date.now()),
      loggedInAt: new Date().toISOString()
    }));
    this.notifySubscribers();
  }

  clearSession() {
    localStorage.removeItem(this.storageKeySession);
    this.currentUser = null;
    this.notifySubscribers();
  }

  /**
   * Simple client-side hash function for demo/offline credential protection
   */
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
  }

  /**
   * Register a new user
   */
  async register({ name, email, password, academicFocus = 'General Studies', avatar = '🎓', avatarBg = '#6366f1' }) {
    if (!name || !email || !password) {
      throw new Error('Please provide name, email, and password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getAllUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const newUser = {
      id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: this.hashPassword(password),
      academicFocus: academicFocus.trim() || 'General Studies',
      bio: `Studying ${academicFocus.trim() || 'General Studies'} with CogniStudy AI.`,
      avatar: avatar || '🎓',
      avatarBg: avatarBg || '#6366f1',
      tier: 'Level 1 Novice',
      streak: 1,
      studyHours: 0.5,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    users.push(newUser);
    this.saveUsers(users);
    this.currentUser = newUser;
    this.saveSession(newUser.id);

    // Try background sync with backend if available
    this.tryBackendRegister(newUser, password).catch(() => {});

    return newUser;
  }

  /**
   * Login user with email & password
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getAllUsers();
    const targetHash = this.hashPassword(password);

    const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === targetHash);

    if (!found) {
      throw new Error('Invalid email or password. Please try again.');
    }

    this.currentUser = found;
    this.saveSession(found.id);

    // Try background backend login if available
    this.tryBackendLogin(cleanEmail, password).catch(() => {});

    return found;
  }

  /**
   * Fast Demo / Guest Login
   */
  loginAsGuest() {
    const users = this.getAllUsers();
    const demoUser = users.find(u => u.id === 'user_demo_01') || users[0];
    if (demoUser) {
      this.currentUser = demoUser;
      this.saveSession(demoUser.id);
      return demoUser;
    }
    this.seedDefaultUsers();
    return this.loginAsGuest();
  }

  /**
   * Logout the active user
   */
  logout() {
    this.clearSession();
    // Re-assign default guest or open login
    const users = this.getAllUsers();
    if (users.length > 0) {
      this.currentUser = users[0];
      this.saveSession(this.currentUser.id);
    }
  }

  /**
   * Update Profile Details
   */
  updateProfile(updates) {
    if (!this.currentUser) return;

    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === this.currentUser.id);

    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
      this.currentUser = users[index];
      this.notifySubscribers();
    }
  }

  /**
   * Change Password
   */
  changePassword(oldPassword, newPassword) {
    if (!this.currentUser) throw new Error('Not logged in.');
    
    if (this.currentUser.passwordHash !== this.hashPassword(oldPassword)) {
      throw new Error('Current password is incorrect.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    const newHash = this.hashPassword(newPassword);
    this.updateProfile({ passwordHash: newHash });
  }

  /**
   * Get Storage Key Scoped to the current User ID
   * E.g. 'cogni_flashcard_decks' -> 'cogni_user_demo_01_flashcard_decks'
   */
  getUserStorageKey(baseKey) {
    const userId = this.currentUser ? this.currentUser.id : 'global';
    return `${baseKey}_${userId}`;
  }

  /**
   * Event subscription system for reactive UI updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error('Error in auth subscriber:', err);
      }
    });
  }

  /**
   * Optional Backend Sync Methods
   */
  async tryBackendRegister(user, plainPassword) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          password: plainPassword,
          academic_focus: user.academicFocus,
          avatar: user.avatar,
          avatar_bg: user.avatarBg
        })
      });
      return await res.json();
    } catch (e) {
      // Backend not running or offline; ignore gracefully
    }
  }

  async tryBackendLogin(email, plainPassword) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: plainPassword })
      });
      return await res.json();
    } catch (e) {
      // Backend not running or offline; ignore gracefully
    }
  }
}

// Attach globally
window.AuthManager = AuthManager;
