class DinosaurGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.dinosaur = null;
        this.obstacles = [];
        this.clouds = [];
        this.score = 0;
        this.highScore = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.difficulty = 'easy';
        this.animationId = null;
        this.gameSpeed = 5;
        this.obstacleTimer = 0;
        this.cloudTimer = 0;
        this.frameCount = 0;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadHighScore();
        this.showStartScreen();
    }

    setupCanvas() {
        this.canvas = document.getElementById('dinosaurCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 300;
    }

    setupEventListeners() {
        document.querySelectorAll('.dinosaur-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.dinosaur-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                
                if (this.difficulty === 'easy') {
                    this.gameSpeed = 5;
                } else if (this.difficulty === 'medium') {
                    this.gameSpeed = 7;
                } else if (this.difficulty === 'hard') {
                    this.gameSpeed = 9;
                }
                
                if (!this.gameRunning) {
                    this.showStartScreen();
                }
            });
        });

        document.getElementById('startDinosaurGame').addEventListener('click', () => this.startGame());
        
        // Jump controls
        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        // Keyboard controls
        this.keyDownHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            } else if (e.code === 'ArrowDown' && this.gameRunning) {
                e.preventDefault();
                this.duck();
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.code === 'ArrowDown' && this.gameRunning) {
                e.preventDefault();
                this.standUp();
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
        this.clouds = [];
        this.obstacleTimer = 0;
        this.cloudTimer = 0;
        this.frameCount = 0;
        
        // Initialize dinosaur
        this.dinosaur = {
            x: 50,
            y: 200,
            width: 44,
            height: 47,
            velocityY: 0,
            gravity: 0.6,
            jumpPower: -12,
            isJumping: false,
            isDucking: false,
            groundY: 200
        };
        
        // Create initial clouds
        for (let i = 0; i < 3; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: 30 + Math.random() * 50,
                width: 46,
                height: 14
            });
        }
        
        this.updateStats();
        this.gameLoop();
        this.showDinosaurMessage('Jump to avoid obstacles! 🦖', 'info');
    }

    jump() {
        if (this.gameRunning && !this.gameOver && !this.dinosaur.isJumping && !this.dinosaur.isDucking) {
            this.dinosaur.isJumping = true;
            this.dinosaur.velocityY = this.dinosaur.jumpPower;
        } else if (!this.gameRunning && this.gameOver) {
            this.startGame();
        }
    }

    duck() {
        if (!this.dinosaur.isJumping) {
            this.dinosaur.isDucking = true;
            this.dinosaur.height = 30;
            this.dinosaur.y = this.dinosaur.groundY + 17;
        }
    }

    standUp() {
        this.dinosaur.isDucking = false;
        this.dinosaur.height = 47;
        this.dinosaur.y = this.dinosaur.groundY;
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
        
        this.frameCount++;
        
        // Update dinosaur physics
        if (this.dinosaur.isJumping) {
            this.dinosaur.velocityY += this.dinosaur.gravity;
            this.dinosaur.y += this.dinosaur.velocityY;
            
            // Land on ground
            if (this.dinosaur.y >= this.dinosaur.groundY) {
                this.dinosaur.y = this.dinosaur.groundY;
                this.dinosaur.velocityY = 0;
                this.dinosaur.isJumping = false;
            }
        }
        
        // Generate obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer > 100 - (this.gameSpeed * 5)) {
            this.createObstacle();
            this.obstacleTimer = 0;
        }
        
        // Generate clouds
        this.cloudTimer++;
        if (this.cloudTimer > 200) {
            this.clouds.push({
                x: this.canvas.width,
                y: 30 + Math.random() * 50,
                width: 46,
                height: 14
            });
            this.cloudTimer = 0;
        }
        
        // Update clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            this.clouds[i].x -= 2;
            
            if (this.clouds[i].x + this.clouds[i].width < 0) {
                this.clouds.splice(i, 1);
            }
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
                this.updateStats();
                continue;
            }
            
            // Check collision
            if (this.checkCollision(this.dinosaur, obstacle)) {
                this.gameOver = true;
                return;
            }
        }
        
        // Increase score over time
        if (this.frameCount % 10 === 0) {
            this.score++;
            this.updateStats();
        }
    }

    createObstacle() {
        const types = ['cactus', 'rock', 'bird'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle = {
            x: this.canvas.width,
            type: type
        };
        
        if (type === 'cactus') {
            obstacle.width = 20;
            obstacle.height = 40;
            obstacle.y = 207;
        } else if (type === 'rock') {
            obstacle.width = 30;
            obstacle.height = 25;
            obstacle.y = 222;
        } else if (type === 'bird') {
            obstacle.width = 42;
            obstacle.height = 30;
            obstacle.y = 150 + Math.random() * 50;
        }
        
        this.obstacles.push(obstacle);
    }

    checkCollision(dino, obstacle) {
        return (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        );
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f7f7f7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.clouds.forEach(cloud => {
            this.drawCloud(cloud);
        });
        
        // Draw ground
        this.ctx.strokeStyle = '#535353';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 247);
        this.ctx.lineTo(this.canvas.width, 247);
        this.ctx.stroke();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle);
        });
        
        // Draw dinosaur
        this.drawDinosaur();
        
        // Draw score
        this.ctx.fillStyle = '#535353';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`HI ${this.highScore.toString().padStart(5, '0')} ${this.score.toString().padStart(5, '0')}`, this.canvas.width - 20, 30);
        this.ctx.textAlign = 'left';
    }

    drawDinosaur() {
        const dino = this.dinosaur;
        
        this.ctx.fillStyle = '#535353';
        
        if (dino.isDucking) {
            // Ducking dinosaur (simplified)
            // Body
            this.ctx.fillRect(dino.x + 10, dino.y, 34, 20);
            // Head
            this.ctx.fillRect(dino.x, dino.y, 20, 15);
            // Eye
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(dino.x + 5, dino.y + 3, 4, 4);
            // Tail
            this.ctx.fillStyle = '#535353';
            this.ctx.fillRect(dino.x + 40, dino.y + 5, 10, 10);
        } else {
            // Body
            this.ctx.fillRect(dino.x + 10, dino.y, 24, 27);
            // Head
            this.ctx.fillRect(dino.x, dino.y, 20, 20);
            // Eye
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(dino.x + 5, dino.y + 5, 4, 4);
            // Mouth
            this.ctx.fillStyle = '#535353';
            this.ctx.fillRect(dino.x + 2, dino.y + 12, 8, 3);
            // Legs
            const legOffset = Math.floor(this.frameCount / 5) % 2 === 0 ? 0 : 4;
            this.ctx.fillRect(dino.x + 12, dino.y + 27, 6, 20);
            this.ctx.fillRect(dino.x + 22 + legOffset, dino.y + 27, 6, 20);
            // Tail
            this.ctx.fillRect(dino.x + 30, dino.y + 5, 14, 15);
        }
    }

    drawObstacle(obstacle) {
        this.ctx.fillStyle = '#535353';
        
        if (obstacle.type === 'cactus') {
            // Main body
            this.ctx.fillRect(obstacle.x + 5, obstacle.y, 10, 40);
            // Left arm
            this.ctx.fillRect(obstacle.x, obstacle.y + 10, 8, 15);
            // Right arm
            this.ctx.fillRect(obstacle.x + 12, obstacle.y + 15, 8, 12);
        } else if (obstacle.type === 'rock') {
            // Rock shape
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
            this.ctx.lineTo(obstacle.x + 5, obstacle.y);
            this.ctx.lineTo(obstacle.x + 15, obstacle.y + 5);
            this.ctx.lineTo(obstacle.x + 25, obstacle.y);
            this.ctx.lineTo(obstacle.x + 30, obstacle.y + obstacle.height);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (obstacle.type === 'bird') {
            // Bird body
            this.ctx.fillRect(obstacle.x + 10, obstacle.y + 10, 22, 12);
            // Head
            this.ctx.fillRect(obstacle.x, obstacle.y + 8, 15, 10);
            // Eye
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(obstacle.x + 3, obstacle.y + 10, 3, 3);
            // Wings (animated)
            this.ctx.fillStyle = '#535353';
            const wingY = Math.floor(this.frameCount / 5) % 2 === 0 ? obstacle.y : obstacle.y + 5;
            this.ctx.fillRect(obstacle.x + 15, wingY, 20, 8);
            this.ctx.fillRect(obstacle.x + 15, obstacle.y + 20, 20, 8);
        }
    }

    drawCloud(cloud) {
        this.ctx.fillStyle = '#c4c4c4';
        
        // Cloud shape
        this.ctx.beginPath();
        this.ctx.arc(cloud.x + 10, cloud.y + 7, 7, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + 20, cloud.y + 5, 8, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + 30, cloud.y + 7, 7, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillRect(cloud.x + 10, cloud.y + 7, 20, 7);
    }

    showStartScreen() {
        this.ctx.fillStyle = '#f7f7f7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.strokeStyle = '#535353';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 247);
        this.ctx.lineTo(this.canvas.width, 247);
        this.ctx.stroke();
        
        // Draw static dinosaur
        this.dinosaur = {
            x: 50,
            y: 200,
            width: 44,
            height: 47,
            isDucking: false
        };
        this.drawDinosaur();
        
        this.ctx.fillStyle = '#535353';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Dinosaur Runner', this.canvas.width / 2, 80);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click "Start Game" to begin!', this.canvas.width / 2, 120);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press SPACE or Click to Jump', this.canvas.width / 2, 150);
        this.ctx.fillText('Press DOWN to Duck', this.canvas.width / 2, 175);
        
        if (this.highScore > 0) {
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, 210);
        }
        
        this.ctx.textAlign = 'left';
    }

    endGame() {
        this.gameRunning = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showDinosaurMessage(`🎉 New High Score: ${this.highScore}! 🎉`, 'success');
        } else {
            this.showDinosaurMessage(`💥 Game Over! Score: ${this.score}. Click to restart! 💥`, 'error-msg');
        }
        
        this.updateStats();
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click or Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.textAlign = 'left';
    }

    updateStats() {
        document.getElementById('dinosaurScore').textContent = this.score;
        document.getElementById('dinosaurHighScore').textContent = this.highScore;
    }

    saveHighScore() {
        localStorage.setItem('dinosaurHighScore', this.highScore);
    }

    loadHighScore() {
        const saved = localStorage.getItem('dinosaurHighScore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
        this.updateStats();
    }

    showDinosaurMessage(text, className) {
        const messageDiv = document.getElementById('dinosaurMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }
}
