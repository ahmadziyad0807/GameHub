class WordSearchGame {
    constructor() {
        this.gridSize = 10;
        this.grid = [];
        this.words = [];
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.difficulty = 'easy';
        this.hintsRemaining = 3;
        
        this.wordLists = {
            easy: ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'FISH', 'BIRD'],
            medium: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'LEMON', 'PEACH', 'MANGO', 'BERRY'],
            hard: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'CHEETAH']
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.word-search-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.word-search-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                
                if (this.difficulty === 'easy') {
                    this.gridSize = 10;
                    this.hintsRemaining = 3;
                } else if (this.difficulty === 'medium') {
                    this.gridSize = 12;
                    this.hintsRemaining = 2;
                } else if (this.difficulty === 'hard') {
                    this.gridSize = 15;
                    this.hintsRemaining = 1;
                }
                
                this.newGame();
            });
        });

        document.getElementById('newWordSearchGame').addEventListener('click', () => this.newGame());
        document.getElementById('getWordHint').addEventListener('click', () => this.giveHint());
    }

    newGame() {
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        
        // Reset hints based on difficulty
        if (this.difficulty === 'easy') this.hintsRemaining = 3;
        else if (this.difficulty === 'medium') this.hintsRemaining = 2;
        else this.hintsRemaining = 1;
        
        this.generateGrid();
        this.renderBoard();
        this.renderWordList();
        this.updateStats();
        this.showWordSearchMessage('Find all the hidden words! 🔍', 'info');
    }

    generateGrid() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(0).map(() => 
            Array(this.gridSize).fill('').map(() => ({ letter: '', wordId: null, direction: null }))
        );
        
        // Select random words based on difficulty
        const wordPool = [...this.wordLists[this.difficulty]];
        this.shuffleArray(wordPool);
        const wordCount = this.difficulty === 'easy' ? 5 : this.difficulty === 'medium' ? 6 : 7;
        this.words = wordPool.slice(0, wordCount).map((word, index) => ({
            id: index,
            text: word,
            found: false
        }));
        
        // Place words in grid
        this.words.forEach(word => {
            this.placeWord(word);
        });
        
        // Fill empty cells with random letters
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j].letter === '') {
                    this.grid[i][j].letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
    }

    placeWord(word) {
        const directions = [
            { dr: 0, dc: 1, name: 'horizontal' },      // Horizontal
            { dr: 1, dc: 0, name: 'vertical' },        // Vertical
            { dr: 1, dc: 1, name: 'diagonal-down' },   // Diagonal down-right
            { dr: -1, dc: 1, name: 'diagonal-up' }     // Diagonal up-right
        ];
        
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!placed && attempts < maxAttempts) {
            attempts++;
            
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            
            if (this.canPlaceWord(word.text, row, col, direction)) {
                this.placeWordInGrid(word, row, col, direction);
                placed = true;
            }
        }
        
        // If word couldn't be placed, try horizontal placement
        if (!placed) {
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j <= this.gridSize - word.text.length; j++) {
                    if (this.canPlaceWord(word.text, i, j, directions[0])) {
                        this.placeWordInGrid(word, i, j, directions[0]);
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
        }
    }

    canPlaceWord(word, row, col, direction) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + (direction.dr * i);
            const newCol = col + (direction.dc * i);
            
            if (newRow < 0 || newRow >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
                return false;
            }
            
            const cell = this.grid[newRow][newCol];
            if (cell.letter !== '' && cell.letter !== word[i]) {
                return false;
            }
        }
        return true;
    }

    placeWordInGrid(word, row, col, direction) {
        for (let i = 0; i < word.text.length; i++) {
            const newRow = row + (direction.dr * i);
            const newCol = col + (direction.dc * i);
            
            this.grid[newRow][newCol] = {
                letter: word.text[i],
                wordId: word.id,
                direction: direction.name
            };
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('wordSearchGameBoard');
        gameBoard.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'word-search-grid';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'word-search-cell';
                cell.textContent = this.grid[i][j].letter;
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('mousedown', (e) => this.startSelection(e, i, j));
                cell.addEventListener('mouseenter', (e) => this.continueSelection(e, i, j));
                cell.addEventListener('mouseup', () => this.endSelection());
                
                grid.appendChild(cell);
            }
        }

        gameBoard.appendChild(grid);
        
        // Add mouse up listener to document
        document.addEventListener('mouseup', () => this.endSelection());
    }

    startSelection(e, row, col) {
        e.preventDefault();
        this.isSelecting = true;
        this.selectedCells = [{ row, col }];
        this.highlightSelection();
    }

    continueSelection(e, row, col) {
        if (!this.isSelecting) return;
        
        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        
        // Check if selection is in a straight line
        if (this.selectedCells.length === 1 || this.isInLine(this.selectedCells[0], lastCell, { row, col })) {
            // Check if cell is adjacent to last selected cell
            if (this.isAdjacent(lastCell, { row, col })) {
                // Don't add if already in selection
                if (!this.selectedCells.some(cell => cell.row === row && cell.col === col)) {
                    this.selectedCells.push({ row, col });
                    this.highlightSelection();
                }
            }
        }
    }

    isAdjacent(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
    }

    isInLine(start, middle, end) {
        const dr1 = middle.row - start.row;
        const dc1 = middle.col - start.col;
        const dr2 = end.row - start.row;
        const dc2 = end.col - start.col;
        
        // Check if direction is consistent
        if (dr1 === 0 && dr2 === 0) return true; // Horizontal
        if (dc1 === 0 && dc2 === 0) return true; // Vertical
        if (dr1 !== 0 && dc1 !== 0) {
            return (dr2 / dr1 === dc2 / dc1); // Diagonal
        }
        return false;
    }

    highlightSelection() {
        // Clear previous highlights
        document.querySelectorAll('.word-search-cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Highlight selected cells
        this.selectedCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`.word-search-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('selected');
        });
    }

    endSelection() {
        if (!this.isSelecting) return;
        this.isSelecting = false;
        
        if (this.selectedCells.length > 0) {
            this.checkWord();
        }
        
        this.selectedCells = [];
        this.clearSelection();
    }

    checkWord() {
        const selectedWord = this.selectedCells.map(({ row, col }) => 
            this.grid[row][col].letter
        ).join('');
        
        // Check forward and backward
        const reversedWord = selectedWord.split('').reverse().join('');
        
        for (let word of this.words) {
            if (!word.found && (word.text === selectedWord || word.text === reversedWord)) {
                word.found = true;
                this.foundWords.push(word.id);
                this.markWordAsFound();
                this.renderWordList();
                this.updateStats();
                
                if (this.foundWords.length === this.words.length) {
                    setTimeout(() => {
                        this.showWordSearchMessage('🎉 Congratulations! You found all words! 🎉', 'success');
                    }, 500);
                } else {
                    this.showWordSearchMessage(`✓ Found "${word.text}"! Keep going! 🎯`, 'success');
                }
                return;
            }
        }
    }

    markWordAsFound() {
        this.selectedCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`.word-search-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('found');
        });
    }

    clearSelection() {
        document.querySelectorAll('.word-search-cell').forEach(cell => {
            cell.classList.remove('selected');
        });
    }

    renderWordList() {
        const wordListDiv = document.getElementById('wordSearchList');
        wordListDiv.innerHTML = '<h3>Words to Find:</h3>';
        
        const list = document.createElement('div');
        list.className = 'word-list';
        
        this.words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            if (word.found) {
                wordItem.classList.add('found');
            }
            wordItem.textContent = word.text;
            list.appendChild(wordItem);
        });
        
        wordListDiv.appendChild(list);
    }

    giveHint() {
        if (this.hintsRemaining <= 0) {
            this.showWordSearchMessage('No hints remaining! 😅', 'error-msg');
            return;
        }
        
        // Find first unfound word
        const unfoundWord = this.words.find(word => !word.found);
        if (!unfoundWord) {
            this.showWordSearchMessage('All words found! 🎉', 'success');
            return;
        }
        
        // Find the word in grid and highlight first letter
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j].wordId === unfoundWord.id && 
                    this.grid[i][j].letter === unfoundWord.text[0]) {
                    
                    const cell = document.querySelector(`.word-search-cell[data-row="${i}"][data-col="${j}"]`);
                    if (cell && !cell.classList.contains('hint')) {
                        cell.classList.add('hint');
                        setTimeout(() => cell.classList.remove('hint'), 2000);
                        
                        this.hintsRemaining--;
                        this.updateStats();
                        this.showWordSearchMessage(`💡 Hint: "${unfoundWord.text}" starts here!`, 'info');
                        return;
                    }
                }
            }
        }
    }

    updateStats() {
        document.getElementById('wordsFoundCount').textContent = `${this.foundWords.length} / ${this.words.length}`;
        document.getElementById('hintsCount').textContent = this.hintsRemaining;
    }

    showWordSearchMessage(text, className) {
        const messageDiv = document.getElementById('wordSearchMessage');
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
