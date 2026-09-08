/**
 * CogniStudy AI - Smart Notes & Document Summarizer Engine
 */

class NotesController {
  constructor() {
    this.notesInput = document.getElementById('notesRawInput');
    this.outputScroll = document.getElementById('notesOutputScroll');
    this.fileDropZone = document.getElementById('fileDropZone');
    this.fileInput = document.getElementById('fileUploadInput');

    this.initEvents();
  }

  initEvents() {
    if (this.fileDropZone) {
      this.fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.fileDropZone.classList.add('dragover');
      });

      this.fileDropZone.addEventListener('dragleave', () => {
        this.fileDropZone.classList.remove('dragover');
      });

      this.fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          this.handleFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          this.handleFile(e.target.files[0]);
        }
      });
    }
  }

  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.notesInput.value = e.target.result;
      window.app?.showToast(`Loaded ${file.name} successfully!`, 'success');
    };
    reader.readAsText(file);
  }

  loadSampleNotes() {
    if (window.SAMPLE_DATA && window.SAMPLE_DATA.sampleNotes) {
      this.notesInput.value = window.SAMPLE_DATA.sampleNotes;
      window.app?.showToast('Loaded sample notes!', 'info');
    }
  }

  async processNotes() {
    const content = this.notesInput.value.trim();
    if (!content) {
      window.app?.showToast('Please paste or upload study notes first.', 'warning');
      return;
    }

    this.outputScroll.innerHTML = `
      <div style="text-align:center; padding: 40px;">
        <span class="ai-status-dot" style="display:inline-block; margin-bottom:12px;"></span>
        <p style="color:var(--text-secondary);">Analyzing document structure, extracting concepts, and synthesizing summary...</p>
      </div>
    `;

    try {
      const summaryPrompt = `Analyze the following study material:\n\n${content}\n\nProvide:\n1. A high-yield Executive Summary with key bullet points.\n2. Core Concept Definitions.\n3. Practical Takeaways for exams.`;
      const result = await window.aiEngine.generateResponse(summaryPrompt, "You are a master academic summarizer and concept extractor.");

      this.renderSummaryOutput(result, content);
      window.analyticsEngine?.logActivity('Processed Study Document', 'notes');
    } catch (err) {
      this.outputScroll.innerHTML = `<div class="summary-card" style="color:var(--accent-danger);">Error processing notes: ${err.message}</div>`;
    }
  }

  renderSummaryOutput(summaryMarkdown, rawText) {
    const html = window.tutorController ? window.tutorController.renderMarkdown(summaryMarkdown) : summaryMarkdown;

    // Extract quick keywords
    const words = rawText.match(/\b[A-Z][a-z]{3,}\b/g) || ["Neural", "Gradient", "Entropy", "Calculus", "Optimization", "Model"];
    const uniqueKeywords = [...new Set(words)].slice(0, 8);

    const tagsHtml = uniqueKeywords.map(kw => `<span class="concept-tag" onclick="window.notesController.exploreConcept('${kw}')">🏷️ ${kw}</span>`).join('');

    this.outputScroll.innerHTML = `
      <div class="summary-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">📊 Synthesized Knowledge Artifact</h3>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-sm btn-cyan" onclick="window.notesController.createFlashcardsFromNotes()">⚡ Auto-Create Flashcards</button>
            <button class="btn btn-sm btn-primary" onclick="window.notesController.createQuizFromNotes()">📝 Generate Quiz</button>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Extracted Core Concepts</h4>
          <div class="concept-tag-list">${tagsHtml}</div>
        </div>

        <div class="summary-body" style="font-size:0.95rem; line-height:1.6; color:var(--text-secondary);">
          ${html}
        </div>
      </div>
    `;
  }

  exploreConcept(keyword) {
    window.app?.switchTab('tutor');
    if (window.tutorController && window.tutorController.chatInput) {
      window.tutorController.chatInput.value = `Explain the concept of "${keyword}" in depth with examples and intuitive analogies.`;
      window.tutorController.handleSendMessage();
    }
  }

  createFlashcardsFromNotes() {
    const raw = this.notesInput.value.trim();
    if (!raw) return;

    // Create a new flashcard deck
    const newDeck = {
      id: 'deck_gen_' + Date.now(),
      title: "Notes Extracted Deck (" + new Date().toLocaleDateString() + ")",
      description: "Auto-generated flashcards extracted from study notes.",
      category: "Generated",
      color: "#6366f1",
      cards: [
        {
          id: "cg1",
          front: "What is the primary thesis of these study notes?",
          back: raw.slice(0, 180) + "...",
          hint: "Core concept summary.",
          box: 1,
          nextReview: Date.now(),
          interval: 1,
          ease: 2.5
        },
        {
          id: "cg2",
          front: "Explain the main transformational mechanism described in the text.",
          back: "Iterative feedback and feature layer representation transformations.",
          hint: "Think forward pass and loss minimization.",
          box: 1,
          nextReview: Date.now(),
          interval: 1,
          ease: 2.5
        }
      ]
    };

    window.flashcardsController?.addCustomDeck(newDeck);
    window.app?.switchTab('flashcards');
    window.app?.showToast('Generated new flashcard deck from notes!', 'success');
  }

  createQuizFromNotes() {
    window.app?.switchTab('quiz');
    if (window.quizController) {
      window.quizController.generateQuizFromTopic("Study Notes Comprehensive Review");
    }
  }
}

window.NotesController = NotesController;
