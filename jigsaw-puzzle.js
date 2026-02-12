class JigsawPuzzleGame {
    constructor() {
        this.gridSize = 3;
        this.tiles = [];
        this.emptyPos = { row: 0, col: 0 };
        this.moves = 0;
        this.colors = [
            ['#FF6B6B', '#4ECDC4', '#45B7D1'],
            ['#FFA07A', '#98D8C8', '#F7DC6F'],
            ['#BB8FCE', '#85C1E2', '#F8B739'],
            ['#EC7063', '#48C9B0', '#F4D03F'],
            ['#AF7AC5', '#5DADE2', '#58D68D']
        ];
        this.currentColors = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.puzzle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.puzzle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const difficulty = e.target.dataset.difficulty;
                
                if (difficulty === 'easy') this.gridSize = 3;
                else if (difficulty === 'medium') this.gridSize = 4;
                else if (difficulty === 'hard') this.gridSize = 5;
                
                this.newGame();
            });
        });

        document.getElementById('newPuzzleGame').addEventListener('click', () => this.newGame());
        document.getElementById('showPreview').addEventListener('click', () => this.showPreview());
    }

    newGame() {
        this.moves = 0;
        this.updateStats();
        this.generatePuzzle();
        this.renderBoard();
        this.showPuzzleMessage('Arrange the tiles in order! 🧩', 'info');
    }

    generatePuzzle() {
        // Select random color scheme
        this.currentColors = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Create ordered tiles
        this.tiles = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.tiles[i][j] = i * this.gridSize + j + 1;
            }
        }
        
        // Last tile is empty
        this.tiles[this.gridSize - 1][this.gridSize - 1] = 0;
        this.emptyPos = { row: this.gridSize - 1, col: this.gridSize - 1 };
        
        // Shuffle with valid moves
        this.shufflePuzzle();
    }

    shufflePuzzle() {
        const moves = this.gridSize * this.gridSize * 50;
        for (let i = 0; i < moves; i++) {
            const validMoves = this.getValidMoves();
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.moveTile(randomMove.row, randomMove.col, false);
        }
        this.moves = 0;
    }

    getValidMoves() {
        const moves = [];
        const { row, col } = this.emptyPos;
        
        if (row > 0) moves.push({ row: row - 1, col: col });
        if (row < this.gridSize - 1) moves.push({ row: row + 1, col: col });
        if (col > 0) moves.push({ row: row, col: col - 1 });
        if (col < this.gridSize - 1) moves.push({ row: row, col: col + 1 });
        
        return moves;
    }

    moveTile(row, col, countMove = true) {
        const { row: emptyRow, col: emptyCol } = this.emptyPos;
        
        // Check if tile is adjacent to empty space
        if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
            
            // Swap tiles
            this.tiles[emptyRow][emptyCol] = this.tiles[row][col];
            this.tiles[row][col] = 0;
            this.emptyPos = { row, col };
            
            if (countMove) {
                this.moves++;
                this.updateStats();
                
                if (this.checkWin()) {
                    setTimeout(() => {
                        this.showPuzzleMessage(`🎉 Congratulations! You solved it in ${this.moves} moves! 🎉`, 'success');
                    }, 300);
                }
            }
            
            return true;
        }
        return false;
    }

    checkWin() {
        let expected = 1;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (i === this.gridSize - 1 && j === this.gridSize - 1) {
                    return this.tiles[i][j] === 0;
                }
                if (this.tiles[i][j] !== expected) return false;
                expected++;
            }
        }
        return true;
    }

    renderBoard() {
        const gameBoard = document.getElementById('puzzleGameBoard');
        gameBoard.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'puzzle-grid';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const tile = document.createElement('div');
                const tileValue = this.tiles[i][j];
                
                if (tileValue === 0) {
                    tile.className = 'puzzle-tile empty';
                } else {
                    tile.className = 'puzzle-tile';
                    tile.textContent = tileValue;
                    
                    // Color based on position
                    const colorIndex = Math.floor((tileValue - 1) / this.gridSize) % this.currentColors.length;
                    tile.style.background = this.currentColors[colorIndex];
                    
                    tile.addEventListener('click', () => {
                        if (this.moveTile(i, j)) {
                            this.renderBoard();
                        }
                    });
                }
                
                grid.appendChild(tile);
            }
        }

        gameBoard.appendChild(grid);
    }

    showPreview() {
        const preview = document.createElement('div');
        preview.className = 'puzzle-preview';
        preview.innerHTML = '<h3>Solved Puzzle Preview</h3>';
        
        const previewGrid = document.createElement('div');
        previewGrid.className = 'puzzle-grid preview-grid';
        previewGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        let num = 1;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                
                if (i === this.gridSize - 1 && j === this.gridSize - 1) {
                    tile.classList.add('empty');
                } else {
                    tile.textContent = num;
                    const colorIndex = Math.floor((num - 1) / this.gridSize) % this.currentColors.length;
                    tile.style.background = this.currentColors[colorIndex];
                    num++;
                }
                
                previewGrid.appendChild(tile);
            }
        }
        
        preview.appendChild(previewGrid);
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.className = 'preview-close-btn';
        closeBtn.addEventListener('click', () => preview.remove());
        preview.appendChild(closeBtn);
        
        document.body.appendChild(preview);
        
        setTimeout(() => preview.remove(), 3000);
    }

    updateStats() {
        document.getElementById('puzzleMoves').textContent = this.moves;
    }

    showPuzzleMessage(text, className) {
        const messageDiv = document.getElementById('puzzleMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }
}
