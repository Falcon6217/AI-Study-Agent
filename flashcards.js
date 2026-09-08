/**
 * CogniStudy AI - Spaced Repetition Flashcard Engine (SRS)
 * Implements Leitner Boxes & SM-2 memory retention intervals
 */

class FlashcardsController {
  constructor() {
    this.decks = this.loadDecks();
    this.currentDeckId = this.decks[0]?.id || null;
    this.currentCardIndex = 0;
    this.isFlipped = false;

    this.cardElement = document.getElementById('activeFlashcard3D');
    this.frontTextEl = document.getElementById('cardFrontText');
    this.backTextEl = document.getElementById('cardBackText');
    this.topicTagEl = document.getElementById('cardTopicTag');
    this.hintTextEl = document.getElementById('cardHintText');
    this.deckSelectEl = document.getElementById('deckSelectDropdown');
    this.cardCounterEl = document.getElementById('cardCounterDisplay');

    this.init();
  }

  loadDecks() {
    const saved = localStorage.getItem('cogni_flashcard_decks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return window.SAMPLE_DATA ? [...window.SAMPLE_DATA.decks] : [];
  }

  saveDecks() {
    localStorage.setItem('cogni_flashcard_decks', JSON.stringify(this.decks));
  }

  init() {
    this.renderDeckSelector();
    this.loadCurrentCard();
    this.renderDeckOverviewList();
  }

  renderDeckSelector() {
    if (!this.deckSelectEl) return;
    this.deckSelectEl.innerHTML = this.decks.map(deck => `
      <option value="${deck.id}" ${deck.id === this.currentDeckId ? 'selected' : ''}>
        ${deck.title} (${deck.cards.length} cards)
      </option>
    `).join('');

    this.deckSelectEl.onchange = (e) => {
      this.currentDeckId = e.target.value;
      this.currentCardIndex = 0;
      this.isFlipped = false;
      this.loadCurrentCard();
    };
  }

  getCurrentDeck() {
    return this.decks.find(d => d.id === this.currentDeckId) || this.decks[0];
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    if (this.cardElement) {
      this.cardElement.classList.toggle('flipped', this.isFlipped);
    }
  }

  loadCurrentCard() {
    const deck = this.getCurrentDeck();
    if (!deck || !deck.cards || deck.cards.length === 0) {
      if (this.frontTextEl) this.frontTextEl.textContent = "No cards in this deck yet. Click 'Add Card' to start!";
      if (this.backTextEl) this.backTextEl.textContent = "Click 'Add Card' above to create flashcards.";
      if (this.topicTagEl) this.topicTagEl.textContent = "EMPTY DECK";
      if (this.hintTextEl) this.hintTextEl.textContent = "";
      if (this.cardCounterEl) this.cardCounterEl.textContent = "0 / 0";
      return;
    }

    if (this.currentCardIndex >= deck.cards.length) {
      this.currentCardIndex = 0;
    }

    const card = deck.cards[this.currentCardIndex];
    this.isFlipped = false;
    if (this.cardElement) this.cardElement.classList.remove('flipped');

    if (this.frontTextEl) this.frontTextEl.textContent = card.front;
    if (this.backTextEl) this.backTextEl.textContent = card.back;
    if (this.topicTagEl) this.topicTagEl.textContent = deck.title;
    if (this.hintTextEl) this.hintTextEl.textContent = card.hint ? `💡 Hint: ${card.hint}` : `Click or press Spacebar to reveal answer`;
    if (this.cardCounterEl) this.cardCounterEl.textContent = `${this.currentCardIndex + 1} / ${deck.cards.length}`;
  }

  // --- Spaced Repetition Scoring Engine (SM-2 / Leitner Hybrid) ---
  rateCard(rating) {
    const deck = this.getCurrentDeck();
    if (!deck || !deck.cards.length) return;

    const card = deck.cards[this.currentCardIndex];
    card.box = card.box || 1;
    card.interval = card.interval || 1;
    card.ease = card.ease || 2.5;

    switch (rating) {
      case 'again': // Failed recall
        card.box = 1;
        card.interval = 1;
        card.ease = Math.max(1.3, card.ease - 0.2);
        window.app?.showToast('Reset interval. You will see this card again soon!', 'info');
        break;
      case 'hard': // Recalled with significant effort
        card.interval = Math.max(1, Math.round(card.interval * 1.2));
        card.ease = Math.max(1.3, card.ease - 0.15);
        break;
      case 'good': // Recalled correctly with standard effort
        card.box = Math.min(5, card.box + 1);
        card.interval = Math.round(card.interval * card.ease);
        break;
      case 'easy': // Instant effortless recall
        card.box = Math.min(5, card.box + 1);
        card.ease += 0.15;
        card.interval = Math.round(card.interval * card.ease * 1.3);
        window.app?.showToast('Mastery improved! Extended review interval.', 'success');
        break;
    }

    card.nextReview = Date.now() + card.interval * 86400000;
    this.saveDecks();

    // Log to analytics
    window.analyticsEngine?.logActivity('Reviewed Flashcard', 'flashcards');
    window.analyticsEngine?.updateCardReviewCount();

    // Next Card
    this.nextCard();
  }

  nextCard() {
    const deck = this.getCurrentDeck();
    if (!deck || !deck.cards.length) return;
    this.currentCardIndex = (this.currentCardIndex + 1) % deck.cards.length;
    this.loadCurrentCard();
  }

  prevCard() {
    const deck = this.getCurrentDeck();
    if (!deck || !deck.cards.length) return;
    this.currentCardIndex = (this.currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
    this.loadCurrentCard();
  }

  addCustomDeck(deckObj) {
    this.decks.push(deckObj);
    this.currentDeckId = deckObj.id;
    this.saveDecks();
    this.init();
  }

  addNewCard(front, back, hint) {
    const deck = this.getCurrentDeck();
    if (!deck) return;

    deck.cards.push({
      id: 'c_' + Date.now(),
      front: front.trim(),
      back: back.trim(),
      hint: hint ? hint.trim() : '',
      box: 1,
      nextReview: Date.now(),
      interval: 1,
      ease: 2.5
    });

    this.saveDecks();
    this.currentCardIndex = deck.cards.length - 1;
    this.loadCurrentCard();
    this.renderDeckSelector();
    this.renderDeckOverviewList();
    window.app?.showToast('Card added successfully!', 'success');
  }

  renderDeckOverviewList() {
    const container = document.getElementById('deckOverviewGrid');
    if (!container) return;

    container.innerHTML = this.decks.map(deck => {
      const mastered = deck.cards.filter(c => (c.box || 1) >= 3).length;
      const pct = deck.cards.length ? Math.round((mastered / deck.cards.length) * 100) : 0;

      return `
        <div class="glass-panel" style="padding:16px; border-radius:var(--radius-md); display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <h4 style="font-weight:700; color:var(--text-primary); font-size:1rem;">${deck.title}</h4>
              <span class="nav-badge" style="background:${deck.color || '#6366f1'}20; color:${deck.color || '#6366f1'}; border-color:${deck.color || '#6366f1'}50;">
                ${deck.cards.length} cards
              </span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">${deck.description || 'Custom study deck'}</p>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px; color:var(--text-secondary);">
              <span>Mastery</span>
              <span>${pct}%</span>
            </div>
            <div class="progress-track" style="height:6px;">
              <div class="progress-fill" style="width:${pct}%;"></div>
            </div>
            <button class="btn btn-sm btn-secondary" style="width:100%; margin-top:10px;" onclick="window.flashcardsController.selectAndStudyDeck('${deck.id}')">
              Study Deck 🎯
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  selectAndStudyDeck(deckId) {
    this.currentDeckId = deckId;
    this.currentCardIndex = 0;
    this.renderDeckSelector();
    this.loadCurrentCard();
    window.app?.showToast(`Selected deck: ${this.getCurrentDeck().title}`, 'info');
  }

  exportDecksJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.decks, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "cognistudy_flashcard_decks.json");
    dlAnchor.click();
  }
}

window.FlashcardsController = FlashcardsController;
