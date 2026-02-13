class MinesweeperGame {
    constructor() {
        this.gridSize = 8;
        this.mineCount = 10;
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.difficulty = 'easy';
        this.revealedCount = 0;
        this.flagCount = 0;
        this.timer = 0;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.minesweeper-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.minesweeper-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                
                if (this.difficulty === 'easy') {
                    this.gridSize = 8;
                    this.mineCount = 10;
                } else if (this.difficulty === 'medium') {
                    this.gridSize = 10;
                    this.mineCount = 20;
                } else if (this.difficulty === 'hard') {
                    this.gridSize = 12;
                    this.mineCount = 30;
                }
                
                this.newGame();
            });
        });

        document.getElementById('newMinesweeperGame').addEventListener('click', () => this.newGame());
        document.getElementById('revealSafeCells').addEventListener('click', () => this.revealSafeCells());
    }

    newGame() {
        this.gameOver = false;
        this.gameWon = false;
        this.revealedCount = 0;
        this.flagCount = 0;
        this.timer = 0;
        this.stopTimer();
        
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        
        this.generateGrid();
        this.renderBoard();
        this.updateStats();
        this.showMinesweeperMessage('Click cells to reveal! Right-click to flag mines! 🚩', 'info');
    }

    generateGrid() {
        // Initialize empty grid
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            this.revealed[i] = [];
            this.flagged[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
                this.revealed[i][j] = false;
                this.flagged[i][j] = false;
            }
        }
        
        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            
            if (this.grid[row][col] !== -1) {
                this.grid[row][col] = -1; // -1 represents a mine
                minesPlaced++;
            }
        }
        
        // Calculate numbers for each cell
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== -1) {
                    this.grid[i][j] = this.countAdjacentMines(i, j);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.gridSize && 
                    newCol >= 0 && newCol < this.gridSize &&
                    this.grid[newRow][newCol] === -1) {
                    count++;
                }
            }
        }
        return count;
    }

    renderBoard() {
        const gameBoard = document.getElementById('minesweeperGameBoard');
        gameBoard.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'minesweeper-grid';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'minesweeper-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.revealed[i][j]) {
                    cell.classList.add('revealed');
                    
                    if (this.grid[i][j] === -1) {
                        cell.textContent = '💣';
                        cell.classList.add('mine');
                    } else if (this.grid[i][j] > 0) {
                        cell.textContent = this.grid[i][j];
                        cell.classList.add(`number-${this.grid[i][j]}`);
                    }
                } else if (this.flagged[i][j]) {
                    cell.textContent = '🚩';
                    cell.classList.add('flagged');
                } else {
                    cell.textContent = '';
                }
                
                if (!this.gameOver && !this.revealed[i][j]) {
                    cell.addEventListener('click', () => this.revealCell(i, j));
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.toggleFlag(i, j);
                    });
                }
                
                grid.appendChild(cell);
            }
        }

        gameBoard.appendChild(grid);
    }

    revealCell(row, col) {
        if (this.gameOver || this.revealed[row][col] || this.flagged[row][col]) {
            return;
        }
        
        // Start timer on first click
        if (this.revealedCount === 0) {
            this.startTimer();
        }
        
        this.revealed[row][col] = true;
        this.revealedCount++;
        
        // Hit a mine
        if (this.grid[row][col] === -1) {
            this.gameOver = true;
            this.stopTimer();
            this.revealAllMines();
            this.showMinesweeperMessage('💥 Game Over! You hit a mine! Try again! 💥', 'error-msg');
            return;
        }
        
        // If cell is empty (0), reveal adjacent cells
        if (this.grid[row][col] === 0) {
            this.revealAdjacentCells(row, col);
        }
        
        this.renderBoard();
        this.updateStats();
        this.checkWin();
    }

    revealAdjacentCells(row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.gridSize && 
                    newCol >= 0 && newCol < this.gridSize &&
                    !this.revealed[newRow][newCol] &&
                    !this.flagged[newRow][newCol]) {
                    
                    this.revealed[newRow][newCol] = true;
                    this.revealedCount++;
                    
                    if (this.grid[newRow][newCol] === 0) {
                        this.revealAdjacentCells(newRow, newCol);
                    }
                }
            }
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.revealed[row][col]) {
            return;
        }
        
        this.flagged[row][col] = !this.flagged[row][col];
        
        if (this.flagged[row][col]) {
            this.flagCount++;
        } else {
            this.flagCount--;
        }
        
        this.renderBoard();
        this.updateStats();
    }

    revealAllMines() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === -1) {
                    this.revealed[i][j] = true;
                }
            }
        }
        this.renderBoard();
    }

    revealSafeCells() {
        if (this.gameOver || this.gameWon) {
            this.showMinesweeperMessage('Game is over! Start a new game! 🎮', 'info');
            return;
        }
        
        let revealed = false;
        
        // Find a safe cell (not a mine, not revealed, not flagged)
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== -1 && !this.revealed[i][j] && !this.flagged[i][j]) {
                    this.revealCell(i, j);
                    this.showMinesweeperMessage('💡 Safe cell revealed! Keep going! 🎯', 'success');
                    revealed = true;
                    return;
                }
            }
        }
        
        if (!revealed) {
            this.showMinesweeperMessage('No more safe cells to reveal! 🎉', 'info');
        }
    }

    checkWin() {
        const totalCells = this.gridSize * this.gridSize;
        const safeCells = totalCells - this.mineCount;
        
        if (this.revealedCount === safeCells) {
            this.gameOver = true;
            this.gameWon = true;
            this.stopTimer();
            this.showMinesweeperMessage(`🎉 You Won! All safe cells revealed in ${this.timer}s! 🎉`, 'success');
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateStats();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStats() {
        document.getElementById('minesRemaining').textContent = this.mineCount - this.flagCount;
        document.getElementById('cellsRevealed').textContent = this.revealedCount;
        document.getElementById('minesweeperTime').textContent = `${this.timer}s`;
    }

    showMinesweeperMessage(text, className) {
        const messageDiv = document.getElementById('minesweeperMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }
}
