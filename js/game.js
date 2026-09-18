class PacmanGame {
    constructor() {
        this.rowCount = 21;
        this.columnCount = 19;
        this.tileSize = 32;
        this.boardWidth = this.columnCount * this.tileSize;
        this.boardHeight = this.rowCount * this.tileSize;

        this.board = null;
        this.context = null;

        this.tileMap = [
            "XXXXXXXXXXXXXXXXXXX",
            "X        X        X",
            "X XX XXX X XXX XX X",
            "X                 X",
            "X XX X XXXXX X XX X",
            "X    X       X    X",
            "XXXX XXXX XXXX XXXX",
            "OOOX X       X XOOO",
            "XXXX X XXrXX X XXXX",
            "O       bpo       O",
            "XXXX X XXXXX X XXXX",
            "OOOX X       X XOOO",
            "XXXX X XXXXX X XXXX",
            "X        X        X",
            "X XX XXX X XXX XX X",
            "X  X     P     X  X",
            "XX X X XXXXX X X XX",
            "X    X   X   X    X",
            "X XXXXXX X XXXXXX X",
            "X                 X",
            "XXXXXXXXXXXXXXXXXXX" 
        ];

        this.walls = new Set();
        this.foods = new Set();
        this.powerPills = new Set();
        this.ghosts = new Set();
        this.pacman = null;

        this.directions = ['U', 'D', 'L', 'R'];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('pacman_highscore')) || 0;
        this.lives = 3;
        this.gameOver = false;
        this.scaredTimer = 0;
        this.nextDirection = 'R';

        // Countdown State
        this.isCountingDown = false;
        this.countdownText = "3";
        this.countdownInterval = null;

        this.images = {};
    }

    init(boardElement) {
        this.board = boardElement;
        this.board.height = this.boardHeight;
        this.board.width = this.boardWidth;
        this.context = this.board.getContext("2d");

        this.loadImages(() => {
            this.loadMap();
            this.startCountdown();
            this.update();
        });

        document.addEventListener("keydown", (e) => this.handleKeyPress(e));
    }

    startCountdown(onComplete) {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        this.isCountingDown = true;
        audioManager.play('ready');

        let step = 0;
        const steps = ["READY!", "3", "2", "1", "GO!"];
        this.countdownText = steps[0];

        this.countdownInterval = setInterval(() => {
            step++;
            if (step < steps.length) {
                this.countdownText = steps[step];
            } else {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.isCountingDown = false;
                if (onComplete) onComplete();
            }
        }, 700);
    }

    loadImages(callback) {
        const sources = {
            wall: "./img/wall.png",
            blueGhost: "./img/blueGhost.png",
            orangeGhost: "./img/orangeGhost.png",
            pinkGhost: "./img/pinkGhost.png",
            redGhost: "./img/redGhost.png",
            scaredGhost: "./img/scaredGhost.png",
            pacmanUp: "./img/pacmanUp.png",
            pacmanDown: "./img/pacmanDown.png",
            pacmanLeft: "./img/pacmanLeft.png",
            pacmanRight: "./img/pacmanRight.png",
            cherry: "./img/cherry.png"
        };

        let loadedCount = 0;
        const total = Object.keys(sources).length;

        for (let key in sources) {
            this.images[key] = new Image();
            this.images[key].src = sources[key];
            this.images[key].onload = () => {
                loadedCount++;
                if (loadedCount === total && callback) {
                    callback();
                }
            };
        }
    }

    loadMap() {
        this.walls.clear();
        this.foods.clear();
        this.powerPills.clear();
        this.ghosts.clear();

        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.columnCount; c++) {
                const row = this.tileMap[r];
                const char = row[c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                if (char === 'X') {
                    this.walls.add(new Block(this.images.wall, x, y, this.tileSize, this.tileSize));
                } else if (char === 'b') {
                    const ghost = new Block(this.images.blueGhost, x, y, this.tileSize, this.tileSize);
                    ghost.originalImage = this.images.blueGhost;
                    this.ghosts.add(ghost);
                } else if (char === 'o') {
                    const ghost = new Block(this.images.orangeGhost, x, y, this.tileSize, this.tileSize);
                    ghost.originalImage = this.images.orangeGhost;
                    this.ghosts.add(ghost);
                } else if (char === 'p') {
                    const ghost = new Block(this.images.pinkGhost, x, y, this.tileSize, this.tileSize);
                    ghost.originalImage = this.images.pinkGhost;
                    this.ghosts.add(ghost);
                } else if (char === 'r') {
                    const ghost = new Block(this.images.redGhost, x, y, this.tileSize, this.tileSize);
                    ghost.originalImage = this.images.redGhost;
                    this.ghosts.add(ghost);
                } else if (char === 'P') {
                    this.pacman = new Block(this.images.pacmanRight, x, y, this.tileSize, this.tileSize);
                    this.nextDirection = 'R';
                } else if (char === ' ') {
                    if ((r === 3 && c === 1) || (r === 3 && c === 17) || (r === 17 && c === 1) || (r === 17 && c === 17)) {
                        this.powerPills.add(new Block(this.images.cherry, x + 8, y + 8, 16, 16));
                    } else {
                        this.foods.add(new Block(null, x + 14, y + 14, 4, 4));
                    }
                }
            }
        }
    }

    update() {
        if (this.gameOver) {
            this.draw();
            return;
        }

        if (this.isCountingDown) {
            this.draw();
            setTimeout(() => this.update(), 50);
            return;
        }

        if (this.scaredTimer > 0) {
            this.scaredTimer--;
            if (this.scaredTimer === 0) {
                audioManager.stop('waza');
                audioManager.loop('siren');
                for (let ghost of this.ghosts.values()) {
                    ghost.image = ghost.originalImage;
                    ghost.isScared = false;
                }
            }
        }

        this.move();
        this.draw();

        setTimeout(() => this.update(), 50); // 20 FPS
    }

    draw() {
        this.context.clearRect(0, 0, this.board.width, this.board.height);

        // Draw Walls
        for (let wall of this.walls.values()) {
            this.context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
        }

        // Draw Food Pellets (Dots)
        this.context.fillStyle = "#ffb8ae";
        for (let food of this.foods.values()) {
            this.context.fillRect(food.x, food.y, food.width, food.height);
        }

        // Draw Power Pills (Cherries)
        for (let pill of this.powerPills.values()) {
            this.context.drawImage(pill.image, pill.x, pill.y, pill.width, pill.height);
        }

        // Draw Pacman
        if (this.pacman) {
            this.context.drawImage(this.pacman.image, this.pacman.x, this.pacman.y, this.pacman.width, this.pacman.height);
        }

        // Draw Ghosts
        for (let ghost of this.ghosts.values()) {
            this.context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
        }

        // Draw Score UI Bar
        this.context.fillStyle = "#ffffff";
        this.context.font = "bold 16px sans-serif";
        this.context.fillText("SCORE: " + String(this.score), this.tileSize / 2, this.tileSize / 1.5);
        this.context.fillText("HIGH: " + String(this.highScore), this.boardWidth - 120, this.tileSize / 1.5);
        this.context.fillText("LIVES: " + String(this.lives), this.tileSize / 2, this.boardHeight - 8);

        // Draw Countdown Overlay
        if (this.isCountingDown) {
            this.context.save();
            this.context.fillStyle = "rgba(0, 0, 0, 0.4)";
            this.context.fillRect(0, this.boardHeight / 2 - 45, this.boardWidth, 75);

            this.context.fillStyle = "#fdff00";
            this.context.shadowColor = "#ff0000";
            this.context.shadowBlur = 12;
            this.context.font = "bold 42px 'Segoe UI', sans-serif";
            this.context.textAlign = "center";
            this.context.fillText(this.countdownText, this.boardWidth / 2, this.boardHeight / 2 + 10);
            this.context.restore();
        }

        // Draw Game Over Screen
        if (this.gameOver) {
            this.context.save();
            this.context.fillStyle = "rgba(0, 0, 0, 0.65)";
            this.context.fillRect(0, this.boardHeight / 2 - 60, this.boardWidth, 100);

            this.context.fillStyle = "#ff2222";
            this.context.font = "bold 32px sans-serif";
            this.context.textAlign = "center";
            this.context.fillText("GAME OVER", this.boardWidth / 2, this.boardHeight / 2 - 5);
            this.context.fillStyle = "#ffffff";
            this.context.font = "14px sans-serif";
            this.context.fillText("Press Arrow key / WASD to Restart", this.boardWidth / 2, this.boardHeight / 2 + 25);
            this.context.restore();
        }
    }

    canMoveInDirection(entity, direction) {
        const tunnelY = 9 * this.tileSize;
        
        // Allow horizontal tunnel movement without wall collisions
        if (Math.abs(entity.y - tunnelY) < this.tileSize / 2) {
            if ((entity.x <= 0 && direction === 'L') || (entity.x >= this.boardWidth - entity.width && direction === 'R')) {
                return true;
            }
        }

        const speed = this.tileSize / 4;
        let vx = 0;
        let vy = 0;
        if (direction === 'U') vy = -speed;
        else if (direction === 'D') vy = speed;
        else if (direction === 'L') vx = -speed;
        else if (direction === 'R') vx = speed;

        let testX = entity.x + vx;
        let testY = entity.y + vy;

        if ((direction === 'U' || direction === 'D') && (entity.direction === 'L' || entity.direction === 'R')) {
            testX = Math.round(entity.x / this.tileSize) * this.tileSize;
        } else if ((direction === 'L' || direction === 'R') && (entity.direction === 'U' || entity.direction === 'D')) {
            testY = Math.round(entity.y / this.tileSize) * this.tileSize;
        }

        const testBlock = {
            x: testX,
            y: testY,
            width: entity.width,
            height: entity.height
        };

        for (let wall of this.walls.values()) {
            if (Block.collision(testBlock, wall)) {
                return false;
            }
        }
        return true;
    }

    move() {
        const tunnelY = 9 * this.tileSize;

        if (this.pacman) {
            // Check nextDirection pre-turning
            if (this.nextDirection && this.nextDirection !== this.pacman.direction) {
                if (this.canMoveInDirection(this.pacman, this.nextDirection)) {
                    if (this.nextDirection === 'U' || this.nextDirection === 'D') {
                        this.pacman.x = Math.round(this.pacman.x / this.tileSize) * this.tileSize;
                    } else if (this.nextDirection === 'L' || this.nextDirection === 'R') {
                        this.pacman.y = Math.round(this.pacman.y / this.tileSize) * this.tileSize;
                    }
                    this.pacman.direction = this.nextDirection;
                    this.updatePacmanImage();
                    this.pacman.updateVelocity(this.tileSize);
                }
            }

            // Snap Y to tunnel lane if in tunnel zone
            if (Math.abs(this.pacman.y - tunnelY) < this.tileSize / 2) {
                if (this.pacman.x < 0 || this.pacman.x > this.boardWidth - this.pacman.width) {
                    this.pacman.y = tunnelY;
                }
            }

            // Move Pacman
            if (this.canMoveInDirection(this.pacman, this.pacman.direction)) {
                this.pacman.x += this.pacman.velocityX;
                this.pacman.y += this.pacman.velocityY;

                // Seamless Tunnel Wrap-around (Left <-> Right)
                if (this.pacman.x < -this.pacman.width) {
                    this.pacman.x = this.boardWidth;
                } else if (this.pacman.x > this.boardWidth) {
                    this.pacman.x = -this.pacman.width;
                }
            } else {
                this.pacman.velocityX = 0;
                this.pacman.velocityY = 0;
            }
        }

        // Ghost Movement & Tunnel Wrap-around
        for (let ghost of this.ghosts.values()) {
            if (Block.collision(ghost, this.pacman)) {
                if (ghost.isScared) {
                    audioManager.play('eatGhost');
                    this.score += 200;
                    this.updateHighScore();
                    ghost.reset();
                    ghost.image = ghost.originalImage;
                    ghost.isScared = false;
                } else {
                    audioManager.stop('siren');
                    audioManager.stop('waza');
                    audioManager.play('die');
                    this.lives -= 1;
                    if (this.lives === 0) {
                        this.gameOver = true;
                        audioManager.stopAll();
                        return;
                    }
                    this.resetPositions();
                    this.startCountdown();
                    return;
                }
            }

            if (ghost.y === tunnelY && ghost.direction !== 'U' && ghost.direction !== 'D') {
                ghost.updateDirection('U', this.walls, this.tileSize);
            }

            // Snap Ghost Y to tunnel lane if wrapping
            if (Math.abs(ghost.y - tunnelY) < this.tileSize / 2) {
                if (ghost.x < 0 || ghost.x > this.boardWidth - ghost.width) {
                    ghost.y = tunnelY;
                }
            }

            ghost.x += ghost.velocityX;
            ghost.y += ghost.velocityY;

            // Ghost tunnel wrap-around
            if (ghost.x < -ghost.width) {
                ghost.x = this.boardWidth;
            } else if (ghost.x > this.boardWidth) {
                ghost.x = -ghost.width;
            }

            for (let wall of this.walls.values()) {
                if (Block.collision(ghost, wall)) {
                    ghost.x -= ghost.velocityX;
                    ghost.y -= ghost.velocityY;
                    const newDirection = this.directions[Math.floor(Math.random() * 4)];
                    ghost.updateDirection(newDirection, this.walls, this.tileSize);
                }
            }
        }

        // Food collision
        let foodEaten = null;
        for (let food of this.foods.values()) {
            if (Block.collision(this.pacman, food)) {
                foodEaten = food;
                this.score += 10;
                this.updateHighScore();
                audioManager.play('eatPill');
                break;
            }
        }
        if (foodEaten) {
            this.foods.delete(foodEaten);
        }

        // Power pill collision
        let pillEaten = null;
        for (let pill of this.powerPills.values()) {
            if (Block.collision(this.pacman, pill)) {
                pillEaten = pill;
                this.score += 50;
                this.updateHighScore();
                audioManager.play('eatFruit');
                this.scaredTimer = 100;
                audioManager.stop('siren');
                audioManager.loop('waza');
                for (let ghost of this.ghosts.values()) {
                    ghost.image = this.images.scaredGhost;
                    ghost.isScared = true;
                }
                break;
            }
        }
        if (pillEaten) {
            this.powerPills.delete(pillEaten);
        }

        // Level Win
        if (this.foods.size === 0 && this.powerPills.size === 0) {
            audioManager.play('extraLife');
            this.loadMap();
            this.resetPositions();
            this.startCountdown();
        }
    }

    updatePacmanImage() {
        if (!this.pacman) return;
        if (this.pacman.direction === 'U') {
            this.pacman.image = this.images.pacmanUp;
        } else if (this.pacman.direction === 'D') {
            this.pacman.image = this.images.pacmanDown;
        } else if (this.pacman.direction === 'L') {
            this.pacman.image = this.images.pacmanLeft;
        } else if (this.pacman.direction === 'R') {
            this.pacman.image = this.images.pacmanRight;
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('pacman_highscore', this.highScore);
        }
    }

    handleKeyPress(e) {
        if (this.gameOver) {
            this.loadMap();
            this.resetPositions();
            this.lives = 3;
            this.score = 0;
            this.gameOver = false;
            this.startCountdown(() => {
                this.update();
            });
            this.update();
            return;
        }

        let direction = null;
        if (e.code === "ArrowUp" || e.code === "KeyW") {
            direction = 'U';
        } else if (e.code === "ArrowDown" || e.code === "KeyS") {
            direction = 'D';
        } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
            direction = 'L';
        } else if (e.code === "ArrowRight" || e.code === "KeyD") {
            direction = 'R';
        }

        if (direction) {
            this.nextDirection = direction;
            if (!this.isCountingDown && this.scaredTimer === 0) {
                audioManager.loop('siren');
            }
        }
    }

    resetPositions() {
        this.pacman.reset();
        this.nextDirection = 'R';
        this.pacman.direction = 'R';
        this.updatePacmanImage();
        for (let ghost of this.ghosts.values()) {
            ghost.reset();
            ghost.image = ghost.originalImage;
            ghost.isScared = false;
            const newDirection = this.directions[Math.floor(Math.random() * 4)];
            ghost.updateDirection(newDirection, this.walls, this.tileSize);
        }
    }
}