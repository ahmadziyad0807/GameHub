class MathQuizGame {
    constructor() {
        this.operation = 'addition';
        this.difficulty = 'easy';
        this.currentQuestion = null;
        this.score = 0;
        this.totalQuestions = 0;
        this.streak = 0;
        this.isAnswering = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateQuestion();
    }

    setupEventListeners() {
        // Operation selection
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.operation-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.operation = e.target.dataset.operation;
                this.isAnswering = false;
                this.generateQuestion();
            });
        });

        // Difficulty selection
        document.querySelectorAll('.math-difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.math-difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.isAnswering = false;
                this.generateQuestion();
            });
        });

        // Answer buttons - single event delegation
        const answerContainer = document.querySelector('.answer-options');
        answerContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-btn') && !this.isAnswering) {
                this.checkAnswer(parseInt(e.target.dataset.answer));
            }
        });

        // Reset button
        const resetBtn = document.getElementById('resetMath');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset clicked');
                this.resetGame();
            });
        }
        
        // Next question button
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('Next clicked');
                this.isAnswering = false;
                this.generateQuestion();
            });
        }

        // Enter key support
        this.keyHandler = (e) => {
            if (document.getElementById('mathGame').style.display !== 'none' && !this.isAnswering) {
                if (e.key >= '1' && e.key <= '4') {
                    const index = parseInt(e.key) - 1;
                    const buttons = document.querySelectorAll('.answer-btn');
                    if (buttons[index]) {
                        this.checkAnswer(parseInt(buttons[index].dataset.answer));
                    }
                }
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    generateQuestion() {
        const ranges = {
            easy: { min: 1, max: 10 },
            medium: { min: 5, max: 20 },
            hard: { min: 10, max: 50 }
        };

        const range = ranges[this.difficulty];
        let num1, num2, num3, num4, answer, symbol;

        switch(this.operation) {
            case 'addition':
                num1 = this.randomInt(range.min, range.max);
                num2 = this.randomInt(range.min, range.max);
                answer = num1 + num2;
                symbol = '+';
                break;
            
            case 'subtraction':
                num1 = this.randomInt(range.min, range.max);
                num2 = this.randomInt(range.min, num1);
                answer = num1 - num2;
                symbol = '-';
                break;
            
            case 'multiplication':
                const multRange = this.difficulty === 'easy' ? 5 : this.difficulty === 'medium' ? 10 : 12;
                num1 = this.randomInt(1, multRange);
                num2 = this.randomInt(1, multRange);
                answer = num1 * num2;
                symbol = '×';
                break;
            
            case 'division':
                const divRange = this.difficulty === 'easy' ? 5 : this.difficulty === 'medium' ? 10 : 12;
                num2 = this.randomInt(1, divRange);
                answer = this.randomInt(1, divRange);
                num1 = num2 * answer;
                symbol = '÷';
                break;
            
            case 'four-numbers':
                const fourRange = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 15 : 20;
                num1 = this.randomInt(1, fourRange);
                num2 = this.randomInt(1, fourRange);
                num3 = this.randomInt(1, fourRange);
                num4 = this.randomInt(1, fourRange);
                answer = num1 + num2 + num3 + num4;
                symbol = '+';
                break;
        }

        this.currentQuestion = {
            num1: num1,
            num2: num2,
            num3: num3,
            num4: num4,
            answer: answer,
            symbol: symbol
        };

        this.displayQuestion();
    }

    displayQuestion() {
        const questionDiv = document.getElementById('mathQuestion');
        
        // Check if it's the four numbers operation
        if (this.operation === 'four-numbers') {
            questionDiv.innerHTML = `
                <span class="number number-color-1">${this.currentQuestion.num1}</span>
                <span class="operator">${this.currentQuestion.symbol}</span>
                <span class="number number-color-2">${this.currentQuestion.num2}</span>
                <span class="operator">${this.currentQuestion.symbol}</span>
                <span class="number number-color-3">${this.currentQuestion.num3}</span>
                <span class="operator">${this.currentQuestion.symbol}</span>
                <span class="number number-color-4">${this.currentQuestion.num4}</span>
                <span class="equals">=</span>
                <span class="question-mark">?</span>
            `;
        } else {
            questionDiv.innerHTML = `
                <span class="number number-color-1">${this.currentQuestion.num1}</span>
                <span class="operator">${this.currentQuestion.symbol}</span>
                <span class="number number-color-2">${this.currentQuestion.num2}</span>
                <span class="equals">=</span>
                <span class="question-mark">?</span>
            `;
        }

        // Generate answer options
        const correctAnswer = this.currentQuestion.answer;
        const options = [correctAnswer];

        // Generate 3 wrong answers
        while (options.length < 4) {
            let wrongAnswer;
            const offset = Math.max(1, Math.floor(correctAnswer * 0.3));
            wrongAnswer = correctAnswer + this.randomInt(-offset, offset);
            
            if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }

        // Shuffle options
        this.shuffleArray(options);

        // Display options
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach((btn, index) => {
            btn.textContent = options[index];
            btn.dataset.answer = options[index];
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
        
        // Hide next button
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    }

    checkAnswer(selectedAnswer) {
        if (this.isAnswering) return;
        this.isAnswering = true;
        
        this.totalQuestions++;
        const buttons = document.querySelectorAll('.answer-btn');
        const nextBtn = document.getElementById('nextQuestion');
        
        if (selectedAnswer === this.currentQuestion.answer) {
            this.score++;
            this.streak++;
            
            buttons.forEach(btn => {
                if (parseInt(btn.dataset.answer) === selectedAnswer) {
                    btn.classList.add('correct');
                }
                btn.disabled = true;
            });

            this.showMathMessage('✓ Correct! Great job! 🎉', 'success');
            
            if (this.streak >= 5) {
                this.showMathMessage(`🔥 Amazing! ${this.streak} in a row! 🔥`, 'success');
            }
            
            // Show next button for correct answers
            nextBtn.style.display = 'inline-block';
        } else {
            this.streak = 0;
            
            buttons.forEach(btn => {
                const answer = parseInt(btn.dataset.answer);
                if (answer === selectedAnswer) {
                    btn.classList.add('wrong');
                } else if (answer === this.currentQuestion.answer) {
                    btn.classList.add('correct');
                }
                btn.disabled = true;
            });

            this.showMathMessage(`✗ Oops! The answer was ${this.currentQuestion.answer}`, 'error-msg');
            
            // Show next button for wrong answers too
            nextBtn.style.display = 'inline-block';
        }

        this.updateMathStats();
    }

    resetGame() {
        this.score = 0;
        this.totalQuestions = 0;
        this.streak = 0;
        this.isAnswering = false;
        this.updateMathStats();
        this.generateQuestion();
        this.showMathMessage('Game reset! Start fresh! 🎯', 'info');
    }

    updateMathStats() {
        document.getElementById('mathScore').textContent = this.score;
        document.getElementById('mathTotal').textContent = this.totalQuestions;
        const percentage = this.totalQuestions > 0 ? Math.round((this.score / this.totalQuestions) * 100) : 0;
        document.getElementById('mathPercentage').textContent = `${percentage}%`;
        document.getElementById('mathStreak').textContent = this.streak;
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    showMathMessage(text, className) {
        const messageDiv = document.getElementById('mathMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }
}
