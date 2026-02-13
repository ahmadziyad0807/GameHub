class ShapeSortingGame {
    constructor() {
        this.difficulty = 'easy';
        this.shapes = [];
        this.placeholders = [];
        this.score = 0;
        this.totalShapes = 0;
        this.draggedShape = null;
        
        this.shapeTypes = {
            easy: [
                { name: 'circle', color: '#FF6B6B', svg: '<circle cx="50" cy="50" r="40"/>' },
                { name: 'square', color: '#4ECDC4', svg: '<rect x="10" y="10" width="80" height="80"/>' },
                { name: 'triangle', color: '#FFA07A', svg: '<polygon points="50,10 90,90 10,90"/>' }
            ],
            medium: [
                { name: 'circle', color: '#FF6B6B', svg: '<circle cx="50" cy="50" r="40"/>' },
                { name: 'square', color: '#4ECDC4', svg: '<rect x="10" y="10" width="80" height="80"/>' },
                { name: 'triangle', color: '#FFA07A', svg: '<polygon points="50,10 90,90 10,90"/>' },
                { name: 'star', color: '#F7DC6F', svg: '<polygon points="50,10 61,40 92,40 67,60 78,90 50,70 22,90 33,60 8,40 39,40"/>' },
                { name: 'heart', color: '#BB8FCE', svg: '<path d="M50,85 Q30,65 30,50 Q30,35 40,35 Q50,35 50,45 Q50,35 60,35 Q70,35 70,50 Q70,65 50,85"/>' }
            ],
            hard: [
                { name: 'circle', color: '#FF6B6B', svg: '<circle cx="50" cy="50" r="40"/>' },
                { name: 'square', color: '#4ECDC4', svg: '<rect x="10" y="10" width="80" height="80"/>' },
                { name: 'triangle', color: '#FFA07A', svg: '<polygon points="50,10 90,90 10,90"/>' },
                { name: 'star', color: '#F7DC6F', svg: '<polygon points="50,10 61,40 92,40 67,60 78,90 50,70 22,90 33,60 8,40 39,40"/>' },
                { name: 'heart', color: '#BB8FCE', svg: '<path d="M50,85 Q30,65 30,50 Q30,35 40,35 Q50,35 50,45 Q50,35 60,35 Q70,35 70,50 Q70,65 50,85"/>' },
                { name: 'hexagon', color: '#85C1E2', svg: '<polygon points="50,5 90,30 90,70 50,95 10,70 10,30"/>' },
                { name: 'diamond', color: '#F8B739', svg: '<polygon points="50,10 90,50 50,90 10,50"/>' }
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.shape-sorting-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.shape-sorting-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.newGame();
            });
        });

        document.getElementById('newShapeSortingGame').addEventListener('click', () => this.newGame());
        document.getElementById('shuffleShapes').addEventListener('click', () => this.shuffleShapes());
    }

    newGame() {
        this.score = 0;
        this.shapes = [];
        this.placeholders = [];
        this.generateShapes();
        this.renderGame();
        this.updateStats();
        this.showShapeSortingMessage('Drag shapes to matching placeholders! 🎯', 'info');
    }

    generateShapes() {
        const shapeSet = this.shapeTypes[this.difficulty];
        let shapeCount;
        
        if (this.difficulty === 'easy') shapeCount = 6;
        else if (this.difficulty === 'medium') shapeCount = 10;
        else shapeCount = 14;
        
        this.totalShapes = shapeCount;
        
        // Generate shapes
        for (let i = 0; i < shapeCount; i++) {
            const shapeType = shapeSet[i % shapeSet.length];
            this.shapes.push({
                id: i,
                type: shapeType.name,
                color: shapeType.color,
                svg: shapeType.svg,
                placed: false
            });
        }
        
        // Shuffle shapes
        this.shuffleArray(this.shapes);
        
        // Generate placeholders (same types as shapes)
        const placeholderTypes = [...this.shapes];
        this.shuffleArray(placeholderTypes);
        
        this.placeholders = placeholderTypes.map((shape, index) => ({
            id: index,
            type: shape.type,
            color: shape.color,
            svg: shape.svg,
            filled: false,
            shapeId: null
        }));
    }

    renderGame() {
        this.renderShapes();
        this.renderPlaceholders();
    }

    renderShapes() {
        const shapesContainer = document.getElementById('shapesContainer');
        shapesContainer.innerHTML = '<h3>Shapes</h3>';
        
        const shapesGrid = document.createElement('div');
        shapesGrid.className = 'shapes-grid';
        
        this.shapes.forEach(shape => {
            if (!shape.placed) {
                const shapeElement = this.createShapeElement(shape);
                shapesGrid.appendChild(shapeElement);
            }
        });
        
        shapesContainer.appendChild(shapesGrid);
    }

    createShapeElement(shape) {
        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'draggable-shape';
        shapeDiv.draggable = true;
        shapeDiv.dataset.shapeId = shape.id;
        shapeDiv.dataset.shapeType = shape.type;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('width', '80');
        svg.setAttribute('height', '80');
        svg.innerHTML = shape.svg;
        svg.querySelector('*').setAttribute('fill', shape.color);
        
        shapeDiv.appendChild(svg);
        
        // Drag events
        shapeDiv.addEventListener('dragstart', (e) => this.handleDragStart(e, shape));
        shapeDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));
        
        // Touch events for mobile
        shapeDiv.addEventListener('touchstart', (e) => this.handleTouchStart(e, shape));
        shapeDiv.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        shapeDiv.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        return shapeDiv;
    }

    renderPlaceholders() {
        const placeholdersContainer = document.getElementById('placeholdersContainer');
        placeholdersContainer.innerHTML = '<h3>Place Shapes Here</h3>';
        
        const placeholdersGrid = document.createElement('div');
        placeholdersGrid.className = 'placeholders-grid';
        
        this.placeholders.forEach(placeholder => {
            const placeholderElement = this.createPlaceholderElement(placeholder);
            placeholdersGrid.appendChild(placeholderElement);
        });
        
        placeholdersContainer.appendChild(placeholdersGrid);
    }

    createPlaceholderElement(placeholder) {
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'shape-placeholder';
        placeholderDiv.dataset.placeholderId = placeholder.id;
        placeholderDiv.dataset.shapeType = placeholder.type;
        
        if (placeholder.filled) {
            placeholderDiv.classList.add('filled');
            const shape = this.shapes.find(s => s.id === placeholder.shapeId);
            if (shape) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 100 100');
                svg.setAttribute('width', '80');
                svg.setAttribute('height', '80');
                svg.innerHTML = shape.svg;
                svg.querySelector('*').setAttribute('fill', shape.color);
                placeholderDiv.appendChild(svg);
            }
        } else {
            // Show outline of expected shape
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('width', '80');
            svg.setAttribute('height', '80');
            svg.innerHTML = placeholder.svg;
            svg.querySelector('*').setAttribute('fill', 'none');
            svg.querySelector('*').setAttribute('stroke', '#ddd');
            svg.querySelector('*').setAttribute('stroke-width', '3');
            svg.querySelector('*').setAttribute('stroke-dasharray', '5,5');
            placeholderDiv.appendChild(svg);
        }
        
        // Drop events
        placeholderDiv.addEventListener('dragover', (e) => this.handleDragOver(e));
        placeholderDiv.addEventListener('drop', (e) => this.handleDrop(e, placeholder));
        
        return placeholderDiv;
    }

    handleDragStart(e, shape) {
        this.draggedShape = shape;
        e.target.style.opacity = '0.5';
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDrop(e, placeholder) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (!this.draggedShape || placeholder.filled) return;
        
        // Check if shape matches placeholder
        if (this.draggedShape.type === placeholder.type) {
            placeholder.filled = true;
            placeholder.shapeId = this.draggedShape.id;
            this.draggedShape.placed = true;
            this.score++;
            
            this.renderGame();
            this.updateStats();
            
            if (this.score === this.totalShapes) {
                setTimeout(() => {
                    this.showShapeSortingMessage('🎉 Perfect! All shapes sorted correctly! 🎉', 'success');
                }, 500);
            } else {
                this.showShapeSortingMessage('✓ Correct! Keep going! 🎯', 'success');
            }
        } else {
            this.showShapeSortingMessage('❌ Wrong shape! Try again!', 'error-msg');
            // Shake animation
            e.currentTarget.classList.add('shake');
            setTimeout(() => e.currentTarget.classList.remove('shake'), 500);
        }
        
        this.draggedShape = null;
    }

    // Touch support for mobile
    handleTouchStart(e, shape) {
        this.draggedShape = shape;
        const touch = e.touches[0];
        const element = e.currentTarget;
        
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.opacity = '0.8';
        
        this.moveTouchElement(element, touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = e.currentTarget;
        
        this.moveTouchElement(element, touch.clientX, touch.clientY);
    }

    handleTouchEnd(e) {
        const element = e.currentTarget;
        const touch = e.changedTouches[0];
        
        // Find placeholder under touch point
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const placeholderElement = targetElement?.closest('.shape-placeholder');
        
        if (placeholderElement) {
            const placeholderId = parseInt(placeholderElement.dataset.placeholderId);
            const placeholder = this.placeholders.find(p => p.id === placeholderId);
            
            if (placeholder && !placeholder.filled && this.draggedShape.type === placeholder.type) {
                placeholder.filled = true;
                placeholder.shapeId = this.draggedShape.id;
                this.draggedShape.placed = true;
                this.score++;
                
                this.renderGame();
                this.updateStats();
                
                if (this.score === this.totalShapes) {
                    setTimeout(() => {
                        this.showShapeSortingMessage('🎉 Perfect! All shapes sorted correctly! 🎉', 'success');
                    }, 500);
                } else {
                    this.showShapeSortingMessage('✓ Correct! Keep going! 🎯', 'success');
                }
            } else {
                this.showShapeSortingMessage('❌ Wrong shape! Try again!', 'error-msg');
            }
        }
        
        // Reset element
        element.style.position = '';
        element.style.zIndex = '';
        element.style.opacity = '';
        element.style.left = '';
        element.style.top = '';
        
        this.draggedShape = null;
    }

    moveTouchElement(element, x, y) {
        element.style.left = (x - 40) + 'px';
        element.style.top = (y - 40) + 'px';
    }

    shuffleShapes() {
        // Remove placed shapes and shuffle remaining
        this.shapes.forEach(shape => shape.placed = false);
        this.placeholders.forEach(placeholder => {
            placeholder.filled = false;
            placeholder.shapeId = null;
        });
        
        this.score = 0;
        this.shuffleArray(this.shapes);
        this.renderGame();
        this.updateStats();
        this.showShapeSortingMessage('Shapes shuffled! Start again! 🔄', 'info');
    }

    updateStats() {
        document.getElementById('shapesSortedCount').textContent = `${this.score} / ${this.totalShapes}`;
        const percentage = this.totalShapes > 0 ? Math.round((this.score / this.totalShapes) * 100) : 0;
        document.getElementById('sortingProgress').textContent = `${percentage}%`;
    }

    showShapeSortingMessage(text, className) {
        const messageDiv = document.getElementById('shapeSortingMessage');
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
