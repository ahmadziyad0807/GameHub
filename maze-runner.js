class MazeRunnerGame {
    constructor() {
        this.size = 10;
        this.maze = [];
        this.playerPos = { row: 0, col: 0 };
        this.endPos = { row: 0, col: 0 };
        this.steps = 0;
        this.time = 0;
        this.timer = null;
        this.solution = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.maze-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.maze-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const difficulty = e.target.dataset.difficulty;
                
                if (difficulty === 'easy') this.size = 10;
                else if (difficulty === 'medium') this.size = 15;
                else if (difficulty === 'hard') this.size = 20;
                
                this.newGame();
            });
        });

        document.getElementById('newMazeGame').addEventListener('click', () => this.newGame());
        document.getElementById('showSolution').addEventListener('click', () => this.showSolution());

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('mazeGame').style.display !== 'none') {
                this.handleKeyPress(e);
            }
        });
    }

    newGame() {
        this.steps = 0;
        this.time = 0;
        this.stopTimer();
        this.updateStats();
        this.generateMaze();
        this.findSolution();
        this.renderBoard();
        this.startTimer();
        this.showMazeMessage('Find your way to the goal! 🎯', 'info');
    }

    generateMaze() {
        // Initialize maze with walls
        this.maze = Array(this.size).fill(0).map(() => Array(this.size).fill(1));
        
        // Set start and end positions
        this.playerPos = { row: 0, col: 0 };
        this.endPos = { row: this.size - 1, col: this.size - 1 };
        
        // Generate maze using recursive backtracking
        this.carvePath(0, 0);
        
        // Ensure start and end are paths
        this.maze[0][0] = 0;
        this.maze[this.size - 1][this.size - 1] = 0;
        
        // Ensure there's a path to the goal
        this.ensurePathToGoal();
    }

    ensurePathToGoal() {
        // Check if path exists
        const visited = Array(this.size).fill(0).map(() => Array(this.size).fill(false));
        const queue = [{ row: 0, col: 0 }];
        visited[0][0] = true;
        let pathExists = false;
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.row === this.endPos.row && current.col === this.endPos.col) {
                pathExists = true;
                break;
            }
            
            const neighbors = this.getValidNeighbors(current.row, current.col);
            for (let neighbor of neighbors) {
                if (!visited[neighbor.row][neighbor.col]) {
                    visited[neighbor.row][neighbor.col] = true;
                    queue.push(neighbor);
                }
            }
        }
        
        // If no path exists, create one
        if (!pathExists) {
            let row = 0, col = 0;
            while (row < this.size - 1 || col < this.size - 1) {
                this.maze[row][col] = 0;
                
                if (row < this.size - 1 && (col === this.size - 1 || Math.random() < 0.5)) {
                    row++;
                } else if (col < this.size - 1) {
                    col++;
                }
            }
            this.maze[this.size - 1][this.size - 1] = 0;
        }
    }

    carvePath(row, col) {
        this.maze[row][col] = 0;
        
        const directions = [
            { dr: -2, dc: 0 },
            { dr: 2, dc: 0 },
            { dr: 0, dc: -2 },
            { dr: 0, dc: 2 }
        ];
        
        this.shuffleArray(directions);
        
        for (let dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            if (newRow >= 0 && newRow < this.size && 
                newCol >= 0 && newCol < this.size && 
                this.maze[newRow][newCol] === 1) {
                
                this.maze[row + dir.dr / 2][col + dir.dc / 2] = 0;
                this.carvePath(newRow, newCol);
            }
        }
    }

    findSolution() {
        const visited = Array(this.size).fill(0).map(() => Array(this.size).fill(false));
        const parent = Array(this.size).fill(0).map(() => Array(this.size).fill(null));
        const queue = [{ row: 0, col: 0 }];
        visited[0][0] = true;
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.row === this.endPos.row && current.col === this.endPos.col) {
                this.solution = this.reconstructPath(parent, current);
                return;
            }
            
            const neighbors = this.getValidNeighbors(current.row, current.col);
            for (let neighbor of neighbors) {
                if (!visited[neighbor.row][neighbor.col]) {
                    visited[neighbor.row][neighbor.col] = true;
                    parent[neighbor.row][neighbor.col] = current;
                    queue.push(neighbor);
                }
            }
        }
    }

    reconstructPath(parent, end) {
        const path = [];
        let current = end;
        
        while (current) {
            path.unshift(current);
            current = parent[current.row][current.col];
        }
        
        return path;
    }

    getValidNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 }
        ];
        
        for (let dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            if (newRow >= 0 && newRow < this.size && 
                newCol >= 0 && newCol < this.size && 
                this.maze[newRow][newCol] === 0) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }
        
        return neighbors;
    }

    renderBoard() {
        const gameBoard = document.getElementById('mazeGameBoard');
        gameBoard.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'maze-grid';
        grid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.maze[i][j] === 1) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                    cell.addEventListener('click', () => this.handleCellClick(i, j));
                }
                
                if (i === this.playerPos.row && j === this.playerPos.col) {
                    cell.classList.add('player');
                    cell.textContent = '🏃';
                }
                
                if (i === this.endPos.row && j === this.endPos.col) {
                    cell.classList.add('goal');
                    cell.textContent = '🏁';
                    cell.classList.remove('wall');
                }
                
                grid.appendChild(cell);
            }
        }

        gameBoard.appendChild(grid);
    }

    handleKeyPress(e) {
        if (document.getElementById('mazeGame').style.display === 'none') return;
        
        let newRow = this.playerPos.row;
        let newCol = this.playerPos.col;
        
        switch(e.key) {
            case 'ArrowUp': newRow--; break;
            case 'ArrowDown': newRow++; break;
            case 'ArrowLeft': newCol--; break;
            case 'ArrowRight': newCol++; break;
            default: return;
        }
        
        e.preventDefault();
        this.movePlayer(newRow, newCol);
    }

    handleCellClick(row, col) {
        const rowDiff = Math.abs(row - this.playerPos.row);
        const colDiff = Math.abs(col - this.playerPos.col);
        
        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            this.movePlayer(row, col);
        }
    }

    movePlayer(newRow, newCol) {
        if (newRow >= 0 && newRow < this.size && 
            newCol >= 0 && newCol < this.size && 
            this.maze[newRow][newCol] === 0) {
            
            this.playerPos = { row: newRow, col: newCol };
            this.steps++;
            this.updateStats();
            this.renderBoard();
            
            if (newRow === this.endPos.row && newCol === this.endPos.col) {
                this.stopTimer();
                setTimeout(() => {
                    this.showMazeMessage(`🎉 Congratulations! You reached the goal in ${this.steps} steps and ${this.time} seconds! Click "New Maze" to play again! 🎉`, 'success');
                }, 200);
            }
        }
    }

    showSolution() {
        // Clear any existing solution paths
        const cells = document.querySelectorAll('.maze-cell');
        cells.forEach(cell => {
            cell.classList.remove('solution-path');
        });
        
        // Highlight solution path
        this.solution.forEach((pos, index) => {
            // Skip start and end positions
            if (index === 0 || index === this.solution.length - 1) return;
            
            const cell = document.querySelector(`.maze-cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
            if (cell && !cell.classList.contains('player') && !cell.classList.contains('goal')) {
                setTimeout(() => {
                    cell.classList.add('solution-path');
                }, index * 50);
            }
        });
        
        // Remove solution after 5 seconds
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('solution-path');
            });
        }, 5000);
        
        this.showMazeMessage('Solution path highlighted! Follow the orange trail! ✨', 'info');
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            this.updateStats();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateStats() {
        document.getElementById('mazeSteps').textContent = this.steps;
        document.getElementById('mazeTime').textContent = `${this.time}s`;
    }

    showMazeMessage(text, className) {
        const messageDiv = document.getElementById('mazeMessage');
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
