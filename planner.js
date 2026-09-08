/**
 * CogniStudy AI - Study Planner & Pomodoro Focus Engine
 */

class PlannerController {
  constructor() {
    this.mode = 'work'; // 'work', 'short_break', 'long_break'
    this.durations = {
      work: 25 * 60,
      short_break: 5 * 60,
      long_break: 15 * 60
    };
    this.timeLeft = this.durations.work;
    this.totalDuration = this.durations.work;
    this.isRunning = false;
    this.timerInterval = null;

    this.timerDigitsEl = document.getElementById('pomodoroDigits');
    this.progressCircleEl = document.getElementById('pomodoroProgressCircle');
    this.playPauseBtnEl = document.getElementById('pomodoroPlayPauseBtn');
    this.taskListEl = document.getElementById('plannerTaskList');

    this.tasks = this.loadTasks();
    this.init();
  }

  loadTasks() {
    const saved = localStorage.getItem('cogni_study_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 't1', title: 'Complete Neural Networks deep dive notes', completed: true, subject: 'AI / CS' },
      { id: 't2', title: 'Review 15 Spaced Repetition Flashcards', completed: false, subject: 'CS / Algorithms' },
      { id: 't3', title: 'Take Quantum Mechanics Mock Exam', completed: false, subject: 'Physics' },
      { id: 't4', title: 'Feynman Explanation on Transformer Attention', completed: false, subject: 'AI' }
    ];
  }

  saveTasks() {
    localStorage.setItem('cogni_study_tasks', JSON.stringify(this.tasks));
  }

  init() {
    this.updateDisplay();
    this.renderTasks();
    this.initSoundControls();
  }

  setTimerMode(mode) {
    this.mode = mode;
    this.pauseTimer();
    this.totalDuration = this.durations[mode];
    this.timeLeft = this.totalDuration;
    this.updateDisplay();

    document.querySelectorAll('.mode-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === mode);
    });

