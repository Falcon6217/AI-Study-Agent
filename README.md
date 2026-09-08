# 🧠 CogniStudy AI — Advanced AI Learning & Study Assistant

A modern, full-stack **AI Study & Learning Assistant** engineered with state-of-the-art pedagogical frameworks (Socratic method, Feynman Technique, Spaced Repetition SRS, and Pomodoro focus synthesis).

---

## 🌟 Key Features

### 1. 🤖 AI Omni-Tutor & Feynman Evaluator
- **4 Pedagogical Modes**:
  - **Standard Tutor**: Step-by-step mathematical derivations, code snippets, and conceptual proofs.
  - **Socratic Guide**: Asks thought-provoking questions to build first-principles intuition.
  - **Feynman Evaluator**: You explain a concept; the AI assesses your accuracy, pinpoints knowledge gaps, and calculates a comprehension score.
  - **ELI5 Explainer**: Simplifies dense jargon into intuitive real-world analogies.
- **Voice & Speech**: Integrated Web Speech recognition for voice queries and Text-to-Speech audio reader.

### 2. 📑 Smart Notes & Document Synthesizer
- Paste lecture transcripts, textbook passages, or drag-and-drop `.txt` / `.md` files.
- Generates high-yield **Executive Bullet Summaries**, extracts **Core Concept Tags**, and produces one-click **Flashcards** and **Quizzes**.

### 3. ⚡ Spaced Repetition Flashcards (SRS)
- **3D Flip Card Scene** with keyboard shortcut support (Spacebar flips card).
- **Leitner & SM-2 Spaced Repetition Engine** (`Again`, `Hard`, `Good`, `Easy`) calculating personalized memory retention review intervals.
- Custom Deck Manager, Card Creator, and JSON Export/Import.

### 4. 📝 AI Quiz & Timed Exam Simulator
- Timed assessments with countdown timer and instant scoring.
- Comprehensive explanations and rationale for every question.
- Performance radar scorecards.

### 5. 🌐 Interactive Concept Mind Map
- Dynamic HTML5 Canvas knowledge graph explorer.
- Drag nodes, zoom in/out, pan, and click any node for instant AI deep dives.
- Export concept trees as PNG images.

### 6. ⏱️ Study Planner & Pomodoro Focus Suite
- Customizable Pomodoro interval timer (Work 25m, Short Break 5m, Long Break 15m) with SVG progress ring.
- **Zero-Dependency Procedural Audio Synthesizer** (Rain sounds, White Noise, and 432Hz Alpha wave binaural focus tones) powered by Web Audio API.
- AI study milestone scheduler based on exam dates and available hours.

### 7. 📈 Mastery Analytics & Streak Tracker
- Automatic study streak counter.
- Daily focus time logs and subject mastery rating charts persisted in `localStorage`.

### 8. 🔌 Dual AI Engine (Zero-Setup & Live Cloud API)
- **Built-in Intelligent Engine**: Works immediately out of the box with zero setup or API keys required.
- **Cloud LLM Integration**: Easily configure **Google Gemini API** (`gemini-1.5-flash`, `gemini-1.5-pro`) or **OpenAI API** (`gpt-4o-mini`, `gpt-4o`) via the in-app Settings dialog (⚙️).

---

## 🚀 Quick Start & Launch

### Method 1: Instant Launch (Windows)
Double-click `run.bat` in the project root folder.

### Method 2: Open in Browser
Simply open [`index.html`](file:///c:/Users/karth/OneDrive/Desktop/AI%20Agent/index.html) in any modern web browser (Chrome, Edge, Firefox, Safari, Brave).

### Method 3: Python Server (Optional)
```bash
# Optional: run with Python backend
pip install -r backend/requirements.txt
python backend/server.py
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## ⌨️ Keyboard Shortcuts
- `Spacebar`: Flip active flashcard (when on Flashcards tab).
- `Enter`: Send message in AI Tutor chat.

---

## 📁 Project Structure

```
AI Agent/
├── index.html              # Main Single-Page Application Shell
├── css/
│   ├── style.css           # Design tokens, variables & glassmorphism theme
│   ├── components.css      # Component styles (3D cards, timer, chat, quizzes)
│   └── responsive.css      # Mobile & tablet responsiveness
├── js/
│   ├── app.js              # Application bootstrapper & modal controller
│   ├── ai-engine.js        # Hybrid AI Engine (Gemini / OpenAI / Local Heuristics)
│   ├── tutor.js            # AI Omni-Tutor & Feynman comprehension validator
│   ├── notes.js            # Document summarizer & concept extractor
│   ├── flashcards.js       # Spaced repetition 3D flashcard system
│   ├── quiz.js             # Interactive quiz simulator & grading logic
│   ├── planner.js          # Pomodoro timer & AI study scheduler
│   ├── mindmap.js          # HTML5 Canvas interactive concept graph
│   ├── analytics.js        # Mastery tracker & study streaks
│   └── sound.js            # Web Audio API ambient noise synthesizer
├── assets/
│   └── sample_data.js      # Curated starter decks & study notes
├── backend/
│   ├── server.py           # FastAPI backend server
│   └── requirements.txt    # Python backend dependencies
├── run.bat                 # Windows one-click launcher
├── run.sh                  # Mac/Linux one-click launcher
└── README.md               # Documentation & usage guide
```
