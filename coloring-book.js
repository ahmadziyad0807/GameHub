class ColoringBookGame {
    constructor() {
        this.currentColor = '#FF6B6B';
        this.currentImage = 0;
        this.images = [
            // Butterfly
            {
                name: 'Butterfly',
                shapes: [
                    { type: 'ellipse', cx: 35, cy: 40, rx: 12, ry: 18 },
                    { type: 'ellipse', cx: 65, cy: 40, rx: 12, ry: 18 },
                    { type: 'ellipse', cx: 35, cy: 65, rx: 10, ry: 15 },
                    { type: 'ellipse', cx: 65, cy: 65, rx: 10, ry: 15 },
                    { type: 'rect', x: 48, y: 30, width: 4, height: 50 },
                    { type: 'circle', cx: 50, cy: 25, r: 4 }
                ]
            },
            // Flower
            {
                name: 'Flower',
                shapes: [
                    { type: 'circle', cx: 50, cy: 40, r: 8 },
                    { type: 'ellipse', cx: 50, cy: 25, rx: 6, ry: 10 },
                    { type: 'ellipse', cx: 65, cy: 35, rx: 6, ry: 10, transform: 'rotate(45 65 35)' },
                    { type: 'ellipse', cx: 65, cy: 50, rx: 6, ry: 10, transform: 'rotate(90 65 50)' },
                    { type: 'ellipse', cx: 50, cy: 60, rx: 6, ry: 10 },
                    { type: 'ellipse', cx: 35, cy: 50, rx: 6, ry: 10, transform: 'rotate(90 35 50)' },
                    { type: 'ellipse', cx: 35, cy: 35, rx: 6, ry: 10, transform: 'rotate(-45 35 35)' },
                    { type: 'rect', x: 48, y: 60, width: 4, height: 30 },
                    { type: 'ellipse', cx: 40, cy: 75, rx: 8, ry: 4, transform: 'rotate(-30 40 75)' }
                ]
            },
            // House
            {
                name: 'House',
                shapes: [
                    { type: 'polygon', points: '30,50 50,30 70,50' },
                    { type: 'rect', x: 30, y: 50, width: 40, height: 35 },
                    { type: 'rect', x: 40, y: 60, width: 10, height: 25 },
                    { type: 'rect', x: 55, y: 60, width: 10, height: 10 }
                ]
            },
            // Star
            {
                name: 'Star',
                shapes: [
                    { type: 'polygon', points: '50,20 55,40 75,40 60,52 65,72 50,60 35,72 40,52 25,40 45,40' }
                ]
            },
            // Heart
            {
                name: 'Heart',
                shapes: [
                    { type: 'path', d: 'M50,75 Q30,55 30,40 Q30,25 40,25 Q50,25 50,35 Q50,25 60,25 Q70,25 70,40 Q70,55 50,75' }
                ]
            },
            // Tree
            {
                name: 'Tree',
                shapes: [
                    { type: 'rect', x: 45, y: 70, width: 10, height: 20 },
                    { type: 'circle', cx: 50, cy: 50, r: 20 },
                    { type: 'circle', cx: 40, cy: 45, r: 12 },
                    { type: 'circle', cx: 60, cy: 45, r: 12 }
                ]
            },
            // Sun
            {
                name: 'Sun',
                shapes: [
                    { type: 'circle', cx: 50, cy: 50, r: 15 },
                    { type: 'rect', x: 48, y: 20, width: 4, height: 10 },
                    { type: 'rect', x: 48, y: 70, width: 4, height: 10 },
                    { type: 'rect', x: 20, y: 48, width: 10, height: 4 },
                    { type: 'rect', x: 70, y: 48, width: 10, height: 4 },
                    { type: 'rect', x: 28, y: 28, width: 4, height: 8, transform: 'rotate(-45 30 32)' },
                    { type: 'rect', x: 68, y: 68, width: 4, height: 8, transform: 'rotate(-45 70 72)' },
                    { type: 'rect', x: 28, y: 68, width: 4, height: 8, transform: 'rotate(45 30 72)' },
                    { type: 'rect', x: 68, y: 28, width: 4, height: 8, transform: 'rotate(45 70 32)' }
                ]
            },
            // Fish
            {
                name: 'Fish',
                shapes: [
                    { type: 'ellipse', cx: 45, cy: 50, rx: 20, ry: 12 },
                    { type: 'polygon', points: '65,50 80,45 80,55' },
                    { type: 'circle', cx: 35, cy: 48, r: 2 },
                    { type: 'path', d: 'M45,45 Q50,50 45,55' }
                ]
            },
            // Cat
            {
                name: 'Cat',
                shapes: [
                    { type: 'circle', cx: 50, cy: 50, r: 18 },
                    { type: 'polygon', points: '35,35 30,20 40,30' },
                    { type: 'polygon', points: '65,35 70,20 60,30' },
                    { type: 'circle', cx: 43, cy: 48, r: 3 },
                    { type: 'circle', cx: 57, cy: 48, r: 3 },
                    { type: 'ellipse', cx: 50, cy: 55, rx: 4, ry: 3 },
                    { type: 'path', d: 'M50,58 Q45,62 40,60' },
                    { type: 'path', d: 'M50,58 Q55,62 60,60' }
                ]
            },
            // Car
            {
                name: 'Car',
                shapes: [
                    { type: 'rect', x: 25, y: 55, width: 50, height: 15, rx: 3 },
                    { type: 'rect', x: 35, y: 45, width: 30, height: 10, rx: 2 },
                    { type: 'circle', cx: 35, cy: 72, r: 6 },
                    { type: 'circle', cx: 65, cy: 72, r: 6 },
                    { type: 'rect', x: 38, y: 47, width: 10, height: 6 },
                    { type: 'rect', x: 52, y: 47, width: 10, height: 6 }
                ]
            }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadImage();
    }

    setupEventListeners() {
        // Color palette
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
                       '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#EC7063',
                       '#48C9B0', '#F4D03F', '#AF7AC5', '#5DADE2', '#58D68D',
                       '#000000', '#FFFFFF', '#8B4513'];
        
        const palette = document.getElementById('colorPalette');
        palette.innerHTML = '';
        
        colors.forEach(color => {
            const colorBtn = document.createElement('div');
            colorBtn.className = 'color-btn';
            colorBtn.style.background = color;
            if (color === this.currentColor) {
                colorBtn.classList.add('active');
            }
            colorBtn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
                colorBtn.classList.add('active');
                this.currentColor = color;
            });
            palette.appendChild(colorBtn);
        });

        // Image selection
        document.getElementById('prevImage').addEventListener('click', () => this.changeImage(-1));
        document.getElementById('nextImage').addEventListener('click', () => this.changeImage(1));
        document.getElementById('clearColors').addEventListener('click', () => this.clearColors());
        document.getElementById('downloadImage').addEventListener('click', () => this.downloadImage());
    }

    loadImage() {
        const svg = document.getElementById('coloringSvg');
        svg.innerHTML = '';
        
        const image = this.images[this.currentImage];
        document.getElementById('imageName').textContent = image.name;
        
        image.shapes.forEach((shapeData, index) => {
            let shape;
            
            if (shapeData.type === 'circle') {
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                shape.setAttribute('cx', shapeData.cx);
                shape.setAttribute('cy', shapeData.cy);
                shape.setAttribute('r', shapeData.r);
            } else if (shapeData.type === 'ellipse') {
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                shape.setAttribute('cx', shapeData.cx);
                shape.setAttribute('cy', shapeData.cy);
                shape.setAttribute('rx', shapeData.rx);
                shape.setAttribute('ry', shapeData.ry);
            } else if (shapeData.type === 'rect') {
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', shapeData.x);
                shape.setAttribute('y', shapeData.y);
                shape.setAttribute('width', shapeData.width);
                shape.setAttribute('height', shapeData.height);
                if (shapeData.rx) shape.setAttribute('rx', shapeData.rx);
            } else if (shapeData.type === 'polygon') {
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                shape.setAttribute('points', shapeData.points);
            } else if (shapeData.type === 'path') {
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                shape.setAttribute('d', shapeData.d);
            }
            
            if (shape) {
                shape.setAttribute('fill', 'white');
                shape.setAttribute('stroke', '#333');
                shape.setAttribute('stroke-width', '2');
                if (shapeData.transform) {
                    shape.setAttribute('transform', shapeData.transform);
                }
                shape.style.cursor = 'pointer';
                shape.dataset.originalFill = 'white';
                
                shape.addEventListener('click', (e) => {
                    e.stopPropagation();
                    shape.setAttribute('fill', this.currentColor);
                    shape.dataset.originalFill = this.currentColor;
                });
                
                svg.appendChild(shape);
            }
        });
        
        this.showColoringMessage(`Color the ${image.name}! 🎨`, 'info');
    }

    changeImage(direction) {
        this.currentImage += direction;
        if (this.currentImage < 0) {
            this.currentImage = this.images.length - 1;
        } else if (this.currentImage >= this.images.length) {
            this.currentImage = 0;
        }
        this.loadImage();
    }

    clearColors() {
        const shapes = document.querySelectorAll('#coloringSvg > *');
        shapes.forEach(shape => {
            shape.setAttribute('fill', 'white');
            shape.dataset.originalFill = 'white';
        });
        this.showColoringMessage('Canvas cleared! Start fresh! 🎨', 'info');
    }

    downloadImage() {
        const svg = document.getElementById('coloringSvg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 400;
        canvas.height = 400;
        
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement('a');
            link.download = `coloring-${this.images[this.currentImage].name}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            this.showColoringMessage('Image downloaded! 📥', 'success');
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    showColoringMessage(text, className) {
        const messageDiv = document.getElementById('coloringMessage');
        messageDiv.textContent = text;
        messageDiv.className = className;
    }
}
