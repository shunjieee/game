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
    x: 135,         // Horizontal Position
    y: 430,         // Vertical Position (near the bottom)
    size: 30        // Width and height of the pixel square
};

// Handle Input (Mouse & Touch)
function movePlayer(e) {
    // Calculate where the canvas is on the screen to get accurate coordinates
    const rect = canvas.getBoundingClientRect();

    // Get X position from either a Touch event or a Mouse event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    // Adjust the player's X to be centered on the touch point
    const x = clientX - rect.left;

    // Clamp the movement so the player can't slide off the left or right edges
    player.x = Math.max(0, Math.min(canvas.width - player.size, x - player.size / 2));
}

// Listen for movements on the canvas
canvas.addEventListener('mousemove', movePlayer);
canvas.addEventListener('touchmove', movePlayer);

// Main Game Loop
function update() {
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
    ctx.moveTo(player.x + player.size / 2, player.y);
    // Bottom Left Point
    ctx.lineTo(player.x, player.y + player.size);
    // Bottom Right Point
    ctx.lineTo(player.x + player.size, player.y + player.size);
    ctx.closePath();
    ctx.fill();

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