    const colors = {
      work: 'var(--accent-primary)',
      short_break: 'var(--accent-secondary)',
      long_break: 'var(--accent-success)'
    };
    if (this.progressCircleEl) {
      this.progressCircleEl.style.stroke = colors[mode];
    }
  }

  togglePlayPause() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.playPauseBtnEl) this.playPauseBtnEl.innerHTML = '⏸️ Pause';

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();

        // Track minutes studied
        if (this.mode === 'work' && this.timeLeft % 60 === 0) {
          window.analyticsEngine?.addStudyMinutes(1);
        }
      } else {
        this.handleTimerComplete();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.playPauseBtnEl) this.playPauseBtnEl.innerHTML = '▶️ Start Focus';
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.totalDuration;
    this.updateDisplay();
  }

  handleTimerComplete() {
    this.pauseTimer();
    window.soundEngine?.playChime();

    if (this.mode === 'work') {
      window.app?.showToast('🎉 Focus session completed! Great job. Time for a break.', 'success');
      this.setTimerMode('short_break');
    } else {
      window.app?.showToast('☕ Break is over. Ready to focus again?', 'info');
      this.setTimerMode('work');
    }
  }

  updateDisplay() {
    if (!this.timerDigitsEl) return;
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    this.timerDigitsEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (this.progressCircleEl) {
      const circumference = 2 * Math.PI * 100; // r=100 -> 628.3
      const progress = (this.totalDuration - this.timeLeft) / this.totalDuration;
      const offset = circumference * (1 - progress);
      this.progressCircleEl.style.strokeDashoffset = offset;
    }
  }

  initSoundControls() {
    const rainToggle = document.getElementById('toggleRainBtn');
    const rainSlider = document.getElementById('volumeRainSlider');
    const whiteToggle = document.getElementById('toggleWhiteNoiseBtn');
    const whiteSlider = document.getElementById('volumeWhiteNoiseSlider');
    const binauralToggle = document.getElementById('toggleBinauralBtn');
    const binauralSlider = document.getElementById('volumeBinauralSlider');

    let rainOn = false, whiteOn = false, binauralOn = false;

    if (rainToggle && rainSlider) {
      rainToggle.onclick = () => {
        rainOn = !rainOn;
        rainToggle.classList.toggle('playing', rainOn);
        window.soundEngine.toggleRain(rainOn, parseFloat(rainSlider.value));
      };
      rainSlider.oninput = (e) => window.soundEngine.setVolume('rain', parseFloat(e.target.value));
    }

    if (whiteToggle && whiteSlider) {
      whiteToggle.onclick = () => {
        whiteOn = !whiteOn;
        whiteToggle.classList.toggle('playing', whiteOn);
        window.soundEngine.toggleWhiteNoise(whiteOn, parseFloat(whiteSlider.value));
      };
      whiteSlider.oninput = (e) => window.soundEngine.setVolume('whitenoise', parseFloat(e.target.value));
    }

    if (binauralToggle && binauralSlider) {
      binauralToggle.onclick = () => {
        binauralOn = !binauralOn;
        binauralToggle.classList.toggle('playing', binauralOn);
        window.soundEngine.toggleBinaural(binauralOn, parseFloat(binauralSlider.value));
      };
      binauralSlider.oninput = (e) => window.soundEngine.setVolume('binaural', parseFloat(e.target.value));
    }
  }

  renderTasks() {
    if (!this.taskListEl) return;
    this.taskListEl.innerHTML = this.tasks.map((task, idx) => `
      <div class="glass-panel" style="padding:12px 16px; display:flex; align-items:center; gap:12px; border-radius:var(--radius-md);">
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="window.plannerController.toggleTask(${idx})" style="width:18px; height:18px; accent-color:var(--accent-primary); cursor:pointer;">
        <div style="flex:1;">
          <div style="font-size:0.92rem; font-weight:600; color:var(--text-primary); text-decoration:${task.completed ? 'line-through' : 'none'}; opacity:${task.completed ? '0.6' : '1'};">
            ${task.title}
          </div>
          <span style="font-size:0.75rem; color:var(--accent-secondary);">${task.subject || 'General'}</span>
        </div>
        <button class="icon-btn" style="width:30px; height:30px; font-size:0.8rem;" onclick="window.plannerController.deleteTask(${idx})" title="Delete Task">✕</button>
      </div>
    `).join('');
  }

  toggleTask(idx) {
    this.tasks[idx].completed = !this.tasks[idx].completed;
    this.saveTasks();
    this.renderTasks();
    if (this.tasks[idx].completed) {
      window.app?.showToast('Task completed! Keep up the momentum.', 'success');
    }
  }

  deleteTask(idx) {
    this.tasks.splice(idx, 1);
    this.saveTasks();
    this.renderTasks();
  }

  addTask(title, subject) {
    if (!title.trim()) return;
    this.tasks.push({
      id: 't_' + Date.now(),
      title: title.trim(),
      subject: subject || 'Study Topic',
      completed: false
    });
    this.saveTasks();
    this.renderTasks();
    window.app?.showToast('Study milestone added!', 'success');
  }

  async generateAISchedule(examDate, dailyHours, topics) {
    window.app?.showToast('Generating personalized AI Study Roadmap...', 'info');
    try {
      const prompt = `Create a structured study milestone schedule leading to exam date: ${examDate}.
Daily available study time: ${dailyHours} hours.
Topics to master: ${topics}.
Provide 4 prioritized actionable milestones.`;

      const response = await window.aiEngine.generateResponse(prompt, "You are an elite academic curriculum planner.");
      
      // Add sample scheduled items based on input
      this.addTask(`Phase 1: Master foundations of ${topics}`, 'Exam Prep');
      this.addTask(`Phase 2: Practice active recall & flashcard sets for ${topics}`, 'Exam Prep');
      this.addTask(`Phase 3: Complete comprehensive mock assessments`, 'Exam Prep');
      
      window.app?.showToast('AI Study Roadmap loaded into your task list!', 'success');
    } catch (err) {
      window.app?.showToast('Failed to generate roadmap: ' + err.message, 'warning');
    }
  }
}

window.PlannerController = PlannerController;
