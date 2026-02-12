class SudokuGame {
    constructor() {
        this.size = 4;
        this.board = [];
        this.solution = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.size = parseInt(e.target.dataset.size);
                this.newGame();
            });
        });

        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
        document.getElementById('checkSolution').addEventListener('click', () => this.checkSolution());
        document.getElementById('hint').addEventListener('click', () => this.giveHint());

        // Menu navigation
        this.menuHandler = (e) => {
            const menuItem = e.target.closest('.menu-item:not(.disabled)');
            if (!menuItem) return;
            
            e.preventDefault();
            const gameName = menuItem.dataset.game;
            
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            menuItem.classList.add('active');
            
            // Hide all games
            document.querySelectorAll('.game-container').forEach(game => {
                game.style.display = 'none';
            });
            
            // Show selected game
            if (gameName === 'sudoku') {
                document.getElementById('sudokuGame').style.display = 'block';
            } else if (gameName === 'memory') {
                document.getElementById('memoryGame').style.display = 'block';
            } else if (gameName === 'puzzle') {
                document.getElementById('puzzleGame').style.display = 'block';
            } else if (gameName === 'maze') {
                document.getElementById('mazeGame').style.display = 'block';
            } else if (gameName === 'coloring') {
                document.getElementById('coloringGame').style.display = 'block';
            } else if (gameName === 'math') {
                document.getElementById('mathGame').style.display = 'block';
            }
        };
        
        document.querySelector('.game-menu').addEventListener('click', this.menuHandler);
    }

    getBoxDimensions() {
        // Return [rows, cols] for each box based on grid size
        if (this.size === 4) return [2, 2];
        if (this.size === 6) return [2, 3];
        if (this.size === 9) return [3, 3];
        return [Math.sqrt(this.size), Math.sqrt(this.size)];
    }

    newGame() {
        this.generatePuzzle();
        this.renderBoard();
        this.showMessage('Good luck! 🍀', 'info');
    }

    resetGame() {
        const cells = document.querySelectorAll('.sudoku-cell:not(.prefilled)');
        cells.forEach(cell => {
            cell.value = '';
            cell.classList.remove('error', 'correct', 'hint');
        });
        this.showMessage('Game reset! Start fresh! 🔄', 'info');
    }

    generatePuzzle() {
        this.solution = this.createSolvedBoard();
        this.board = JSON.parse(JSON.stringify(this.solution));
        this.removeCells();
    }

    createSolvedBoard() {
        const board = Array(this.size).fill(0).map(() => Array(this.size).fill(0));
        this.fillBoard(board);
        return board;
    }

    fillBoard(board, row = 0, col = 0) {
        if (row === this.size) return true;
        if (col === this.size) return this.fillBoard(board, row + 1, 0);

        const numbers = this.shuffleArray([...Array(this.size).keys()].map(n => n + 1));
        
        for (let num of numbers) {
            if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                if (this.fillBoard(board, row, col + 1)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    isValid(board, row, col, num) {
        // Check row
        for (let x = 0; x < this.size; x++) {
            if (board[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < this.size; x++) {
            if (board[x][col] === num) return false;
        }

        // Check box
        const [boxRows, boxCols] = this.getBoxDimensions();
        const boxRow = Math.floor(row / boxRows) * boxRows;
        const boxCol = Math.floor(col / boxCols) * boxCols;

        for (let i = 0; i < boxRows; i++) {
            for (let j = 0; j < boxCols; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    removeCells() {
        const cellsToRemove = Math.floor(this.size * this.size * 0.5);
        let removed = 0;

        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);

            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                removed++;
            }
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'sudoku-grid';
        grid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('input');
                cell.type = 'text';
                cell.className = 'sudoku-cell';
                cell.maxLength = 1;
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (this.board[i][j] !== 0) {
                    cell.value = this.board[i][j];
                    cell.classList.add('prefilled');
                    cell.readOnly = true;
                } else {
                    cell.addEventListener('input', (e) => this.handleInput(e));
                    cell.addEventListener('keydown', (e) => this.handleKeydown(e));
                }

                grid.appendChild(cell);
            }
        }

        gameBoard.appendChild(grid);
    }

    handleInput(e) {
        const value = e.target.value;
        if (value && (isNaN(value) || value < 1 || value > this.size)) {
            e.target.value = '';
        }
        e.target.classList.remove('error', 'correct');
    }

    handleKeydown(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        let newRow = row;
        let newCol = col;

        switch(e.key) {
            case 'ArrowUp': newRow = Math.max(0, row - 1); break;
            case 'ArrowDown': newRow = Math.min(this.size - 1, row + 1); break;
            case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
            case 'ArrowRight': newCol = Math.min(this.size - 1, col + 1); break;
            default: return;
        }

        e.preventDefault();
        const nextCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (nextCell) nextCell.focus();
    }

    checkSolution() {
        const cells = document.querySelectorAll('.sudoku-cell:not(.prefilled)');
        let allCorrect = true;
        let allFilled = true;

        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = parseInt(cell.value);

            cell.classList.remove('error', 'correct');

            if (!value) {
                allFilled = false;
                return;
            }

            if (value === this.solution[row][col]) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('error');
                allCorrect = false;
            }
        });

        if (!allFilled) {
            this.showMessage('Please fill all cells first! 📝', 'info');
        } else if (allCorrect) {
            this.showMessage('🎉 Congratulations! You solved it! 🎉', 'success');
        } else {
            this.showMessage('Some cells are incorrect. Keep trying! 💪', 'error-msg');
        }
    }

    giveHint() {
        const emptyCells = [];
        document.querySelectorAll('.sudoku-cell:not(.prefilled)').forEach(cell => {
            if (!cell.value) {
                emptyCells.push(cell);
            }
        });

        if (emptyCells.length === 0) {
            this.showMessage('No empty cells to hint! 🎯', 'info');
            return;
        }

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const row = parseInt(randomCell.dataset.row);
        const col = parseInt(randomCell.dataset.col);

        randomCell.value = this.solution[row][col];
        randomCell.classList.add('hint');
        setTimeout(() => randomCell.classList.remove('hint'), 1000);

        this.showMessage('Hint added! ✨', 'success');
    }

    showMessage(text, className) {
        const messageDiv = document.getElementById('message');
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

// Initialize games when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
    new MemoryMatchGame();
    new JigsawPuzzleGame();
    new MazeRunnerGame();
    new ColoringBookGame();
    new MathQuizGame();
});
