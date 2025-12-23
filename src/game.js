// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Opens the app to full height

// Reference HTML Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restartBtn');

// Set canvas size
canvas.width = 300;
canvas.height = 500;

// Game State
let score = 0;
let gameOver = false;
let obstacles = [];
let gameSpeed = 5;

let player = {
    x: canvas.width / 2,    // Horizontal Position (Center)
    y: canvas.height - 35,  // Vertical Position (near the bottom)
    size: 30                // Width and height of the pixel square
};

let lastTime = 0;
let fps = 0;

// Handle Input (Mouse & Touch)
function movePlayer(e) {
    // Calculate where the canvas is on the screen to get accurate coordinates
    const rect = canvas.getBoundingClientRect();

    // Get X position from either a Touch event or a Mouse event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    // Adjust the player's X to be centered on the touch point
    // i.e. if rect.left = 50, clientX = 150, actual = 100
    const x = clientX - rect.left;

    // Clamp the movement so the player can't slide off the left or right edges
    const centeringPlayer = x - player.size / 2;
    const rightWallCheck = Math.min(canvas.width - player.size, centeringPlayer);
    const leftWallCheck = Math.max(0, rightWallCheck);
    player.x = leftWallCheck
    // player.x = Math.max(0, Math.min(canvas.width - player.size, x - player.size / 2));
}

// Listen for movements on the canvas
canvas.addEventListener('mousemove', movePlayer);
canvas.addEventListener('touchmove', movePlayer);

// Main Game Loop
function update(currentTime) {
    // Stop the loop if the player crashed
    if (gameOver) return;

    // Clear the canvas before drawing the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // // Draw Player
    // ctx.fillStyle = "#00FF00";
    // ctx.fillRect(player.x, player.y, player.size, player.size);

    // Draw Player as a Triangle
    ctx.fillStyle = "#00FF00";
    ctx.beginPath();
    // Top Point (Middle-Top of the player area)
    ctx.moveTo(player.x, player.y);
    // Bottom Left Point
    ctx.lineTo(player.x - player.size / 2, player.y + player.size);
    // Bottom Right Point
    ctx.lineTo(player.x + player.size / 2, player.y + player.size);
    ctx.closePath();
    ctx.fill();

    // Spawn Lanes


    // Spawn Obstacles
    if (Math.random() < 0.03) {
        obstacles.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            size: 40
        });
    }

    // Update & Draw Obstacles
    obstacles.forEach((obs, index) => {
        // Move the obstacle down
        obs.y += gameSpeed;

        ctx.fillStyle = "#FF0000";
        ctx.fillRect(obs.x, obs.y, obs.size, obs.size);

        // Collision Detection
        if (player.x < obs.x + obs.size &&
            player.x + player.size > obs.x &&
            player.y < obs.y + obs.size &&
            player.y + player.size > obs.y) {
            endGame();
        }

        // Score increase
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreElement.innerText = `Score: ${score}`;
            gameSpeed += 0.1; // Speed up
        }
    });

    // 1. Calculate Delta Time
    // currentTime is automatically provided by requestAnimationFrame
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // 2. Calculate FPS (1000ms / time passed)
    // We use a simple floor to avoid decimals
    fps = Math.round(1000 / deltaTime);

    // 3. Display the FPS on the Canvas
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

    requestAnimationFrame(update);
}

function endGame() {
    gameOver = true;
    overlay.classList.remove('hidden');

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
    }
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    gameOver = false;
    scoreElement.innerText = `Score: 0`;
    overlay.classList.add('hidden');
    update();
}

restartBtn.addEventListener('click', resetGame);

// Start the game
update();