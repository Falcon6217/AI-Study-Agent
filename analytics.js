/**
 * CogniStudy AI - Analytics & Study Mastery Tracker
 */

class AnalyticsEngine {
  constructor() {
    this.data = this.loadData();
    this.init();
  }

  loadData() {
    const saved = localStorage.getItem('cogni_study_analytics');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      streakDays: 7,
      lastActiveDate: new Date().toDateString(),
      totalFocusMinutes: 145,
      cardsReviewed: 48,
      quizHistory: [
        { title: "Deep Learning Foundations", score: 4, total: 4, percentage: 100, date: new Date().toLocaleDateString() },
        { title: "Algorithms & Complexities", score: 3, total: 4, percentage: 75, date: new Date().toLocaleDateString() }
      ],
      recentActivities: [
        { text: "Mastered Transformer Attention mechanism", type: "flashcards", time: "10 mins ago" },
        { text: "Achieved 100% on Deep Learning Foundations Quiz", type: "quiz", time: "1 hour ago" },
        { text: "Completed 25m Pomodoro Focus Session", type: "pomodoro", time: "2 hours ago" }
      ],
      topicMastery: {
        "Neural Networks": 88,
        "Algorithms & Data Structures": 72,
        "Quantum Physics": 65,
        "Linear Algebra & Calculus": 80
      }
    };
  }

  saveData() {
    localStorage.setItem('cogni_study_analytics', JSON.stringify(this.data));
  }

  init() {
    this.checkStreak();
    this.updateUIElements();
    this.renderMasteryBars();
  }

  checkStreak() {
    const today = new Date().toDateString();
    if (this.data.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (this.data.lastActiveDate === yesterday) {
        this.data.streakDays += 1;
      } else {
        // Missed more than 1 day
        this.data.streakDays = 1;
      }
      this.data.lastActiveDate = today;
      this.saveData();
    }
  }

  addStudyMinutes(mins) {
    this.data.totalFocusMinutes += mins;
    this.saveData();
    this.updateUIElements();
  }

  updateCardReviewCount() {
    this.data.cardsReviewed += 1;
    this.saveData();
    this.updateUIElements();
  }

  logQuizScore(title, score, total, percentage) {
    this.data.quizHistory.unshift({
      title, score, total, percentage, date: new Date().toLocaleDateString()
    });
    if (this.data.quizHistory.length > 10) this.data.quizHistory.pop();
    this.saveData();
    this.updateUIElements();
  }

  logActivity(text, type) {
    this.data.recentActivities.unshift({
      text, type, time: "Just now"
    });
    if (this.data.recentActivities.length > 8) this.data.recentActivities.pop();
    this.saveData();
    this.renderRecentActivities();
  }

  updateUIElements() {
    const streakEl = document.getElementById('globalStreakDisplay');
    const statStreakEl = document.getElementById('statStreakVal');
    const statHoursEl = document.getElementById('statFocusHoursVal');
    const statCardsEl = document.getElementById('statCardsReviewedVal');
    const statQuizzesEl = document.getElementById('statQuizzesPassedVal');

    if (streakEl) streakEl.innerHTML = `🔥 ${this.data.streakDays} Day Streak`;
    if (statStreakEl) statStreakEl.textContent = `${this.data.streakDays} Days`;
    if (statHoursEl) statHoursEl.textContent = `${(this.data.totalFocusMinutes / 60).toFixed(1)} hrs`;
    if (statCardsEl) statCardsEl.textContent = `${this.data.cardsReviewed}`;
    if (statQuizzesEl) statQuizzesEl.textContent = `${this.data.quizHistory.length}`;

    this.renderRecentActivities();
    this.renderMasteryBars();
  }

  renderRecentActivities() {
    const listEl = document.getElementById('recentActivityList');
    if (!listEl) return;

    const icons = {
      tutor: '💬',
      notes: '📑',
      flashcards: '⚡',
      quiz: '📝',
      pomodoro: '⏱️'
    };

    listEl.innerHTML = this.data.recentActivities.map(item => `
      <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-glass);">
        <div style="width:32px; height:32px; border-radius:var(--radius-sm); background:var(--bg-surface); display:flex; align-items:center; justify-content:center; font-size:1rem;">
          ${icons[item.type] || '📌'}
        </div>
        <div style="flex:1;">
          <div style="font-size:0.88rem; font-weight:600; color:var(--text-primary);">${item.text}</div>
          <span style="font-size:0.72rem; color:var(--text-muted);">${item.time}</span>
        </div>
      </div>
    `).join('');
  }

  renderMasteryBars() {
    const container = document.getElementById('topicMasteryContainer');
    if (!container) return;

    container.innerHTML = Object.entries(this.data.topicMastery).map(([topic, pct]) => `
      <div class="mastery-bar-item">
        <div class="mastery-header">
          <span style="color:var(--text-primary);">${topic}</span>
          <span style="color:var(--accent-secondary);">${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;"></div>
        </div>
      </div>
    `).join('');
  }
}

window.AnalyticsEngine = AnalyticsEngine;
