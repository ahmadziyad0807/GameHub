class HelicopterGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.helicopter = null;
        this.obstacles = [];
        this.score = 0;
        this.highScore = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.difficulty = 'easy';
        this.animationId = null;
        this.lastObstacleTime = 0;
        this.obstacleInterval = 2000;
        this.gameSpeed = 3;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadHighScore();
        this.showStartScreen();
    }

    setupCanvas() {
        this.canvas = document.getElementById('helicopterCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 400;
    }

    setupEventListeners() {
        document.querySelectorAll('.helicopter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.helicopter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                
                if (this.difficulty === 'easy') {
                    this.obstacleInterval = 2500;
                    this.gameSpeed = 3;
                } else if (this.difficulty === 'medium') {
                    this.obstacleInterval = 2000;
                    this.gameSpeed = 4;
                } else if (this.difficulty === 'hard') {
                    this.obstacleInterval = 1500;
                    this.gameSpeed = 5;
                }
                
                if (!this.gameRunning) {
                    this.showStartScreen();
                }
            });
        });

        document.getElementById('startHelicopterGame').addEventListener('click', () => this.startGame());
        
        // Mouse/Touch controls
        this.canvas.addEventListener('mousedown', () => this.helicopterUp());
        this.canvas.addEventListener('mouseup', () => this.helicopterDown());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.helicopterUp();
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.helicopterDown();
        });
        
        // Keyboard controls
        this.keyDownHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.helicopterUp();
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.helicopterDown();
            }
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.lastObstacleTime = Date.now();
        
        // Initialize helicopter
        this.helicopter = {
            x: 100,
            y: this.canvas.height / 2,
            width: 60,
            height: 30,
            velocity: 0,
            gravity: 0.3,
            lift: -6,
            isLifting: false
        };
        
        this.updateStats();
        this.gameLoop();
        this.showHelicopterMessage('Hold to fly up! Release to fall! 🚁', 'info');
    }

    helicopterUp() {
        if (this.gameRunning && !this.gameOver) {
            this.helicopter.isLifting = true;
        }
    }

    helicopterDown() {
        if (this.gameRunning && !this.gameOver) {
            this.helicopter.isLifting = false;
        }
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        if (!this.gameOver) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        } else {
            this.endGame();
        }
    }

    update() {
        if (this.gameOver) return;
        
        // Update helicopter physics
        if (this.helicopter.isLifting) {
            this.helicopter.velocity = this.helicopter.lift;
        } else {
            this.helicopter.velocity += this.helicopter.gravity;
        }
        
        this.helicopter.y += this.helicopter.velocity;
        
        // Check boundaries
        if (this.helicopter.y < 0) {
            this.helicopter.y = 0;
            this.helicopter.velocity = 0;
        }
        
        if (this.helicopter.y + this.helicopter.height > this.canvas.height) {
            this.gameOver = true;
            return;
        }
        
        // Generate obstacles
        const currentTime = Date.now();
        if (currentTime - this.lastObstacleTime > this.obstacleInterval) {
            this.createObstacle();
            this.lastObstacleTime = currentTime;
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                this.updateStats();
                continue;
            }
            
            // Check collision
            if (this.checkCollision(this.helicopter, obstacle)) {
                this.gameOver = true;
                return;
            }
        }
    }

    createObstacle() {
        const minGap = 150;
        const maxGap = 200;
        const gap = minGap + Math.random() * (maxGap - minGap);
        
        const minHeight = 50;
        const maxHeight = this.canvas.height - gap - 50;
        const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
        
        this.obstacles.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + gap,
            bottomHeight: this.canvas.height - (topHeight + gap),
            width: 50,
            passed: false
        });
    }

    checkCollision(heli, obstacle) {
        // Check if helicopter is in the x-range of obstacle
        if (heli.x + heli.width > obstacle.x && heli.x < obstacle.x + obstacle.width) {
            // Check if helicopter hits top or bottom obstacle
            if (heli.y < obstacle.topHeight || heli.y + heli.height > obstacle.bottomY) {
                return true;
            }
        }
        return false;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw ground line
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle);
        });
        
        // Draw helicopter
        this.drawHelicopter();
        
        // Draw score
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    }

    drawHelicopter() {
        const heli = this.helicopter;
        
        // Helicopter body
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(heli.x, heli.y + 10, 50, 15);
        
        // Cockpit
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.beginPath();
        this.ctx.arc(heli.x + 15, heli.y + 17, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tail
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(heli.x + 45, heli.y + 15, 15, 5);
        
        // Tail rotor
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(heli.x + 58, heli.y + 12, 2, 10);
        
        // Main rotor
        const rotorY = heli.y + 5;
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(heli.x + 10, rotorY);
        this.ctx.lineTo(heli.x + 40, rotorY);
        this.ctx.stroke();
        
        // Rotor support
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(heli.x + 23, heli.y + 5, 4, 8);
        
        // Landing skids
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(heli.x + 10, heli.y + 25);
        this.ctx.lineTo(heli.x + 10, heli.y + 30);
        this.ctx.lineTo(heli.x + 40, heli.y + 30);
        this.ctx.lineTo(heli.x + 40, heli.y + 25);
        this.ctx.stroke();
    }

    drawObstacle(obstacle) {
        // Top obstacle
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
        
        // Top obstacle cap
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(obstacle.x - 5, obstacle.topHeight - 20, obstacle.width + 10, 20);
        
        // Bottom obstacle
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(obstacle.x, obstacle.bottomY, obstacle.width, obstacle.bottomHeight);
        
        // Bottom obstacle cap
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(obstacle.x - 5, obstacle.bottomY, obstacle.width + 10, 20);
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Static clouds for decoration
        const clouds = [
            { x: 100, y: 50 },
            { x: 300, y: 80 },
            { x: 500, y: 40 },
            { x: 700, y: 70 }
        ];
        
        clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 25, cloud.y, 25, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    showStartScreen() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawClouds();
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Helicopter Game', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Click "Start Game" to begin!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Hold mouse/space to fly up', this.canvas.width / 2, this.canvas.height / 2 + 60);
        this.ctx.fillText('Release to fall down', this.canvas.width / 2, this.canvas.height / 2 + 90);
        
        if (this.highScore > 0) {
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 130);
        }
        
        this.ctx.textAlign = 'left';
    }

    endGame() {
        this.gameRunning = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showHelicopterMessage(`🎉 New High Score: ${this.highScore}! 🎉`, 'success');
        } else {
            this.showHelicopterMessage(`💥 Game Over! Score: ${this.score}. Try again! 💥`, 'error-msg');
        }
        
        this.updateStats();
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '32px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Click "Start Game" to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
        
        this.ctx.textAlign = 'left';
    }

    updateStats() {
        document.getElementById('helicopterScore').textContent = this.score;
        document.getElementById('helicopterHighScore').textContent = this.highScore;
    }

    saveHighScore() {
        localStorage.setItem('helicopterHighScore', this.highScore);
    }

    loadHighScore() {
        const saved = localStorage.getItem('helicopterHighScore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
        this.updateStats();
    }

    showHelicopterMessage(text, className) {
        const messageDiv = document.getElementById('helicopterMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }
}
