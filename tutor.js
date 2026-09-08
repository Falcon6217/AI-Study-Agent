/**
 * CogniStudy AI - AI Omni-Tutor & Feynman Evaluator Controller
 */

class TutorController {
  constructor() {
    this.currentMode = 'standard'; // 'standard', 'socratic', 'feynman', 'eli5'
    this.messagesContainer = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendChatBtn');
    this.voiceBtn = document.getElementById('voiceInputBtn');
    this.isListening = false;
    this.recognition = null;

    this.initSpeechRecognition();
  }

  setMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.mode-card').forEach(card => {
      card.classList.toggle('active', card.dataset.mode === mode);
    });

    const modeDescriptions = {
      standard: "Comprehensive step-by-step explanations, math derivations, and code snippets.",
      socratic: "Guides your intuition through probing questions and thought experiments.",
      feynman: "Explain a concept to the AI; it evaluates your accuracy, identifies knowledge gaps, and scores clarity.",
      eli5: "Crystal clear analogies and metaphors simple enough for a 10-year-old."
    };

    const headerBadge = document.getElementById('currentModeBadge');
    if (headerBadge) {
      headerBadge.textContent = mode.toUpperCase() + " MODE";
    }

    this.appendSystemNotice(`Switched to **${mode.toUpperCase()}** mode. ${modeDescriptions[mode]}`);
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.voiceBtn) this.voiceBtn.style.color = 'var(--accent-danger)';
        window.app?.showToast('Listening to your voice...', 'info');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.chatInput) {
          this.chatInput.value = transcript;
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.voiceBtn) this.voiceBtn.style.color = '';
      };

      this.recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        this.isListening = false;
        if (this.voiceBtn) this.voiceBtn.style.color = '';
      };
    }
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      window.app?.showToast('Voice recognition not supported in this browser.', 'warning');
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown tags before speaking
      const cleanText = text.replace(/[*#`$\-_]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      window.app?.showToast('Speech synthesis not supported.', 'warning');
    }
  }

  async handleSendMessage() {
    const text = this.chatInput.value.trim();
    if (!text) return;

    this.chatInput.value = '';
    this.appendUserMessage(text);

    // Show loading skeleton
    const loadingId = this.appendLoadingSkeleton();

    try {
      let systemPrompt = "You are CogniStudy AI, an elite tutor.";
      if (this.currentMode === 'socratic') {
        systemPrompt = "You are a Socratic tutor. Do NOT give direct answers immediately. Guide the student by asking thoughtful, probing questions.";
      } else if (this.currentMode === 'feynman') {
        systemPrompt = "You are a Feynman Technique comprehension evaluator. The user is explaining a concept to you. Rate their accuracy, highlight knowledge gaps, and challenge them with simple analogies.";
      } else if (this.currentMode === 'eli5') {
        systemPrompt = "Explain this concept like I am 5 years old. Use intuitive, vivid metaphors and avoid dense jargon.";
      }

      const response = await window.aiEngine.generateResponse(text, systemPrompt);
      this.removeMessage(loadingId);
      this.appendAIMessage(response);

      // Log to analytics
      window.analyticsEngine?.logActivity('AI Tutor Query', 'tutor');
    } catch (err) {
      this.removeMessage(loadingId);
      this.appendAIMessage(`⚠️ *Error communicating with AI engine:* ${err.message}`);
    }
  }

  appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble user';
    bubble.innerHTML = `
      <div class="message-avatar">U</div>
      <div class="message-content">${this.escapeHTML(text)}</div>
    `;
    this.messagesContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  appendAIMessage(markdownText) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble ai';
    const formattedHtml = this.renderMarkdown(markdownText);

    bubble.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="message-content">
        ${formattedHtml}
        <div class="message-actions">
          <button class="btn btn-sm btn-secondary" onclick="window.tutorController.speakText(decodeURIComponent('${encodeURIComponent(markdownText)}'))" title="Read Aloud">
            🔊 Read
          </button>
          <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(markdownText)}')); window.app.showToast('Copied to clipboard!', 'success');" title="Copy">
            📋 Copy
          </button>
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  appendSystemNotice(text) {
    const notice = document.createElement('div');
    notice.style.textAlign = 'center';
    notice.style.fontSize = '0.8rem';
    notice.style.color = 'var(--accent-secondary)';
    notice.style.margin = '10px 0';
    notice.innerHTML = `<span>ℹ️ ${this.renderMarkdown(text)}</span>`;
    this.messagesContainer.appendChild(notice);
    this.scrollToBottom();
  }

  appendLoadingSkeleton() {
    const id = 'msg_load_' + Date.now();
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.className = 'message-bubble ai';
    bubble.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="message-content" style="display:flex; align-items:center; gap:8px;">
        <span class="ai-status-dot"></span>
        <span style="color:var(--text-muted); font-size:0.9rem;">CogniStudy AI is thinking...</span>
      </div>
    `;
    this.messagesContainer.appendChild(bubble);
    this.scrollToBottom();
    return id;
  }

  removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  renderMarkdown(text) {
    let html = text;

    // Code blocks with syntax container
    html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${this.escapeHTML(code)}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 style="margin:10px 0 6px; font-weight:700; color:var(--accent-secondary);">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="margin:14px 0 8px; font-weight:700; color:var(--text-primary);">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="margin:16px 0 10px; font-weight:700;">$1</h2>');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul style="margin:8px 0; padding-left:20px;">$1</ul>');

    // Paragraphs / Linebreaks
    html = html.replace(/\n\n/g, '<br/><br/>');

    return html;
  }
}

window.TutorController = TutorController;
