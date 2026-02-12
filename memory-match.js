class MemoryMatchGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.difficulty = 'easy';
        this.isProcessing = false;
        this.usedEmojiSets = [];
        this.allEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', 
                          '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
                          '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐠',
                          '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒',
                          '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
                          '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
                          '⭐', '🌟', '💫', '✨', '🌙', '☀️', '🌈', '🔥'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.newGame();
            });
        });

        document.getElementById('newMemoryGame').addEventListener('click', () => this.newGame());
    }

    newGame() {
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isProcessing = false;
        this.updateStats();
        this.generateCards();
        this.renderBoard();
        this.showMemoryMessage('Find all matching pairs! 🎯', 'info');
    }

    generateCards() {
        let pairCount;
        switch(this.difficulty) {
            case 'easy': pairCount = 4; break;
            case 'medium': pairCount = 5; break;
            case 'hard': pairCount = 6; break;
            default: pairCount = 4;
        }

        // Get a random set of emojis that's different from the last game
        let selectedEmojis;
        let attempts = 0;
        do {
            const shuffled = this.shuffleArray([...this.allEmojis]);
            selectedEmojis = shuffled.slice(0, pairCount);
            attempts++;
        } while (attempts < 10 && this.isSameAsLastSet(selectedEmojis));

        // Store this set for next comparison
        this.usedEmojiSets.push([...selectedEmojis]);
        if (this.usedEmojiSets.length > 3) {
            this.usedEmojiSets.shift(); // Keep only last 3 sets
        }

        this.cards = [...selectedEmojis, ...selectedEmojis];
        this.shuffleArray(this.cards);
    }

    isSameAsLastSet(newSet) {
        if (this.usedEmojiSets.length === 0) return false;
        
        const lastSet = this.usedEmojiSets[this.usedEmojiSets.length - 1];
        const sortedNew = [...newSet].sort();
        const sortedLast = [...lastSet].sort();
        
        return sortedNew.every((emoji, index) => emoji === sortedLast[index]);
    }

    renderBoard() {
        const gameBoard = document.getElementById('memoryGameBoard');
        gameBoard.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'memory-grid';
        
        let cols;
        switch(this.difficulty) {
            case 'easy': cols = 4; break;
            case 'medium': cols = 5; break;
            case 'hard': cols = 4; break;
            default: cols = 4;
        }
        
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        this.cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;

            const cardInner = document.createElement('div');
            cardInner.className = 'memory-card-inner';

            const cardFront = document.createElement('div');
            cardFront.className = 'memory-card-front';
            cardFront.textContent = '?';

            const cardBack = document.createElement('div');
            cardBack.className = 'memory-card-back';
            cardBack.textContent = emoji;

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);

            card.addEventListener('click', () => this.flipCard(card, index));

            grid.appendChild(card);
        });

        gameBoard.appendChild(grid);
    }

    flipCard(cardElement, index) {
        if (this.isProcessing) return;
        if (cardElement.classList.contains('flipped')) return;
        if (cardElement.classList.contains('matched')) return;
        if (this.flippedCards.length >= 2) return;

        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, index: index, emoji: this.cards[index] });

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isProcessing = true;
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            setTimeout(() => {
                card1.element.classList.add('matched');
                card2.element.classList.add('matched');
                this.matchedPairs++;
                this.updateStats();
                this.flippedCards = [];
                this.isProcessing = false;

                if (this.matchedPairs === this.cards.length / 2) {
                    setTimeout(() => {
                        this.showMemoryMessage(`🎉 You won in ${this.moves} moves! 🎉`, 'success');
                    }, 500);
                }
            }, 500);
        } else {
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                this.flippedCards = [];
                this.isProcessing = false;
            }, 1000);
        }
    }

    updateStats() {
        document.getElementById('movesCount').textContent = this.moves;
        document.getElementById('pairsCount').textContent = `${this.matchedPairs} / ${this.cards.length / 2}`;
    }

    showMemoryMessage(text, className) {
        const messageDiv = document.getElementById('memoryMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
