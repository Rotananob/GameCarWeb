
        // Game variables
        let gameActive = false;
        let score = 0;
        let lives = 3;
        let level = 1;
        let gameSpeed = 5;
        let playerPosition = 50; // Percentage from left
        let playerLane = 1; // 0=left, 1=center, 2=right
        let powerActive = false;
        let powerTimer = 0;
        let powerDuration = 5; // seconds
        let obstacles = [];
        let powerUps = [];
        
        // DOM elements
        const player = document.getElementById('player');
        const gameContainer = document.querySelector('.game-container');
        const scoreDisplay = document.getElementById('score');
        const livesDisplay = document.getElementById('lives');
        const levelDisplay = document.getElementById('level');
        const speedDisplay = document.getElementById('speed');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const powerBtn = document.getElementById('powerBtn');
        const gameOverScreen = document.getElementById('gameOver');
        const finalScoreDisplay = document.getElementById('finalScore');
        const restartBtn = document.getElementById('restartBtn');
        const powerIndicator = document.getElementById('powerIndicator');
        const powerTimerDisplay = document.getElementById('powerTimer');
        
        // Mobile controls
        const mobileUp = document.getElementById('mobileUp');
        const mobileDown = document.getElementById('mobileDown');
        const mobileLeft = document.getElementById('mobileLeft');
        const mobileRight = document.getElementById('mobileRight');
        const mobileAction = document.getElementById('mobileAction');
        
        // Initialize game
        function initGame() {
            score = 0;
            lives = 3;
            level = 1;
            gameSpeed = 5;
            playerPosition = 50;
            playerLane = 1;
            powerActive = false;
            powerTimer = 0;
            obstacles = [];
            powerUps = [];
            
            updateDisplays();
            updatePlayerPosition();
            
            // Remove existing obstacles and power-ups
            document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
            document.querySelectorAll('.power-up').forEach(pu => pu.remove());
            
            gameOverScreen.style.display = 'none';
            powerIndicator.classList.remove('active');
            powerBtn.disabled = true;
        }
        
        // Update displays
        function updateDisplays() {
            scoreDisplay.textContent = score;
            livesDisplay.textContent = lives;
            levelDisplay.textContent = level;
            speedDisplay.textContent = gameSpeed;
        }
        
        // Update player position based on lane
        function updatePlayerPosition() {
            const positions = [20, 50, 80]; // left, center, right
            playerPosition = positions[playerLane];
            player.style.left = `${playerPosition}%`;
        }
        
        // Start game
        function startGame() {
            if (gameActive) return;
            
            gameActive = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            powerBtn.disabled = false;
            
            // Create obstacles at intervals
            obstacleInterval = setInterval(createObstacle, 1500);
            
            // Create power-ups at intervals
            powerUpInterval = setInterval(createPowerUp, 5000);
            
            // Increase score over time
            scoreInterval = setInterval(() => {
                if (gameActive) {
                    score += 5;
                    updateDisplays();
                    
                    // Increase level every 100 points
                    if (score % 100 === 0) {
                        levelUp();
                    }
                }
            }, 1000);
            
            // Game loop for power timer
            powerInterval = setInterval(() => {
                if (powerActive && gameActive) {
                    powerTimer--;
                    powerTimerDisplay.textContent = powerTimer;
                    
                    if (powerTimer <= 0) {
                        deactivatePower();
                    }
                }
            }, 1000);
        }
        
        // Pause game
        function pauseGame() {
            gameActive = !gameActive;
            
            if (gameActive) {
                pauseBtn.textContent = 'ផ្អាក';
            } else {
                pauseBtn.textContent = 'បន្ត';
            }
        }
        
        // Create a new obstacle
        function createObstacle() {
            if (!gameActive) return;
            
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle');
            
            // Random lane (0, 1, or 2)
            const lane = Math.floor(Math.random() * 3);
            const positions = [20, 50, 80];
            const position = positions[lane];
            
            obstacle.style.left = `${position}%`;
            obstacle.style.top = '-80px';
            obstacle.dataset.lane = lane;
            
            gameContainer.appendChild(obstacle);
            obstacles.push({
                element: obstacle,
                lane: lane,
                top: -80
            });
        }
        
        // Create a power-up
        function createPowerUp() {
            if (!gameActive || powerActive) return;
            
            const powerUp = document.createElement('div');
            powerUp.classList.add('power-up');
            
            // Random lane (0, 1, or 2)
            const lane = Math.floor(Math.random() * 3);
            const positions = [20, 50, 80];
            const position = positions[lane];
            
            powerUp.style.left = `${position}%`;
            powerUp.style.top = '-40px';
            powerUp.dataset.lane = lane;
            
            gameContainer.appendChild(powerUp);
            powerUps.push({
                element: powerUp,
                lane: lane,
                top: -40
            });
        }
        
        // Move obstacles and power-ups
        function moveObjects() {
            if (!gameActive) return;
            
            // Move obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                obstacle.top += gameSpeed;
                obstacle.element.style.top = `${obstacle.top}px`;
                
                // Check collision with player
                if (obstacle.top > 400 && obstacle.top < 500 && 
                    obstacle.lane === playerLane) {
                    // Collision detected
                    if (powerActive) {
                        // If power is active, destroy obstacle instead of losing life
                        obstacle.element.remove();
                        obstacles.splice(i, 1);
                        score += 10;
                        updateDisplays();
                    } else {
                        // Normal collision
                        obstacle.element.remove();
                        obstacles.splice(i, 1);
                        loseLife();
                    }
                    continue;
                }
                
                // Remove obstacle when it goes off screen
                if (obstacle.top > 600) {
                    obstacle.element.remove();
                    obstacles.splice(i, 1);
                }
            }
            
            // Move power-ups
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const powerUp = powerUps[i];
                powerUp.top += gameSpeed;
                powerUp.element.style.top = `${powerUp.top}px`;
                
                // Check collision with player
                if (powerUp.top > 400 && powerUp.top < 500 && 
                    powerUp.lane === playerLane) {
                    // Collect power-up
                    powerUp.element.remove();
                    powerUps.splice(i, 1);
                    activatePower();
                    continue;
                }
                
                // Remove power-up when it goes off screen
                if (powerUp.top > 600) {
                    powerUp.element.remove();
                    powerUps.splice(i, 1);
                }
            }
        }
        
        // Activate power-up
        function activatePower() {
            powerActive = true;
            powerTimer = powerDuration;
            powerTimerDisplay.textContent = powerTimer;
            powerIndicator.classList.add('active');
            
            // Visual effect for power activation
            player.style.background = '#f1c40f';
            setTimeout(() => {
                if (powerActive) {
                    player.style.background = '#e74c3c';
                }
            }, 200);
        }
        
        // Deactivate power-up
        function deactivatePower() {
            powerActive = false;
            powerIndicator.classList.remove('active');
            player.style.background = '#e74c3c';
        }
        
        // Use power (button click)
        function usePower() {
            if (powerActive && gameActive) {
                // Special effect when manually using power
                score += 20;
                updateDisplays();
                
                // Clear all obstacles in player's lane
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    const obstacle = obstacles[i];
                    if (obstacle.lane === playerLane) {
                        obstacle.element.remove();
                        obstacles.splice(i, 1);
                    }
                }
                
                deactivatePower();
            }
        }
        
        // Move player
        function movePlayer(direction) {
            if (!gameActive) return;
            
            if (direction === 'up') {
                // Move forward (increase speed temporarily)
                gameSpeed += 2;
                setTimeout(() => {
                    if (gameActive) gameSpeed -= 2;
                    updateDisplays();
                }, 500);
                updateDisplays();
            } else if (direction === 'down') {
                // Move backward (decrease speed temporarily)
                gameSpeed = Math.max(3, gameSpeed - 2);
                setTimeout(() => {
                    if (gameActive) gameSpeed += 2;
                    updateDisplays();
                }, 500);
                updateDisplays();
            } else if (direction === 'left' && playerLane > 0) {
                playerLane--;
                updatePlayerPosition();
            } else if (direction === 'right' && playerLane < 2) {
                playerLane++;
                updatePlayerPosition();
            }
        }
        
        // Lose a life
        function loseLife() {
            lives--;
            updateDisplays();
            
            // Visual feedback for hit
            player.style.background = '#ff0000';
            setTimeout(() => {
                player.style.background = '#e74c3c';
            }, 200);
            
            if (lives <= 0) {
                endGame();
            }
        }
        
        // Level up
        function levelUp() {
            level++;
            gameSpeed += 1;
            updateDisplays();
        }
        
        // End game
        function endGame() {
            gameActive = false;
            clearInterval(obstacleInterval);
            clearInterval(powerUpInterval);
            clearInterval(scoreInterval);
            clearInterval(powerInterval);
            clearInterval(gameLoop);
            
            finalScoreDisplay.textContent = score;
            gameOverScreen.style.display = 'flex';
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            powerBtn.disabled = true;
            pauseBtn.textContent = 'ផ្អាក';
        }
        
        // Event listeners
        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', pauseGame);
        powerBtn.addEventListener('click', usePower);
        restartBtn.addEventListener('click', () => {
            initGame();
            startGame();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                movePlayer('left');
            } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                movePlayer('right');
            } else if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                movePlayer('up');
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                movePlayer('down');
            }
        });
        
        // Right mouse click for power
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (gameActive) {
                usePower();
            }
        });
        
        // Mobile controls
        mobileUp.addEventListener('touchstart', () => movePlayer('up'));
        mobileDown.addEventListener('touchstart', () => movePlayer('down'));
        mobileLeft.addEventListener('touchstart', () => movePlayer('left'));
        mobileRight.addEventListener('touchstart', () => movePlayer('right'));
        mobileAction.addEventListener('touchstart', usePower);
        
        // Prevent default on mobile buttons to avoid scrolling
        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        });
        
        // Touch controls for swiping
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!gameActive) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Check if it's a swipe (minimum distance)
            if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
                // Horizontal swipe takes precedence
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) {
                        movePlayer('right');
                    } else {
                        movePlayer('left');
                    }
                } else {
                    if (diffY > 0) {
                        movePlayer('down');
                    } else {
                        movePlayer('up');
                    }
                }
            }
        });
        
        // Game loop
        let obstacleInterval, powerUpInterval, scoreInterval, powerInterval, gameLoop;
        
        // Initialize game on load
        window.addEventListener('load', () => {
            initGame();
            
            // Start game loop
            gameLoop = setInterval(moveObjects, 50);
        });
    