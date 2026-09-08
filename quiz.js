/**
 * CogniStudy AI - Interactive Quiz & Exam Simulator
 */

class QuizController {
  constructor() {
    this.quiz = window.SAMPLE_DATA ? window.SAMPLE_DATA.sampleQuiz : null;
    this.currentQuestionIdx = 0;
    this.userAnswers = [];
    this.timerSeconds = 300; // 5 min default
    this.timerInterval = null;
    this.isExamSubmitted = false;

    this.titleEl = document.getElementById('quizTitleDisplay');
    this.timerEl = document.getElementById('quizTimerDisplay');
    this.questionEl = document.getElementById('quizQuestionText');
    this.optionsListEl = document.getElementById('quizOptionsList');
    this.questionNumEl = document.getElementById('quizQuestionNumber');
    this.explanationEl = document.getElementById('quizExplanationBox');
    this.submitBtnEl = document.getElementById('quizSubmitBtn');
    this.nextBtnEl = document.getElementById('quizNextBtn');
  }

  startQuiz(quizData = null) {
    this.quiz = quizData || (window.SAMPLE_DATA ? window.SAMPLE_DATA.sampleQuiz : null);
    if (!this.quiz || !this.quiz.questions || !this.quiz.questions.length) return;

    this.currentQuestionIdx = 0;
    this.userAnswers = new Array(this.quiz.questions.length).fill(null);
    this.isExamSubmitted = false;
    this.timerSeconds = this.quiz.questions.length * 60;

    if (this.titleEl) this.titleEl.textContent = this.quiz.title || "Interactive Concept Assessment";
    this.startTimer();
    this.renderQuestion();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0 && !this.isExamSubmitted) {
        this.timerSeconds--;
        this.updateTimerDisplay();
      } else if (this.timerSeconds === 0 && !this.isExamSubmitted) {
        clearInterval(this.timerInterval);
        this.submitQuiz(true);
      }
    }, 1000);
  }

  updateTimerDisplay() {
    if (!this.timerEl) return;
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    this.timerEl.textContent = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  renderQuestion() {
    const q = this.quiz.questions[this.currentQuestionIdx];
    if (!q) return;

    if (this.questionNumEl) this.questionNumEl.textContent = `Question ${this.currentQuestionIdx + 1} of ${this.quiz.questions.length}`;
    if (this.questionEl) this.questionEl.textContent = q.question;
    if (this.explanationEl) this.explanationEl.style.display = 'none';

    const letters = ['A', 'B', 'C', 'D', 'E'];
    const currentSelected = this.userAnswers[this.currentQuestionIdx];

    if (this.optionsListEl) {
      this.optionsListEl.innerHTML = q.options.map((opt, idx) => {
        let extraClass = '';
        if (this.isExamSubmitted) {
          if (idx === q.correctIndex) extraClass = 'correct';
          else if (currentSelected === idx && idx !== q.correctIndex) extraClass = 'incorrect';
        } else if (currentSelected === idx) {
          extraClass = 'selected';
        }

        return `
          <div class="quiz-option ${extraClass}" onclick="window.quizController.selectOption(${idx})">
            <span class="option-letter">${letters[idx] || idx + 1}</span>
            <span style="flex:1;">${opt}</span>
          </div>
        `;
      }).join('');
    }

    if (this.isExamSubmitted && this.explanationEl) {
      this.explanationEl.style.display = 'block';
      this.explanationEl.innerHTML = `<strong>💡 Explanation:</strong> ${q.explanation || 'No explanation provided.'}`;
    }
  }

  selectOption(idx) {
    if (this.isExamSubmitted) return;
    this.userAnswers[this.currentQuestionIdx] = idx;
    this.renderQuestion();
  }

  nextQuestion() {
    if (this.currentQuestionIdx < this.quiz.questions.length - 1) {
      this.currentQuestionIdx++;
      this.renderQuestion();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIdx > 0) {
      this.currentQuestionIdx--;
      this.renderQuestion();
    }
  }

  submitQuiz(autoTriggered = false) {
    if (this.isExamSubmitted) return;
    this.isExamSubmitted = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    let score = 0;
    this.quiz.questions.forEach((q, idx) => {
      if (this.userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    const pct = Math.round((score / this.quiz.questions.length) * 100);
    this.renderQuestion();

    // Log to Analytics
    window.analyticsEngine?.logQuizScore(this.quiz.title, score, this.quiz.questions.length, pct);
    window.analyticsEngine?.logActivity(`Completed Quiz: ${this.quiz.title}`, 'quiz');

    // Show Results Alert
    window.app?.openResultsModal({
      title: this.quiz.title,
      score: score,
      total: this.quiz.questions.length,
      percentage: pct,
      auto: autoTriggered
    });
  }

  async generateQuizFromTopic(topicName) {
    window.app?.showToast(`Generating AI Quiz for "${topicName}"...`, 'info');
    try {
      const prompt = `Generate a rigorous 4-question multiple choice quiz on the topic: "${topicName}".
Return ONLY a valid JSON object matching this structure:
{
  "title": "${topicName} Assessment",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed rationale"
    }
  ]
}`;

      const raw = await window.aiEngine.generateResponse(prompt, "You are a specialized test generator. Return ONLY JSON.");
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.startQuiz(parsed);
        window.app?.showToast('AI Quiz generated successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      window.app?.showToast('Error generating AI quiz. Loaded standard test.', 'warning');
      this.startQuiz();
    }
  }
}

window.QuizController = QuizController;
